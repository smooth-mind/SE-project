from django.db import models
from django.contrib.auth import get_user_model
from classes.models import Class
from assignments.utils import read_file_b64, docx_to_text
from django.conf import settings
import requests
import mimetypes

User = get_user_model()


class Assignment(models.Model):
    classroom = models.ForeignKey(
        Class, on_delete=models.CASCADE, related_name="assignments"
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    deadline = models.DateTimeField()
    task_file = models.FileField(max_length=1024)
    solution_file = models.FileField(max_length=1024)
    max_score = models.IntegerField(null=False, blank=False)

    class Meta:
        unique_together = ("classroom", "name")


class Submission(models.Model):
    assignment = models.ForeignKey(
        Assignment, on_delete=models.CASCADE, related_name="submissions"
    )
    student = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="submissions"
    )
    submitted_file = models.FileField(max_length=1024)
    submitted_at = models.DateTimeField(auto_now_add=True)
    score = models.FloatField(null=True, blank=True)
    is_hand_written = models.BooleanField(null=False, blank=False)

    class Meta:
        unique_together = ("assignment", "student")

    def auto_check(self, assignment: Assignment) -> float | None:
        # Determine MIME types for the files
        task_mime_type, _ = mimetypes.guess_type(assignment.task_file.name)
        solution_mime_type, _ = mimetypes.guess_type(assignment.solution_file.name)
        submission_mime_type, _ = mimetypes.guess_type(self.submitted_file.name)

        predicted_text = self.handle_ocr_prediction(submission_mime_type)

        # Fallback to a generic binary type if MIME type cannot be determined
        if not task_mime_type:
            task_mime_type = "application/octet-stream"
        if not solution_mime_type:
            solution_mime_type = "application/octet-stream"
        if not submission_mime_type:
            submission_mime_type = "application/octet-stream"

        # Construct the content parts for the Gemini API request
        gemini_prompt_parts = [
            {
                "text": (
                    f"You are an expert assignment grader for the course {assignment.classroom.subject}. I will provide "
                    f"you with the assignment's task, a correct solution, and a student's submission. Carefully compare "
                    f"the student's submission to the task and the provided solution. Your primary goal is to evaluate "
                    f"accuracy, completeness, and adherence to the task requirements. Assign a numerical score between 0.0 and "
                    f"{assignment.max_score} (inclusive). Provide ONLY the numerical score in your response, "
                    f"preceded by the text 'Score: ', for example: 'Score: 85.5'. Do not include any other text, "
                    f"explanation, or formatting beyond this."
                )
            }
        ]
        self.add_part(gemini_prompt_parts, task_mime_type, assignment.task_file)
        self.add_part(gemini_prompt_parts, solution_mime_type, assignment.solution_file)
        self.add_part(gemini_prompt_parts, submission_mime_type, self.submitted_file)

        # If the submission was handwritten and OCR produced text, include it as additional context for Gemini
        if self.is_hand_written and predicted_text:
            gemini_prompt_parts.append(
                {
                    "text": f"\nAdditionally, the OCR-extracted text from the handwritten submission is:\n```\n{predicted_text}\n```\n"
                    f"Use this text to aid your evaluation, especially if the original image quality is low."
                }
            )

        try:
            check_response = self.make_gemini_prediction(gemini_prompt_parts)
            check_response.raise_for_status()  # Raises HTTPError for bad responses (4xx or 5xx)

            response_json = check_response.json()
            gemini_output_text = (
                response_json.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text", "")
            )

            # Attempt to parse the score from the Gemini output
            # Expected format: "Score: 85.5"
            score_prefix = "Score: "
            if gemini_output_text.startswith(score_prefix):
                try:
                    score_str = gemini_output_text[len(score_prefix) :].strip()
                    score = float(score_str)
                    # Ensure the score is within the valid range [0.0, max_score]
                    return max(0.0, min(score, float(assignment.max_score)))
                except ValueError as e:
                    print(
                        f"Error parsing numerical score from Gemini output '{gemini_output_text}': {e}"
                    )
                    return None
            else:
                print(
                    f"Gemini output did not start with expected 'Score: ' prefix. Output: '{gemini_output_text}'"
                )
                # Fallback: try to extract any float if the format is not exact
                import re

                match = re.search(r"\b\d+\.?\d*\b", gemini_output_text)
                if match:
                    try:
                        extracted_score = float(match.group(0))
                        print(
                            f"Extracted score '{extracted_score}' from non-standard output."
                        )
                        return max(
                            0.0, min(extracted_score, float(assignment.max_score))
                        )
                    except ValueError:
                        pass  # Continue to default 0.0 if extraction fails
                return None  # Default to 0.0 if score parsing fails

        except requests.exceptions.RequestException as e:
            print(f"Network or API request error calling Gemini API: {e}")
            return None
        except (KeyError, IndexError) as e:
            print(
                f"Error parsing Gemini API response structure: {e}. Full response: {check_response.text if 'check_response' in locals() else 'No response object'}"
            )
            return None
        except Exception as e:  # Catch any other unexpected errors
            print(f"An unexpected error occurred during auto-checking: {e}")
            return None

    def handle_ocr_prediction(self, submission_mime_type):
        if self.is_hand_written and submission_mime_type == "image/png":
            image_b64 = read_file_b64(self.submitted_file)
            response = requests.post(
                settings.OCR_PREDICTION_URL, json={"image": image_b64}
            )
            if response.status_code != 200:
                return None
            return response.json().get("pred", "")
        return ""

    def add_part(self, gemini_prompt_parts, mime_type, file_field):
        if (
            mime_type
            == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ):
            text = docx_to_text(file_field)
            gemini_prompt_parts.append({"text": text})
        else:
            gemini_prompt_parts.append(
                {
                    "inline_data": {
                        "mimeType": mime_type,
                        "data": read_file_b64(file_field),
                    }
                }
            )

    def make_gemini_prediction(self, prompt_parts):
        return requests.post(
            settings.GEMINI_MODEL_URL,
            headers={"Content-Type": "application/json"},
            json={"contents": [{"parts": prompt_parts}]},
            params={"key": settings.GEMINI_API_KEY},
        )

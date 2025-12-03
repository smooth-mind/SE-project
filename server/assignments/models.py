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

        predicted_text = ""
        try:
            predicted_text = self.handle_ocr_prediction(submission_mime_type)
        except requests.exceptions.RequestException as e:
            # OCR is optional; continue without it on network errors
            print(f"OCR request failed, continuing without OCR text: {e}")
        except Exception as e:
            print(f"Unexpected OCR error, continuing without OCR text: {e}")

        # Fallback to a generic binary type if MIME type cannot be determined
        if not task_mime_type:
            task_mime_type = "application/octet-stream"
        if not solution_mime_type:
            solution_mime_type = "application/octet-stream"
        if not submission_mime_type:
            submission_mime_type = "application/octet-stream"

        prompt_parts = self.build_openrouter_prompt(
            assignment,
            task_mime_type,
            solution_mime_type,
            submission_mime_type,
            predicted_text,
        )

        try:
            check_response = self.make_openrouter_prediction(prompt_parts)
            check_response.raise_for_status()  # Raises HTTPError for bad responses (4xx or 5xx)

            response_json = check_response.json()
            openrouter_output_text = self.extract_openrouter_text(response_json)

            # Attempt to parse the score from the OpenRouter output
            # Expected format: "Score: 85.5"
            score_prefix = "Score: "
            if openrouter_output_text.startswith(score_prefix):
                try:
                    score_str = openrouter_output_text[len(score_prefix) :].strip()
                    score = float(score_str)
                    # Ensure the score is within the valid range [0.0, max_score]
                    return max(0.0, min(score, float(assignment.max_score)))
                except ValueError as e:
                    print(
                        f"Error parsing numerical score from OpenRouter output '{openrouter_output_text}': {e}"
                    )
                    return None
            else:
                print(
                    f"OpenRouter output did not start with expected 'Score: ' prefix. Output: '{openrouter_output_text}'"
                )
                # Fallback: try to extract any float if the format is not exact
                import re

                match = re.search(r"\b\d+\.?\d*\b", openrouter_output_text)
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
            print(f"Network or API request error calling OpenRouter API: {e}")
            return None
        except (KeyError, IndexError) as e:
            print(
                f"Error parsing OpenRouter API response structure: {e}. Full response: {check_response.text if 'check_response' in locals() else 'No response object'}"
            )
            return None
        except Exception as e:  # Catch any other unexpected errors
            print(f"An unexpected error occurred during auto-checking: {e}")
            return None

    def handle_ocr_prediction(self, submission_mime_type):
        if (
            not settings.OCR_PREDICTION_URL
            or not self.is_hand_written
            or submission_mime_type != "image/png"
        ):
            return ""

        image_b64 = read_file_b64(self.submitted_file)
        response = requests.post(settings.OCR_PREDICTION_URL, json={"image": image_b64})
        response.raise_for_status()
        return response.json().get("pred", "")

    def build_openrouter_prompt(
        self,
        assignment: Assignment,
        task_mime_type: str,
        solution_mime_type: str,
        submission_mime_type: str,
        predicted_text: str,
    ):
        prompt_parts = [
            {
                "type": "text",
                "text": (
                    f"You are an expert assignment grader for the course {assignment.classroom.subject}. I will provide "
                    f"you with the assignment's task, a correct solution, and a student's submission. Carefully compare "
                    f"the student's submission to the task and the provided solution. Your primary goal is to evaluate "
                    f"accuracy, completeness, and adherence to the task requirements. Assign a numerical score between 0.0 and "
                    f"{assignment.max_score} (inclusive). Provide ONLY the numerical score in your response, "
                    f"preceded by the text 'Score: ', for example: 'Score: 85.5'. Do not include any other text, "
                    f"explanation, or formatting beyond this."
                ),
            },
            {"type": "text", "text": "Assignment Task:"},
        ]

        self.add_content_part(prompt_parts, task_mime_type, assignment.task_file)
        prompt_parts.append({"type": "text", "text": "Reference Solution:"})
        self.add_content_part(prompt_parts, solution_mime_type, assignment.solution_file)
        prompt_parts.append({"type": "text", "text": "Student Submission:"})
        self.add_content_part(prompt_parts, submission_mime_type, self.submitted_file)

        # If the submission was handwritten and OCR produced text, include it as additional context for the model
        if self.is_hand_written and predicted_text:
            prompt_parts.append(
                {
                    "type": "text",
                    "text": (
                        "OCR extracted text from the handwritten submission:\n"
                        f"{predicted_text}"
                    ),
                }
            )

        return prompt_parts

    def add_content_part(self, prompt_parts, mime_type, file_field):
        if (
            mime_type
            == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ):
            text = docx_to_text(file_field)
            prompt_parts.append({"type": "text", "text": text})
        elif mime_type and mime_type.startswith("image/"):
            prompt_parts.append(
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:{mime_type};base64,{read_file_b64(file_field)}"
                    },
                }
            )
        else:
            prompt_parts.append(
                {
                    "type": "text",
                    "text": (
                        f"File ({mime_type}) provided as base64 content:\n"
                        f"{read_file_b64(file_field)}"
                    ),
                }
            )

    def extract_openrouter_text(self, response_json):
        message_content = (
            response_json.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
        )

        if isinstance(message_content, str):
            return message_content
        if isinstance(message_content, list):
            return " ".join(
                part.get("text", "")
                for part in message_content
                if isinstance(part, dict) and part.get("type") == "text"
            )
        return ""

    def make_openrouter_prediction(self, prompt_parts):
        if not settings.OPENROUTER_API_KEY:
            raise ValueError("OPENROUTER_API_KEY is not configured")

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        }
        payload = {
            "model": settings.OPENROUTER_MODEL,
            "messages": [{"role": "user", "content": prompt_parts}],
            "max_tokens": 150,
            "temperature": 0,
        }
        return requests.post(
            settings.OPENROUTER_API_URL,
            headers=headers,
            json=payload,
        )

from rest_framework import serializers
from .models import Assignment, Submission
from django.contrib.auth import get_user_model

User = get_user_model()


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "name", "email"]


class CreateAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = ["name", "description", "max_score", "deadline", "task_file", "solution_file"]


class AssignmentSerializer(serializers.ModelSerializer):
    submitted = serializers.SerializerMethodField()
    solution_file = serializers.SerializerMethodField()
    submission_count = serializers.SerializerMethodField()
    user_submission = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = [
            "id",
            "classroom",
            "name",
            "description",
            "max_score",
            "deadline",
            "task_file",
            "solution_file",
            "submitted",
            "submission_count",
            "user_submission",
        ]

    def get_submitted(self, obj):
        user = self.context["request"].user
        if user.role == "student":
            return Submission.objects.filter(assignment=obj, student=user).exists()
        return None

    def get_user_submission(self, obj):
        user = self.context["request"].user
        if user.role == "student":
            try:
                submission = Submission.objects.get(assignment=obj, student=user)
                return {
                    "id": submission.id,
                    "submitted_file": (
                        self.context["request"].build_absolute_uri(
                            submission.submitted_file.url
                        )
                        if submission.submitted_file
                        else None
                    ),
                    "submitted_at": submission.submitted_at,
                    "is_hand_written": submission.is_hand_written,
                    "score": submission.score,
                }
            except Submission.DoesNotExist:
                return None
        return None

    def get_solution_file(self, obj):
        user = self.context["request"].user
        if user.role == "teacher":
            request = self.context["request"]
            return (
                request.build_absolute_uri(obj.solution_file.url)
                if obj.solution_file
                else None
            )
        return None

    def get_submission_count(self, obj):
        user = self.context["request"].user
        if user.role == "teacher":
            return obj.submissions.count()
        return None


class SubmissionSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    submitted_file_url = serializers.SerializerMethodField()

    class Meta:
        model = Submission
        fields = [
            "id",
            "student",
            "submitted_file",
            "submitted_file_url",
            "submitted_at",
            "score",
            "is_hand_written",
        ]

    def get_submitted_file_url(self, obj):
        if obj.submitted_file:
            request = self.context.get("request")
            return (
                request.build_absolute_uri(obj.submitted_file.url)
                if request
                else obj.submitted_file.url
            )
        return None


class SubmissionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = ["submitted_file", "is_hand_written"]


class StudentSubmissionStatusSerializer(serializers.ModelSerializer):
    submitted = serializers.SerializerMethodField()

    class Meta:
        model = Submission
        fields = ["submitted_files", "submitted_at", "score", "submitted"]

    def get_submitted(self, obj):
        return True if obj.submitted_at else False

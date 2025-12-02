from django.contrib.auth import get_user_model
from rest_framework import serializers
from classes.models import Class
from assignments.serializers import AssignmentSerializer

User = get_user_model()


class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "name"]


class CreateClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = Class
        fields = ["name", "subject", "section"]


class ClassSerializer(serializers.ModelSerializer):
    teacher = TeacherSerializer()
    student_count = serializers.SerializerMethodField()

    class Meta:
        model = Class
        fields = ["id", "name", "subject", "section", "teacher", "student_count"]

    def get_student_count(self, obj):
        return obj.classmembership_set.count()


class JoinClassSerializer(serializers.Serializer):
    invite_code = serializers.CharField(min_length=7, max_length=7)


class ClassDetailSerializer(serializers.ModelSerializer):
    teacher = TeacherSerializer()
    assignments = serializers.SerializerMethodField()
    student_count = serializers.SerializerMethodField()

    class Meta:
        model = Class
        fields = [
            "id",
            "name",
            "subject",
            "section",
            "invite_code",
            "student_count",
            "teacher",
            "assignments",
        ]

    def get_assignments(self, obj):
        assignments = obj.assignments.all()
        request = self.context.get("request")
        serializer = AssignmentSerializer(
            assignments, many=True, context={"request": request}
        )
        return serializer.data

    def get_student_count(self, obj):
        return obj.classmembership_set.count()

from rest_framework import generics, permissions
from classes.models import Class, ClassMembership
from classes.serializers import (
    ClassSerializer,
    CreateClassSerializer,
    JoinClassSerializer,
    ClassDetailSerializer,
)
from accounts.permissions import IsTeacher, IsStudent
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from classes.utils import generate_invite_code


class CreateClassView(generics.CreateAPIView):
    serializer_class = CreateClassSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user, invite_code=generate_invite_code())


class ClassDetailView(generics.RetrieveAPIView):
    serializer_class = ClassDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "teacher":
            return Class.objects.filter(teacher=user)
        return Class.objects.filter(classmembership__student=user)

    def get_object(self):
        return get_object_or_404(self.get_queryset(), pk=self.kwargs["pk"])


class JoinClassView(generics.CreateAPIView):
    serializer_class = JoinClassSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def post(self, request, *args, **kwargs):
        code = request.data["invite_code"]
        classroom = get_object_or_404(Class, invite_code=code)
        ClassMembership.objects.get_or_create(student=request.user, classroom=classroom)
        return Response({"status": "joined"})


class ClassesView(generics.ListAPIView):
    serializer_class = ClassSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "teacher":
            return Class.objects.filter(teacher=user)
        return Class.objects.filter(classmembership__student=user)

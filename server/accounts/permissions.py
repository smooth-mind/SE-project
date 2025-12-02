from rest_framework.permissions import BasePermission

class IsStudent(BasePermission):
    def has_permission(self, request, view) -> bool:  # type:ignore
        return request.user.role == "student"

class IsTeacher(BasePermission):
    def has_permission(self, request, view) -> bool:  # type:ignore
        return request.user.role == "teacher"


from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Class(models.Model):
    name = models.CharField(max_length=255)
    section = models.CharField(max_length=255)
    subject = models.CharField(max_length=255)
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name="taught_classes")
    invite_code = models.CharField(unique=True)

    class Meta:
        unique_together = ('subject', 'section')


class ClassMembership(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    classroom = models.ForeignKey(Class, on_delete=models.CASCADE)
    class Meta:
        unique_together = ('student', 'classroom')

from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "name", "email", "role"]


class RegisterUserSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=["student", "teacher"])

    class Meta:
        model = User
        fields = ["name", "email", "password", "role"]
        extra_kwargs = {"password": {"write_only": True}}

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)  # type:ignore

# detection/serializers.py
from rest_framework import serializers
from .models import AISData, SARData
from django.contrib.auth.models import User

class AISDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = AISData
        fields = '__all__'

class SARDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = SARData
        fields = '__all__'

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
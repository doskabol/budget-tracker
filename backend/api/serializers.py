from rest_framework import serializers
from .models import Category, Transaction, Goal, Debt
from django.contrib.auth import get_user_model

User = get_user_model()

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'type', 'icon', 'color']

class TransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    
    class Meta:
        model = Transaction
        fields = ['id', 'amount', 'description', 'merchant', 'date', 'category', 'category_name', 'category_color', 'is_income']

class UserProfileSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150, required=False)
    last_name = serializers.CharField(max_length=150, required=False)
    avatar = serializers.ImageField(required=False)
    phone = serializers.CharField(required=False)
    
    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.phone = validated_data.get('phone', instance.phone)
        if 'avatar' in validated_data:
            instance.avatar = validated_data['avatar']
        instance.save()
        return instance

class GoalSerializer(serializers.ModelSerializer):
    progress_percent = serializers.SerializerMethodField()
    
    class Meta:
        model = Goal
        fields = ['id', 'name', 'target_amount', 'current_amount', 'deadline', 'progress_percent']
    
    def get_progress_percent(self, obj):
        if obj.target_amount > 0:
            return int((obj.current_amount / obj.target_amount) * 100)
        return 0

class DebtSerializer(serializers.ModelSerializer):
    class Meta:
        model = Debt
        fields = ['id', 'person_name', 'amount', 'debt_type', 'description', 'due_date', 'is_paid']

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    
    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Пароли не совпадают")
        return data
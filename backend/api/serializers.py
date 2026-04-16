from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Transaction, BudgetLimit, SavingGoal, Debt, Profile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=False)
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email', '')
        )
        return user

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class TransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    
    class Meta:
        model = Transaction
        fields = ['id', 'amount', 'type', 'description', 'date', 'updated_at', 'category', 'category_name']
        read_only_fields = ['user']

class BudgetLimitSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    month = serializers.IntegerField()
    year = serializers.IntegerField()
    limit_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return BudgetLimit.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        instance.category = validated_data.get('category', instance.category)
        instance.month = validated_data.get('month', instance.month)
        instance.year = validated_data.get('year', instance.year)
        instance.limit_amount = validated_data.get('limit_amount', instance.limit_amount)
        instance.save()
        return instance

class SavingGoalSerializer(serializers.ModelSerializer):
    current_amount = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False)
    
    class Meta:
        model = SavingGoal
        fields = ['id', 'name', 'target_amount', 'current_amount', 'deadline']
        read_only_fields = ['user']

class DebtSerializer(serializers.ModelSerializer):
    class Meta:
        model = Debt
        fields = ['id', 'name', 'amount', 'direction', 'due_date', 'is_paid']
        read_only_fields = ['user']

class UpdateProfileSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    email = serializers.ReadOnlyField(source='user.email')
    first_name = serializers.ReadOnlyField(source='user.first_name')
    last_name = serializers.ReadOnlyField(source='user.last_name')
    date_joined = serializers.ReadOnlyField(source='user.date_joined')
    
    class Meta:
        model = Profile
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'avatar', 'phone']
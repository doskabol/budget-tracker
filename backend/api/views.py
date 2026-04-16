from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.db.models import Sum
from django.utils import timezone
from django.conf import settings
import os
from .models import Category, Transaction, BudgetLimit, SavingGoal, Debt
from .serializers import (
    RegisterSerializer, UserSerializer, CategorySerializer,
    TransactionSerializer, BudgetLimitSerializer, SavingGoalSerializer, DebtSerializer
)

# ==================== FBV ====================

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def logout(request):
    request.user.auth_token.delete()
    return Response({'message': 'Logged out successfully'})

@api_view(['GET'])
def get_stats(request):
    user = request.user
    now = timezone.now()
    
    incomes = Transaction.objects.filter(user=user, type='income').aggregate(total=Sum('amount'))['total'] or 0
    expenses = Transaction.objects.filter(user=user, type='expense').aggregate(total=Sum('amount'))['total'] or 0
    balance = incomes - expenses
    
    expenses_by_category = Transaction.objects.filter(
        user=user, 
        type='expense',
        date__month=now.month,
        date__year=now.year
    ).values('category__name').annotate(total=Sum('amount'))
    
    return Response({
        'balance': balance,
        'total_income': incomes,
        'total_expense': expenses,
        'expenses_by_category': expenses_by_category
    })

# ==================== CBV ====================

class TransactionListCreateView(APIView):
    def get(self, request):
        transactions = Transaction.objects.filter(user=request.user).order_by('-date')
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = TransactionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TransactionDetailView(APIView):
    def get_object(self, pk, user):
        try:
            return Transaction.objects.get(pk=pk, user=user)
        except Transaction.DoesNotExist:
            return None
    
    def put(self, request, pk):
        transaction = self.get_object(pk, request.user)
        if not transaction:
            return Response({'error': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = TransactionSerializer(transaction, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        transaction = self.get_object(pk, request.user)
        if not transaction:
            return Response({'error': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)
        transaction.delete()
        return Response({'message': 'Deleted'}, status=status.HTTP_204_NO_CONTENT)

class CategoryListCreateView(APIView):
    def get(self, request):
        categories = Category.objects.filter(user=request.user)
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SavingGoalListCreateView(APIView):
    def get(self, request):
        goals = SavingGoal.objects.filter(user=request.user)
        serializer = SavingGoalSerializer(goals, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = SavingGoalSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SavingGoalDetailView(APIView):
    def get_object(self, pk, user):
        try:
            return SavingGoal.objects.get(pk=pk, user=user)
        except SavingGoal.DoesNotExist:
            return None
    
    def put(self, request, pk):
        goal = self.get_object(pk, request.user)
        if not goal:
            return Response({'error': 'Goal not found'}, status=status.HTTP_404_NOT_FOUND)
        
        print("Received data:", request.data)
        
        serializer = SavingGoalSerializer(goal, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        print("Serializer errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        goal = self.get_object(pk, request.user)
        if not goal:
            return Response({'error': 'Goal not found'}, status=status.HTTP_404_NOT_FOUND)
        goal.delete()
        return Response({'message': 'Deleted'}, status=status.HTTP_204_NO_CONTENT)

class DebtListCreateView(APIView):
    def get(self, request):
        debts = Debt.objects.filter(user=request.user)
        serializer = DebtSerializer(debts, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = DebtSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DebtDetailView(APIView):
    def get_object(self, pk, user):
        try:
            return Debt.objects.get(pk=pk, user=user)
        except Debt.DoesNotExist:
            return None
    
    def delete(self, request, pk):
        debt = self.get_object(pk, request.user)
        if not debt:
            return Response({'error': 'Debt not found'}, status=status.HTTP_404_NOT_FOUND)
        debt.delete()
        return Response({'message': 'Deleted'}, status=status.HTTP_204_NO_CONTENT)

# ==================== Profile ====================

@api_view(['GET'])
def get_profile(request):
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'date_joined': user.date_joined,
    })

# ==================== Profile ====================

@api_view(['GET'])
def get_profile(request):
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'date_joined': user.date_joined,
    })

@api_view(['PUT'])
def update_profile(request):
    user = request.user
    serializer = UpdateProfileSerializer(data=request.data)
    if serializer.is_valid():
        if 'email' in serializer.validated_data:
            user.email = serializer.validated_data['email']
        if 'first_name' in serializer.validated_data:
            user.first_name = serializer.validated_data['first_name']
        if 'last_name' in serializer.validated_data:
            user.last_name = serializer.validated_data['last_name']
        user.save()
        return Response({'message': 'Profile updated successfully'})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def change_password(request):
    user = request.user
    serializer = ChangePasswordSerializer(data=request.data)
    if serializer.is_valid():
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({'error': 'Wrong password'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        # Создаём новый токен (старый станет недействительным)
        Token.objects.filter(user=user).delete()
        new_token = Token.objects.create(user=user)
        return Response({'message': 'Password changed successfully', 'token': new_token.key})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_profile_with_avatar(request):
    user = request.user
    profile, created = Profile.objects.get_or_create(user=user)
    serializer = ProfileSerializer(profile)
    return Response(serializer.data)

@api_view(['POST'])
def upload_avatar(request):
    user = request.user
    profile, created = Profile.objects.get_or_create(user=user)
    
    if 'avatar' not in request.FILES:
        return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    file = request.FILES['avatar']
    
    # Проверка типа файла
    if not file.content_type.startswith('image/'):
        return Response({'error': 'File must be an image'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Удаляем старый аватар если есть
    if profile.avatar:
        old_avatar_path = os.path.join(settings.MEDIA_ROOT, str(profile.avatar))
        if os.path.exists(old_avatar_path):
            os.remove(old_avatar_path)
    
    profile.avatar = file
    profile.save()
    
    return Response({'avatar': profile.avatar.url if profile.avatar else None})

@api_view(['PUT'])
def update_profile_full(request):
    user = request.user
    profile, created = Profile.objects.get_or_create(user=user)
    
    # Обновляем поля User
    if 'first_name' in request.data:
        user.first_name = request.data['first_name']
    if 'last_name' in request.data:
        user.last_name = request.data['last_name']
    if 'email' in request.data:
        user.email = request.data['email']
    user.save()
    
    # Обновляем поля Profile
    if 'phone' in request.data:
        profile.phone = request.data['phone']
    profile.save()
    
    serializer = ProfileSerializer(profile)
    return Response(serializer.data)
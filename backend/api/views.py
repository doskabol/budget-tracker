from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.db.models import Sum
from django.utils import timezone
from .models import Category, Transaction, BudgetLimit, SavingGoal, Debt
from .serializers import (
    RegisterSerializer, UserSerializer, CategorySerializer,
    TransactionSerializer, BudgetLimitSerializer, SavingGoalSerializer, DebtSerializer
)

# ==================== FBV (Function-Based Views) ====================

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

# ==================== CBV (Class-Based Views) ====================

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
        return Response({'message': 'Deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

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
        print(serializer.errors)  # для отладки
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

# ==================== Статистика ====================

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
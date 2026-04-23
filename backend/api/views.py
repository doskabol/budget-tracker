from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Category, Transaction, Goal, Debt
from .serializers import (
    CategorySerializer, TransactionSerializer, GoalSerializer, 
    DebtSerializer, UserProfileSerializer, RegisterSerializer
)
from django.contrib.auth import get_user_model

User = get_user_model()

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def transaction_list_create(request):
    if request.method == 'GET':
        transactions = Transaction.objects.filter(user=request.user)
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = TransactionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def transaction_detail(request, pk):
    transaction = get_object_or_404(Transaction, pk=pk, user=request.user)
    
    if request.method == 'GET':
        serializer = TransactionSerializer(transaction)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = TransactionSerializer(transaction, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        transaction.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class CategoryListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        categories = Category.objects.filter(user=request.user) | Category.objects.filter(user__isnull=True)
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GoalListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        goals = Goal.objects.filter(user=request.user)
        serializer = GoalSerializer(goals, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = GoalSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DebtListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
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
    permission_classes = [IsAuthenticated]
    
    def put(self, request, pk):
        debt = get_object_or_404(Debt, pk=pk, user=request.user)
        serializer = DebtSerializer(debt, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        debt = get_object_or_404(Debt, pk=pk, user=request.user)
        debt.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        transactions = Transaction.objects.filter(user=request.user)
        total_income = sum(t.amount for t in transactions if t.is_income)
        total_expense = sum(t.amount for t in transactions if not t.is_income)
        balance = total_income - total_expense
        
        return Response({
            'balance': balance,
            'total_income': total_income,
            'total_expense': total_expense,
            'recent_transactions': TransactionSerializer(transactions[:5], many=True).data
        })

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = User.objects.create_user(
            username=serializer.validated_data['username'],
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password']
        )
        return Response({
            'user': UserProfileSerializer(user).data,
            'message': 'Пользователь успешно создан'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
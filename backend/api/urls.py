from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    
    # Stats
    path('stats/', views.get_stats, name='stats'),
    
    # Transactions (CRUD)
    path('transactions/', views.TransactionListCreateView.as_view(), name='transactions'),
    path('transactions/<int:pk>/', views.TransactionDetailView.as_view(), name='transaction-detail'),
    
    # Categories
    path('categories/', views.CategoryListCreateView.as_view(), name='categories'),
    
    # Saving Goals
    path('saving-goals/', views.SavingGoalListCreateView.as_view(), name='saving-goals'),
    path('saving-goals/<int:pk>/', views.SavingGoalDetailView.as_view(), name='saving-goal-detail'),
    
    # Debts
    path('debts/', views.DebtListCreateView.as_view(), name='debts'),
    path('debts/<int:pk>/', views.DebtDetailView.as_view(), name='debt-detail'),
]
from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # Auth endpoints
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', views.register, name='register'),
    
    # Profile
    path('profile/', views.ProfileView.as_view(), name='profile'),
    
    # Dashboard
    path('dashboard/', views.DashboardStatsView.as_view(), name='dashboard'),
    
    # Transactions
    path('transactions/', views.transaction_list_create, name='transactions'),
    path('transactions/<int:pk>/', views.transaction_detail, name='transaction_detail'),
    
    # Categories
    path('categories/', views.CategoryListCreateView.as_view(), name='categories'),
    
    # Goals
    path('goals/', views.GoalListCreateView.as_view(), name='goals'),
    
    # Debts
    path('debts/', views.DebtListCreateView.as_view(), name='debts'),
    path('debts/<int:pk>/', views.DebtDetailView.as_view(), name='debt_detail'),
]
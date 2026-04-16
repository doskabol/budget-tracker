from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('stats/', views.get_stats, name='stats'),
    path('transactions/', views.TransactionListCreateView.as_view(), name='transactions'),
    path('transactions/<int:pk>/', views.TransactionDetailView.as_view(), name='transaction-detail'),
    path('categories/', views.CategoryListCreateView.as_view(), name='categories'),
    path('saving-goals/', views.SavingGoalListCreateView.as_view(), name='saving-goals'),
    path('saving-goals/<int:pk>/', views.SavingGoalDetailView.as_view(), name='saving-goal-detail'),
    path('debts/', views.DebtListCreateView.as_view(), name='debts'),
    path('debts/<int:pk>/', views.DebtDetailView.as_view(), name='debt-detail'),
    path('profile/', views.get_profile, name='profile'),
    path('profile/update/', views.update_profile, name='update-profile'),
    path('change-password/', views.change_password, name='change-password'),
    path('profile-full/', views.get_profile_with_avatar, name='profile-full'),
    path('upload-avatar/', views.upload_avatar, name='upload-avatar'),
    path('update-profile-full/', views.update_profile_full, name='update-profile-full'),
]
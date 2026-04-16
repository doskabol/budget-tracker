from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import os

class Category(models.Model):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='categories')
    
    def __str__(self):
        return self.name

class Transaction(models.Model):
    TYPE_CHOICES = [
        ('income', 'Доход'),
        ('expense', 'Расход'),
    ]
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    description = models.CharField(max_length=200, blank=True)
    date = models.DateField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    
    def __str__(self):
        return f"{self.get_type_display()}: {self.amount} - {self.date}"

class BudgetLimit(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='budget_limits')
    month = models.IntegerField()
    year = models.IntegerField()
    limit_amount = models.DecimalField(max_digits=10, decimal_places=2)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='budget_limits')
    
    class Meta:
        unique_together = ('category', 'month', 'year', 'user')
    
    def __str__(self):
        return f"{self.category.name}: {self.limit_amount} - {self.month}/{self.year}"

class SavingGoal(models.Model):
    name = models.CharField(max_length=100)
    target_amount = models.DecimalField(max_digits=10, decimal_places=2)
    current_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deadline = models.DateField(null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saving_goals')
    
    def __str__(self):
        return f"{self.name}: {self.current_amount}/{self.target_amount}"

class Debt(models.Model):
    DIRECTION_CHOICES = [
        ('i_owe', 'Я должен'),
        ('owe_me', 'Мне должны'),
    ]
    
    name = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    direction = models.CharField(max_length=10, choices=DIRECTION_CHOICES)
    due_date = models.DateField(null=True, blank=True)
    is_paid = models.BooleanField(default=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='debts')
    
    def __str__(self):
        return f"{'Я должен' if self.direction == 'i_owe' else 'Мне должны'} {self.name}: {self.amount}"

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True, default='')
    
    def __str__(self):
        return f"{self.user.username}'s profile"

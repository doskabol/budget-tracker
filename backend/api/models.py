from django.db import models
from django.conf import settings

class Category(models.Model):
    TYPE_CHOICES = [
        ('income', 'Доход'),
        ('expense', 'Расход'),
    ]
    
    name = models.CharField(max_length=100, verbose_name='Название')
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='expense')
    icon = models.CharField(max_length=50, blank=True, null=True)
    color = models.CharField(max_length=20, default='#007bff')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='categories', null=True, blank=True)
    
    def __str__(self):
        return self.name

class Transaction(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='transactions')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=255, blank=True)
    merchant = models.CharField(max_length=255, blank=True)
    date = models.DateTimeField(auto_now_add=True)
    is_income = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.user.username} - {self.amount}"
    
    class Meta:
        ordering = ['-date']

class Goal(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='goals')
    name = models.CharField(max_length=200)
    target_amount = models.DecimalField(max_digits=10, decimal_places=2)
    current_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deadline = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class Debt(models.Model):
    DEBT_TYPE = [
        ('i_owe', 'Я должен'),
        ('owe_me', 'Должны мне'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='debts')
    person_name = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    debt_type = models.CharField(max_length=10, choices=DEBT_TYPE)
    description = models.TextField(blank=True)
    due_date = models.DateField(null=True, blank=True)
    is_paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.person_name} - {self.amount}"
from django.contrib import admin
from .models import Category, Transaction, Goal, Debt

admin.site.register(Category)
admin.site.register(Transaction)
admin.site.register(Goal)
admin.site.register(Debt)
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './categories.html',
  styleUrls: ['./categories.css']
})
export class CategoriesComponent implements OnInit {
  categories: any[] = [];
  newCategoryName = '';
  newCategoryType = 'expense';
  
  // Цвета для иконок
  colors = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
  
  constructor(private http: HttpClient) {}
  
  ngOnInit(): void {
    this.loadCategories();
  }
  
  loadCategories(): void {
    const token = localStorage.getItem('access_token');
    this.http.get('http://localhost:8000/api/categories/', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (data: any) => {
        this.categories = data;
      },
      error: () => {
        // Демо данные
        this.categories = [
          { id: 1, name: 'Еда', type: 'expense', color: '#ef4444' },
          { id: 2, name: 'Транспорт', type: 'expense', color: '#f59e0b' },
          { id: 3, name: 'Зарплата', type: 'income', color: '#10b981' },
          { id: 4, name: 'Развлечения', type: 'expense', color: '#8b5cf6' }
        ];
      }
    });
  }
  
  addCategory(): void {
    if (!this.newCategoryName.trim()) {
      alert('Введите название категории');
      return;
    }
    
    const newCategory = {
      name: this.newCategoryName,
      type: this.newCategoryType,
      color: this.colors[Math.floor(Math.random() * this.colors.length)]
    };
    
    const token = localStorage.getItem('access_token');
    this.http.post('http://localhost:8000/api/categories/', newCategory, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        alert('✅ Категория добавлена!');
        this.newCategoryName = '';
        this.loadCategories();
      },
      error: () => {
        // Демо добавление
        this.categories.push({ ...newCategory, id: this.categories.length + 1 });
        this.newCategoryName = '';
        alert('✅ Категория добавлена (демо режим)');
      }
    });
  }
  
  editCategory(category: any): void {
    const newName = prompt('Введите новое название:', category.name);
    if (newName && newName.trim()) {
      category.name = newName;
      alert('✅ Категория обновлена');
    }
  }
  
  deleteCategory(id: number): void {
    if (confirm('Вы уверены, что хотите удалить эту категорию?')) {
      const token = localStorage.getItem('access_token');
      this.http.delete(`http://localhost:8000/api/categories/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: () => {
          this.loadCategories();
          alert('✅ Категория удалена');
        },
        error: () => {
          // Демо удаление
          this.categories = this.categories.filter(c => c.id !== id);
          alert('✅ Категория удалена (демо режим)');
        }
      });
    }
  }
}
import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Transaction } from '../../models/transaction';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('lineChart') lineChartRef!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;

  stats: any = null;
  categories: any[] = [];
  transactions: Transaction[] = [];
  
  // Для добавления дохода
  incomeAmount: number = 0;
  incomeDescription: string = '';
  incomeCategoryId: number = 0;
  
  // Для добавления расхода
  expenseAmount: number = 0;
  expenseDescription: string = '';
  expenseCategoryId: number = 0;
  
  // Для быстрых расходов с выбором суммы
  showModal: boolean = false;
  selectedCategory: any = null;
  customAmount: number = 0;
  
  quickCategories = [
    { name: 'Кафе', icon: 'fas fa-mug-hot' },
    { name: 'Транспорт', icon: 'fas fa-car' },
    { name: 'Продукты', icon: 'fas fa-shopping-basket' },
    { name: 'Такси', icon: 'fas fa-taxi' }
  ];

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadAllData();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.transactions.length > 0) {
        this.createChart();
      }
    }, 500);
  }

  loadAllData() {
    this.apiService.getStats().subscribe(data => {
      this.stats = data;
    });

    this.apiService.getCategories().subscribe(data => {
      this.categories = data;
      if (data && data.length > 0 && data[0].id) {
        this.incomeCategoryId = data[0].id;
        this.expenseCategoryId = data[0].id;
      }
    });

    this.apiService.getTransactions().subscribe(data => {
      console.log('Загружено транзакций для графика:', data.length);
      this.transactions = data;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.createChart();
      }, 300);
    });
  }

  addIncome() {
    if (this.incomeAmount <= 0) {
      alert('Введите сумму больше 0');
      return;
    }
    if (!this.incomeCategoryId) {
      alert('Выберите категорию');
      return;
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const transaction: Transaction = {
      amount: this.incomeAmount,
      type: 'income',
      description: this.incomeDescription || 'Доход',
      date: todayStr,
      category: this.incomeCategoryId
    };
    
    this.apiService.createTransaction(transaction).subscribe({
      next: () => {
        this.loadAllData();
        this.incomeAmount = 0;
        this.incomeDescription = '';
        alert('Доход добавлен');
      },
      error: (err) => {
        console.error('Ошибка:', err);
        alert('Ошибка: ' + (err.error?.error || err.message));
      }
    });
  }

  addExpense() {
    if (this.expenseAmount <= 0) {
      alert('Введите сумму больше 0');
      return;
    }
    if (!this.expenseCategoryId) {
      alert('Выберите категорию');
      return;
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const transaction: Transaction = {
      amount: this.expenseAmount,
      type: 'expense',
      description: this.expenseDescription || 'Расход',
      date: todayStr,
      category: this.expenseCategoryId
    };
    
    this.apiService.createTransaction(transaction).subscribe({
      next: () => {
        this.loadAllData();
        this.expenseAmount = 0;
        this.expenseDescription = '';
        alert('Расход добавлен');
      },
      error: (err) => {
        console.error('Ошибка:', err);
        alert('Ошибка: ' + (err.error?.error || err.message));
      }
    });
  }

  showAmountDialog(category: any) {
    this.selectedCategory = category;
    this.customAmount = 0;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedCategory = null;
    this.customAmount = 0;
  }

  addQuickExpense() {
    if (this.customAmount <= 0) {
      alert('Введите сумму больше 0');
      return;
    }
    
    const foundCategory = this.categories.find(c => c.name === this.selectedCategory.name);
    
    if (!foundCategory) {
      alert(`Сначала создай категорию "${this.selectedCategory.name}" в разделе Категории`);
      this.closeModal();
      return;
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const transaction: Transaction = {
      amount: this.customAmount,
      type: 'expense',
      description: this.selectedCategory.name,
      date: todayStr,
      category: foundCategory.id
    };
    
    this.apiService.createTransaction(transaction).subscribe({
      next: () => {
        this.loadAllData();
        alert(`Добавлен расход ${this.selectedCategory.name}: ${this.customAmount} ₸`);
        this.closeModal();
      },
      error: (err) => {
        console.error('Ошибка:', err);
        alert('Ошибка: ' + (err.error?.error || err.message));
      }
    });
  }

  createChart() {
    console.log('createChart вызван');
    
    if (!this.lineChartRef || !this.lineChartRef.nativeElement) {
      console.log('Canvas не найден, повторная попытка через 500ms');
      setTimeout(() => this.createChart(), 500);
      return;
    }

    const dates = this.getLast7Days();
    const incomeData: number[] = [];
    const expenseData: number[] = [];

    dates.forEach(date => {
      let income = 0;
      let expense = 0;
      
      this.transactions.forEach(t => {
        if (t.date === date) {
          if (t.type === 'income') {
            income += t.amount;
          } else {
            expense += t.amount;
          }
        }
      });
      
      incomeData.push(income);
      expenseData.push(expense);
    });

    const labels = dates.map(d => {
      const [year, month, day] = d.split('-');
      return `${day}.${month}`;
    });

    console.log('Даты:', labels);
    console.log('Доходы:', incomeData);
    console.log('Расходы:', expenseData);

    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    this.chart = new Chart(this.lineChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: '💰 Доходы',
            data: incomeData,
            borderColor: '#34c759',
            backgroundColor: 'rgba(52, 199, 89, 0.1)',
            borderWidth: 3,
            tension: 0.2,
            fill: true,
            pointBackgroundColor: '#34c759',
            pointBorderColor: '#fff',
            pointRadius: 5,
            pointHoverRadius: 7
          },
          {
            label: '📉 Расходы',
            data: expenseData,
            borderColor: '#ff3b30',
            backgroundColor: 'rgba(255, 59, 48, 0.1)',
            borderWidth: 3,
            tension: 0.2,
            fill: true,
            pointBackgroundColor: '#ff3b30',
            pointBorderColor: '#fff',
            pointRadius: 5,
            pointHoverRadius: 7
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { size: 12, weight: 'bold' } }
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: ${context.raw} ₸`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => value + ' ₸'
            }
          }
        }
      }
    });
    
    console.log('График создан успешно');
  }

  getLast7Days(): string[] {
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
    }
    return dates;
  }

  logout() {
    this.authService.logout();
  }
}
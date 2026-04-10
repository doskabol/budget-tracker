# 💰 Budget Tracker — CoinKeeper Style

A simple and intuitive web application to help you track your income, expenses, and manage your personal budget effectively. Built as a group project for web development course.

**Group Members:** Abdikarim Dosbol, Kystaubekov Mukhamedjan

> *Group of 2 students (approved by instructor)*

---

## 🚀 Features

- ✅ Add income and expense transactions
- ✅ Real-time balance, total income, and total expenses
- ✅ Edit and delete transactions
- ✅ Filter transactions by category
- ✅ Category management with detailed statistics
- ✅ Saving goals with progress bar
- ✅ Debt tracking ("I owe" / "Owe me" sections)
- ✅ Dynamic chart (last 7 days income/expenses)
- ✅ JWT authentication (login/register/logout)
- ✅ Fully responsive design (mobile-friendly)
- ✅ Persistent data storage using PostgreSQL/SQLite

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Angular 17, TypeScript, HTML5, CSS3, Chart.js, Font Awesome |
| **Backend** | Django 4, Django REST Framework (DRF) |
| **Authentication** | Token Authentication (JWT) |
| **Database** | SQLite (development) |
| **Version Control** | Git & GitHub |
| **API Testing** | Postman |

---

## 📁 Project Structure
budget-tracker/
├── backend/ # Django backend
│ ├── api/ # Main application
│ │ ├── models.py # Database models
│ │ ├── views.py # API endpoints (FBV + CBV)
│ │ ├── serializers.py # DRF serializers
│ │ └── urls.py # API routes
│ └── budget_tracker/ # Django settings
├── frontend/ # Angular frontend
│ └── src/app/
│ ├── components/ # UI components
│ ├── services/ # API services (HttpClient)
│ ├── models/ # TypeScript interfaces
│ ├── guards/ # Auth guard for routes
│ └── interceptors/ # JWT token interceptor
├── postman/ # Postman collection
└── README.md


---

## 🗄️ Database Models

| Model | Description |
|-------|-------------|
| `User` | Django default user model |
| `Category` | Transaction categories (food, transport, etc.) |
| `Transaction` | Income/expense records (amount, type, date, category) |
| `SavingGoal` | Savings goals with target amount and progress |
| `Debt` | Debts with direction (I owe / Owe me) |
| `BudgetLimit` | Monthly budget limits per category |

### Relationships (ForeignKey)
- `Transaction → Category`
- `Transaction → User`
- `SavingGoal → User`
- `Debt → User`
- `BudgetLimit → Category & User`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register/` | User registration |
| POST | `/api/login/` | Login (returns token) |
| POST | `/api/logout/` | Logout (deletes token) |
| GET | `/api/transactions/` | List all transactions |
| POST | `/api/transactions/` | Create transaction |
| PUT | `/api/transactions/{id}/` | Update transaction |
| DELETE | `/api/transactions/{id}/` | Delete transaction |
| GET | `/api/categories/` | List categories |
| POST | `/api/categories/` | Create category |
| GET | `/api/saving-goals/` | List saving goals |
| POST | `/api/saving-goals/` | Create saving goal |
| GET | `/api/debts/` | List debts |
| POST | `/api/debts/` | Create debt |
| GET | `/api/stats/` | Balance + chart statistics |

---

## 🖥️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/budget-tracker.git
cd budget-tracker
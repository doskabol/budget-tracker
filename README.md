# Budget Tracker - Финансовый трекер

## 📱 О проекте

Budget Tracker - это веб-приложение для учета личных финансов, разработанное в рамках курсового проекта. Приложение позволяет отслеживать доходы и расходы, управлять категориями, ставить финансовые цели, контролировать долги и просматривать банкоматы на карте.

## 👥 Разработчики

- **Abdikarim Dosbol**
- **Kystaubekov Mukhamedzhan**

## 🛠 Технологический стек

### Backend
- **Django** - веб-фреймворк
- **Django REST Framework** - создание API
- **Simple JWT** - JWT-аутентификация
- **SQLite** - база данных
- **django-cors-headers** - CORS настройки

### Frontend
- **Angular 17+** - SPA фреймворк
- **TypeScript** - язык программирования
- **Chart.js** - построение графиков
- **2GIS API** - карта банкоматов
- **Font Awesome** - иконки

## 📋 Функциональные требования

### Выполненные требования:

1. ✅ **Angular** - не менее 4 событий `(click)` с вызовом API
2. ✅ **Angular** - не менее 4 форм с `[(ngModel)]`
3. ✅ **Angular** - Routing модуль с маршрутами: `/profile`, `/history`, `/categories`, `/goals`, `/debts`, `/map`
4. ✅ **Angular** - Использование `@for` и `@if` синтаксиса
5. ✅ **Angular** - JWT интерцептор, логин, логаут
6. ✅ **Angular** - Один сервис `ApiService` для всех HTTP запросов
7. ✅ **Angular** - Graceful error handling
8. ✅ **CSS стили** - адаптивный дизайн

### Backend:

1. ✅ **Django + DRF** - минимум 4 модели
2. ✅ **ForeignKey** - минимум 2 связи
3. ✅ **2 кастомных Serializer и 2 ModelSerializer**
4. ✅ **2 Function-Based Views + 2 Class-Based Views**
5. ✅ **JWT токены** - login/logout endpoints
6. ✅ **CRUD** - для модели Transaction
7. ✅ **request.user** - автоматическая подстановка пользователя
8. ✅ **CORS** - настроен для Angular (http://localhost:4200)

### Дополнительно:

1. ✅ **Аватарка** - загрузка и хранение на бэкенде
2. ✅ **2GIS API** - карта с банкоматами
3. ✅ **Бургер-меню** - адаптивное для мобильных устройств
4. ✅ **Премиум подписка** - ограничение доступа к некоторым функциям

## 🚀 Установка и запуск

### Требования:
- Python 3.11+
- Node.js 18+
- Angular CLI 17+

### Backend:

```bash
# Переход в папку бэкенда
cd backend

# Создание виртуального окружения
python -m venv venv

# Активация виртуального окружения
venv\Scripts\activate

# Установка зависимостей
pip install -r requirements.txt

# Миграции базы данных
python manage.py makemigrations
python manage.py migrate

# Создание суперпользователя
python manage.py createsuperuser

# Запуск сервера
python manage.py runserver

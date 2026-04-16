# ServiceHub Backend

Django REST API backend for the ServiceHub cross-platform client.

## Запуск

1. Собрать и запустить контейнеры:
   ```bash
   docker-compose up --build
   ```

2. Применить миграции и создать суперпользователя в контейнере backend:
   ```bash
   docker compose exec backend python manage.py migrate
   docker compose exec backend python manage.py createsuperuser
   ```

3. Открыть API:
   - http://localhost:8000/api/
   - http://localhost:8000/api/docs/

## Frontend запуск

1. Перейти в папку с клиентом:
   ```bash
   cd frontend
   ```
2. Установить зависимости и запустить Electron:
   ```bash
   npm install
   npm start
   ```

## Структура

- `servicehub/` — конфигурация Django проекта
- `apps/users/` — кастомная модель пользователя и auth API
- `apps/requests_app/` — модуль заявок
- `apps/news/` — модуль новостей

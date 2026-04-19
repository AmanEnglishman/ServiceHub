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

## Веб-интерфейс

1. Запустить проект:
   ```bash
   docker-compose up --build
   ```
2. Применить миграции и создать суперпользователя:
   ```bash
   docker compose exec backend python manage.py migrate
   docker compose exec backend python manage.py createsuperuser
   ```
3. Открыть в браузере:
   - http://localhost:8000/
   - http://localhost:8000/admin/
   - http://localhost:8000/api/docs/

> В проект добавлен простой Django-шаблонный интерфейс для работы с заявками и новостями без отдельного Electron-клиента.

## Структура

- `servicehub/` — конфигурация Django проекта
- `apps/users/` — кастомная модель пользователя и auth API
- `apps/requests_app/` — модуль заявок
- `apps/news/` — модуль новостей

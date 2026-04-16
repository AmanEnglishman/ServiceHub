from django.urls import path
from .views import RequestListCreateAPIView, RequestPartialUpdateAPIView

urlpatterns = [
    path('requests/', RequestListCreateAPIView.as_view(), name='request-list-create'),
    path('requests/<int:pk>/', RequestPartialUpdateAPIView.as_view(), name='request-partial-update'),
]

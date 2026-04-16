from django.urls import path
from .views import NewsListCreateAPIView, NewsDetailAPIView

urlpatterns = [
    path('news/', NewsListCreateAPIView.as_view(), name='news-list-create'),
    path('news/<int:pk>/', NewsDetailAPIView.as_view(), name='news-detail'),
]

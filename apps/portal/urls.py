from django.urls import path

from .views import (
    DashboardView,
    NewsListView,
    PortalLoginView,
    PortalLogoutView,
    RequestCreateView,
    RequestListView,
)

urlpatterns = [
    path('', DashboardView.as_view(), name='portal-home'),
    path('requests/', RequestListView.as_view(), name='portal-requests'),
    path('requests/new/', RequestCreateView.as_view(), name='portal-request-new'),
    path('news/', NewsListView.as_view(), name='portal-news'),
    path('login/', PortalLoginView.as_view(), name='login'),
    path('logout/', PortalLogoutView.as_view(), name='logout'),
]
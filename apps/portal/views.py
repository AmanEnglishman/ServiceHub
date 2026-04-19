from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.views import LoginView, LogoutView
from django.urls import reverse_lazy
from django.views.generic import CreateView, ListView, TemplateView

from apps.news.models import News
from apps.requests_app.models import RequestItem


class PortalLoginView(LoginView):
    template_name = 'portal/login.html'
    redirect_authenticated_user = True


class PortalLogoutView(LogoutView):
    next_page = reverse_lazy('login')


class DashboardView(LoginRequiredMixin, TemplateView):
    template_name = 'portal/home.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['request_count'] = RequestItem.objects.count()
        context['news_count'] = News.objects.count()
        context['recent_requests'] = RequestItem.objects.select_related('created_by').order_by('-created_at')[:5]
        context['recent_news'] = News.objects.order_by('-created_at')[:5]
        return context


class RequestListView(LoginRequiredMixin, ListView):
    model = RequestItem
    template_name = 'portal/requests.html'
    context_object_name = 'requests'
    ordering = ['-created_at']


class RequestCreateView(LoginRequiredMixin, CreateView):
    model = RequestItem
    fields = ['title', 'description']
    template_name = 'portal/request_form.html'
    success_url = reverse_lazy('portal-requests')

    def form_valid(self, form):
        form.instance.created_by = self.request.user
        return super().form_valid(form)


class NewsListView(LoginRequiredMixin, ListView):
    model = News
    template_name = 'portal/news.html'
    context_object_name = 'news_list'
    ordering = ['-created_at']

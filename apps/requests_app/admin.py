from django.contrib import admin
from .models import RequestItem


@admin.register(RequestItem)
class RequestItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'created_by', 'created_at')
    list_filter = ('status',)
    search_fields = ('title', 'description', 'created_by__username')

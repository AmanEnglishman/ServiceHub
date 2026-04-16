from rest_framework import serializers
from .models import RequestItem


class RequestSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = RequestItem
        fields = ['id', 'title', 'description', 'status', 'created_at', 'created_by']
        read_only_fields = ['created_at', 'created_by']

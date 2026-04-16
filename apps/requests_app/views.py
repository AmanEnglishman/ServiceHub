from rest_framework import generics, permissions
from .models import RequestItem
from .serializers import RequestSerializer


class RequestListCreateAPIView(generics.ListCreateAPIView):
    queryset = RequestItem.objects.select_related('created_by').all().order_by('-created_at')
    serializer_class = RequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class RequestPartialUpdateAPIView(generics.UpdateAPIView):
    queryset = RequestItem.objects.all()
    serializer_class = RequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['patch']

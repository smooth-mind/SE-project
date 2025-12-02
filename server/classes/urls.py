from django.urls import path
from classes.views import CreateClassView, JoinClassView, ClassesView, ClassDetailView

urlpatterns = [
    path('create/', CreateClassView.as_view(), name='classes.create'),
    path('join/', JoinClassView.as_view(), name='classes.join'),
    path('', ClassesView.as_view(), name='classes.all'),
    path('<int:pk>/', ClassDetailView.as_view(), name='class-detail'),
]

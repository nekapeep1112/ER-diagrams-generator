from django.urls import path
from . import views
from . import auth_views

urlpatterns = [
    # Auth
    path('auth/register/', auth_views.RegisterView.as_view(), name='register'),
    path('auth/login/', auth_views.LoginView.as_view(), name='login'),
    path('auth/logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('auth/verify/', auth_views.VerifyTokenView.as_view(), name='verify-token'),
    path('auth/verify-email/', auth_views.VerifyEmailView.as_view(), name='verify-email'),
    path('auth/resend-verification/', auth_views.ResendVerificationView.as_view(), name='resend-verification'),
    path('auth/me/', auth_views.UserProfileView.as_view(), name='user-profile'),

    # Chats
    path('chats/', views.ChatListView.as_view(), name='chat-list'),
    path('chats/<uuid:chat_id>/', views.ChatDetailView.as_view(), name='chat-detail'),
    path('chats/<uuid:chat_id>/generate-title/', views.GenerateTitleView.as_view(), name='generate-title'),

    # Messages
    path('chats/<uuid:chat_id>/messages/', views.MessageView.as_view(), name='message-create'),

    # Saved schemas
    path('schemas/', views.SavedSchemaListView.as_view(), name='schema-list'),
    path('schemas/<uuid:schema_id>/', views.SavedSchemaDetailView.as_view(), name='schema-detail'),
    path('schemas/<uuid:schema_id>/export/', views.SavedSchemaExportView.as_view(), name='schema-export'),

    # Tags
    path('tags/', views.TagListView.as_view(), name='tag-list'),
    path('tags/<uuid:tag_id>/', views.TagDetailView.as_view(), name='tag-detail'),
]

from django.urls import path
from .views import create_user, get_users, get_user, update_user, delete_user,file_upload , file_history , cleanup_files ,user_login , user_logout,chat,getners

urlpatterns = [
    path('users/', get_users, name='get_users'),
    path('users/create/', create_user, name='create_user'),
    path('users/<int:id>/', get_user, name='get_user'),
    path('users/update/<int:id>/', update_user, name='update_user'),
    path('users/delete/<int:id>/', delete_user, name='delete_user'),
    path('users/upload/', file_upload, name='file_upload'),
    path('users/cleanup/', cleanup_files, name='cleanup_files'),
    path('users/history/', file_history, name='file_history'),
    path('users/login/', user_login, name='login'),
    path('users/logout/', user_logout, name='logout'),
    path('users/chat/',chat,name='chat'),
    path('users/ncr/',getners,name='ners')
]
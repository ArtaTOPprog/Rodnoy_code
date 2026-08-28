from django.contrib import admin
from .models import *

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['id','username','email']
    search_fields = ['username', 'email']

@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    list_display = ['name', 'region', 'city', 'is_popular']
    list_filter = ['region', 'city', 'is_popular']
    search_fields = ['name']

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['id','user', 'rating', 'created_at']
    list_filter = ['rating']

@admin.register(Generated_Route)
class Genrated_RouteAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'status', 'generated_at']
    list_filter = ['status']

@admin.register(Generated_Route_Place)
class Generated_Route_PlaceAdmin(admin.ModelAdmin):
    list_display = ['generated_route', 'place', 'day_number', 'order']

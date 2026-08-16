from django.contrib import admin
from .models import *

@admin.register(User)
class User(admin.ModelAdmin):
    list_display = ['id','username','email']

@admin.register(Place)
class Place(admin.ModelAdmin):
    list_display = ['name']

@admin.register(Review)
class Review(admin.ModelAdmin):
    list_display = ['id','user']

@admin.register(Generated_Route)
class Genrated_Route(admin.ModelAdmin):
    list_display = ['title']

@admin.register(Generated_Route_Place)
class Generated_Route_Place(admin.ModelAdmin):
    list_display = ['generated_route']

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from app.views import RegisterUser, QuestionnaireView, PlaceView, Generated_RouteView, filter_places, ReviewView, ProfileView

router = DefaultRouter()
router.register('questionnaires', QuestionnaireView, basename='questionnaire')
router.register('places', PlaceView, basename='place')
router.register('routes', Generated_RouteView, basename='route')
router.register('reviews', ReviewView, basename='review')

urlpatterns = [
    path('register/', RegisterUser.as_view(), name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('filter-places/', filter_places, name='filter_places'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('', include(router.urls)),
]

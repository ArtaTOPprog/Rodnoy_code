from django.shortcuts import render
from .models import User, Questionnaire, Generated_Route, Generated_Route_Place, Review, Place
from .serializers import (
    UserSerializer,
    QuestionnareSerializer,
    Generated_RouteSerializer,
    Generated_Route_PlaceSerializer,
    PlaceSerializer,
    ReviewSerializer,
    ProfileSerializer,
)
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, action, permission_classes
from .tasks import generate_itinerary
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated 
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterUser(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': serializer.data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = ProfileSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = ProfileSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def put(self, request):
        serializer = ProfileSerializer(request.user, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class QuestionnaireView(viewsets.ModelViewSet):
    queryset = Questionnaire.objects.all()
    serializer_class = QuestionnareSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class PlaceView(viewsets.ReadOnlyModelViewSet):
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer
    permission_classes = [AllowAny]

class Generated_RouteView(viewsets.ModelViewSet):
    queryset = Generated_Route.objects.all()
    serializer_class = Generated_RouteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        itinerary = serializer.save(user=self.request.user, status='pending')
        generate_itinerary.delay(itinerary.id)

    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):
        itinerary = self.get_object()
        return Response({
            'id': itinerary.id,
            'status': itinerary.status,
            'generator': itinerary.generator,
            'full_text': itinerary.full_text if itinerary.status == 'ready' else None
        })

class ReviewView(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

@api_view(['GET'])
@permission_classes([AllowAny])
def filter_places(request):
    region = request.query_params.get('region', '')
    interest = request.query_params.get('interest', '')
    places = Place.objects.all()
    if region:
        places = places.filter(region__icontains=region)
    if interest:
        places = places.filter(tags__contains=[interest])
    serializer = PlaceSerializer(places[:20], many=True)
    return Response(serializer.data)
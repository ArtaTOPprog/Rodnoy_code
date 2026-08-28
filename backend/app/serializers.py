from rest_framework import serializers
from .models import User, Questionnaire, Place, Generated_Route, Generated_Route_Place, Review
from django.contrib.auth.password_validation import validate_password

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'telegram', 'phone', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            telegram=validated_data.get('telegram', ''),
            phone=validated_data.get('phone', ''),
            password=validated_data['password'],
        )
        return user

class QuestionnareSerializer(serializers.ModelSerializer):
    class Meta:
        model = Questionnaire
        fields = '__all__'
        read_only_fields = ['user', 'created_at']

class PlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = '__all__'

class Generated_Route_PlaceSerializer(serializers.ModelSerializer):
    place = PlaceSerializer(read_only=True)
    class Meta:
        model = Generated_Route_Place
        fields = ['id', 'place', 'day_number', 'order', 'notes']

class Generated_RouteSerializer(serializers.ModelSerializer):
    place = Generated_Route_PlaceSerializer(source = 'generated_route_place_set', many=True, read_only=True)
    class Meta:
        model = Generated_Route
        fields = ['id', 'title', 'description', 'start_date', 'end_date', 'duration_days', 'status', 'generated_at', 'updated_at', 'full_text', 'places']
        read_only_fields = ['user', 'generated_at', 'updated_at', 'status', 'full_text']

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'generated_route', 'text', 'rating', 'created_at', 'image']
        read_only_fields = ['user', 'created_at']

    def validate_rating(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError("Оценка должна быть от 1 до 5 включительно!")
        return value

    def validate_generated_route(self, route):
        request = self.context.get('request')

        if request and route.user_id != request.user_id:
            raise serializers.ValidationError("Этот маршрут вам не принадлежит!")
        return route
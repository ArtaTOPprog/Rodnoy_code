from rest_framework import serializers
from .models import User, Questionnaire, Place, Generated_Route, Generated_Route_Place, Review

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'telegram', 'phone']
        extra_kwargs = {'password': {'write_only':True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password']
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
        fields = ['id', 'title', 'description', 'start_date', 'end_date', 'duration_days', 'status', 'generated_at', 'updated_at', 'full_text']
        read_only_fields = ['user', 'generated_at', 'updated_at', 'status', 'full_text']

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ['user', 'created_at']
        
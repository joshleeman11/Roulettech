from rest_framework import serializers
from .models import Recipe

# Convert Python object to JSON
class RecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = ['id', 'name', 'description', 'ingredients']
from django.http import JsonResponse
from django.shortcuts import render
from .models import Recipe
from .serializers import RecipeSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

# API endpoints
@api_view(['GET', 'POST'])
def recipe_list(request):
    # Get all recipes
    if request.method == 'GET':
        recipes = Recipe.objects.all()
        serializer = RecipeSerializer(recipes, many=True)
        return Response(serializer.data)
    
    # Add a new recipe
    if request.method == 'POST':
        serializer = RecipeSerializer(data=request.data)
        print(serializer)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'DELETE'])
def recipe_detail(request, id):
    try:
        # Get specific recipe
        recipe = Recipe.objects.get(pk = id)
    except Recipe.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    
    # Get recipe
    if request.method == 'GET':
        serializer = RecipeSerializer(recipe)
        return Response(serializer.data)
    
    # Edit recipe
    elif request.method == 'PUT':
        serializer = RecipeSerializer(recipe, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Delete recipe
    elif request.method == 'DELETE':
        recipe.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
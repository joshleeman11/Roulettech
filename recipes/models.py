from django.db import models

# Creating Recipe model to appear in database
class Recipe(models.Model):
    name = models.CharField(max_length=30)
    description = models.CharField(max_length=400)
    ingredients = models.JSONField(default=list)
    
    # String representation for each 'Recipe' in database
    def __str__(self) -> str:
        return self.name
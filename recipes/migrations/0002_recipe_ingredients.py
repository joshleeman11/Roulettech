# Generated by Django 5.0.7 on 2024-07-14 03:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("recipes", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="recipe",
            name="ingredients",
            field=models.JSONField(default=list),
        ),
    ]

import React, { useEffect, useState } from "react";
import axios from "axios";
import "./recipes.css";
import RecipeCard from "./RecipeCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { faMarker } from "@fortawesome/free-solid-svg-icons";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

function Recipes() {
    const [recipes, setRecipes] = useState([]);
    const [id, setId] = useState(0);
    const [recipeDetails, setRecipeDetails] = useState({
        name: "",
        description: "",
        ingredients: [],
    });
    const [editedRecipeDetails, setEditedRecipeDetails] = useState({
        name: "",
        description: "",
        ingredients: [],
    });
    const [matchedRecipes, setMatchedRecipes] = useState([]);
    const [editRecipeId, setEditRecipeId] = useState(null);
    const [fridgeIngredients, setFridgeIngredients] = useState({});
    const [ingredientCount, setIngredientCount] = useState(0);

    // Update front end to point to backend API
    const API_URL = 'http://35.153.160.215:8000/';

    const getRecipes = () => {
        axios
            .get(API_URL)
            .then((res) => {
                setRecipes(res.data);
            })
            .catch((error) => {
                console.log(error);
            });
    };
    const deleteRecipe = (id) => {
        axios
            .delete(`${API_URL}recipes/${id}`)
            .then(() => {
                getRecipes();
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const addRecipe = () => {
        axios
            .post(API_URL, recipeDetails)
            .then((res) => {
                getRecipes();
                setRecipeDetails({
                    name: "",
                    description: "",
                    ingredients: [],
                });
            })
            .catch((error) => {
                console.log(error);
            });
    };
    const handleDelete = (e) => {
        e.preventDefault();
        deleteRecipe(id);
    };
    const handleAddRecipe = (e) => {
        e.preventDefault();
        addRecipe();
    };
    const handleEditRecipe = (id) => {
        const recipeToEdit = recipes.find((recipe) => recipe.id === id);
        if (recipeToEdit) {
            setEditRecipeId(id);
            setEditedRecipeDetails({
                name: recipeToEdit.name,
                description: recipeToEdit.description,
                ingredients: recipeToEdit.ingredients,
            });
        }
    };
    const handleSavingRecipe = (id) => {
        axios
            .put(`${API_URL}recipes/${id}`, editedRecipeDetails)
            .then(() => {
                setEditRecipeId(null);
                setEditedRecipeDetails({
                    name: "",
                    description: "",
                    ingredients: [],
                });

                getRecipes();
            })
            .catch((error) => {
                console.log(error);
            });
    };
    const handleAddFridgeIngredient = (e) => {
        e.preventDefault();
        setFridgeIngredients((prevFridgeIngredients) => ({
            ...prevFridgeIngredients,
            [ingredientCount]: "",
        }));
        setIngredientCount((count) => count + 1);
    };
    const handleDeleteFridgeIngredient = (index) => {
        setFridgeIngredients((prevFridgeIngredients) =>
            Object.values(prevFridgeIngredients).filter((_, i) => i !== index)
        );
        setIngredientCount((count) => count - 1);
    };
    const ingredientsInRecipe = (fridgeIngredients, recipeIngredients) => {
        // Checks if ingredients in fridge matches any existing recipe
        // Allows for more ingredients in fridge than what recipe asks for
        if (fridgeIngredients.length >= recipeIngredients.length) {
            for (let i = 0; i < recipeIngredients.length; i++) {
                if (!fridgeIngredients.includes(recipeIngredients[i])) {
                    return false;
                }
            }
            return true;
        }
        return false;
    };
    const handleCheck = (e) => {
        e.preventDefault();
        const fridgeIngredientsList = Object.values(fridgeIngredients);
        let matchedRecipes = [];
        recipes.forEach((element) => {
            const recipeIngredients = element.ingredients;
            if (ingredientsInRecipe(fridgeIngredientsList, recipeIngredients)) {
                matchedRecipes.push(element);
            }
        });
        setMatchedRecipes(matchedRecipes);
    };
    useEffect(() => {
        getRecipes();
    }, []);

    return (
        <div className="grid-container">
            <div className="header">
                <h1>Community Recipes</h1>
                <Link to="home">Documentation</Link>
            </div>
            <div id="community-recipes">
                {recipes &&
                    recipes.map((recipe) => (
                        <RecipeCard
                            key={recipe.id}
                            recipe={recipe}
                            edit={editRecipeId === recipe.id}
                            match={false}
                            onEdit={handleEditRecipe}
                            onSave={handleSavingRecipe}
                            editedRecipeDetails={editedRecipeDetails}
                            setEditedRecipeDetails={setEditedRecipeDetails}
                        />
                    ))}
            </div>

            <div id="delete-recipe">
                <form onSubmit={handleDelete}>
                    <div>
                        <label style={{ marginRight: "5px" }} htmlFor="id">
                            Delete (id):
                        </label>
                        <input
                            type="text"
                            id="id"
                            placeholder="Enter id to delete"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                        />
                    </div>

                    <button type="submit">Delete Recipe</button>
                </form>
            </div>
            <div id="add-recipe">
                <form onSubmit={handleAddRecipe}>
                    <div className="form-group">
                        <label style={{ marginRight: "7px" }} htmlFor="name">
                            Name:
                        </label>
                        <input
                            type="text"
                            id="name"
                            placeholder="Enter name"
                            value={recipeDetails.name}
                            onChange={(e) => [
                                setRecipeDetails((prevRecipeDetails) => ({
                                    ...prevRecipeDetails,
                                    name: e.target.value,
                                })),
                            ]}
                        />
                    </div>

                    <div
                        className="form-group"
                        style={{ alignItems: "flex-start" }}
                    >
                        <label
                            style={{ marginRight: "7px" }}
                            htmlFor="description"
                        >
                            Description:
                        </label>
                        <textarea
                            type="text"
                            id="description"
                            placeholder="Enter description"
                            value={recipeDetails.description}
                            onChange={(e) => [
                                setRecipeDetails((prevRecipeDetails) => ({
                                    ...prevRecipeDetails,
                                    description: e.target.value,
                                })),
                            ]}
                        />
                    </div>

                    <div
                        className="form-group"
                        style={{ alignItems: "flex-start" }}
                    >
                        <label
                            style={{ marginRight: "7px" }}
                            htmlFor="ingredients"
                        >
                            Ingredients:
                        </label>
                        <textarea
                            type="text"
                            id="ingredients"
                            placeholder="Enter ingredients (comma separated)"
                            value={recipeDetails.ingredients}
                            onChange={(e) => [
                                setRecipeDetails((prevRecipeDetails) => ({
                                    ...prevRecipeDetails,
                                    ingredients: e.target.value
                                        .split(",")
                                        .map((ingredient) => ingredient.trim()),
                                })),
                            ]}
                        />
                    </div>

                    <button type="submit">Add Recipe</button>
                </form>
            </div>

            <div id="check-recipe">
                <label htmlFor="form">
                    Add ingredients to see what you can make!
                </label>
                <form onSubmit={handleCheck}>
                    {Object.values(fridgeIngredients).map(
                        (ingredient, index) => (
                            <div key={index}>
                                <input
                                    type="text"
                                    value={ingredient}
                                    onChange={(e) =>
                                        setFridgeIngredients(
                                            (prevFridgeIngredients) => ({
                                                ...prevFridgeIngredients,
                                                [index]: e.target.value,
                                            })
                                        )
                                    }
                                />
                                <FontAwesomeIcon
                                    icon={faTrashCan}
                                    onClick={() =>
                                        handleDeleteFridgeIngredient(index)
                                    }
                                    style={{
                                        cursor: "pointer",
                                        marginLeft: "5px",
                                    }}
                                />
                            </div>
                        )
                    )}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <FontAwesomeIcon
                            icon={faCirclePlus}
                            onClick={handleAddFridgeIngredient}
                            style={{ cursor: "pointer", marginRight: "5px" }}
                        />

                        <button type="submit">Check</button>
                    </div>
                </form>
                {matchedRecipes.length > 0 && (
                    <div>
                        <h3>Here is what you can make!</h3>
                        {matchedRecipes.map((recipe) => (
                            <RecipeCard
                                key={recipe.id}
                                recipe={recipe}
                                edit={false}
                                match={true}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Recipes;

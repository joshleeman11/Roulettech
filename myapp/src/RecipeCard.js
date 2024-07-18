import React from "react";
import PropTypes from "prop-types";
import "./RecipeCard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMarker, faCheck } from "@fortawesome/free-solid-svg-icons";

const RecipeCard = ({
    recipe,
    edit,
    match,
    onEdit,
    onSave,
    editedRecipeDetails,
    setEditedRecipeDetails,
}) => {
    return (
        <div className="recipe-card">
            <div className="recipe-header">
                <div className="title-description">
                    {!edit ? (
                        <p style={{ width: "300px" }} className="recipe-name">
                            {recipe.name}
                        </p>
                    ) : (
                        <input
                            type="text"
                            style={{ border: "1px solid #007bff" }}
                            className="recipe-name"
                            value={editedRecipeDetails.name}
                            onChange={(e) => [
                                setEditedRecipeDetails(
                                    (prevEditedRecipeDetails) => ({
                                        ...prevEditedRecipeDetails,
                                        name: e.target.value,
                                    })
                                ),
                            ]}
                        />
                    )}
                    {!edit ? (
                        <p
                            style={{ width: "300px" }}
                            className="recipe-description"
                        >
                            {recipe.description}
                        </p>
                    ) : (
                        <input
                            type="text"
                            style={{ border: "1px solid #007bff" }}
                            className="recipe-description"
                            value={editedRecipeDetails.description}
                            onChange={(e) => {
                                setEditedRecipeDetails(
                                    (prevEditedRecipeDetails) => ({
                                        ...prevEditedRecipeDetails,
                                        description: e.target.value,
                                    })
                                );
                            }}
                        />
                    )}
                </div>

                <div className="recipe-details">
                    {!match ? (
                        <FontAwesomeIcon
                            icon={!edit ? faMarker : faCheck}
                            onClick={
                                !edit
                                    ? () => onEdit(recipe.id)
                                    : () => onSave(recipe.id)
                            }
                            style={{
                                cursor: "pointer",
                                marginInline: "7px",
                            }}
                        />
                    ) : null}
                    <p id="id">{recipe.id}</p>
                </div>
            </div>
            <p className="recipe-ingredients">
                <strong style={{ paddingRight: "5px" }}>Ingredients:</strong>
                {!edit ? (
                    recipe.ingredients.join(", ")
                ) : (
                    <input
                        type="text"
                        style={{ border: "1px solid #007bff" }}
                        id="recipe-ingredients"
                        value={editedRecipeDetails.ingredients.join(", ")}
                        onChange={(e) => {
                            setEditedRecipeDetails(
                                (prevEditedRecipeDetails) => ({
                                    ...prevEditedRecipeDetails,
                                    ingredients: e.target.value
                                        .split(",")
                                        .map((ingredient) => ingredient.trim()),
                                })
                            );
                        }}
                    />
                )}
            </p>
        </div>
    );
};

RecipeCard.propTypes = {
    recipe: PropTypes.object.isRequired,
    edit: PropTypes.bool.isRequired,
    match: PropTypes.bool.isRequired,
    onEdit: PropTypes.func,
    onSave: PropTypes.func,
    editedRecipeDetails: PropTypes.object,
    setEditedRecipeDetails: PropTypes.func,
};

export default RecipeCard;

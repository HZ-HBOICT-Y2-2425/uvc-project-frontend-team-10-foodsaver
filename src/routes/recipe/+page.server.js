export async function load({ params }) {
    const apiKey = "7e9812af07664d9cab95027605fc7484";
    const recipeId = "663971";

    const response = await fetch(
        `https://api.spoonacular.com/recipes/${recipeId}/information?includeNutrition=false&apiKey=${apiKey}`
    );

    if (!response.ok) {
        return { error: "Failed to fetch recipe details." };
    }

    const recipe = await response.json();
    return { recipe };
}

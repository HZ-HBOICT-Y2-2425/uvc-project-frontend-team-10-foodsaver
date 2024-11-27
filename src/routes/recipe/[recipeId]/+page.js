export async function load({ params, fetch }) {
  const { recipeId } = params;
  const apiKey = "4b94021e0008460490fb26e12c8ec0f0";

  try {
    const response = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`);
    if (!response.ok) {
      return { status: 404, error: new Error('Recipe not found') };
    }

    const recipe = await response.json();
    console.log('Recipe data from API:', recipe);
    console.log('recipeId:', recipeId);

    return {
      props: {
        recipe
      }
    };
  } catch (error) {
    return { status: 500, error: new Error('Failed to load data') };
  }
}

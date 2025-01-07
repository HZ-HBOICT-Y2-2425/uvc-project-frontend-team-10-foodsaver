import { API_KEY } from '../../../lib/index'; // Import the API key

export async function load({ params, fetch }) {
  const { recipeId } = params;

  try {
    const response = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`);
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
    console.error('Request failed:', error);
    return {
      status: 500,
      error: new Error('Request failed')
    };
  }
}

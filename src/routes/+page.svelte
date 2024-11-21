<script>
  import RecipeSearch from "../components/RecipeSearch.svelte";
  import Pantry from "../components/Pantry.svelte";
  import { goto } from "$app/navigation";

  function navigateToRecipe() {
    goto("/recipe");
  }
</script>

<div>
  <button
    on:click={navigateToRecipe}
    class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4"
  >
    Go to Recipe Page
  </button>
</div>

<div class="main-content mt-4 flex-1 flex">
  <RecipeSearch />
</div>

<style>
  .main-content {
    display: flex;
    flex-grow: 1;
  }
</style>

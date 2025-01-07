<script lang="ts">

  import { authStore } from "./../../../lib/stores/authStore.js";
  import { goto } from "$app/navigation";
  import { pantryStore } from "./../../../lib/stores/pantryStore"; // Import pantry store
  import { searchedIngredients } from "./../../../lib/stores/ingredientStore.js";
  import { writable } from "svelte/store";
  import { onMount, onDestroy } from "svelte";

let pantry = [];
let missingIngredients = [];
let showShoppingList = false;
let user_id = 1;

authStore.subscribe((state) => {
  console.log("Auth store state in home page: ", state);
  user_id = state.user?.id || 1;
  console.log("user id is: ", user_id);
});

async function fetchPantryItems() {
  try {
    const response = await fetch(`http://localhost:4010/pantry?user_id=${user_id}`);
    if (response.ok) {
      pantry = await response.json();
      console.log("Pantry items fetched:", pantry);
    } else {
      console.error("Failed to fetch pantry items");
    }
  } catch (error) {
    console.error("Error fetching pantry items:", error);
  }
}

function toggleShoppingList() {
  if (!showShoppingList) {
    findMissingIngredients();
  }
  showShoppingList = !showShoppingList;
}

function closeShoppingList() {
  showShoppingList = false;
}

function findMissingIngredients() {
  if (!recipe?.extendedIngredients || !Array.isArray(pantry)) return;

  missingIngredients = [];
  const recipeIngredients = recipe.extendedIngredients.map((ingredient) => ({
    name: ingredient.name || ingredient.original,
    requiredQuantity: ingredient.amount || 0,
  }));

  for (const recipeIngredient of recipeIngredients) {
    const pantryItem = pantry.find(
      (item) => item.name.toLowerCase() === recipeIngredient.name.toLowerCase()
    );

    if (!pantryItem || pantryItem.quantity < recipeIngredient.requiredQuantity) {
      const missingQuantity =
        recipeIngredient.requiredQuantity - (pantryItem?.quantity || 0);
      missingIngredients.push({
        name: recipeIngredient.name,
        requiredQuantity: missingQuantity,
      });
    }
  }
}

async function saveShoppingList() {
  console.log("Full Recipe Data:", recipe);

  if (!recipe || !recipe.title || !recipe.image) {
    console.error("Invalid recipe data:", recipe);
    alert("Recipe data is missing or incomplete.");
    return;
  }

  console.log("Saving shopping list with data:", {
    userId: user_id,
    shoppingListName: recipe.title,  // Recipe name as shopping list name
    ingredients: missingIngredients, // Missing ingredients
    recipeTitle: recipe.title,       // Recipe title
    recipeImage: recipe.image,       // Recipe image URL
  });

  if (missingIngredients.length === 0) {
    alert("No missing ingredients to save!");
    return;
  }

  try {
    const shoppingListResponse = await fetch('http://localhost:4053/shopping-lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user_id,
        shoppingListName: recipe.title,
        ingredients: missingIngredients,
        recipeTitle: recipe.title,
        recipeImage: recipe.image,
      }),
    });

    if (shoppingListResponse.ok) {
      alert("Shopping list saved successfully!");
    } else {
      const error = await shoppingListResponse.json();
      console.error("Failed to save shopping list:", error);
      alert("Failed to save shopping list.");
    }
  } catch (error) {
    console.error("Error saving shopping list:", error);
    alert("Error saving shopping list.");
  }
}






async function fetchShoppingLists() {
  try {
    const response = await fetch(`http://localhost:4053/shopping-lists?userId=${user_id}`);
    if (response.ok) {
      const shoppingLists = await response.json();
      console.log('Fetched shopping lists:', shoppingLists);
      savedShoppingLists = shoppingLists;
    } else {
      console.error('Failed to fetch shopping lists. Status:', response.status);
    }
  } catch (error) {
    console.error('Error fetching shopping lists:', error.message);
  }
}


// Example call for pantry items (replace with actual function logic)
fetchPantryItems();


  authStore.subscribe((state) => {
    user_id = state.user?.id || 1;
  });

  // Fetch recipe data from props
  export let data;
  const { recipe } = data.props;

  let isFavorite = false;
  let countdowns: Countdown[] = [];
  let showModal = false;
  let pantry = [];
  let showIngredientModal = writable<boolean>(false);
  let currentStepIndex = writable<number | null>(null);
  let name = writable<string>("");
  let amountUsed = writable<number>(0);
  let measurementUnit = writable<string>("grams");
  let selectedIngredient = writable<string>("");
  let selectedIngredientOriginal = writable<string>("");
  let selectedMeasurement = writable<string>("");
  let ingredient = writable<string>("");
  let selectedIngredients: { [key: number]: { name: string, amount: number, measurement: string } } = {}; // Initialize selectedIngredients
  let amount = writable<number>(0);

  interface Countdown {
    time: number;
    interval: NodeJS.Timeout | null;
    input: number;
  }

  // Subscribe to the pantry store to get pantry data
  const unsubscribe = pantryStore.subscribe((data) => {
    pantry = data;
  });

  onDestroy(() => {
    // Unsubscribe to avoid memory leaks
    unsubscribe();
  });

  // Fetch pantry items from backend when component mounts
  onMount(() => {
    fetchPantryItems();
  });

  async function fetchPantryItems() {
    try {
      const response = await fetch(
        `http://localhost:4010/pantry?user_id=${user_id}`,
      );
      const data = await response.json();
      if (response.ok) {
        pantry = data;
        pantryStore.set(pantry);
      } else {
        console.error("Error fetching pantry items:", data.error);
      }
    } catch (error) {
      console.error("Error fetching pantry items:", error);
    }
  }
  const saveUsedAmount = async (): Promise<void> => {
    const selectedIngredientValue = $selectedIngredient; // Get the value of selectedIngredient
    const updateItem = {
      name: selectedIngredientValue,
      quantity: pantry.find(item => item.name === selectedIngredientValue)?.quantity - $amountUsed,
      measurement: $measurementUnit,
      user_id: user_id, // Automatically associate the logged-in user
    };

    try {
      const response = await fetch(
         `http://localhost:4010/pantry/update/${encodeURIComponent(selectedIngredientValue)}?user_id=${user_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateItem),
        },
      );

      const data = await response.json();

      if (response.ok) {
        console.log("Ingredient updated successfully:", data);
        fetchPantryItems(); // Reload pantry items
      } else {
        console.error("Error updating ingredient:", data.error);
      }

      // Reset fields and close the form
      ingredient.set("");
      amountUsed.set(0);
      measurementUnit.set("grams");
      showIngredientModal.set(false);
    } catch (error) {
      console.error("Error saving updated ingredient:", error);
    }
  };

  // Checking favorite status for recipe
  async function checkFavoriteStatus() {
    const response = await fetch(
      `http://localhost:3012/check-favorite/${recipe.id}?user_id=${user_id}`,
    );
    if (response.ok) {
      const data = await response.json();
      isFavorite = data.isFavorite;

    } else {
      console.error("Failed to check favorite status");

    }
  }

  checkFavoriteStatus();

  const openIngredientModal = (item) => {
    selectedIngredient.set(item.name);
    amount.set(0);
    selectedMeasurement.set(item.measurement);
    showIngredientModal.set(true);
  };

  // Toggle favorite status
  export async function toggleFavorite() {
    if (isFavorite) {
      const response = await fetch(
        `http://localhost:3012/favorites/${recipe.id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id }),
        },
      );
      if (response.ok) {
        alert("This recipe is removed from favorites");
        isFavorite = false;
      } else {
        const error = await response.json();
        alert(`Failed to remove from favorites: ${error.error}`);
      }
    } else {
      const response = await fetch("http://localhost:3012/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe_id: recipe.id, user_id }),
      });

      if (response.ok) {
        alert("This recipe is added to favorites");
        isFavorite = true;
      } else {
        const error = await response.json();
        alert(`Failed to add to favorites: ${error.error}`);
      }
    }
    checkFavoriteStatus();

  }

  function getSteps(instructions: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(instructions, "text/html");
    const textContent = doc.body.textContent || "";

    return textContent
      .split(".")
      .map((step) => step.trim())
      .filter((step) => step !== "");
  }

  function containsTime(step: string) {
    return /\b(minutes?|hours?|seconds?|mins?)\b/i.test(step);

  }

  function startCountdown(index: number, timeInSeconds: number) {
    if (timeInSeconds <= 0) return;

    if (!countdowns[index]) {
      countdowns[index] = {
        time: timeInSeconds,
        interval: null,
        input: timeInSeconds,
      };
    }

    if (countdowns[index]?.interval) {
      clearInterval(countdowns[index].interval);
    }

    countdowns[index].time = timeInSeconds;
    countdowns[index].interval = setInterval(() => {
      if (countdowns[index].time > 0) {
        countdowns[index].time -= 1;
        countdowns = [...countdowns];
      } else {
        clearInterval(countdowns[index].interval!);
        countdowns[index].interval = null;
        showTimeUpModal();
      }
    }, 1000);

    countdowns = [...countdowns];
  }

  function showTimeUpModal() {
    showModal = true;
  }

  function closeModal() {
    showModal = false;
  }

  // Function to split recipe instructions into individual steps
  function getSteps(instructions: string) {
    if (!instructions) return [];

    // Remove HTML tags from the instructions string
    instructions = instructions.replace(/<\/?[^>]+(>|$)/g, "");

    // Split by periods or newlines to create steps
    return instructions
      .split(/(?:\r?\n|\.\s*)/g)
      .filter((step) => step.trim().length > 0);
  }

  // Function to check if a step contains any time references
  function containsTime(step: string) {
    return /(\d+)(?:\s*min|\s*sec|\s*hour)/i.test(step);
  }

  let ingredients = [];
  searchedIngredients.subscribe((items) => {
    ingredients = items;
  });

  let message = "No ingredients from this recipe are in your pantry.";
</script>

{#if recipe}
  <div class="container w-full mx-auto px-4">
    <section class="flex flex-col lg:flex-row mt-5">

      <div
        class="basis-full lg:basis-2/6 bg-gray-100 rounded-lg p-4 lg:p-10 lg:mr-8 mb-4 lg:mb-0"
      >
        <img
          class="rounded-lg mb-5 w-full"
          src={recipe.image}
          alt={recipe.title}
        />
        <h2 class="text-2xl lg:text-4xl mt-3 mb-3">
          Ingredients in Your Pantry
        </h2>

        <!-- CO2 Calculation Button -->
        <div
          class="recipe-card mt-3 p-4 bg-white border border-gray-300 rounded-lg text-center"
        >
          <p class="text-lg font-semibold mb-4">
            If you finished this recipe, click below to calculate your CO2
            reduction.
          </p>
          <button
            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
          >
            Complete
          </button>
        </div>
      </div>

      <!-- Recipe details and instructions -->
      <div class="basis-full lg:basis-4/5 bg-gray-100 rounded-lg p-4 lg:p-10">
        <h1 class="text-2xl lg:text-4xl mt-3 mb-3">

      <div class="basis-2/6 bg-gray-100 rounded-lg p-10 lg:mr-8">
        <img class="rounded-lg mb-5" src={recipe.image} alt={recipe.title} />

        <h1 class="text-4xl mt-3 mb-3">

          {recipe.title}
          <img
            src={isFavorite ? "/solid-heart.png" : "/blank-heart.png"}
            alt="Favorite"
            class="inline-block w-6 h-6 cursor-pointer ml-3"
            on:click={toggleFavorite}
          />
        </h1>

        <div class="flex flex-wrap gap-2 mb-4">
          {#each recipe.dishTypes as type}
            <span
              class="bg-white border border-gray-300 text-black px-3 py-1 rounded-lg text-sm"
              >{type}</span
            >
          {/each}
        </div>

        <h2 class="text-2xl lg:text-4xl mt-3 mb-1">Ingredients</h2>
        <div class="mb-5">
          <ul>
            {#each recipe.extendedIngredients as ingredient}
              <li>{ingredient.original}</li>
            {/each}
          </ul>
        </div>

        <h2 class="text-2xl lg:text-4xl mt-3 mb-1">Instructions</h2>
        <p class="mb-1 text-gray-500 text-sm">
          (Make sure to input the amount of ingredients used after every step so
          we can calculate how much CO2 and money you have saved.)
        </p>
        {#each getSteps(recipe.instructions) as step, index (step)}
          <div class="step flex flex-col lg:flex-row items-start gap-4 mb-4">
            <div class="flex items-left">
              <h3 class="text-lg lg:text-xl">Step {index + 1}</h3>
              <button
                class="ml-2 flex items-center justify-left"
                on:click={() => openIngredientModal(index)}
              >
                {#if selectedIngredients[index]}
                  <img
                    src="../../../minus-button.png"
                    alt="Ingredient Added"
                    class="w-4 h-4"
                  />

        <h2 class="text-4xl mt-3 mb-3">Ingredients</h2>

<div>
  <ul>
    {#each recipe.extendedIngredients as ingredient}
      <li>{ingredient.original}</li>
    {/each}
  </ul>
  <button
    class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mt-4"
    on:click={toggleShoppingList}
  >
    Show Shopping List
  </button>
</div>

        <div
          class="recipe-card mt-3 p-4 bg-white border border-gray-300 rounded-lg text-center"
        >
          <p class="text-lg font-semibold mb-4">
            If you finished this recipe, you can click the button below to get
            your CO2 reduction calculated into account.
          </p>
          <button
            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Complete
          </button>
        </div>
      </div>
      <div class="basis-4/6 bg-gray-100 rounded-lg p-10 lg:mr-8">
        <h2 class="text-4xl mt-3 mb-3">Instructions</h2>
        {#each getSteps(recipe.instructions) as step, index (step)}
          <div class="step">
            <h3 class="text-xl">Step {index + 1}</h3>
            <p>{step}.</p>
            {#if containsTime(step)}
              <div class="flex items-center gap-2 mt-2">
                <span class="text-lg">⏰</span>
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  value={countdowns[index]?.minutes || ""}
                  on:input={(e) =>
                    updateCountdownMinutes(index, e.target.value)}
                  class="border border-gray-300 rounded px-2 w-20"
                />
                <span>:</span>
                <input
                  type="number"
                  placeholder="Sec"
                  min="0"
                  max="59"
                  value={countdowns[index]?.seconds || ""}
                  on:input={(e) =>
                    updateCountdownSeconds(index, e.target.value)}
                  class="border border-gray-300 rounded px-2 w-20"
                />
                <button
                  on:click={() =>
                    startCountdown(
                      index,
                      Number(countdowns[index]?.minutes || 0) * 60 +
                        Number(countdowns[index]?.seconds || 0),
                    )}
                  class="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Start
                </button>
                {#if countdowns[index] && countdowns[index].time !== null}
                  <p class="text-gray-700">
                    Time left: {Math.floor(countdowns[index].time / 60)}m
                    {countdowns[index].time % 60}s
                  </p>
                {:else if countdowns[index]?.minutes || countdowns[index]?.seconds}
                  <p class="text-gray-700">
                    Time left: {countdowns[index].minutes || 0}m
                    {countdowns[index]?.seconds || 0}s
                  </p>

                {:else}
                  <img
                    src="../../../add-button.png"
                    alt="Add Ingredient"
                    class="w-4 h-4"
                  />
                {/if}
              </button>
            </div>
            <div class="flex-2 text-left">
              <p class="mt-2">{step}.</p>

              {#if containsTime(step)}
                <div class="flex-3 items-left gap-2 mt-2 justify-end">
                  <span class="text-lg">⏰</span>
                  <input
                    type="number"
                    placeholder="Min"
                    min="0"
                    value={countdowns[index]?.minutes || ""}
                    on:input={(e) =>
                      updateCountdownMinutes(index, e.target.value)}
                    class="border border-gray-300 rounded px-2 w-20"
                  />
                  <span>:</span>
                  <input
                    type="number"
                    placeholder="Sec"
                    min="0"
                    max="59"
                    value={countdowns[index]?.seconds || ""}
                    on:input={(e) =>
                      updateCountdownSeconds(index, e.target.value)}
                    class="border border-gray-300 rounded px-2 w-20"
                  />
                  <button
                    on:click={() =>
                      startCountdown(
                        index,
                        Number(countdowns[index]?.minutes || 0) * 60 +
                          Number(countdowns[index]?.seconds || 0),
                      )}
                    class="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Start
                  </button>
                  {#if countdowns[index] && countdowns[index].time !== null}
                    <p class="text-gray-700">
                      Time left: {Math.floor(countdowns[index].time / 60)}m
                      {countdowns[index].time % 60}s
                    </p>
                  {:else if countdowns[index]?.minutes || countdowns[index]?.seconds}
                    <p class="text-gray-700">
                      Time left: {countdowns[index].minutes || 0}m
                      {countdowns[index]?.seconds || 0}s
                    </p>
                  {:else}
                    <p class="text-gray-700">Time left: 0m 0s</p>
                  {/if}
                </div>
              {/if}
            </div>
            <div class="flex-1">
              {#if selectedIngredients[index]}
                <p class="mt-2 text-green-600">
                  Used: {selectedIngredients[index].name}, {selectedIngredients[
                    index
                  ].amount}
                  {selectedIngredients[index].measurement}
                </p>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </section>
  </div>

  <!-- Modal for Time Up -->
  {#if showModal}
    <div
      class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50"
    >
      <div
        class="bg-white rounded-lg p-6 shadow-lg w-11/12 md:w-1/3 text-center"
      >
        <h2 class="text-2xl font-bold mb-4">Time to Go!</h2>
        <p>You've completed this step! Ready for the next?</p>
        <button
          class="bg-blue-500 text-white px-4 py-2 rounded mt-4"
          on:click={closeModal}
        >
          Close
        </button>
      </div>
    </div>
  {/if}

  <!-- Modal for Ingredient Selection -->
  {#if $showIngredientModal}
    <div
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg w-11/12 md:max-w-md">
        <h2 class="text-2xl font-bold text-green-600 mb-4">
          Select an Ingredient and an Amount Used
        </h2>
        <div class="mb-4">
          <select
            bind:value={$selectedIngredient}
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
          >
            <option value="">Select an ingredient</option>
            {#each pantry as ingredient}
              <option value={ingredient.name}>{ingredient.name}</option>
            {/each}
          </select>
        </div>
        <div class="mb-4">
          <input
            type="number"
            bind:value={$amountUsed}
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
          />Amount
        </div>
        <div class="mb-4">
          <select
            bind:value={$measurementUnit}
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
          >
            <option value="grams">Grams</option>
            <option value="milliliters">Milliliters</option>
            <option value="pieces">Pieces</option>
          </select>Measurement
        </div>
        <div class="flex justify-end space-x-4">
          <button
            on:click={() => showIngredientModal.set(false)}
            class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            on:click={saveUsedAmount}
            class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  {/if}
{/if}

{#if showShoppingList}
  <div
    class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white p-6 rounded-lg shadow-lg w-1/3 text-center">
      <h2 class="text-2xl font-bold mb-4">Shopping List</h2>
      {#if missingIngredients.length > 0}
        <ul>
          {#each missingIngredients as ingredient}
            <li>{ingredient.name} - {ingredient.requiredQuantity}g</li>
          {/each}
        </ul>
        <div class="mt-4 flex gap-4 justify-center">
          <button
            on:click={saveShoppingList}
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Save Shopping List
          </button>
          <button
            on:click={closeShoppingList}
            class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      {:else}
        <p>All ingredients are available in your pantry!</p>
        <div class="mt-4">
          <button
            on:click={closeShoppingList}
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}



<style>
  /* Add your custom styles here */
  .step {
    margin-bottom: 1.5rem;
  }
</style>

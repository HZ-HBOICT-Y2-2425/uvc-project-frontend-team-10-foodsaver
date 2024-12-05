<script lang="ts">
	// import { authStore } from './../../../lib/stores/authStore.js';
  import { goto } from "$app/navigation";

  // It doesn't work since we don't have a user_id in frontend store
  // let user_id = 1;
  // authStore.subscribe((state) => {
  //   console.log("Auth store state in home page: ", state);
  //   user_id = state.user?.id || 1;
  // });

  export let data;
  const { recipe } = data.props;
  console.log("Recipe data in component:", recipe);

  let isFavorite = false;
  let countdowns: Countdown[] = [];
  let showModal = false;
  const user_id = 1;

  interface Countdown {
    time: number; // Remaining time
    interval: NodeJS.Timeout | null; // Interval reference
    input: number; // User-entered time in seconds
  }

  async function checkFavoriteStatus() {
    // TODO: Pass the user_id from authStore or somewhere else
    const response = await fetch(
        `http://localhost:3012/check-favorite/${recipe.id}?user_id=${user_id}`
    );

    if (response.ok) {
        const data = await response.json();
        isFavorite = data.isFavorite;
    } else {
        console.error("Failed to check favorite status");
    }
}

  checkFavoriteStatus();

  async function toggleFavorite() {
    // TODO: Pass the user_id from authStore or somewhere else
    if (isFavorite) {
        const response = await fetch(`http://localhost:3012/favorites/${recipe.id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id }),
        });

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
    if (timeInSeconds <= 0) return; // Prevent invalid timer input

    // Initialize countdown object
    if (!countdowns[index]) {
      countdowns[index] = {
        time: timeInSeconds,
        interval: null,
        input: timeInSeconds,
      };
    }

    // Clear any existing interval
    if (countdowns[index]?.interval) {
      clearInterval(countdowns[index].interval);
    }

    // Start new countdown
    countdowns[index].time = timeInSeconds;
    countdowns[index].interval = setInterval(() => {
      if (countdowns[index].time > 0) {
        countdowns[index].time -= 1; // Decrement timer
        countdowns = [...countdowns]; // Trigger reactivity
      } else {
        clearInterval(countdowns[index].interval!); // Stop timer
        countdowns[index].interval = null;
        showTimeUpModal(); // Show modal when time is up
      }
    }, 1000);

    countdowns = [...countdowns]; // Trigger reactivity
  }

  function updateCountdownMinutes(index: number, value: string) {
    countdowns[index] = {
      ...countdowns[index],
      minutes: Number(value),
    };
    countdowns = [...countdowns]; // Trigger reactivity
  }

  function updateCountdownSeconds(index: number, value: string) {
    countdowns[index] = {
      ...countdowns[index],
      seconds: Number(value),
    };
    countdowns = [...countdowns]; // Trigger reactivity
  }

  function showTimeUpModal() {
    showModal = true;
  }

  function closeModal() {
    showModal = false;
  }
</script>

{#if recipe}
  <div class="container w-full mx-auto">
    <section class="flex flex-col lg:flex-row mt-5">
      <div class="basis-2/6 bg-gray-100 rounded-lg p-10 lg:mr-8">
        <img class="rounded-lg mb-5" src={recipe.image} alt={recipe.title} />

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
        <h1 class="text-4xl mt-3 mb-3">
          {recipe.title}
          <img
            src={isFavorite ? "/solid-heart.png" : "/blank-heart.png"}
            alt="Favorite"
            class="inline-block w-6 h-6 cursor-pointer ml-3"
            on:click={toggleFavorite}
          />
        </h1>

        <div class="flex flex-wrap gap-2">
          {#each recipe.dishTypes as type}
            <span
              class="bg-white border border-gray-300 text-black px-3 py-1 rounded-lg text-sm"
              >{type}</span
            >
          {/each}
        </div>

        <h2 class="text-4xl mt-3 mb-3">Ingredients</h2>
        <div>
          <ul>
            {#each recipe.extendedIngredients as ingredient}
              <li>{ingredient.original}</li>
            {/each}
          </ul>
        </div>

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
                  on:input={(e) => updateCountdownMinutes(index, e.target.value)}
                  class="border border-gray-300 rounded px-2 w-20"
                />
                <span>:</span>
                <input
                  type="number"
                  placeholder="Sec"
                  min="0"
                  max="59"
                  value={countdowns[index]?.seconds || ""}
                  on:input={(e)=>updateCountdownSeconds(index, e.target.value)}
                  class="border border-gray-300 rounded px-2 w-20"
                />
                <button
                  on:click={() =>
                    startCountdown(
                      index,
                      (Number(countdowns[index]?.minutes || 0) * 60) +
                      Number(countdowns[index]?.seconds || 0)
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
        {/each}
      </div>
    </section>
  </div>

  <!-- Modal for Time Up -->
  {#if showModal}
    <div
      class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 shadow-lg w-1/3 text-center">
        <h2 class="text-2xl font-bold mb-4">Time to Go!</h2>
        <p>You can move to the next step.</p>
        <div class="mt-4 flex justify-center gap-4">
          <button
            on:click={closeModal}
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            OK
          </button>
        </div>
        <button
          on:click={closeModal}
          class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
    </div>
  {/if}
{:else}
  <p>Loading...</p>
{/if}

<style>
  .fixed {
    position: fixed;
  }

  .inset-0 {
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }

  .bg-opacity-50 {
    background-color: rgba(0, 0, 0, 0.5);
  }

  .rounded-lg {
    border-radius: 0.5rem;
  }

  .shadow-lg {
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  }

  .z-50 {
    z-index: 50;
  }

  .recipe-card {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
  }

  .recipe-card p {
    font-size: 1.1rem;
  }

  .recipe-card button {
    font-size: 1.1rem;
  }
</style>

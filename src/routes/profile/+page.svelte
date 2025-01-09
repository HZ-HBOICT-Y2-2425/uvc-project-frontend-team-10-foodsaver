<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { authStore } from '../../lib/stores/authStore';
  
    let newUsername = '';
    let oldPassword = '';
    let newPassword = '';
    let errorMessage = '';
    let successMessage = '';
    let passwordErrorMessage = '';
    let passwordSuccessMessage = '';
    let token = '';
    let recipeCount = 0;
    let badges = [];
    let username = "";
    let savedShoppingLists = [];
    let user_id = null; // Initialize user_id
    let isLoading = true; // Loading state
    let selectedList = null; // Store the selected shopping list for display
    let isButtonDisabled = false; 

    $: username = $authStore.user?.username || 'Guest';
  
    authStore.subscribe(($authStore) => {
      token = $authStore.token;
      recipeCount = $authStore.recipeCount || 0;
    });
  
    $: {
    badges = [];
    if (recipeCount >= 1) badges.push({ image: '/badges/badge_1.png', description: 'Completed 1 recipe' });
    if (recipeCount >= 5) badges.push({ image: '/badges/badge_2.png', description: 'Completed 5 recipes' });
    if (recipeCount >= 10) badges.push({ image: '/badges/badge_3.png', description: 'Completed 10 recipes' });
  }
  
    onMount(() => {
      if (!token) {
        console.log('No token found, redirecting to login...');
        goto('/login');
      }
    });
  
    async function updateUsername() {
      console.log('Sending token:', token);
  
      const response = await fetch('http://localhost:4000/api/users/update-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newUsername }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        successMessage = data.message;
        errorMessage = '';
        newUsername = '';
  
        authStore.update((state) => ({
          ...state,
          user: data.user,
        }));
  
        console.log('Username successfully updated and authStore updated.');
      } else {
        errorMessage = data.message;
        successMessage = '';
        console.log('Failed to update username:', data.message);
      }
    }
  
    async function changePassword() {
      console.log('Changing password with token:', token);
  
      const response = await fetch('http://localhost:4000/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        passwordSuccessMessage = data.message;
        passwordErrorMessage = '';
        oldPassword = '';
        newPassword = '';
        console.log('Password successfully changed.');
      } else {
        passwordErrorMessage = data.message;
        passwordSuccessMessage = '';
        console.log('Failed to change password:', data.message);
      }
    }
  
      // Fetch shopping lists when the component mounts
     onMount(() => {
      const user = JSON.parse(localStorage.getItem("user"));
      user_id = user?.id || null;
      if (!user_id) {
        console.error("User not logged in or no user_id found in localStorage");
        return;
      }
      console.log("Retrieved user_id:", user_id);
      fetchShoppingLists();
    });
  
    // Function to fetch shopping lists from the backend
    async function fetchShoppingLists() {
      if (!user_id) {
        console.error("user_id is not defined. Cannot fetch shopping lists.");
        return;
      }
  
      try {
        const response = await fetch(`http://localhost:4053/shopping-lists?userId=${user_id}`);
        if (response.ok) {
          const lists = await response.json();
  
          // For each shopping list, fetch recipe details if available
          for (let list of lists) {
            if (list.recipe_id) {
              const recipeData = await fetchRecipeData(list.recipe_id);
              list.recipe_name = recipeData?.strMeal || "Unknown Recipe";
              list.recipe_image = recipeData?.strMealThumb || null;
            }
          }
  
          savedShoppingLists = lists;
        } else {
          console.error("Failed to fetch shopping lists:", await response.json());
        }
      } catch (error) {
        console.error("Error fetching shopping lists:", error);
      } finally {
        isLoading = false; // Stop loading once the data is fetched
      }
    }
  
    // Function to fetch recipe details based on the recipeId
    async function fetchRecipeData(recipeId) {
      if (!recipeId) {
        console.error('Invalid recipeId:', recipeId);
        return null;
      }
  
      try {
        const response = await fetch(`http://localhost:4053/proxy/mealdb?ingredient=${recipeId}`);
        if (response.ok) {
          const data = await response.json();
          return data?.meals?.[0] || null;
        } else {
          console.error('Failed to fetch recipe details:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching recipe details:', error);
      }
      return null;
    }
  
    // Handle click event to show details for the selected shopping list
    function handleSelectList(list) {
      selectedList = list; // Set the selected list for detailed view
    }
  
    // Close the selected list details
    function closeSelectedList() {
      selectedList = null;
    }
  </script>
  
  <div class="profile-page flex flex-col items-center bg-gray-100 py-8 px-4 sm:px-8">
    <header class="w-full max-w-5xl text-center mb-8">
      <h1 class="text-4xl font-bold text-green-600">Hello, <span class="italic">{username}!</span>!</h1>
    </header>
  
    <section class="w-full max-w-5xl flex flex-col sm:flex-row items-start">
      <div class="flex flex-col items-center bg-white shadow-lg rounded-lg p-6 sm:w-1/3">
        <img
          src="/images/profile-placeholder.png"
          alt="Profile Avatar"
          class="w-32 h-32 rounded-full border-4 border-gray-300 mb-6"
        />

        <form on:submit|preventDefault={updateUsername} class="w-full space-y-4">
          <div>
            <label for="username" class="block text-lg font-medium text-gray-700 mb-2">Name:</label>
            <input
              type="text"
              id="username"
              bind:value={newUsername}
              placeholder="update your username"
              class="block w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <button
            type="submit"
            class="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition"
          >
            Save
          </button>
        </form>
  
        {#if errorMessage}
          <p class="text-red-500 mt-4">{errorMessage}</p>
        {/if}
        {#if successMessage}
          <p class="text-green-500 mt-4">{successMessage}</p>
        {/if}
  
        <div class="mt-8 w-full">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Change Password</h2>
          <form on:submit|preventDefault={changePassword} class="space-y-4">
            <div>
              <label for="oldPassword" class="block text-lg font-medium text-gray-700 mb-2">Old Password:</label>
              <input
                type="password"
                id="oldPassword"
                bind:value={oldPassword}
                class="block w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label for="newPassword" class="block text-lg font-medium text-gray-700 mb-2">New Password:</label>
              <input
                type="password"
                id="newPassword"
                bind:value={newPassword}
                class="block w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <button
              type="submit"
              class="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
            >
              Update Password
            </button>
          </form>
  
          {#if passwordErrorMessage}
            <p class="text-red-500 mt-4">{passwordErrorMessage}</p>
          {/if}
          {#if passwordSuccessMessage}
            <p class="text-green-500 mt-4">{passwordSuccessMessage}</p>
          {/if}
        </div>
      </div>
  
      <div class="flex-grow mt-8 sm:mt-0 sm:ml-8 bg-white shadow-lg rounded-lg p-6 text-center">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Achievements</h2>
        <div class="badge-container mt-4 flex flex-wrap justify-center gap-4">
          {#each badges as badge}
            <div class="relative group">
              <img src={badge.image} alt="Achievement Badge" class="w-16 h-16 sm:w-20 sm:h-20 rounded-full shadow-md" />
              <div
                class="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-3 py-1 rounded bg-gray-800 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {badge.description}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </section>
  </div>  

<div class="ml-4 mr-4">
    <button
        class="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300"
        on:click={() => goto("/favorite")}
    >
        Favourites
    </button>


    <button
      class="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300"
      on:click={() => goto("/community")}
    >
      Community
    </button>
  </div>
  
  {#if isLoading}
    <p>Loading your shopping lists...</p>
  {:else if savedShoppingLists.length > 0}
    <ul class="list-disc list-inside">
      {#each savedShoppingLists as list}
        <li class="cursor-pointer">
          <h3 
            class="text-lg font-semibold hover:bg-gray-100 p-2 rounded"
            on:click={() => handleSelectList(list)} 
          >
            {list.recipe_name || `Shopping List ${list.id}`}
          </h3>
        </li>
      {/each}
    </ul>
  
    {#if selectedList}
      <div class="mt-4 p-4 bg-white shadow-lg rounded-md">
        <div class="flex justify-between items-center">
          <h3 class="text-xl font-semibold">{selectedList.recipe_name || `Shopping List ${selectedList.id}`}</h3>
          <button
            class="text-red-500 font-bold"
            on:click={closeSelectedList}
          >
            Close
          </button>
        </div>
  
        {#if selectedList.recipe_image}
          <img
            src={selectedList.recipe_image}
            alt={selectedList.recipe_name}
            class="w-64 h-64 object-cover rounded-md mt-4 mx-auto"
          />
        {:else}
          <p class="text-gray-500 mt-4 text-center">No image available</p>
        {/if}
  
        <ul class="list-none mt-2">
          {#each selectedList.items as ingredient}
            <li class="text-gray-700">{ingredient.name} - {ingredient.quantity}g</li>
          {/each}
        </ul>
      </div>
    {/if}
  {:else}
    <p>No saved shopping lists yet.</p>
  {/if}
  
  <style>
    .cursor-pointer:hover {
      background-color: #f7fafc;
    }
  
    .text-red-500 {
      color: red;
    }
  
    .bg-white {
      background-color: #fff;
    }
  
    .shadow-lg {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
  
    .rounded-md {
      border-radius: 0.375rem;
    }
  
    .text-center {
      text-align: center;
    }
  
    .p-4 {
      padding: 1rem;
    }
  
    .mt-4 {
      margin-top: 1rem;
    }
  
    .text-xl {
      font-size: 1.25rem;
    }
  
    .font-semibold {
      font-weight: 600;
    }

    .group-hover\:opacity-100 {
      transition: opacity 0.3s;
    }
  </style>
  
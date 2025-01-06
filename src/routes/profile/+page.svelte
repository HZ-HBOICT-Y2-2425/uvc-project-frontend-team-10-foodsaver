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

    $: username = $authStore.user?.username || 'Guest';
  
    authStore.subscribe(($authStore) => {
      token = $authStore.token;
      recipeCount = $authStore.recipeCount || 0;
    });
  
    $: {
      badges = [];
      if (recipeCount >= 1) badges.push('/badges/badge_1.png');
      if (recipeCount >= 5) badges.push('/badges/badge_2.png');
      if (recipeCount >= 10) badges.push('/badges/badge_3.png');
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
            <img src={badge} alt="Achievement Badge" class="w-16 h-16 sm:w-20 sm:h-20 rounded-full shadow-md" />
          {/each}
        </div>
      </div>
    </section>
  </div>  
  
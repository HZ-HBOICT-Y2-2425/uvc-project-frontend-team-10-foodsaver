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

    authStore.subscribe(($authStore) => {
        token = $authStore.token;
    });

    onMount(() => {
        if (!token) {
            console.log("No token found, redirecting to login...");
            goto('/login');
        }
    });

    async function updateUsername() {
        console.log('Sending token:', token);

        const response = await fetch('http://localhost:4000/api/users/update-username', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ newUsername })
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

            console.log("Username successfully updated and authStore updated.");
        } else {
            errorMessage = data.message;
            successMessage = '';
            console.log("Failed to update username: ", data.message);
        }
    }

    async function changePassword() {
        console.log('Changing password with token:', token);

        const response = await fetch('http://localhost:4000/api/users/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ oldPassword, newPassword })
        });

        const data = await response.json();

        if (response.ok) {
            passwordSuccessMessage = data.message;
            passwordErrorMessage = '';
            oldPassword = '';
            newPassword = '';
            console.log("Password successfully changed.");
        } else {
            passwordErrorMessage = data.message;
            passwordSuccessMessage = '';
            console.log("Failed to change password:", data.message);
        }
    }
</script>

<div class="flex flex-col sm:flex-row justify-between items-start px-6 py-4">
    <button
        class="mt-6 sm:mt-0 bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300"
        on:click={() => goto("/community")}
    >
        Community
    </button>

    <div class="form-container bg-white rounded-lg shadow-md p-6">
        <!-- Change Username Form -->
        <form on:submit|preventDefault={updateUsername} class="space-y-4">
            <div>
                <label for="username" class="block text-sm font-medium text-gray-700">New Username:</label>
                <input type="text" id="username" bind:value={newUsername} class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
            </div>
            <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300">Update Username</button>
            {#if errorMessage}
                <p class="text-red-500">{errorMessage}</p>
            {/if}
            {#if successMessage}
                <p class="text-green-500">{successMessage}</p>
            {/if}
        </form>

        <!-- Change Password Form -->
        <form on:submit|preventDefault={changePassword} class="space-y-4 mt-6">
            <div>
                <label for="oldPassword" class="block text-sm font-medium text-gray-700">Old Password:</label>
                <input type="password" id="oldPassword" bind:value={oldPassword} class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
            </div>
            <div>
                <label for="newPassword" class="block text-sm font-medium text-gray-700">New Password:</label>
                <input type="password" id="newPassword" bind:value={newPassword} class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
            </div>
            <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300">Change Password</button>
            {#if passwordErrorMessage}
                <p class="text-red-500">{passwordErrorMessage}</p>
            {/if}
            {#if passwordSuccessMessage}
                <p class="text-green-500">{passwordSuccessMessage}</p>
            {/if}
        </form>
    </div>
</div>

<style>
    .form-container {
        max-width: 400px;
    }
</style>


<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

    let posts = [];

    // Fetch all posts from the backend
    async function fetchPosts() {
        const response = await fetch("http://localhost:3015/forum");
        if (response.ok) {
            posts = await response.json();
        } else {
            console.error("Failed to fetch posts");
        }
    }

    onMount(fetchPosts);

    // Navigate to the new post creation page
    function goToCreatePost() {
        goto("/community/create");
    }
</script>

<!-- Main Content -->
<div class="container mx-auto mt-6 p-6">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Forum</h1>
        <button
            class="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
            on:click={goToCreatePost}
        >
            Add New Post
        </button>
    </div>

    <!-- Display Posts -->
    {#if posts.length > 0}
        <div class="space-y-6">
            {#each posts as post}
                <div
                    class="post-card border p-4 rounded-lg shadow-md hover:shadow-lg transition-all"
                    on:click={() => goto(`/community/${post.id}`)}
                >
                    <h2 class="text-xl font-semibold">{post.title}</h2>
                    <p class="text-gray-700 mt-2">{post.content}</p>
                    <p class="text-sm text-gray-500 mt-2">
                        Posted on: {new Date(post.created_at).toLocaleString()}
                    </p>
                </div>
            {/each}
        </div>
    {:else}
        <p>Loading posts...</p>
    {/if}
</div>

<style>
    .container {
        max-width: 1200px;
    }

    .post-card {
        background-color: white;
        padding: 1rem;
        border-radius: 8px;
    }

    .post-card h2 {
        margin-bottom: 0.5rem;
    }

    .post-card p {
        margin-bottom: 0.5rem;
    }
</style>

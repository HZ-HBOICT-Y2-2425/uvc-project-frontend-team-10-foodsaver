<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";

    let post = null;
    let isEditing = false;
    let updatedTitle = "";
    let updatedContent = "";

    // TODO: Pass the user_id from authStore or somewhere else
    let user_id = 1;

    // Fetch the post based on the post ID
    async function fetchPost() {
        const { post_id } = $page.params;
        const response = await fetch(`http://localhost:3015/forum/${post_id}`);

        if (response.ok) {
            post = await response.json();
            updatedTitle = post.title;
            updatedContent = post.content;
        } else {
            console.error("Failed to fetch post");
        }
    }

    // check if the current user can edit or delete the posts
    function canEditOrDelete() {
        return post?.user_id === user_id; // checke if current user_id is same with the post creator
    }

    // Update and delete functions remain unchanged...
    async function updatePost() {
        const { post_id } = $page.params;
        const response = await fetch(`http://localhost:3015/forum/${post_id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title: updatedTitle,
                content: updatedContent,
            }),
        });

        if (response.ok) {
            post.title = updatedTitle;
            post.content = updatedContent;
            isEditing = false;
        } else {
            console.error("Failed to update post");
        }
    }

    async function deletePost() {
        const { post_id } = $page.params;
        const response = await fetch(`http://localhost:3015/forum/${post_id}`, {
            method: "DELETE",
        });

        if (response.ok) {
            goto("/community");
        } else {
            console.error("Failed to delete post");
        }
    }

    onMount(fetchPost);
</script>

<!-- Post Details -->
<div class="container mx-auto mt-6 p-6">
    {#if post}
        <div class="post-card border p-4 rounded-lg shadow-md">
            {#if isEditing}
                <!-- Edit Mode -->
                <h1 class="text-3xl font-bold mb-4">Edit Post</h1>
                <input
                    type="text"
                    class="w-full p-2 border border-gray-300 rounded mb-4"
                    bind:value={updatedTitle}
                />
                <textarea
                    class="w-full p-2 border border-gray-300 rounded mb-4"
                    rows="4"
                    bind:value={updatedContent}
                ></textarea>
                <div class="flex gap-4">
                    <button
                        class="bg-green-500 text-white px-4 py-2 rounded"
                        on:click={updatePost}
                    >
                        Save
                    </button>
                    <button
                        class="bg-gray-500 text-white px-4 py-2 rounded"
                        on:click={() => (isEditing = false)}
                    >
                        Cancel
                    </button>
                </div>
            {:else}
                <!-- View Mode -->
                <h1 class="text-3xl font-bold">{post.title}</h1>
                <p class="text-lg text-gray-700 mt-4">{post.content}</p>
                <p class="text-sm text-gray-500 mt-4">
                    Posted on: {new Date(post.created_at).toLocaleString()}
                </p>

                <div class="flex gap-4 mt-4">
                    {#if canEditOrDelete()}
                        <!-- Only show Edit and Delete if the user owns the post -->
                        <button
                            class="bg-yellow-500 text-white px-4 py-2 rounded"
                            on:click={() => (isEditing = true)}
                        >
                            Edit
                        </button>
                        <button
                            class="bg-red-500 text-white px-4 py-2 rounded"
                            on:click={deletePost}
                        >
                            Delete
                        </button>
                    {/if}
                    <button
                        class="bg-gray-500 text-white px-4 py-2 rounded"
                        on:click={() => goto("/community")}
                    >
                        Back to list
                    </button>
                </div>
            {/if}
        </div>
    {:else}
        <p>Loading post details...</p>
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

    .post-card h1 {
        margin-bottom: 1rem;
    }

    .post-card p {
        margin-bottom: 1rem;
    }

    input,
    textarea {
        font-size: 1rem;
        padding: 0.5rem;
        border-radius: 0.375rem;
        border: 1px solid #ccc;
    }
</style>

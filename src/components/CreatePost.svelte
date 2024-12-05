<script lang="ts">
    import { goto } from "$app/navigation";

    let title = '';
    let content = '';

    // TODO: Pass the user_id from authStore or somewhere else
    let user_id = 1;

    // Handle form submission to create a new post
    async function handleSubmit() {
        console.log("Submitting post:", { user_id, title, content });

        const response = await fetch("http://localhost:3015/forum", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id, title, content }),
        });

        const responseData = await response.json();
        console.log("Response from server:", responseData);

        if (response.ok) {
            console.log("Post created successfully");
            goto("/community"); // Redirect to the list of posts
        } else {
            console.error("Failed to create post:", responseData.error || responseData.message);
            alert("Failed to create post: " + (responseData.error || responseData.message)); // Show detailed error message
        }
    }

    // Handle cancel button (navigate back to community page)
    function handleCancel() {
        goto("/community");
    }
</script>

<!-- Create Post Form -->
<div class="container mx-auto mt-6 p-6">
    <h1 class="text-3xl font-bold mb-6">Create a New Post</h1>

    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        <div>
            <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
            <input
                id="title"
                type="text"
                bind:value={title}
                class="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                placeholder="Enter post title"
                required
            />
        </div>

        <div>
            <label for="content" class="block text-sm font-medium text-gray-700">Content</label>
            <textarea
                id="content"
                bind:value={content}
                class="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                placeholder="Enter post content"
                required
            ></textarea>
        </div>

        <div class="flex justify-between mt-4">
            <button
                type="submit"
                class="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
            >
                Create Post
            </button>

            <button
                type="button"
                on:click={handleCancel}
                class="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
            >
                Cancel
            </button>
        </div>
    </form>
</div>

<style>
    .container {
        max-width: 600px;
    }
</style>

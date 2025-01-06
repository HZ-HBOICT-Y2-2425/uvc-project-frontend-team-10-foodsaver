<script>
    import { goto } from "$app/navigation";
</script>

<div class="ml-4">
    <button
        class="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300"
        on:click={() => goto("/community")}
    >
        Community
    </button>

    <button
        class="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300"
        on:click={() => goto("/leaderboard")}
    >
        Leaderboard
    </button>
</div>

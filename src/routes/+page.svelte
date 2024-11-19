<script>
    import "../app.css";
    import Recipe from "$lib/components/Recipe.svelte";
</script>

<div class="container w-full mx-auto">
    <section class="mt-4">
        <h2 class="text-6xl">
            R<span class="inline-block bg-green-100 rounded-lg">ecipe</span>
        </h2>
        <Recipe />
    </section>
</div>

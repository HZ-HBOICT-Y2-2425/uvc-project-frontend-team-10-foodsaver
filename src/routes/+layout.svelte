<script>
	import "../app.css";
</script>

<div class="flex flex-col h-screen justify-between">
	<nav class="bg-green-300 shadow">
		<div class="flex items-left">
			<a href="/" class="nav-item"><h1 class="text-xl font-semibold">🍟 FoodSaver</h1></a>
		</div>
	</nav>

	<main>
		<slot />
	</main>

	<footer class="bg-green-300">
		<p class="text-center">Team 10</p>
	</footer>
</div>

<style>
</style>

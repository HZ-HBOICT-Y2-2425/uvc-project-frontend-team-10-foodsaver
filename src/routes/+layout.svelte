<script>
	import "../app.css";
</script>

<div class="flex flex-col h-screen justify-between">
	<header class="flex justify-between items-center px-6 py-3 border-b border-gray-300">
		<div class="text-lg font-bold">FoodSaver</div>
		<nav class="flex space-x-4">
			<a href="/home" class="hover:underline">Home</a>
			<a href="/about" class="hover:underline">About Us</a>
			<a href="/tips" class="hover:underline">Tips & Tricks</a>
			<a href="/pantry" class="hover:underline">My pantry</a>
			<a href="/profile" class="hover:underline">Profile</a>
		</nav>
	</header>
	
	<main>
		<slot />
	</main>
</div>

<style>
</style>

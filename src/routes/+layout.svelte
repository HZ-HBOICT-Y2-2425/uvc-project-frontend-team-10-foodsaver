<script>
	import '../app.css';
	let isMenuOpen = false;

	// Función para alternar el estado del menú desplegable
	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}
</script>

<div class="flex flex-col h-screen justify-between">
	<!-- Encabezado solo visible en pantallas de ordenador -->
	<header class="hidden sm:flex justify-between items-center px-6 py-3 border-b border-gray-300">
		<div class="text-lg font-bold">FoodSaver</div>
		<nav class="flex space-x-4">
			<a href="/home" class="hover:underline">Home</a>
			<a href="/about" class="hover:underline">About Us</a>
			<a href="/tips" class="hover:underline">Tips & Tricks</a>
			<a href="/pantry" class="hover:underline">My pantry</a>
			<a href="/profile" class="hover:underline">Profile</a>
		</nav>
	</header>

	<!-- Menú desplegable para móviles -->
	<header class="sm:hidden flex justify-between items-center px-6 py-3 border-b border-gray-300">
		<div class="text-lg font-bold">FoodSaver</div>
		<button
			class="text-2xl focus:outline-none"
			on:click="{toggleMenu}"
			aria-label="Toggle menu"
		>
			☰
		</button>
	</header>

	{#if isMenuOpen}
		<nav class="sm:hidden bg-gray-100 p-4 border-t border-gray-300">
			<ul class="space-y-2">
				<li>
					<a href="/home" class="block hover:underline">Home</a>
				</li>
				<li>
					<a href="/about" class="block hover:underline">About Us</a>
				</li>
				<li>
					<a href="/tips" class="block hover:underline">Tips & Tricks</a>
				</li>
				<li>
					<a href="/pantry" class="block hover:underline">My pantry</a>
				</li>
				<li>
					<a href="/profile" class="block hover:underline">Profile</a>
				</li>
			</ul>
		</nav>
	{/if}

	<main>
		<slot />
	</main>
</div>

<style>
	/* Puedes añadir más estilos personalizados aquí si es necesario */
</style>

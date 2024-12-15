<script>
    // Agrega aquí cualquier lógica si se necesita
</script>

<div>
    <div class="header z-50">Tips & Tricks</div>
    <div class="container">
        <a href="makeUseOfIngredients" class="card-link">
            <div class="card">
                <img
                    src="https://y4c5c8s9.rocketcdn.me/wp-content/uploads/2023/06/How-to-start-a-zero-waste-lifestyle.jpg"
                    alt="Make the most use of ingredients"
                />
                <div class="card-title">Make the MOST use of the Ingredients</div>
            </div>
        </a>
        <a href="reuseFoodLeftOvers" class="card-link">
            <div class="card">
                <img
                    src="https://www.cityofsydney.nsw.gov.au/-/jssmedia/corporate/images/programs/environmental-support-funding/food-scraps-trial/14220kg-foodscrapstrial-45.jpg?mw=640"
                    alt="Reusing your leftovers"
                />
                <div class="card-title">Reusing your food leftovers</div>
            </div>
        </a>
        <a href="storingFood" class="card-link">
            <div class="card">
                <img
                    src="https://media.istockphoto.com/id/1307979766/nl/foto/netjes-georganiseerde-transparante-bussen-voor-het-bakken-van-ingredi%C3%ABnten.jpg?s=612x612&w=0&k=20&c=Gl72Z5Upo8hpA937y_tlUJBN01FwDmcEy6r5Ssal-DM="
                    alt="Storing food tips"
                />
                <div class="card-title">Storing food tips</div>
            </div>
        </a>
        <a href="saveYourMoney" class="card-link">
            <div class="card">
                <img
                    src="https://carlosdegramos.com/wp-content/uploads/2024/08/Take-our-NMNT-2-week-food-budget-challenge-and-eat-for-55-a-week-1024x538.jpg"
                    alt="Save your money"
                />
                <div class="card-title">Save YOUR money!</div>
            </div>
        </a>
    </div>
<!-- Leafs picture -->
<img
  class="LeafBackgroundRemoved9 w-72 h-60 left-[-80.30px] top-[800px] absolute origin-top-left rotate-[0.0deg] rounded-xl -z-10"
  src="../../../leaf-background2.png"
  alt="Leaf Background"
/>

<img
  class="LeafBackgroundRemoved9 w-72 h-60 right-[-90px] top-[250px] absolute origin-top-left rotate-[270deg] rounded-xl -z-10"
  src="../../../leaf-background1.png"
  alt="Leaf Background"
/>
</div>

<style>
    .container {
        display: grid;
        grid-template-columns: repeat(2, 1fr); /* Dos tarjetas por fila */
        gap: 1rem;
        margin: 2rem;
    }

    .card-link {
        text-decoration: none; /* Quita el subrayado de los enlaces */
    }

    .card {
        position: relative;
        overflow: hidden;
        top: 3rem;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        width: 100%;
        height: 500px;
        margin: 0 auto;
        transition: transform 0.3s ease, box-shadow 0.3s ease; /* Transición suave */
    }

    .card:hover {
        transform: scale(1.05); /* Agrandar al pasar el cursor */
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3); /* Sombra más intensa */
    }

    .card img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .card-title {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 1.5rem; /* Texto más pequeño */
        font-weight: bold;
        text-align: center;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
    }

    .header {
        position: absolute;
        top: 5rem;
        left: 1rem;
        font-size: 2rem;
        color: #2e962e;
        transform: rotate(-10deg);
        padding: 0.5rem 1rem;
        border-radius: 5px;
    }

    @media (max-width: 768px) {
        .container {
            grid-template-columns: 1fr; /* Una tarjeta por fila en dispositivos móviles */
        }

        .card {
            width: 100%; /* Ocupar todo el ancho en pantallas pequeñas */
            height: 180px; /* Ajuste menor para pantallas pequeñas */
        }

        .card-title {
            font-size: 1.3rem;
        }

        .header {
            font-size: 1.8rem;
            top: 2rem;
        }
    }

    @media (min-width: 1024px) {
        .container {
            grid-template-columns: repeat(
                2,
                1fr
            ); /* Mantener dos tarjetas por fila en pantallas grandes */
        }

        .card {
            width: 85%; /* Reducir aún más en pantallas grandes */
            height: 220px; /* Ajustar tamaño */
        }

        .card-title {
            font-size: 1.7rem;
        }

        .header {
            font-size: 2.2rem;
        }
    }
</style>

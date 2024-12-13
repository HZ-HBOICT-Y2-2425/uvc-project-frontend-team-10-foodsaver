<script>
    import "../../app.css";
    let tips = [
        {
            title: "Potato Peel Chips",
            description:
                "Wash the potatoes well and save the peels; bake them with a bit of oil and salt for a crispy snack.",
        },
        {
            title: "Citrus Peels",
            description:
                "Grate citrus peels before using them and store them in the freezer; they’re great for adding flavor to desserts, drinks, and sauces.",
        },
        {
            title: "Broccoli and Cauliflower Stems",
            description:
                "Peel and chop the stems to cook as part of your dish, or add them to soups and stir-fries.",
        },
        {
            title: "Vegetable Peels for Broth",
            description:
                "Save vegetable peels and stems (carrots, onions, celery, garlic) in a freezer bag. Once you have enough, use them to make homemade broth.",
        },
    ];
</script>

<div>
    <div class="container">
        <div class="header">Tips & Tricks</div>
        <!-- Imagen de fondo que ocupa todo el ancho -->
        <div class="card-background">
            <div class="card-title">Stroging food tips</div>
        </div>
        {#each tips as tip, i}
            <div class="tip">
                <h2>{tip.title}</h2>
                <p>{tip.description}</p>
            </div>
            {#if i < tips.length - 1}
                <hr class="divider" />
            {/if}
        {/each}
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
    /* Contenedor principal */
    .container {
        max-width: 100%;
        margin: 0 auto;
        padding: 20px;
    }

    /* Cabecera de texto inclinada */
    .header {
        position: absolute;
        top: 8rem;
        left: 1rem;
        font-size: 2rem;
        color: #00ff08;
        transform: rotate(-10deg);
        padding: 0.5rem 1rem;
        border-radius: 5px;
    }

    /* Fondo de la tarjeta que ocupa todo el ancho */
    .card-background {
        width: 100%;
        height: 300px;
        background-image: url("https://media.istockphoto.com/id/1307979766/nl/foto/netjes-georganiseerde-transparante-bussen-voor-het-bakken-van-ingredi%C3%ABnten.jpg?s=612x612&w=0&k=20&c=Gl72Z5Upo8hpA937y_tlUJBN01FwDmcEy6r5Ssal-DM=");
        background-size: cover;
        background-position: center;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        color: rgb(0, 0, 0);
    }

    /* Título sobre la imagen */
    .card-title {
        font-size: 2rem;
        padding: 10px;
        background: rgb(252, 252, 252, 0.5);
        border-radius: 5px;
    }

   /* Diseño de los tips */
   .tip {
        margin: 20px 0;
        padding: 10px 0;
    }

    .tip h2 {
        margin: 0 0 10px;
        color: #000; /* Cambiado a negro */
        font-size: 1.2rem;
        font-weight: bold; /* Texto en negrita */
    }

    .tip p {
        margin: 0;
        font-size: 1rem;
        color: #000;
    }

    /* Línea separadora */
    .divider {
        border: none;
        border-top: 1px solid #ddd;
        margin: 10px 0;
    }

      /* Media Queries para pantallas más pequeñas (móviles) */
      @media (max-width: 768px) {
        .header {
            top: 5rem;
            font-size: 1.5rem;
            left: 0.5rem;
        }

        .card-title {
            font-size: 1.5rem;
        }

        .tip h2 {
            font-size: 1rem;
        }

        .tip p {
            font-size: 0.9rem;
        }

        .divider {
            margin: 5px 0;
        }
    }

    /* Media Queries para pantallas más grandes (escritorios) */
    @media (min-width: 1024px) {
        .container {
            max-width: 100%;
        }

        .header {
            top: 8rem;
            font-size: 2rem;
            left: 1rem;
        }

        .card-title {
            font-size: 2rem;
        }

        .tip h2 {
            font-size: 1.2rem;
        }

        .tip p {
            font-size: 1rem;
        }
    }
</style>

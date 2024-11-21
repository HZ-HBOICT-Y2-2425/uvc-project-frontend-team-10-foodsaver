<script lang="ts">
    import { pantry } from '../lib/stores/pantryStore';
  
    let ingredient: string = '';
  
    const addIngredient = (): void => {
      if (ingredient.trim()) {
        pantry.update((items: string[]) => {
          if (!items.includes(ingredient.trim())) {
            return [...items, ingredient.trim()];
          } else {
            alert(`${ingredient.trim()} is already in your pantry!`);
            return items;
          }
        });
        ingredient = ''; // Clear the input field
      }
    };
  
    const removeIngredient = (item: string): void => {
      pantry.update((items: string[]) => items.filter((existingItem) => existingItem !== item));
    };
  </script>
  
  <div class="pantry">
    <h2>My Pantry</h2>
    <ul>
      {#each $pantry as item}
        <li>
          {item}
          <button on:click={() => removeIngredient(item)} class="button-small">Remove</button>
        </li>
      {/each}
    </ul>
  
    <h3>Add Ingredients</h3>
    <input type="text" bind:value={ingredient} placeholder="Add an ingredient" class="input" />
    <button on:click={addIngredient} class="button">Add</button>
  </div>
  
  <style>
    .pantry {
      padding: 1rem;
      background: #f3f4f6;
      border-left: 1px solid #ddd;
    }
  
    ul {
      list-style: none;
      padding: 0;
    }
  
    li {
      margin-bottom: 0.5rem;
      display: flex;
      justify-content: space-between;
    }
  </style>
  
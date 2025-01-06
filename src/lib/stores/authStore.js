import { writable } from 'svelte/store';

export const authStore = writable(
  {
    isLoggedIn: false,
    user: null,
    token: null,
  },
  (set) => {
    const savedLoginState = localStorage.getItem('isLoggedIn') === 'true';
    const savedUser = JSON.parse(localStorage.getItem('user'));
    const savedToken = localStorage.getItem('authToken');

    console.log("Initial auth store state: ", { savedLoginState, savedUser, savedToken });

    if (savedLoginState && savedToken) {
      set({ isLoggedIn: true, user: savedUser, token: savedToken });
    }

    return authStore.subscribe((state) => {
      console.log("Auth store updated: ", state);
      localStorage.setItem('isLoggedIn', state.isLoggedIn);
      localStorage.setItem('user', JSON.stringify(state.user));
      localStorage.setItem('authToken', state.token || '');
    });
  }
);

export function login(user, token) {
  console.log("Logging in user: ", user);
  authStore.set({
    isLoggedIn: true,
    user: user,
    token: token,
  });
}

export function logout() {a
  console.log("Logging out...");
  authStore.set({
    isLoggedIn: false,
    user: null,
    token: null,
  });
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('user');
  localStorage.removeItem('authToken');
}


export async function checkFavoriteStatus() {
  const response = await fetch(
      `http://localhost:3012/check-favorite/${recipe.id}?user_id=${user_id}`
  );

  if (response.ok) {
      const data = await response.json();
      isFavorite = data.isFavorite;
  } else {
      console.error("Failed to check favorite status");
  }
}


export async function toggleFavorite() {
  if (isFavorite) {
      const response = await fetch(`http://localhost:3012/favorites/${recipe.id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id }),
      });

      if (response.ok) {
          alert("This recipe is removed from favorites");
          isFavorite = false;
      } else {
          const error = await response.json();
          alert(`Failed to remove from favorites: ${error.error}`);
      }
  } else {
      const response = await fetch("http://localhost:3012/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipe_id: recipe.id, user_id }),
      });

      if (response.ok) {
          alert("This recipe is added to favorites");
          isFavorite = true;
      } else {
          const error = await response.json();
          alert(`Failed to add to favorites: ${error.error}`);
      }
  }

  checkFavoriteStatus();
}

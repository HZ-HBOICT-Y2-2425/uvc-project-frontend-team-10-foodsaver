import { writable } from 'svelte/store';

export const user = writable(null);

export const authStore = writable(
  {
    isLoggedIn: false,
    user: null,
    token: null,
  },
  (set) => {
    // Check if window is available to avoid SSR issues
    if (typeof window !== 'undefined') {
      const savedLoginState = localStorage.getItem('isLoggedIn') === 'true';
      const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
      const savedToken = localStorage.getItem('authToken');

      console.log("Initial auth store state: ", { savedLoginState, savedUser, savedToken });

      if (savedLoginState && savedToken) {
        set({ isLoggedIn: true, user: savedUser, token: savedToken });
      }
    }

    return authStore.subscribe((state) => {
      console.log("Auth store updated: ", state);
      if (typeof window !== 'undefined') {
        // Update localStorage in the browser
        localStorage.setItem('isLoggedIn', String(state.isLoggedIn));
        localStorage.setItem('user', JSON.stringify(state.user));
        localStorage.setItem('authToken', state.token || '');
      }
      user.set(state.user);
    });
  }
);

export function login(userData, token) {
  console.log("Logging in user: ", userData);
  authStore.set({
    isLoggedIn: true,
    user: userData,
    token: token,
  });
}

export function logout() {
  console.log("Logging out...");
  authStore.set({
    isLoggedIn: false,
    user: null,
    token: null,
  });
  
  if (typeof window !== 'undefined') {
    // Clear localStorage data in the browser
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  }
}

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


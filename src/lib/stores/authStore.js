import { writable } from 'svelte/store';

export const authStore = writable(
  {
    isLoggedIn: false,
    user: null,
  },
  (set) => {
    const savedLoginState = localStorage.getItem('isLoggedIn') === 'true';
    const savedUser = JSON.parse(localStorage.getItem('user'));

    if (savedLoginState) {
      set({ isLoggedIn: true, user: savedUser });
    }

    return authStore.subscribe((state) => {
      localStorage.setItem('isLoggedIn', state.isLoggedIn);
      localStorage.setItem('user', JSON.stringify(state.user));
    });
  }
);

export function login(user) {
  authStore.set({
    isLoggedIn: true,
    user: user,
  });
}

export function logout() {
  authStore.set({
    isLoggedIn: false,
    user: null,
  });
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('user');
}

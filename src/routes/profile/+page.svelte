<script>
  import { authStore } from '../../lib/stores/authStore';

  let userId = null;

  authStore.subscribe((state) => {
    if (state.isLoggedIn && state.user) {
      userId = state.user.id;
    }
  });
</script>

<h1>Carbon saved: </h1>
<p>User ID: {userId}</p>

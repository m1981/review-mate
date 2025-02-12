<script lang="ts">
    import Header from './Header.svelte';
    import '../app.css';
    import { onMount } from 'svelte';
    import { getFirebaseAuth } from '$lib/firebase';
    import { user } from '$lib/stores/auth';
    import { onAuthStateChanged } from 'firebase/auth';
    import { browser } from '$app/environment';

    onMount(() => {
        if (browser) {
            const auth = getFirebaseAuth();
            return onAuthStateChanged(auth, (userData) => {
                user.set(userData);
            });
        }
    });
</script>

<div class="app">
	<Header />

	<main>
		<slot />
	</main>

	<footer>
		<p>visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to learn SvelteKit</p>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
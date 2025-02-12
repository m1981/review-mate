<script lang="ts">
    import { getFirebaseAuth } from '$lib/firebase';
    import { user } from '$lib/stores/auth';
    import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
    import { browser } from '$app/environment';

    async function signInWithGoogle() {
        if (!browser) return;

        const auth = getFirebaseAuth();
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error('Error signing in with Google:', error);
        }
    }

    async function handleSignOut() {
        if (!browser) return;

        const auth = getFirebaseAuth();
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	{#if $user}
		<div class="profile">
			<img src={$user.photoURL} alt="Profile" class="avatar" />
			<h2>Welcome, {$user.displayName}!</h2>
			<p>Email: {$user.email}</p>
			<button on:click={handleSignOut}>Sign Out</button>
		</div>
	{:else}
		<div class="auth-container">
			<h2>Welcome to the App</h2>
			<button on:click={signInWithGoogle} class="google-btn">
				Sign in with Google
			</button>
		</div>
	{/if}
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	.profile {
		text-align: center;
		padding: 2rem;
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.avatar {
		width: 100px;
		height: 100px;
		border-radius: 50%;
		margin-bottom: 1rem;
	}

	.auth-container {
		text-align: center;
		padding: 2rem;
	}

	button {
		background-color: var(--color-theme-1);
		color: white;
		border: none;
		padding: 0.8rem 1.5rem;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
		margin-top: 1rem;
		transition: background-color 0.2s;
	}

	button:hover {
		background-color: #ff4f1a;
	}

	.google-btn {
		background-color: #4285f4;
	}

	.google-btn:hover {
		background-color: #357ae8;
	}
</style>
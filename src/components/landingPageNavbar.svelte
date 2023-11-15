<script lang="ts">
	import CaptifyLogo from "~icons/game-icons/abstract-116";
	import PhArrowCircleUpRightFill from "~icons/ph/arrow-circle-up-right-fill";
	import LogosGoogleIcon from "~icons/logos/google-icon";
	import LogosGithubIcon from "~icons/skill-icons/github-light";
	import Spinner from "~icons/svg-spinners/270-ring";

	import ThemeToggle from "./themeToggle.svelte";
	import { onMount } from "svelte";
	import { themeChange } from "theme-change";
	import type { PageData } from "../routes/(landing)/$types";

	export let data: PageData;
	let { supabase, session } = data;
	$: ({ supabase, session } = data);

	let modal: HTMLDialogElement;

	let modalDisabled = false;
	let googleSigninInProgress = false;
	let githubSigninInProgress = false;

	async function signinWithGoogle() {
		modalDisabled = true;
		googleSigninInProgress = true;
		// Emulate a delay
		setTimeout(() => {
			modalDisabled = false;
			googleSigninInProgress = false;
		}, 3000);

		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: "google"
		});

		if (error) {
			console.error(error);
			return;
		}
	}

	async function signinWithGithub() {
		modalDisabled = true;
		githubSigninInProgress = true;
		// Emulate a delay
		setTimeout(() => {
			modalDisabled = false;
			githubSigninInProgress = false;
		}, 3000);

		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: "github"
		});

		if (error) {
			console.error(error);
			return;
		}
	}

	async function signout() {
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error(error);
			return;
		}
	}

	onMount(() => {
		themeChange(false);
	});
</script>

<nav class="py-6 font-bold">
	<div class="grid grid-cols-2 md:grid-cols-3">
		<div class="flex items-center text-2xl md:text-4xl">
			<CaptifyLogo class="w-10 h-10" />
			<a href="/" class="pl-2">Captify</a>
		</div>
		<div class="hidden md:flex items-center justify-evenly font-medium md:text-lg">
			<a
				href="/"
				class="hover:font-bold hover:-translate-y-1 hover:outline outline-1 outline-gray-500 rounded-md px-2 transition"
				>/Home</a
			>
			<a
				href="#/features"
				class="hover:font-bold hover:-translate-y-1 hover:outline outline-1 outline-gray-500 rounded-md px-2 transition"
				>/Features</a
			>
			<a
				href="#/TOS"
				class="hover:font-bold hover:-translate-y-1 hover:outline outline-1 outline-gray-500 rounded-md px-2 transition"
				>/TOS</a
			>
			<ThemeToggle width={24} />
		</div>
		{#if session}
			<div class="flex items-center justify-end text-lg lg:text-xl">
				<div class="dropdown dropdown-end">
					<span role="button" tabindex="0" class="btn m-1">
						{session.user.email?.substring(0, 6)}...{session.user.email?.substring(
							session.user.email.length - 10
						)}
					</span>
					<ul
						role="menu"
						tabindex="0"
						class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
					>
						<li><a href="#/dashboard">Dashboard</a></li>
						<li><button on:click={signout}>Sign out</button></li>
					</ul>
				</div>
			</div>
		{:else}
			<div class="flex items-center justify-end text-lg lg:text-xl">
				<div id="nav-buttons">
					<button
						on:click={() => modal.showModal()}
						class="flex items-center gap-2 border-2 border-gray-500 rounded-full hover:drop-shadow-lg hover:-translate-y-1 transition"
					>
						<span class="ml-2">Get Started</span>
						<PhArrowCircleUpRightFill class="w-8 h-8 md:w-10 md:h-10" />
					</button>
				</div>
			</div>
		{/if}
	</div>
	<div class="flex md:hidden items-center justify-evenly font-medium md:text-lg mt-5">
		<a
			href="/"
			class="hover:font-bold hover:-translate-y-1 hover:outline outline-1 outline-gray-500 rounded-md px-2 transition"
			>/Home</a
		>
		<a
			href="#/features"
			class="hover:font-bold hover:-translate-y-1 hover:outline outline-1 outline-gray-500 rounded-md px-2 transition"
			>/Features</a
		>
		<a
			href="#/TOS"
			class="hover:font-bold hover:-translate-y-1 hover:outline outline-1 outline-gray-500 rounded-md px-2 transition"
			>/TOS</a
		>
		<ThemeToggle width={24} />
	</div>
</nav>

<dialog class="modal" bind:this={modal}>
	<div class="modal-box">
		<form method="dialog">
			{#if !modalDisabled}
				<button class="btn btn-sm btn-circle btn-ghost absolute right-5 top-5">✕</button>
			{/if}
		</form>
		<h3 class="font-bold text-lg">Login / Signup</h3>
		<div class="divider"></div>
		<form class="flex flex-col w-auto justify-center items-center py-4 gap-4">
			<!-- Sign in buttons -->
			<div class="flex flex-col gap-y-2">
				<button
					class="btn btn-outline w-full
                    enabled:hover:outline disabled:hover:outline-none
                    enabled:hover:outline-accent
                    enabled:hover:scale-105
                    disabled:cursor-not-allowed
                    disabled:text-white
                    disabled:bg-neutral
                    transition"
					disabled={modalDisabled}
					on:click={signinWithGoogle}
				>
					{#if googleSigninInProgress}
						<Spinner />
						Signing in
					{:else}
						<LogosGoogleIcon class="w-6 h-6" />
						Continue with Google
					{/if}
				</button>
				<button
					class="btn btn-outline w-full
                    enabled:hover:outline disabled:hover:outline-none
                    enabled:hover:outline-accent
                    enabled:hover:scale-105
                    disabled:cursor-not-allowed
                    disabled:text-white
                    disabled:bg-neutral
                    transition"
					disabled={modalDisabled}
					on:click={signinWithGithub}
				>
					{#if githubSigninInProgress}
						<Spinner />
						Signing in
					{:else}
						<LogosGithubIcon class="w-6 h-6" />
						Continue with Github
					{/if}
				</button>
			</div>
		</form>
	</div>
</dialog>

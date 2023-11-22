<script>
	import { onMount } from "svelte";
	import LandingPageNavbar from "../../components/landingPageNavbar.svelte";

	export let data;

	let modalOpen = false;
	onMount(() => {
		// Get query params
		const params = new URLSearchParams(window.location.search);
		const showModal = params.get("showSignin") === "true";

		if (showModal) {
			modalOpen = true;
		}
	});
</script>

<div class="container mx-auto lg:px-32 px-8">
	<LandingPageNavbar {data} {modalOpen} />
	<h1>Welcome to SvelteKit</h1>
	<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
</div>

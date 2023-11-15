<script>
	import LandingPageNavbar from "../../components/landingPageNavbar.svelte";

	export let data;
	let { supabase } = data;
	$: ({ supabase } = data);
</script>

<div class="container mx-auto lg:px-32 px-8">
	<LandingPageNavbar {data} />
	<slot />
</div>

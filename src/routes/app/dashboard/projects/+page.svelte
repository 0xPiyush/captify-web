<script lang="ts">
	import CaptifyLogo from "~icons/game-icons/abstract-116";
	import LogoutIcon from "~icons/iconoir/log-out";
	import HamburgerMenu from "~icons/solar/hamburger-menu-line-duotone";
	import Spinner from "~icons/svg-spinners/270-ring";

	import ThemeToggle from "$components/themeToggle/themeToggle.svelte";
	import { onMount } from "svelte";

	export let data;
	let { supabase, session } = data;
	$: ({ supabase, session } = data);

	async function signout() {
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error(error);
			return;
		}

		window.location.href = "/";
	}

	let loadingProjects = false;

	let projects: Project[] = [];

	type Project = {
		id: string;
		name: string;
		raw_video_bucket_path: string;
		transcription_native_language_bucket_path: string;
		transcription_eng_language_bucket_path: string;
		generated_media_title: string;
		generated_media_thumbnail_bucket_path: string;
		ownerId: string;
	};
	onMount(async () => {
		loadingProjects = true;
		const res = await fetch("/api/getProjects");
		projects = await res.json();
		loadingProjects = false;
	});
</script>

<div class="drawer lg:drawer-open">
	<input id="sidebar" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content flex flex-col">
		<!-- Page content here -->
		<div id="topbar-container" class="p-5 sticky top-0 bg-base-100 lg:bg-transparent">
			<div class="flex items-center justify-between text-2xl w-full mb-4 lg:hidden font-bold">
				<label for="sidebar" class="btn btn-ghost drawer-button lg:hidden">
					<HamburgerMenu class="w-8 h-8" />
				</label>
				<a href="/" class="flex">
					<CaptifyLogo class="w-8 h-8" />
					<span class="pl-2">Captify</span>
				</a>
				<ThemeToggle width={24} />
			</div>
			<div
				id="topbar-content"
				class="flex w-full justify-center items-center bg-base-200 p-5 rounded-lg"
			>
				<span id="title" class="font-semibold text-xl">Projects</span>
			</div>
			<div class="flex items-center justify-between w-full mt-5">
				<div class="flex items-center gap-5">
					<!-- <div class="flex items-center gap-2">
						<span class="text-xl font-semibold">Sort by:</span>
						<select class="select select-bordered select-sm w-32">
							<option value="1">Name</option>
							<option value="2">Date</option>
						</select>
					</div>
					<div class="flex items-center gap-2">
						<span class="text-xl font-semibold">Filter by:</span>
						<select class="select select-bordered select-sm w-32">
							<option value="1">Name</option>
							<option value="2">Date</option>
						</select>
					</div> -->
				</div>
				<a class="btn btn-primary" href="/app/dashboard/studio/new">New Project</a>
			</div>
		</div>

		<div id="page-content" class="w-full h-full p-10">
			{#if loadingProjects}
				<div class="w-full h-full flex items-center justify-center">
					<Spinner class="w-16 h-16 brightness-50" />
				</div>
			{/if}
			{#if !loadingProjects}
				{#if projects.length === 0}
					<div class="w-full h-full flex items-center justify-center">
						<span class="text-xl">No projects found</span>
					</div>
				{:else}
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
						{#each projects as project}
							<a
								href={`/app/dashboard/studio/${project.id}`}
								class="flex flex-col items-center justify-center bg-base-200 rounded-lg p-5 hover:bg-base-300 hover:-translate-y-2 outline-none hover:outline-2 hover:outline-base-content transition-all"
							>
								<div class="w-full h-48 object-cover rounded-lg" />
								<span class="text-xl font-semibold">{project.name}</span>
							</a>
						{/each}
					</div>
				{/if}
			{/if}
		</div>
	</div>
	<div class="drawer-side">
		<label for="sidebar" aria-label="close sidebar" class="drawer-overlay"></label>
		<div
			class="menu justify-between p-6 w-80 min-h-full bg-base-200 text-base-content text-lg md:text-xl"
		>
			<div class="hidden lg:flex items-center justify-between">
				<a href="/" class="flex text-4xl font-bold items-center justify-center">
					<CaptifyLogo class="w-10 h-10" />
					<span class="pl-2">Captify</span>
				</a>
				<ThemeToggle width={24} />
			</div>
			<ul id="sidebar-links" class="flex flex-col gap-5">
				<li><a class="active" href="/app/dashboard/projects">Projects</a></li>
				<li><a class="" href="/app/dashboard/studio/new">Studio</a></li>
				<!-- <li><a class="" href="/app/dashboard/imgen">Image generation</a></li> -->
				<li><a class="" href="/app/dashboard/chat">Chat</a></li>
				<li><a class="" href="/app/dashboard/transcribe">Transcription</a></li>
			</ul>
			<div class="flex items-center justify-between text-sm bg-base-300 rounded-lg px-4 py-2">
				<span>
					{session?.user.email?.substring(0, 6)}...{session?.user.email?.substring(
						session.user.email.length - 10
					)}
				</span>
				<button class="btn btn-square" on:click={signout} aria-label="Sign out button">
					<LogoutIcon class="w-5 h-5" />
				</button>
			</div>
		</div>
	</div>
</div>

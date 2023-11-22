<script lang="ts">
	import CaptifyLogo from "~icons/game-icons/abstract-116";
	import LogoutIcon from "~icons/iconoir/log-out";
	import HamburgerMenu from "~icons/solar/hamburger-menu-line-duotone";
	import Spinner from "~icons/svg-spinners/270-ring";

	import ThemeToggle from "../../../../../components/themeToggle/themeToggle.svelte";
	import { onMount } from "svelte";
	import { PUBLIC_STORAGE_BUCKET } from "$env/static/public";

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

	let selectedVideoFile: FileList;
	let uploading = false;
	async function uploadToStorage() {
		if (selectedVideoFile.length != 1) return;
		uploading = true;

		// Create a new project

		let createdProject: Project = await (await fetch("/api/newProject")).json();

		console.log(createdProject);

		const { data, error } = await supabase.storage
			.from(PUBLIC_STORAGE_BUCKET)
			.upload(`/${createdProject.id}/raw_video.mp4`, selectedVideoFile[0]);

		await fetch("/api/updateProject", {
			method: "POST",
			body: JSON.stringify({
				projectId: createdProject.id,
				updates: {
					raw_video_bucket_path: `/${createdProject.id}/raw_video.mp4`
				}
			})
		});

		console.log(data, error);

		uploading = false;

		window.location.href = `/app/dashboard/studio/${createdProject.id}`;
	}
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
				<span id="title" class="font-semibold text-xl">Studio</span>
			</div>
		</div>

		<div id="page-content" class="w-full h-full p-10">
			<div class="flex justify-center items-center">
				<div class="form-control w-full max-w-xs">
					<label class="label">
						<span class="label-text">Choose a video to continue</span>
					</label>
					<input
						type="file"
						class="file-input file-input-bordered w-full max-w-xs"
						accept="video/*"
						bind:files={selectedVideoFile}
					/>
					<button
						class="btn btn-primary mt-2"
						disabled={!selectedVideoFile || uploading}
						on:click={uploadToStorage}
					>
						{#if uploading}
							<Spinner />
						{:else}
							Upload
						{/if}
					</button>
				</div>
			</div>
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
				<li><a class="" href="/app/dashboard/projects">Projects</a></li>
				<li><a class="active" href="">Studio</a></li>
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

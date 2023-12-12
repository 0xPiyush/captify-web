<script lang="ts">
	import CaptifyLogo from "~icons/game-icons/abstract-116";
	import LogoutIcon from "~icons/iconoir/log-out";
	import HamburgerMenu from "~icons/solar/hamburger-menu-line-duotone";
	import Spinner from "~icons/svg-spinners/270-ring";

	import ThemeToggle from "$components/themeToggle/themeToggle.svelte";
	import { onMount } from "svelte";
	import { PUBLIC_LLAMA_API, PUBLIC_STORAGE_BUCKET, PUBLIC_WHISPER_API } from "$env/static/public";

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

	let videoUrl: string = "";

	let transcription: string = "";
	let generatedTitle: string = "";
	let generatedDescription: string = "";
	let generatedTags: string = "";

	async function transcribeAudio(audioFileUrl: string) {
		type TranscribeAudioResponse = {
			message: string;
			data: string;
		};

		const res = await fetch("/api/transcribeAudio", {
			method: "POST",
			body: JSON.stringify({
				audioFileUrl
			})
		});

		const { data }: TranscribeAudioResponse = await res.json();
		return data;
	}

	async function generateTitle(transcription: string) {
		type GenerateTitleResponse = {
			message: string;
			data: string;
		};

		const res = await fetch("/api/generateVideoTitle", {
			method: "POST",
			body: JSON.stringify({
				videoTranscript: transcription
			})
		});

		const { data }: GenerateTitleResponse = await res.json();

		return data;
	}

	async function generateDescription(transcription: string, videoTitle: string) {
		type GenerateDescriptionResponse = {
			message: string;
			data: string;
		};

		const res = await fetch("/api/generateVideoDescription", {
			method: "POST",
			body: JSON.stringify({
				videoTranscript: transcription,
				videoTitle
			})
		});

		const { data }: GenerateDescriptionResponse = await res.json();

		return data;
	}

	async function generateTags(transcription: string, videoTitle: string, videoDescription: string) {
		type GenerateTagsResponse = {
			message: string;
			data: string;
		};

		const res = await fetch("/api/generateVideoTags", {
			method: "POST",
			body: JSON.stringify({
				videoTranscript: transcription,
				videoTitle,
				videoDescription
			})
		});

		const { data }: GenerateTagsResponse = await res.json();

		return data;
	}

	function updateDataInDB(updates: any) {
		fetch("/api/updateProject", {
			method: "POST",
			body: JSON.stringify({
				projectId: data.project.id,
				updates
			})
		});
	}

	onMount(async () => {
		let updateGeneratedDataInDB = false;

		let res = await supabase.storage
			.from(PUBLIC_STORAGE_BUCKET)
			.createSignedUrl(data.project.raw_video_bucket_path!, 60 * 60 * 24 * 7, {
				download: true
			});

		videoUrl = res.data?.signedUrl!;

		if (data.project.transcription_native_language == null) {
			const text = await transcribeAudio(videoUrl);
			updateGeneratedDataInDB = true;
			transcription = text;
		} else {
			transcription = data.project.transcription_native_language;
		}

		if (data.project.generated_media_title == null) {
			generatedTitle = await generateTitle(transcription);
			updateGeneratedDataInDB = true;
		} else {
			generatedTitle = data.project.generated_media_title;
		}

		if (data.project.generated_media_description == null) {
			generatedDescription = await generateDescription(transcription, generatedTitle);
			updateGeneratedDataInDB = true;
		} else {
			generatedDescription = data.project.generated_media_description;
		}

		if (data.project.generated_media_tags == null) {
			generatedTags = await generateTags(transcription, generatedTitle, generatedDescription);
			updateGeneratedDataInDB = true;
		} else {
			generatedTags = data.project.generated_media_tags;
		}

		if (updateGeneratedDataInDB) {
			await updateDataInDB({
				transcription_native_language: transcription,
				generated_media_title: generatedTitle,
				generated_media_description: generatedDescription,
				generated_media_tags: generatedTags
			});
		}
	});
</script>

<div class="drawer lg:drawer-open">
	<input id="sidebar" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content flex flex-col">
		<!-- Page content here -->
		<div id="topbar-container" class="p-5 bg-base-100 lg:bg-transparent">
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

		<div
			id="page-content"
			class="w-full h-full p-5 grid grid-cols-1 justify-center md:grid-cols-2 gap-4"
		>
			<!-- Display video -->
			<!-- svelte-ignore a11y-media-has-caption -->
			<video
				id="video"
				class="border border-neutral rounded-lg aspect-square w-full h-72 md:h-96"
				src={videoUrl}
				controls
				controlsList="nodownload"
			></video>

			<div id="transcription" class="bg-base-300 flex flex-col w-full h-72 md:h-96 p-4 rounded-lg">
				<h1 class="text-2xl font-bold mb-5">Transcription</h1>
				{#if transcription == ""}
					<div class="flex w-full h-full justify-center items-center">
						<Spinner class="w-10 h-10" />
					</div>
				{:else}
					{transcription}
				{/if}
			</div>
			<div
				id="vid-title"
				class="bg-base-300 flex items-center justify-center w-full h-16 p-4 rounded-lg md:col-span-2"
			>
				{#if generatedTitle == ""}
					<div class="flex w-full h-full justify-center items-center">
						<Spinner class="w-5 h-5" />
					</div>
				{:else}
					<h1 class="text-xl font-bold">{generatedTitle}</h1>
				{/if}
			</div>
			<div id="vid-desc" class="bg-base-300 flex flex-col w-full h-72 md:h-96 p-4 rounded-lg">
				<h1 class="text-2xl font-bold mb-5">Description</h1>
				{#if generatedDescription == ""}
					<div class="flex w-full h-full justify-center items-center">
						<Spinner class="w-10 h-10" />
					</div>
				{:else}
					{generatedDescription}
				{/if}
			</div>
			<div id="vid-tags" class="bg-base-300 flex flex-col w-full h-72 md:h-96 p-4 rounded-lg">
				<h1 class="text-2xl font-bold mb-5">Tags</h1>
				{#if generatedTags == ""}
					<div class="flex w-full h-full justify-center items-center">
						<Spinner class="w-10 h-10" />
					</div>
				{:else}
					{generatedTags}
				{/if}
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
				<!-- svelte-ignore a11y-invalid-attribute -->
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

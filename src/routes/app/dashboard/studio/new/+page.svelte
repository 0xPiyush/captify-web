<script lang="ts">
	import CaptifyLogo from "~icons/game-icons/abstract-116";
	import LogoutIcon from "~icons/iconoir/log-out";
	import HamburgerMenu from "~icons/solar/hamburger-menu-line-duotone";
	import Spinner from "~icons/svg-spinners/270-ring";

	import ThemeToggle from "$components/themeToggle/themeToggle.svelte";
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

	let selectedFiles: FileList;
	let uploading = false;

	async function extractAudioFromVideo(videoFile: File) {
		// Extract audio from video
		const fileData = new Blob([videoFile], { type: videoFile.type });
		const buffer = await fileData.arrayBuffer();

		const audioContext = new AudioContext();
		const audioBuffer = await audioContext.decodeAudioData(buffer);

		// Convert audio buffer to Blob
		const [left, right] = [audioBuffer.getChannelData(0), audioBuffer.getChannelData(1)];

		// interleave both channels together
		const interleaved = new Float32Array(left.length + right.length);
		for (let src = 0, dst = 0; src < left.length; src++, dst += 2) {
			interleaved[dst] = left[src];
			interleaved[dst + 1] = right[src];
		}

		// create the wav blob and pass it on to createDownloadLink
		const wavBytes = getWavBytes(interleaved.buffer, {
			isFloat: true,
			numChannels: 2,
			sampleRate: audioBuffer.sampleRate,
			bitDepth: 32
		});

		const wav = new Blob([wavBytes], { type: "audio/wav" });
		return wav;
	}

	function getWavBytes(
		buffer: ArrayBuffer,
		options: { isFloat: boolean; numChannels: number; sampleRate: number; bitDepth: number }
	) {
		const type = options.isFloat ? Float32Array : Uint16Array;
		const numFrames = buffer.byteLength / type.BYTES_PER_ELEMENT;

		const headerBytes = getWavHeader(options, numFrames);
		const wavBytes = new Uint8Array(headerBytes.length + buffer.byteLength);

		// prepend header, then add pcmBytes
		wavBytes.set(headerBytes, 0);
		wavBytes.set(new Uint8Array(buffer), headerBytes.length);

		return wavBytes;
	}

	function getWavHeader(
		options: {
			isFloat: boolean;
			numChannels: number;
			sampleRate: number;
			bitDepth: number;
		},
		numFrames: number
	) {
		const numChannels = options.numChannels || 2;
		const sampleRate = options.sampleRate || 44100;
		const bytesPerSample = options.isFloat ? 4 : 2;
		const format = options.isFloat ? 3 : 1;

		const blockAlign = numChannels * bytesPerSample;
		const byteRate = sampleRate * blockAlign;
		const dataSize = numFrames * blockAlign;

		const buffer = new ArrayBuffer(44);
		const dv = new DataView(buffer);

		let p = 0;

		function writeString(s: string) {
			for (let i = 0; i < s.length; i++) {
				dv.setUint8(p + i, s.charCodeAt(i));
			}
			p += s.length;
		}

		function writeUint32(d: number) {
			dv.setUint32(p, d, true);
			p += 4;
		}

		function writeUint16(d: number) {
			dv.setUint16(p, d, true);
			p += 2;
		}

		writeString("RIFF"); // ChunkID
		writeUint32(dataSize + 36); // ChunkSize
		writeString("WAVE"); // Format
		writeString("fmt "); // Subchunk1ID
		writeUint32(16); // Subchunk1Size
		writeUint16(format); // AudioFormat https://i.stack.imgur.com/BuSmb.png
		writeUint16(numChannels); // NumChannels
		writeUint32(sampleRate); // SampleRate
		writeUint32(byteRate); // ByteRate
		writeUint16(blockAlign); // BlockAlign
		writeUint16(bytesPerSample * 8); // BitsPerSample
		writeString("data"); // Subchunk2ID
		writeUint32(dataSize); // Subchunk2Size

		return new Uint8Array(buffer);
	}

	async function processSelectedFile() {
		if (selectedFiles.length != 1) return;
		uploading = true;

		const videoFile = selectedFiles[0];
		// const audioFile = await extractAudioFromVideo(videoFile);

		// get created project
		let createdProject: Project = await (await fetch("/api/newProject")).json();

		console.log(createdProject);

		// upload video file
		const { data, error } = await supabase.storage
			.from(PUBLIC_STORAGE_BUCKET)
			.upload(`${session?.user.id}/${createdProject.id}/raw_video.mp4`, videoFile);

		// // upload audio file
		// const { data: audioData, error: audioError } = await supabase.storage
		// 	.from(PUBLIC_STORAGE_BUCKET)
		// 	.upload(`${session?.user.id}/${createdProject.id}/raw_audio.wav`, audioFile);

		// TODO: handle file upload errors

		await fetch("/api/updateProject", {
			method: "POST",
			body: JSON.stringify({
				projectId: createdProject.id,
				updates: {
					raw_video_bucket_path: `${session?.user.id}/${createdProject.id}/raw_video.mp4`
					// raw_audio_bucket_path: `${session?.user.id}/${createdProject.id}/raw_audio.wav`
				}
			})
		});

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
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">
						<span class="label-text">Choose a video to continue</span>
					</label>
					<input
						type="file"
						class="file-input file-input-bordered w-full max-w-xs"
						accept="video/*"
						bind:files={selectedFiles}
					/>
					<button
						class="btn btn-primary mt-2"
						disabled={!selectedFiles || uploading}
						on:click={processSelectedFile}
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

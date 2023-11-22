import { PUBLIC_WHISPER_API } from "$env/static/public";
import db from "$lib/db";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async (event) => {
	const session = await event.locals.getSession();
	if (!session) {
		return json({ error: "Not logged in" }, { status: 401 });
	}
	// get request body
	const body = await event.request.json();

	console.log(PUBLIC_WHISPER_API);
	console.log(body.file_url);

	function get(url: string, options: any, timeout = 7000) {
		return Promise.race([
			fetch(url, options),
			new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), timeout))
		]);
	}
	const res: any = await get(`${PUBLIC_WHISPER_API}/transcribe`, {
		method: "POST",
		body: JSON.stringify({
			file_url: body.file_url
		})
	});

	const transcription = await res.json();
	// const transcription = await (
	// 	await fetch(`${PUBLIC_WHISPER_API}/transcribe`, {
	// 		method: "POST",
	// 		body: JSON.stringify({
	// 			file_url: body.file_url
	// 		})
	// 	})
	// ).json();

	return transcription;
};

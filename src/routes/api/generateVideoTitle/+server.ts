import { replicateAI } from "$lib/replicateAI";
import { json, type RequestHandler } from "@sveltejs/kit";

import { z } from "zod";

const bodySchema = z.object({
	videoTranscript: z.string()
});

export const POST: RequestHandler = async (event) => {
	const session = await event.locals.getSession();
	if (!session) {
		return json({ message: "Not logged in.", error: "Unauthorized" }, { status: 401 });
	}
	// get request body
	const data = bodySchema.safeParse(await event.request.json());

	if (!data.success) {
		return json({ message: "Invalid POST data", error: data.error });
	}

	const modelName =
		"mistralai/mistral-7b-instruct-v0.1:83b6a56e7c828e667f21fd596c338fd4f0039b46bcfa18d973e8e70e455fda70";

	const modelInput = {
		debug: false,
		top_k: 0,
		top_p: 0.9,
		prompt: `Generate a title for this video that has the following transcript, \
		keep the title short (within 6 words) and interesting such that a viewer would want to know more. \
		Dont include words like "Title" just give the title as the output. \
		Here's the transcript: ${data.data.videoTranscript}`,
		temperature: 0.7,
		max_new_tokens: 20,
		min_new_tokens: -1
	};

	const modelOutput = (await replicateAI.run(modelName, {
		input: modelInput
	})) as string[];

	const generateTitle = modelOutput.join("");

	return json({ message: "Success", data: generateTitle });
};

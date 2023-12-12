import { replicateAI } from "$lib/replicateAI";
import { json, type RequestHandler } from "@sveltejs/kit";

import { z } from "zod";

const bodySchema = z.object({
	videoTranscript: z.string(),
	videoTitle: z.string(),
	videoDescription: z.string()
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
		prompt: `Generate comma separated tags for a video that has the title: ${data.data.videoTitle} \
		Genrate tags that are relevant to the video and are not too long. \
        Use the following transcript to generate the tags: \n
        ${data.data.videoTranscript} \n
        Also use this description to generate accurate tags: \n
        ${data.data.videoDescription} \n
		==================== \n
		Generate at between 10 to 15 tags using all the information above, the tags should be comma separated, don't number the tags.`,
		temperature: 0.7,
		max_new_tokens: 150,
		min_new_tokens: -1
	};

	const modelOutput = (await replicateAI.run(modelName, {
		input: modelInput
	})) as string[];

	const generateTitle = modelOutput.join("");

	return json({ message: "Success", data: generateTitle });
};

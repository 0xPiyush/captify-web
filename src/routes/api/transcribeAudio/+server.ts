import { replicateAI } from "$lib/replicateAI";
import { json, type RequestHandler } from "@sveltejs/kit";
import { z } from "zod";

const bodySchema = z.object({
	audioFileUrl: z.string()
});

export const POST: RequestHandler = async (event) => {
	const session = await event.locals.getSession();
	if (!session) {
		return json({ error: "Not logged in" }, { status: 401 });
	}

	// get request body
	const data = bodySchema.safeParse(await event.request.json());

	if (!data.success) {
		return json({ message: "Invalid POST data", error: data.error });
	}

	const modelName =
		"daanelson/whisperx:9aa6ecadd30610b81119fc1b6807302fd18ca6cbb39b3216f430dcf23618cedd";

	const modelInput = {
		audio: data.data.audioFileUrl,
		only_text: true
	};

	const modelOutput = await replicateAI.run(modelName, {
		input: modelInput
	});

	return json({ message: "Success", data: modelOutput });
};

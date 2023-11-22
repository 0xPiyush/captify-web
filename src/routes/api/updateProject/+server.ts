import db from "$lib/db";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async (event) => {
	const session = await event.locals.getSession();
	if (!session) {
		return json({ error: "Not logged in" }, { status: 401 });
	}
	// get request body
	const body = await event.request.json();

	await db.project.update({
		data: body["updates"],
		where: {
			id: body.projectId
		}
	});

	return json({ success: true });
};

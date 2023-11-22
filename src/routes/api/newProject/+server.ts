import db from "$lib/db";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async (event) => {
	const session = await event.locals.getSession();
	if (!session) {
		return json({ error: "Not logged in" }, { status: 401 });
	}
	// Get all projects for the current user
	const project = await db.project.create({
		data: {
			name: "New Project",
			ownerId: session.user.id
		}
	});

	return json(project);
};

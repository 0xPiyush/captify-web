import db from "$lib/db";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async (event) => {
	const session = await event.locals.getSession();
	if (!session) {
		return json({ error: "Not logged in" }, { status: 401 });
	}

	const random_num = Math.floor(Math.random() * 1000);

	// Create new project
	const project = await db.project.create({
		data: {
			name: `New Project ${random_num}`,
			ownerId: session.user.id
		}
	});

	return json(project);
};

import db from "$lib/db";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async (event) => {
	const session = await event.locals.getSession();

	// Get all projects for the current user
	const projects = await db.project.findMany({
		where: {
			ownerId: session?.user.id
		}
	});

	return json(projects);
};

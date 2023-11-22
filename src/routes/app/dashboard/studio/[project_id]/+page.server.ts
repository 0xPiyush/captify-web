import db from "$lib/db.js";
import { redirect } from "@sveltejs/kit";

export const load = async ({ params }) => {
	// get the project id from the url
	const projectId = params.project_id;

	const project = await db.project.findUnique({
		where: {
			id: projectId
		}
	});

	if (!project) {
		throw redirect(303, "/app/dashboard/projects");
	}

	return { project };
};

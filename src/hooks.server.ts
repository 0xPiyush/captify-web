import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "$env/static/public";
import { createSupabaseServerClient } from "@supabase/auth-helpers-sveltekit";
import { redirect, type Handle, json } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createSupabaseServerClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		event
	});

	/**
	 * A convenience helper so we can just call await getSession() instead const { data: { session } } = await supabase.auth.getSession()
	 */
	event.locals.getSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		return session;
	};

	if (event.url.pathname.startsWith("/app")) {
		const session = await event.locals.getSession();
		if (!session) {
			throw redirect(303, "/?showSignin=true");
		}
	}

	if (event.url.pathname.startsWith("/api")) {
		const session = await event.locals.getSession();
		if (!session) {
			return json({
				status: 401,
				body: "Unauthorized"
			});
		}
	}

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === "content-range";
		}
	});
};

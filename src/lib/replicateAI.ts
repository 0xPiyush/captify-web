import { REPLICATE_API_TOKEN } from "$env/static/private";
import Replicate from "replicate";

export const replicateAI = new Replicate({
	auth: REPLICATE_API_TOKEN
});

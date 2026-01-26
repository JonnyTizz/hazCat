import type { APIRoute } from "astro";
import { HazCat } from "@jonnytizz/hazcat";

export const prerender = false;

const requiredEnv = ["HAZCAT_API_KEY", "HAZCAT_MODEL"] as const;

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log({ request });

    const env = import.meta.env;
    const missing = requiredEnv.filter((key) => !env[key]);
    if (missing.length > 0) {
      return new Response(`Missing required env: ${missing.join(", ")}`, {
        status: 500,
      });
    }

    const body = (await request.json()) as {
      imageBase64?: string;
      imageType?: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
    };

    console.log({ body });

    if (!body.imageBase64 || !body.imageType) {
      return new Response("Missing image data.", { status: 400 });
    }

    const client = new HazCat({
      apiKey: env.HAZCAT_API_KEY ?? "",
      model: env.HAZCAT_MODEL ?? "",
      baseUrl: env.HAZCAT_BASE_URL,
    });

    const result = await client.hazCat({
      catImage: body.imageBase64,
      imageType: body.imageType,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected error.";
    return new Response(message, { status: 500 });
  }
};

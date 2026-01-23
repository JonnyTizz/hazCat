import type { OpenAI } from "openai/index.js";
import type { HazCatResponse } from "./types.js";

export const isFileSmallEnough = (fileString: string): boolean => {
	const maxSizeInBytes = 50 * 1024 * 1024; // 50MB

	const fileSizeInBytes = Buffer.byteLength(fileString, "base64");
	return fileSizeInBytes <= maxSizeInBytes;
};

export const isFileTypeValid = (imageType: string): boolean => {
	const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
	return validTypes.includes(imageType);
};

const isHazCatResponse = (value: unknown): value is HazCatResponse => {
	return (
		typeof value === "object" &&
		value !== null &&
		"hazCat" in value &&
		"message" in value &&
		typeof (value as any).hazCat === "boolean" &&
		typeof (value as any).message === "string"
	);
};

export const extractOutputText = (
	response: OpenAI.Responses.Response,
): string => {
	if (!response) {
		throw new Error("Invalid response format: missing response object.");
	}

	if (response.output_text) {
		return response.output_text;
	}

	if (!response.output?.length) {
		throw new Error("Invalid response format: missing output text.");
	}

	const output = response.output[0];

	if (!output || output.type !== "message" || !output.content.length) {
		throw new Error("Invalid response format: missing message content.");
	}

	const textItem = output.content.find(
		(
			item,
		): item is Extract<
			(typeof output.content)[number],
			{ type: "output_text" }
		> => item.type === "output_text",
	);

	if (!textItem) {
		throw new Error("Invalid response format: missing text output.");
	}

	return textItem.text;
};

export function parseHazCatResponse(rawText: string): HazCatResponse {
	let parsed: unknown;

	try {
		parsed = JSON.parse(rawText);
	} catch {
		throw new Error("Model response was not valid JSON");
	}

	if (!isHazCatResponse(parsed)) {
		throw new Error("Model response JSON did not match HazCatResponse");
	}

	return parsed;
}

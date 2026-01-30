import type { ParsedFile } from "./types";

export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const SUPPORTED_IMAGE_TYPES_STRING = SUPPORTED_IMAGE_TYPES.join(",");

/**
 * Parse a data URL into its mime type and base64 content
 */
export const parseDataUrl = (dataUrl: string): ParsedFile | null => {
  const match = dataUrl.match(/^data:(.+);base64,(.*)$/);
  if (!match) {
    return null;
  }
  return { mime: match[1], base64: match[2] };
};

/**
 * Check if a file type is supported
 */
export const isSupportedImageType = (
  type: string,
): type is (typeof SUPPORTED_IMAGE_TYPES)[number] => {
  return SUPPORTED_IMAGE_TYPES.includes(
    type as (typeof SUPPORTED_IMAGE_TYPES)[number],
  );
};

/**
 * Get a human-readable error message for hazcat errors
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
};

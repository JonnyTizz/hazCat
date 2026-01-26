export type HazCatConfig = {
  apiKey: string;
  model: string;
  baseUrl?: string;
};

export type HazCatRequest = {
  catImage: string;
  imageType: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
};

export type HazCatResponse = {
  hazCat: boolean;
  message: string;
};

import "dotenv/config";
import { HazCat } from "./index.js";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const apiKey = `Bearer ${process.env.OPEN_AI_KEY || ""}`;
const baseUrl = process.env.HAZCAT_BASE_URL || "";

console.log("Starting HazCat demo...");

const hazCatClient = new HazCat({
  apiKey,
  model: "vercel/openai-gpt-5-nano",
  baseUrl,
});

// const imagePath = resolve(process.cwd(), "test-images", "spiros.jpeg");
// const imagePath = resolve(process.cwd(), "test-images", "horses.jpg");
const imagePath = resolve(process.cwd(), "test-images", "Garfield_the_Cat.png");
// const imagePath = resolve(process.cwd(), "test-images", "tom.webp");
// const imagePath = resolve(process.cwd(), "test-images", "grumpy.webp");
// const imagePath = resolve(process.cwd(), "test-images", "lotsocats.webp");
// const imagePath = resolve(
// 	process.cwd(),
// 	"test-images",
// 	"Felicette_spacecat.jpg",
// );
const imageBase64 = (await readFile(imagePath)).toString("base64");

const catResponse = await hazCatClient.hazCat({
  catImage: imageBase64,
  imageType: "image/png",
});

console.log("HazCat request completed.");
console.log("hazCat:", catResponse.hazCat);
console.log("message:", catResponse.message);

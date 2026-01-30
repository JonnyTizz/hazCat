# HazCat

[![NPM Downloads](https://img.shields.io/npm/dw/%40jonnytizz%2Fhazcat?logo=npm)](https://www.npmjs.com/package/@jonnytizz/hazcat) [![Static Badge](https://img.shields.io/badge/github-repo-blue?logo=github&link=https%3A%2F%2Fgithub.com%2FJonnyTizz%2FhazCat)](https://github.com/JonnyTizz/hazCat/tree/main/lib)

Because disappointment is expensive and sadness is measurable.

HazCat is the premium-grade, nonsense-powered module that keeps users safe from the crushing void of looking at a picture and realizing there is no cat in it. It’s a simple promise: if there’s a picture, you’ll **know** whether there’s a cat. HazCat doesn’t add cats; it adds clarity. Your users will never again experience the **soul-sinking moment of not finding a cat** without at least getting a polite, mildly sad report first.

## Features

- **Anti-Disappointment Detection™**: Detects the absence of cats and tells you gently.
- **Sadness Rate Limiting**: Caps sorrow at a legally acceptable level.
- **Feline Verification**: Confirms when cats are actually present.
- **Truth, Not Feline Fabrication**: Zero cat invention, all cat accountability.

## Install

```bash
npm install hazcat
```

## Usage

```ts
import { HazCat } from 'hazcat';

const hazcat = new HazCat({
  apiKey: process.env.OPENAI_API_KEY!,
  model: 'gpt-4.1-mini',
});

const result = await hazcat.hazCat({
  catImage: '<base64 image string>',
  imageType: 'image/jpeg',
});

// result => { hazCat: boolean, message: string }
```

### Example Result

```json
{ "hazCat": false, "message": "A skateboard in a park. Sadly, no cat." }
```

## Configuration

### `HazCatConfig`

| Option    | Type   | Default                  | Description                |
| --------- | ------ | ------------------------ | -------------------------- |
| `apiKey`  | string | required                 | OpenAI API key.            |
| `model`   | string | required                 | OpenAI model to use.       |
| `baseUrl` | string | `https://api.openai.com` | Override the API base URL. |

### `HazCatRequest`

| Option      | Type   | Description                                     |
| ----------- | ------ | ----------------------------------------------- |
| `catImage`  | string | Base64-encoded image data (no data URL prefix). |
| `imageType` | string | MIME type like `image/png` or `image/jpeg`.     |

## Why HazCat

Because no one should have to whisper “I thought there would be a cat.”

HazCat removes the emotional risk from images and replaces it with a warm, validating purr. It’s less a module and more a public service — with honesty.

## FAQ

**Q: What if there is already a cat in the picture?**

A: We confirm it. You’re welcome.

**Q: Does HazCat work on all images?**

A: Yes. Especially the ones that hurt.

**Q: Is this serious?**

A: It’s serious about cats.

## License

Meow.

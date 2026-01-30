export type ParsedFile = {
  mime: string;
  base64: string;
};

export type HazCatResult = {
  hazCat: boolean;
  message: string;
};

export type HazCatState = {
  imageData: ParsedFile | null;
  result: HazCatResult | null;
  error: Error | null;
  isPending: boolean;
};

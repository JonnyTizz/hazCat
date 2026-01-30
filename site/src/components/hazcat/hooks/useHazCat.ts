import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import type { HazCatResult, ParsedFile } from "../types";

type UseHazCatOptions = {
  onSuccess?: (result: HazCatResult) => void;
  onError?: (error: Error) => void;
};

async function checkHazCat(imageData: ParsedFile): Promise<HazCatResult> {
  const res = await fetch("/api/hazcat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageBase64: imageData.base64,
      imageType: imageData.mime,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`HazCat check failed (${res.status}): ${errorText}`);
  }

  return res.json() as Promise<HazCatResult>;
}

export function useHazCat(options: UseHazCatOptions = {}) {
  const [imageData, setImageData] = useState<ParsedFile | null>(null);
  const [result, setResult] = useState<HazCatResult | null>(null);

  const mutation = useMutation({
    mutationFn: () => {
      if (!imageData) {
        return Promise.reject(new Error("No image selected"));
      }
      return checkHazCat(imageData);
    },
    onSuccess: (data) => {
      setResult(data);
      options.onSuccess?.(data);
    },
    onError: (error) => {
      setResult(null);
      options.onError?.(error);
    },
  });

  const setImage = useCallback(
    (data: ParsedFile) => {
      setResult(null);
      mutation.reset();
      setImageData(data);
    },
    [mutation],
  );

  const check = useCallback(() => {
    if (imageData) {
      mutation.mutate();
    }
  }, [imageData, mutation]);

  const reset = useCallback(() => {
    setImageData(null);
    setResult(null);
    mutation.reset();
  }, [mutation]);

  return {
    // State
    imageData,
    result,
    error: mutation.error,
    isPending: mutation.isPending,
    isError: mutation.isError,
    canCheck: imageData !== null && !mutation.isPending,

    // Actions
    setImage,
    check,
    reset,
  };
}

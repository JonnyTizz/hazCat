import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { UploadIcon } from "lucide-react";
import React, { useRef } from "react";
import { useState } from "react";
import { Spinner } from "./ui/spinner";

import { QueryProvider } from "@/components/QueryProvider";

const SUPPORTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type ParsedFile = {
  mime: string;
  base64: string;
};

type HazCatResult = {
  hazCat: boolean;
  message: string;
};

export const HazCatApp = () => {
  return (
    <QueryProvider>
      <HazCat />
    </QueryProvider>
  );
};

const parseDataUrl = (dataUrl: string): ParsedFile | null => {
  const match = dataUrl.match(/^data:(.+);base64,(.*)$/);
  if (!match) {
    return null;
  }
  return { mime: match[1], base64: match[2] };
};

export const HazCat = () => {
  const [imageData, setImageData] = useState<ParsedFile | null>(null);
  const [result, setResult] = useState<HazCatResult | null>(null);

  const { mutate, isPending, error } = useMutation({
    mutationFn: async () => {
      if (!imageData) {
        throw new Error("No image data to send to HazCat");
      }

      const res = await fetch("/api/hazcat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imageData.base64,
          imageType: imageData.mime,
        }),
      });

      if (!res.ok) {
        throw new Error(`HazCat failed: ${res.status}`);
      }

      return (await res.json()) as HazCatResult;
    },
    onSuccess: async (data) => {
      setResult(data);
    },
    onError: (error) => {
      setResult(null);
      console.error("Error during hazcat check:", error);
    },
  });

  return (
    <Card className="relative mx-auto w-full max-h-[90vh] max-w-2xl pt-0 backdrop-blur-sm bg-(--card)/20">
      <div className="grid w-full h-full">
        <FileInput
          className="col-start-1 row-start-1"
          disabled={isPending}
          onFileChange={(imageData) => {
            setResult(null);
            setImageData(imageData);
          }}
        />
        {isPending && (
          <div className="col-start-1 row-start-1 w-full h-full grid place-items-center content-center m-2 overflow-hidden rounded-[6px] bg-white/30 z-50">
            <Spinner className="size-12 z-50 text-primary" />
          </div>
        )}
      </div>
      {result && (
        <CardHeader>
          <CardTitle>
            {result.hazCat ? "Yay! Cat detected 🎉" : "Aww, no cats here 🥺"}
          </CardTitle>
          <CardDescription>{result.message}</CardDescription>
        </CardHeader>
      )}
      <CardFooter>
        <Button
          className="w-full disabled:opacity-100 disabled:grayscale-50"
          disabled={!imageData || isPending}
          onClick={() => imageData && mutate()}
        >
          {isPending ? (
            <>
              <Spinner /> Checking…
            </>
          ) : (
            "HazCat?"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

const FileInput = ({
  className = undefined,
  disabled = false,
  onFileChange,
}: {
  className?: string | undefined;
  disabled?: boolean;
  onFileChange: (fileData: ParsedFile) => void;
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isDragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState<string>("");
  const dragDepth = React.useRef(0);

  const isFileDrag = (e: React.DragEvent) =>
    Array.from(e.dataTransfer.types || []).includes("Files");

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return false;

    e.preventDefault();
    e.stopPropagation();
    if (!isFileDrag(e)) return;

    dragDepth.current += 1;
    if (!isDragActive) setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return false;

    e.preventDefault();
    e.stopPropagation();
    if (!isFileDrag(e)) return;

    dragDepth.current -= 1;

    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setDragActive(false);
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return false;

    e.preventDefault(); // REQUIRED for drop to fire
    e.stopPropagation();
    if (!isFileDrag(e)) return;
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return false;

    e.preventDefault();
    e.stopPropagation();

    dragDepth.current = 0;
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      loadFile(file);
    }
  };

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      loadFile(file);
    }
  };

  const onPickClick = () => {
    if (disabled) return false;

    inputRef.current?.click();
  };

  const loadFile = (file: File) => {
    if (!SUPPORTED_TYPES.includes(file.type)) {
      setMessage(
        "Unsupported file type. Please use jpeg, png, webp, or static gif.",
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        return;
      }

      const parsed = parseDataUrl(reader.result);
      if (!parsed) {
        setMessage("Could not read that image. Try another file.");
        return;
      }

      setImageUrl(reader.result);
      onFileChange(parsed);
      // setImageBase64(parsed.base64);
      // setImageType(parsed.mime);
      // setStatus('idle');
      // setMessage('Ready to ask hazcat?');
    };

    reader.readAsDataURL(file);

    setMessage("");
  };

  return (
    <div
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
      onClick={onPickClick}
      className={cn(
        "grid place-items-center content-center m-2 overflow-hidden rounded-[6px]",
        !disabled && "cursor-pointer",
        className,
      )}
    >
      <Card
        className={cn(
          "rounded-[6px] col-start-1 row-start-1 border-dashed border-muted-foreground text-muted-foreground border-2 relative z-20 aspect-video w-full h-full object-cover bg-accent grid place-items-center content-center",
          !disabled &&
            "hover:border-primary hover:text-primary hover:bg-transparent",
          isDragActive && "border-primary text-primary bg-transparent",
          imageUrl && "opacity-0 bg-none",
          imageUrl &&
            !disabled &&
            " hover:opacity-100 hover:bg-white/40 hover:text-black hover:border-black",
        )}
      >
        <span className="text-sm ">
          <UploadIcon className="inline-block mr-2 h-4 w-4" />
          {message || "Drag an image here, or click to select ..."}
        </span>
      </Card>

      {imageUrl && (
        <img
          src={imageUrl}
          alt="Uploaded"
          className="rounded-[6px] col-start-1 row-start-1 w-full h-full  object-contain transition"
        />
      )}
      <input
        ref={inputRef}
        type="file"
        accept={SUPPORTED_TYPES.join(",")}
        onChange={onInputChange}
        style={{ display: "none" }}
      />
    </div>
  );
};

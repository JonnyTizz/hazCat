import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { UploadIcon } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";
import type { ParsedFile } from "./types";
import {
  isSupportedImageType,
  parseDataUrl,
  SUPPORTED_IMAGE_TYPES_STRING,
} from "./utils";
import { Spinner } from "@/components/ui/spinner";

type FileInputProps = {
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
  onFileChange: (fileData: ParsedFile) => void;
};

export function FileInput({
  className,
  disabled = false,
  isLoading = false,
  onFileChange,
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isDragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState<string>("");
  const dragDepth = useRef(0);

  const isFileDrag = (e: React.DragEvent) =>
    Array.from(e.dataTransfer.types || []).includes("Files");

  const loadFile = useCallback(
    (file: File) => {
      if (!isSupportedImageType(file.type)) {
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
      };

      reader.readAsDataURL(file);
      setMessage("");
    },
    [onFileChange],
  );

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;

    e.preventDefault();
    e.stopPropagation();
    if (!isFileDrag(e)) return;

    dragDepth.current += 1;
    if (!isDragActive) setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;

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
    if (disabled) return;

    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;

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
    if (disabled) return;
    inputRef.current?.click();
  };

  return (
    <div
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
      onClick={onPickClick}
      className={cn(
        "flex items-center justify-center p-2 overflow-hidden rounded-[6px] h-full min-h-0",
        !disabled && "cursor-pointer",
        className,
      )}
    >
      {/* Placeholder card shown when no image */}
      {!imageUrl && (
        <Card
          className={cn(
            "rounded-[6px] border-dashed border-muted-foreground text-muted-foreground border-2 aspect-video w-full bg-accent grid place-items-center content-center",
            !disabled &&
              "hover:border-primary hover:text-primary hover:bg-transparent",
            isDragActive && "border-primary text-primary bg-transparent",
          )}
        >
          <span className="text-sm">
            <UploadIcon className="inline-block mr-2 h-4 w-4" />
            {message || "Drag an image here, or click to select ..."}
          </span>
        </Card>
      )}

      {/* Image with loading overlay container */}
      {imageUrl && (
        <div className="relative h-full max-w-full min-h-0 min-w-0 flex items-center justify-center">
          <img
            src={imageUrl}
            alt="Uploaded"
            className="rounded-[6px] max-h-full max-w-full object-contain transition block"
          />
          {/* Hover overlay for re-upload */}
          <div
            className={cn(
              "absolute inset-0 rounded-[6px] border-dashed border-2 border-transparent grid place-items-center opacity-0 transition-opacity",
              !disabled &&
                "hover:opacity-100 hover:bg-white/40 hover:border-black hover:text-black",
            )}
          >
            <span className="text-sm">
              <UploadIcon className="inline-block mr-2 h-4 w-4" />
              Click or drag to change image
            </span>
          </div>
          {isLoading && (
            <div className="absolute inset-0 grid place-items-center rounded-[6px] bg-white/30 z-50">
              <Spinner className="size-12 text-primary" />
            </div>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={SUPPORTED_IMAGE_TYPES_STRING}
        onChange={onInputChange}
        style={{ display: "none" }}
      />
    </div>
  );
}

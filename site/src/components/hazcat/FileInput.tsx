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

type FileInputProps = {
  className?: string;
  disabled?: boolean;
  onFileChange: (fileData: ParsedFile) => void;
};

export function FileInput({
  className,
  disabled = false,
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
        "grid place-items-center content-center m-2 overflow-hidden rounded-[6px] h-full min-h-0",
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
            "hover:opacity-100 hover:bg-white/40 hover:text-black hover:border-black",
        )}
      >
        <span className="text-sm">
          <UploadIcon className="inline-block mr-2 h-4 w-4" />
          {message || "Drag an image here, or click to select ..."}
        </span>
      </Card>

      {imageUrl && (
        <img
          src={imageUrl}
          alt="Uploaded"
          className="rounded-[6px] col-start-1 row-start-1 w-auto h-auto max-h-full max-w-full object-contain transition"
        />
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

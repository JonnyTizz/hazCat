import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { QueryProvider } from "@/components/QueryProvider";
import { FileInput } from "./FileInput";
import { useHazCat } from "./hooks/useHazCat";
import { getErrorMessage } from "./utils";

/**
 * Main HazCat app wrapper with QueryProvider
 */
export function HazCatApp() {
  return (
    <QueryProvider>
      <HazCat />
    </QueryProvider>
  );
}

/**
 * HazCat component - checks if an image contains a cat
 */
export function HazCat() {
  const { result, error, isPending, isError, canCheck, setImage, check } =
    useHazCat();

  return (
    <Card className="relative mx-auto w-full max-h-[90vh] max-w-2xl pt-0 backdrop-blur-sm bg-(--card)/20 flex flex-col">
      <div className="grid w-full flex-1 min-h-0">
        <FileInput
          className="col-start-1 row-start-1"
          disabled={isPending}
          onFileChange={setImage}
        />
        {isPending && <LoadingOverlay />}
      </div>

      <ResultDisplay result={result} error={error} isError={isError} />

      <CardFooter className="mt-auto">
        <Button
          className="w-full disabled:opacity-100 disabled:grayscale-50"
          disabled={!canCheck}
          onClick={check}
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
}

function LoadingOverlay() {
  return (
    <div className="col-start-1 row-start-1 w-full h-full grid place-items-center content-center m-2 overflow-hidden rounded-[6px] bg-white/30 z-50">
      <Spinner className="size-12 z-50 text-primary" />
    </div>
  );
}

type ResultDisplayProps = {
  result: { hazCat: boolean; message: string } | null;
  error: Error | null;
  isError: boolean;
};

function ResultDisplay({ result, error, isError }: ResultDisplayProps) {
  if (isError && error) {
    return (
      <CardHeader>
        <CardTitle className="text-destructive">
          Something went wrong 😿
        </CardTitle>
        <CardDescription className="text-destructive/80">
          {getErrorMessage(error)}
        </CardDescription>
      </CardHeader>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <CardHeader>
      <CardTitle>
        {result.hazCat ? "Yay! Cat detected 🎉" : "Aww, no cats here 🥺"}
      </CardTitle>
      <CardDescription>{result.message}</CardDescription>
    </CardHeader>
  );
}

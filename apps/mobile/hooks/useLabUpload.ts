import { useCallback, useState } from "react";
import { api } from "@/lib/api";

interface ExtractedValue {
  readonly name: string;
  readonly value: number | null;
  readonly unit: string;
  readonly referenceRange: string;
  readonly isAbnormal: boolean;
}

interface UploadEnvelope {
  readonly success: boolean;
  readonly data: {
    readonly record: { readonly id: string };
    readonly extractedValues: Record<
      string,
      number | null
    >;
    readonly confidence: Record<string, number>;
    readonly needsConfirmation: boolean;
  } | null;
  readonly error: string | null;
}

interface ConfirmEnvelope {
  readonly success: boolean;
  readonly data: {
    readonly labResult: Record<string, unknown>;
    readonly dataLevel: number;
    readonly message: string;
  } | null;
  readonly error: string | null;
}

const VALUE_METADATA: Readonly<
  Record<string, { readonly unit: string; readonly range: string }>
> = {
  totalCholesterol: { unit: "mg/dL", range: "<200" },
  ldlCholesterol: { unit: "mg/dL", range: "<100" },
  hdlCholesterol: { unit: "mg/dL", range: ">40" },
  triglycerides: { unit: "mg/dL", range: "<150" },
  lipoproteinA: { unit: "nmol/L", range: "<75" },
  apolipoproteinB: { unit: "mg/dL", range: "<90" },
  hsCrp: { unit: "mg/L", range: "<2.0" },
  hba1c: { unit: "%", range: "<5.7" },
  fastingGlucose: { unit: "mg/dL", range: "70-100" },
};

function isAbnormal(name: string, value: number): boolean {
  const meta = VALUE_METADATA[name];
  if (!meta) return false;
  const range = meta.range;
  if (range.startsWith("<")) return value >= parseFloat(range.slice(1));
  if (range.startsWith(">")) return value <= parseFloat(range.slice(1));
  const [low, high] = range.split("-").map(Number);
  return value < low || value > high;
}

function transformExtracted(
  raw: Record<string, number | null>,
): readonly ExtractedValue[] {
  return Object.entries(raw)
    .filter(([, v]) => v != null)
    .map(([name, value]) => {
      const meta = VALUE_METADATA[name] ?? { unit: "", range: "" };
      return {
        name,
        value,
        unit: meta.unit,
        referenceRange: meta.range,
        isAbnormal: value != null ? isAbnormal(name, value) : false,
      };
    });
}

interface UseLabUploadReturn {
  readonly uploadImage: (
    imageUri: string,
    reportDate: string,
  ) => Promise<void>;
  readonly confirmValues: (
    labResultId: string,
    corrections?: Record<string, number | null>,
  ) => Promise<{ error: string | null }>;
  readonly extractedValues: readonly ExtractedValue[];
  readonly labResultId: string | null;
  readonly isUploading: boolean;
  readonly isConfirming: boolean;
  readonly error: string | null;
  readonly reset: () => void;
}

export function useLabUpload(): UseLabUploadReturn {
  const [extractedValues, setExtractedValues] = useState<
    readonly ExtractedValue[]
  >([]);
  const [labResultId, setLabResultId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = useCallback(
    async (imageUri: string, reportDate: string) => {
      setIsUploading(true);
      setError(null);

      const formData = new FormData();
      const uriParts = imageUri.split(".");
      const fileType = uriParts[uriParts.length - 1];

      formData.append("file", {
        uri: imageUri,
        name: `lab-report.${fileType}`,
        type: `image/${fileType === "jpg" ? "jpeg" : fileType}`,
      } as unknown as Blob);
      formData.append("reportDate", reportDate);

      const response = await api.postFormData<UploadEnvelope>(
        "/api/lab-results/upload",
        formData,
      );

      if (response.error) {
        setError(response.error);
        setIsUploading(false);
        return;
      }

      const payload = response.data?.data;

      if (payload) {
        setLabResultId(payload.record.id);
        setExtractedValues(transformExtracted(payload.extractedValues));
      }

      setIsUploading(false);
    },
    [],
  );

  const confirmValues = useCallback(
    async (
      id: string,
      corrections?: Record<string, number | null>,
    ) => {
      setIsConfirming(true);
      setError(null);

      const response = await api.post<ConfirmEnvelope>(
        `/api/lab-results/${id}/confirm`,
        { corrections },
      );

      setIsConfirming(false);

      if (response.error) {
        setError(response.error);
        return { error: response.error };
      }

      return { error: null };
    },
    [],
  );

  const reset = useCallback(() => {
    setExtractedValues([]);
    setLabResultId(null);
    setIsUploading(false);
    setIsConfirming(false);
    setError(null);
  }, []);

  return {
    uploadImage,
    confirmValues,
    extractedValues,
    labResultId,
    isUploading,
    isConfirming,
    error,
    reset,
  };
}

export type { ExtractedValue, UseLabUploadReturn };

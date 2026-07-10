"use client";

import { useState, useTransition } from "react";
import SignaturePad from "./SignaturePad";

async function uploadSignatureDataUrl(dataUrl: string): Promise<string> {
  console.log("Uploading signature to server...");

  const res = await fetch("/api/upload-signature", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dataUrl,
    }),
  });

  const json = await res.json();

  console.log("Upload API response:", json);

  if (!res.ok) {
    throw new Error(json.error || "Upload failed");
  }

  return json.signatureKey;
}

export default function SignAndSubmit({
  leaseId,
  label,
  onSign,
}: {
  leaseId: string;
  label: string;
  onSign: (
    leaseId: string,
    signatureUrl: string
  ) => Promise<{ error?: string; success?: boolean }>;
}) {
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleCapture(dataUrl: string) {
    setError("");

    startTransition(async () => {
      try {
        console.log("Capturing signature...");

        const signatureUrl = await uploadSignatureDataUrl(dataUrl);

        console.log("Signature uploaded:");
        console.log(signatureUrl);

        const result = await onSign(leaseId, signatureUrl);

        console.log("Server action result:", result);

        if (result?.error) {
          setError(result.error);
        } else {
          setDone(true);
        }
      } catch (err) {
        console.error("Signature flow failed:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Could not save signature."
        );
      }
    });
  }

  if (done) {
    return (
      <p className="text-emerald-600 text-sm bg-emerald-50 rounded-lg px-3 py-2">
        Signed successfully.
      </p>
    );
  }

  return (
    <div>
      <SignaturePad onCapture={handleCapture} label={label} />

      {isPending && (
        <p className="text-xs text-slate-400 mt-2">
          Saving signature...
        </p>
      )}

      {error && (
        <p className="text-red-600 text-xs bg-red-50 rounded-lg px-3 py-2 mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
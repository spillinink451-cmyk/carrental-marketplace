"use client";

import { useState } from "react";

export default function PhotoUploader({
  photos,
  onChange,
  label,
  purpose = "evidence",
}: {
  photos: string[];
  onChange: (photos: string[]) => void;
  label: string;
  purpose?: "evidence" | "car-image";
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);

    try {
      const res = await fetch("/api/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type, purpose }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not get upload URL");
      }
      const { uploadUrl, publicUrl } = await res.json();

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Upload failed");

      onChange([...photos, publicUrl]);
    } catch (err: any) {
      setError(err.message || "Photo upload failed, please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="text-xs text-gray-500 block mb-1">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {photos.map((url) => (
          <img key={url} src={url} alt="" className="w-16 h-16 object-cover rounded-lg border" />
        ))}
      </div>
      <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} className="text-sm" />
      {uploading && <p className="text-xs text-gray-400 mt-1">Uploading...</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
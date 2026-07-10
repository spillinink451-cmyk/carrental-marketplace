"use client";

import { useRef, useState, useEffect } from "react";

export default function SignaturePad({ onCapture, label = "Sign here" }: { onCapture: (dataUrl: string) => void; label?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1E293B";
  }, []);

  function getPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = true;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  }

  function handleClear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  }

  function handleConfirm() {
    if (!canvasRef.current || !hasDrawn) return;
    onCapture(canvasRef.current.toDataURL("image/png"));
  }

  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">{label}</label>
      <canvas
        ref={canvasRef}
        width={400}
        height={150}
        className="border border-gray-200 rounded-xl w-full touch-none bg-white"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={() => (drawing.current = false)}
        onPointerLeave={() => (drawing.current = false)}
      />
      <div className="flex gap-2 mt-2">
        <button type="button" onClick={handleClear} className="text-xs text-slate-500 underline">Clear</button>
        <button type="button" onClick={handleConfirm} disabled={!hasDrawn} className="bg-brand hover:bg-brand-dark text-white text-xs font-semibold px-4 py-2 rounded-full disabled:opacity-50 transition-colors">
          Confirm signature
        </button>
      </div>
    </div>
  );
}
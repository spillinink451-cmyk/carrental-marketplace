"use client";

import { useState, useTransition, useMemo } from "react";
import { createCar } from "@/app/actions/cars";
import PhotoUploader from "./PhotoUploader";

const inputClass = "border border-gray-200 rounded-xl px-4 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand";

type Branch = { id: string; name: string; city: string };
type Model = { id: string; name: string };
type Brand = { id: string; name: string; models: Model[] };
type Category = { id: string; name: string };

const NEW_BRAND_VALUE = "__new__";
const NEW_MODEL_VALUE = "__new__";

export default function NewCarForm({ branches, brands, categories }: { branches: Branch[]; brands: Brand[]; categories: Category[] }) {
  const [branchId, setBranchId] = useState(branches[0]?.id ?? "");
  const [brandId, setBrandId] = useState("");
  const [newBrandName, setNewBrandName] = useState("");
  const [modelId, setModelId] = useState("");
  const [newModelName, setNewModelName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [seats, setSeats] = useState("");
  const [transmission, setTransmission] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [depositPercentage, setDepositPercentage] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const selectedBrand = useMemo(() => brands.find((b) => b.id === brandId), [brands, brandId]);
  const isNewBrand = brandId === NEW_BRAND_VALUE;
  const isNewModel = modelId === NEW_MODEL_VALUE;

  function handleBrandChange(value: string) {
    setBrandId(value);
    setModelId("");
    setNewModelName("");
    if (value !== NEW_BRAND_VALUE) setNewBrandName("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!branchId) return setError("Please select a branch.");
    if (!isNewBrand && !brandId) return setError("Please select a brand.");
    if (isNewBrand && !newBrandName.trim()) return setError("Please enter the new brand name.");
    if (!isNewBrand && !isNewModel && !modelId) return setError("Please select a model.");
    if ((isNewBrand || isNewModel) && !newModelName.trim()) return setError("Please enter the new model name.");
    if (!categoryId || !seats || !transmission || !fuelType || !pricePerDay) return setError("Please fill in all required fields.");
    if (images.length === 0) return setError("Please upload at least one photo.");

    startTransition(async () => {
      const result = await createCar({
        branchId,
        brandId: isNewBrand ? undefined : brandId,
        newBrandName: isNewBrand ? newBrandName : undefined,
        modelId: isNewBrand || isNewModel ? undefined : modelId,
        newModelName: isNewBrand || isNewModel ? newModelName : undefined,
        categoryId, seats: Number(seats), transmission, fuelType, pricePerDay,
        depositPercentage: depositPercentage || undefined, images,
      });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Branch</label>
        <select value={branchId} onChange={(e) => setBranchId(e.target.value)} required className={`${inputClass} bg-white`}>
          {branches.length === 0 && <option value="">No branches yet — create one first</option>}
          {branches.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.city})</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Brand</label>
          <select value={brandId} onChange={(e) => handleBrandChange(e.target.value)} required className={`${inputClass} bg-white`}>
            <option value="">Select brand</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            <option value={NEW_BRAND_VALUE}>+ Add new brand</option>
          </select>
          {isNewBrand && (
            <input placeholder="New brand name" value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} className={`${inputClass} mt-2`} />
          )}
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Model</label>
          <select
            value={modelId} onChange={(e) => setModelId(e.target.value)} disabled={!brandId || isNewBrand} required={!isNewBrand}
            className={`${inputClass} bg-white disabled:bg-gray-50 disabled:text-gray-400`}
          >
            <option value="">{isNewBrand ? "Enter new model below" : "Select model"}</option>
            {selectedBrand?.models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            {!isNewBrand && brandId && <option value={NEW_MODEL_VALUE}>+ Add new model</option>}
          </select>
          {(isNewBrand || isNewModel) && (
            <input placeholder="New model name" value={newModelName} onChange={(e) => setNewModelName(e.target.value)} className={`${inputClass} mt-2`} />
          )}
        </div>
      </div>

      <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className={`${inputClass} bg-white`}>
        <option value="">Select category</option>
        {categories.map((c) => <option key={c.id} value={c.id} className="capitalize">{c.name}</option>)}
      </select>

      <div className="grid grid-cols-2 gap-3">
        <input type="number" placeholder="Seats" value={seats} onChange={(e) => setSeats(e.target.value)} required className={inputClass} />
        <select value={transmission} onChange={(e) => setTransmission(e.target.value)} required className={`${inputClass} bg-white`}>
          <option value="">Transmission</option>
          <option value="automatic">Automatic</option>
          <option value="manual">Manual</option>
        </select>
      </div>

      <select value={fuelType} onChange={(e) => setFuelType(e.target.value)} required className={`${inputClass} bg-white`}>
        <option value="">Fuel type</option>
        <option value="petrol">Petrol</option>
        <option value="diesel">Diesel</option>
        <option value="hybrid">Hybrid</option>
        <option value="electric">Electric</option>
      </select>

      <div className="grid grid-cols-2 gap-3">
        <input type="number" placeholder="Price per day" value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} required className={inputClass} />
        <input type="number" placeholder="Deposit % (default 20)" value={depositPercentage} onChange={(e) => setDepositPercentage(e.target.value)} className={inputClass} />
      </div>

      <PhotoUploader photos={images} onChange={setImages} label="Car photos (at least 1 required)" purpose="car-image" />

      {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <button disabled={isPending || branches.length === 0} className="w-full bg-brand hover:bg-brand-dark text-white font-semibold text-sm py-3.5 rounded-full transition-colors disabled:opacity-50">
        {isPending ? "Saving..." : "Add car"}
      </button>
    </form>
  );
}
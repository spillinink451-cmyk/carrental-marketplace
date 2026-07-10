"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { LoadScript } from "@react-google-maps/api";

import { createBranch } from "@/app/actions/branches";
import type { LocationResult } from "./LocationPicker";

const AddressSearch = dynamic(() => import("./AddressSearch"), {
  ssr: false,
});

const LocationPicker = dynamic(() => import("./LocationPicker"), {
  ssr: false,
});

const inputClass =
  "border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full";

const DEFAULT_CENTER = {
  lat: 33.6844,
  lng: 73.0479,
};

const libraries: ("places")[] = ["places"];

type Country = {
  code: string;
  name: string;
};

export default function CreateBranchForm({
  countries,
}: {
  countries: Country[];
}) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState(
    countries[0]?.code ?? "PK"
  );
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");

  const [coords, setCoords] = useState(DEFAULT_CENTER);

  const [error, setError] = useState("");

  const [isPending, startTransition] =
    useTransition();

  function handleLocationChange(
    result: LocationResult
  ) {
    setCoords({
      lat: result.lat,
      lng: result.lng,
    });

    if (result.address) {
      setAddress(result.address);
    }

    if (result.city) {
      setCity(result.city);
    }

    if (result.countryCode) {
      setCountry(result.countryCode);
    }
  }

  function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");

    startTransition(async () => {
      const result = await createBranch({
        name,
        city,
        country,
        area,
        address,
        lat: coords.lat,
        lng: coords.lng,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      setName("");
      setCity("");
      setArea("");
      setAddress("");
      setCoords(DEFAULT_CENTER);
    });
  }

  return (
    <LoadScript
      googleMapsApiKey={
        process.env
          .NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!
      }
      libraries={libraries}
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-3"
      >
        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="Branch name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            required
            className={inputClass}
          />

          <select
            value={country}
            onChange={(e) =>
              setCountry(e.target.value)
            }
            required
            className={`${inputClass} bg-white`}
          >
            {countries.map((c) => (
              <option
                key={c.code}
                value={c.code}
              >
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="City"
            value={city}
            onChange={(e) =>
              setCity(e.target.value)
            }
            required
            className={inputClass}
          />

          <input
            placeholder="Area (optional)"
            value={area}
            onChange={(e) =>
              setArea(e.target.value)
            }
            className={inputClass}
          />
        </div>

        <input
          placeholder="Address"
          value={address}
          onChange={(e) =>
            setAddress(e.target.value)
          }
          className={inputClass}
        />

        <AddressSearch
          onSelect={handleLocationChange}
        />

        <LocationPicker
          position={coords}
          onLocationChange={
            handleLocationChange
          }
        />

        {error && (
          <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          disabled={isPending}
          className="bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors disabled:opacity-50"
        >
          {isPending
            ? "Adding..."
            : "Add branch"}
        </button>
      </form>
    </LoadScript>
  );
}
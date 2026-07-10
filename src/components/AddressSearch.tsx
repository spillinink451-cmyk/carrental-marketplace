"use client";

import { useEffect, useRef, useState } from "react";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import type { LocationResult } from "./LocationPicker";

const libraries: ("places")[] = ["places"];

export default function AddressSearch({
  onSelect,
}: {
  onSelect: (result: LocationResult) => void;
}) {
  const { isLoaded } = useJsApiLoader({
    id: "google",
    googleMapsApiKey:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  const autocompleteRef =
    useRef<google.maps.places.Autocomplete | null>(null);

  const [value, setValue] = useState("");

  const handlePlaceChanged = () => {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();

    if (!place.geometry?.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    let city = "";
    let countryCode = "";

    place.address_components?.forEach((component) => {
      if (component.types.includes("locality")) {
        city = component.long_name;
      }

      if (
        component.types.includes("administrative_area_level_2") &&
        !city
      ) {
        city = component.long_name;
      }

      if (component.types.includes("country")) {
        countryCode = component.short_name;
      }
    });

    const address = place.formatted_address ?? "";

    setValue(address);

    onSelect({
      lat,
      lng,
      address,
      city,
      countryCode,
    });
  };

  useEffect(() => {
    if (!isLoaded) return;
  }, [isLoaded]);

  if (!isLoaded) {
    return (
      <div className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-400">
        Loading search...
      </div>
    );
  }

  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
        Search location
      </label>

      <Autocomplete
        onLoad={(autocomplete) => {
          autocompleteRef.current = autocomplete;
        }}
        onPlaceChanged={handlePlaceChanged}
        options={{
          fields: [
            "formatted_address",
            "geometry",
            "address_components",
          ],
        }}
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search for a location..."
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </Autocomplete>
    </div>
  );
}
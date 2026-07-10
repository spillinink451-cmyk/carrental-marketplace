"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  GoogleMap,
  MarkerF,
  useJsApiLoader,
} from "@react-google-maps/api";

export interface LocationResult {
  lat: number;
  lng: number;
  address?: string;
  city?: string;
  countryCode?: string;
}

const containerStyle = {
  width: "100%",
  height: "280px",
};

const libraries: ("places")[] = ["places"];

export default function LocationPicker({
  position,
  onLocationChange,
}: {
  position: { lat: number; lng: number };
  onLocationChange: (result: LocationResult) => void;
}) {
  const [markerPosition, setMarkerPosition] = useState(position);

  const { isLoaded } = useJsApiLoader({
    id: "google",
    googleMapsApiKey:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  useEffect(() => {
    setMarkerPosition(position);
  }, [position]);

  const center = useMemo(() => markerPosition, [markerPosition]);

  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      const geocoder = new google.maps.Geocoder();

      geocoder.geocode(
        {
          location: { lat, lng },
        },
        (results, status) => {
          if (
            status !== "OK" ||
            !results ||
            results.length === 0
          ) {
            onLocationChange({
              lat,
              lng,
            });

            return;
          }

          const address = results[0].formatted_address;

          let city = "";
          let countryCode = "";

          results[0].address_components.forEach((component) => {
            if (
              component.types.includes("locality")
            ) {
              city = component.long_name;
            }

            if (
              component.types.includes("administrative_area_level_2") &&
              !city
            ) {
              city = component.long_name;
            }

            if (
              component.types.includes("country")
            ) {
              countryCode = component.short_name;
            }
          });

          onLocationChange({
            lat,
            lng,
            address,
            city,
            countryCode,
          });
        }
      );
    },
    [onLocationChange]
  );

  const moveMarker = useCallback(
    async (lat: number, lng: number) => {
      setMarkerPosition({
        lat,
        lng,
      });

      await reverseGeocode(lat, lng);
    },
    [reverseGeocode]
  );

  if (!isLoaded) {
    return (
      <div className="border border-gray-200 rounded-xl h-[280px] flex items-center justify-center text-sm text-gray-500">
        Loading Google Maps...
      </div>
    );
  }

  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
        Pin the exact location
      </label>

      <div className="rounded-xl overflow-hidden border border-gray-200">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={14}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
          onClick={(e) => {
            if (!e.latLng) return;

            moveMarker(
              e.latLng.lat(),
              e.latLng.lng()
            );
          }}
        >
          <MarkerF
            position={markerPosition}
            draggable
            onDragEnd={(e) => {
              if (!e.latLng) return;

              moveMarker(
                e.latLng.lat(),
                e.latLng.lng()
              );
            }}
          />
        </GoogleMap>
      </div>

      <p className="text-xs text-slate-400 mt-1.5">
        Search an address above, click the map, or drag the
        pin to set the exact spot.
      </p>
    </div>
  );
}
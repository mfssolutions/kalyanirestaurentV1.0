import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, Loader2, MapPin, Navigation, Search } from "lucide-react";
import { CheckoutConfig, DeliveryAddress } from "../types";
import { fetchCheckoutConfig } from "../lib/checkout";
import {
  buildStaticMapUrl,
  getRoadDistanceKm,
  parseMapboxFeature,
  reverseGeocode,
  searchAddresses,
} from "../lib/mapbox";

interface AddressPageProps {
  onBack: () => void;
  onContinue: (address: DeliveryAddress, distanceKm: number) => void;
  defaultReceiverName?: string;
  defaultContactNumber?: string;
}

export function AddressPage({
  onBack,
  onContinue,
  defaultReceiverName = "",
  defaultContactNumber = "",
}: AddressPageProps) {
  const [config, setConfig] = useState<CheckoutConfig | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{ id: string; place_name: string; center: [number, number] }>>([]);
  const [placeName, setPlaceName] = useState("");
  const [roadName, setRoadName] = useState("");
  const [pincode, setPincode] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [houseFloor, setHouseFloor] = useState("");
  const [receiverName, setReceiverName] = useState(defaultReceiverName);
  const [contactNumber, setContactNumber] = useState(defaultContactNumber);
  const [landmark, setLandmark] = useState("");
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchCheckoutConfig().then(setConfig);
  }, []);

  const applyParsedLocation = (parsed: {
    placeName: string;
    roadName: string;
    pincode: string;
    latitude: number;
    longitude: number;
  }) => {
    setPlaceName(parsed.placeName);
    setRoadName(parsed.roadName);
    setPincode(parsed.pincode);
    setLatitude(parsed.latitude);
    setLongitude(parsed.longitude);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported in this browser.");
      return;
    }

    setLocating(true);
    setErrorMsg("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const parsed = await reverseGeocode(position.coords.latitude, position.coords.longitude);
          if (parsed) {
            applyParsedLocation(parsed);
            setSearchQuery(parsed.placeName);
          } else {
            setErrorMsg("Could not resolve your location. Please search manually.");
          }
        } catch {
          setErrorMsg("Location lookup failed. Please search manually.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setErrorMsg("Unable to access your location. Please search manually.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSearch = async (value: string) => {
    setSearchQuery(value);
    setErrorMsg("");
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }
    const results = await searchAddresses(value);
    setSuggestions(results);
  };

  const handleSelectSuggestion = (feature: {
    id: string;
    place_name: string;
    center: [number, number];
    context?: Array<{ id: string; text: string }>;
    text?: string;
  }) => {
    applyParsedLocation(parseMapboxFeature(feature));
    setSearchQuery(feature.place_name);
    setSuggestions([]);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMsg("");

    if (latitude === null || longitude === null || !placeName) {
      setErrorMsg("Please detect or search your delivery location on the map.");
      return;
    }
    if (!houseFloor.trim()) {
      setErrorMsg("House / Floor Number is required.");
      return;
    }
    if (!receiverName.trim()) {
      setErrorMsg("Receiving person name is required.");
      return;
    }
    if (!/^\d{10}$/.test(contactNumber.trim())) {
      setErrorMsg("Enter a valid 10-digit contact number.");
      return;
    }
    if (!config?.hotel_latitude || !config?.hotel_longitude) {
      setErrorMsg("Delivery configuration is unavailable. Please try again later.");
      return;
    }

    setSubmitting(true);

    const distanceKm = await getRoadDistanceKm(
      config.hotel_longitude,
      config.hotel_latitude,
      longitude,
      latitude
    );

    setSubmitting(false);

    if (distanceKm === null) {
      setErrorMsg("Unable to calculate delivery distance. Please try again.");
      return;
    }

    if (distanceKm > config.max_delivery_km) {
      setErrorMsg(`Sorry, We serve only within ${config.max_delivery_km}km. Your location is ${distanceKm.toFixed(1)}km away.`);
      return;
    }

    onContinue(
      {
        placeName,
        roadName,
        pincode,
        latitude,
        longitude,
        houseFloor: houseFloor.trim(),
        receiverName: receiverName.trim(),
        contactNumber: contactNumber.trim(),
        landmark: landmark.trim() || undefined,
      },
      distanceKm
    );
  };

  const mapUrl =
    latitude !== null && longitude !== null ? buildStaticMapUrl(latitude, longitude) : "";

  return (
    <div className="min-h-screen bg-neutral-100 pb-32 lg:pb-10">
      <div className="bg-white border-b border-neutral-200 sticky top-20 z-30">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </button>
          <h1 className="text-xl font-black text-neutral-900 font-display">Delivery Address</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {errorMsg && (
          <div className="bg-red-50 text-red-800 text-sm p-3 rounded-xl border border-red-200 font-semibold">
            {errorMsg}
          </div>
        )}

        <div className="bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-sm">
          <div className="relative h-52 bg-neutral-200">
            {mapUrl ? (
              <img src={mapUrl} alt="Delivery location map" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-500 text-sm">
                Map preview will appear after location selection
              </div>
            )}
            {latitude !== null && longitude !== null && (
              <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur rounded-xl p-3 text-xs shadow-lg border border-neutral-200">
                <p className="font-black text-brand-green flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Selected Location
                </p>
                <p className="font-bold text-neutral-800 mt-1">{placeName}</p>
                {roadName && <p className="text-neutral-600">Road: {roadName}</p>}
                {pincode && <p className="text-neutral-600">Pincode: {pincode}</p>}
                <p className="text-neutral-500 mt-1 font-mono text-[10px]">
                  Lat: {latitude.toFixed(6)}, Lng: {longitude.toFixed(6)}
                </p>
              </div>
            )}
          </div>

          <div className="p-4 space-y-3">
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={locating}
              className="w-full bg-brand-green text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
              {locating ? "Fetching current location..." : "Use Current Location"}
            </button>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => handleSearch(event.target.value)}
                placeholder="Search area, street, landmark..."
                className="w-full pl-10 pr-3 py-3 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
              {suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto divide-y">
                  {suggestions.map((feature) => (
                    <button
                      key={feature.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(feature)}
                      className="w-full text-left p-3 text-xs hover:bg-neutral-50 cursor-pointer"
                    >
                      {feature.place_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-sm space-y-3">
          <div>
            <label className="text-xs font-bold text-neutral-600 uppercase">House / Floor Number *</label>
            <input
              required
              value={houseFloor}
              onChange={(event) => setHouseFloor(event.target.value)}
              className="w-full mt-1 px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              placeholder="Flat 201, Block B"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-neutral-600 uppercase">Receiving Person Name *</label>
            <input
              required
              value={receiverName}
              onChange={(event) => setReceiverName(event.target.value)}
              className="w-full mt-1 px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-neutral-600 uppercase">Contact Number *</label>
            <input
              required
              inputMode="numeric"
              maxLength={10}
              value={contactNumber}
              onChange={(event) => setContactNumber(event.target.value.replace(/\D/g, "").slice(0, 10))}
              className="w-full mt-1 px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              placeholder="10-digit mobile number"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-neutral-600 uppercase">Landmark (Optional)</label>
            <input
              value={landmark}
              onChange={(event) => setLandmark(event.target.value)}
              className="w-full mt-1 px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              placeholder="Near temple, park, etc."
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-green hover:bg-brand-green/90 text-white font-black py-4 rounded-2xl uppercase tracking-wide cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Next
          </button>
        </form>
      </div>
    </div>
  );
}

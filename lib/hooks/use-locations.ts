import { useAuthStore } from "@/lib/stores/auth.store";
import axios from "axios";
import { useState, useCallback } from "react";

export interface LocationAddress {
  location_address_latitude: string;
  location_address_longitude: string;
  location_address_country: string;
  location_address_adm_division: string;
  location_address_city: string;
  location_address_street: string;
}

export interface Location {
  location_id: string;
  location_name: string;
  location_alias: string;
  location_address: LocationAddress;
  location_company: string;
  location_timezone: string;
  location_accessibility: string;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "https://emobility-bff.dev.dhemax.link/bff";

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const fetchLocations = useCallback(async () => {
    if (!user?.userId || !user?.companyId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/users/${user.userId}/locations?companyId=${user.companyId}&enabled=true`
      );
      setLocations(response.data.payload || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error fetching locations";
      setError(message);
      console.error("Fetch locations error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  return { locations, loading, error, fetchLocations };
}

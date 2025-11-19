import { useEffect, useState } from "react";
import api from "../utils/api";
import * as SecureStore from "expo-secure-store";

export type Service = {
  id: number;
  name: string;
  description?: string;
  image?: string;
  price: number;
  duration?: string;
  categoryId: number;
  rating?: number;
  reviewCount?: number;
};

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);

        const session = await SecureStore.getItemAsync("my-user-session");
        const token = session ? JSON.parse(session).token : null;

        console.log(">>> TOKEN USER:", token);   // THÊM DÒNG NÀY

        if (!token) throw new Error("Missing access token");

        const res = await api.get("/api/v1/service/get-all", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.err !== 0) {
          setError(res.data.mes || "Không thể tải dịch vụ");
          return;
        }

        // ⚡ FIX QUAN TRỌNG NHẤT
        setServices(res.data.data || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  return { services, isLoading, error };
}

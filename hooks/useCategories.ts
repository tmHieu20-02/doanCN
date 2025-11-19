import { useEffect, useState } from "react";
import api from "../utils/api";
import * as SecureStore from "expo-secure-store";

export type Category = {
  id: number;
  name: string;
  description?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;

  filterKey: string;
  color: string;
  icon: string;
};

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);

        const session = await SecureStore.getItemAsync("my-user-session");
        const token = session ? JSON.parse(session).token : null;

        if (!token) {
          setError("Missing access token");
          setIsLoading(false);
          return;
        }

        const res = await api.get("/api/v1/category/get-all", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.err !== 0) {
          setError(res.data.mes || "Không thể tải danh mục");
          return;
        }

        // ⭐ MAP DỮ LIỆU ĐỂ UI KHÔNG BỊ LỖI
        setCategories(
          (res.data.categories || []).map((c: any) => ({
            ...c,
            filterKey: c.name?.toLowerCase() ?? "",
            color: "#F59E0B",
            icon: "⭐",
          }))
        );
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, isLoading, error };
}

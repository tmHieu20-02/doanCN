import { useEffect, useState } from "react";

export type Category = {
  id: number;
  name: string;
  description?: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;

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

        // ❗ API category không cần token
        const res = await fetch("https://phatdat.store/api/v1/category/get-all");

        const json = await res.json();

        if (json.err !== 0 || !json.data) {
          setError(json.mes || "Không thể tải danh mục");
          return;
        }

        // ⭐ MAP DỮ LIỆU CHO UI
        const mapped = json.data.map((c: any) => ({
          id: c.id,
          name: c.name,
          description: c.description || "",
          image: c.image || "",
          createdAt: c.createdAt || "",
          updatedAt: c.updatedAt || "",

          filterKey: c.name?.toLowerCase() ?? "",
          color: "#F59E0B",
          icon: "⭐",
        }));

        setCategories(mapped);
      } catch (e: any) {
        setError(e.message || "Lỗi kết nối server");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, isLoading, error };
}

import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function BookingIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace({
      pathname: "/staff/(tabs)/bookings",
    } as any);
  }, []);

  return null;
}

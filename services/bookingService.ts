import axios from "axios";
import * as SecureStore from "expo-secure-store";

const BASE_URL = "https://phatdat.store/api/v1/booking";

// ===== Lấy token =====
const getToken = async () => {
  const stored = await SecureStore.getItemAsync("my-user-session");
  return JSON.parse(stored!).token;
};

// ==========================
// GET ALL BOOKINGS
// ==========================
export const getAllBookings = async () => {
  const token = await getToken();
  return axios.get(`${BASE_URL}/get-all`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ==========================
// UPDATE BOOKING
// ==========================
export const updateBookingById = async (id: string, body: any) => {
  const token = await getToken();
  return axios.put(`${BASE_URL}/update/${id}`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ==========================
// CANCEL 1 BOOKING
// ==========================
export const cancelBookingById = async (id: string, body: any) => {
  const token = await getToken();
  return axios.post(`${BASE_URL}/cancel/${id}`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ==========================
// CANCEL ALL BOOKINGS (FINAL)
// ==========================
export const cancelAllBookings = async (body: any) => {
  const token = await getToken();
  return axios.post(`${BASE_URL}/cancel-all`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

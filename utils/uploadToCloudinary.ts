import axios from "axios";
import * as FileSystem from "expo-file-system";

export async function uploadToCloudinary(localUri: string) {
  const CLOUD_NAME = "your_cloud_name";   // ví dụ: "dx3uyf8sz"
  const UPLOAD_PRESET = "your_preset";    // ví dụ: "mobile_unsigned"

  const base64Data = await FileSystem.readAsStringAsync(localUri, {
    encoding: "base64",
  });

  const formData = new FormData();

  formData.append("file", `data:image/jpeg;base64,${base64Data}`);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await axios.post(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data.secure_url; // URL ảnh Cloudinary
}

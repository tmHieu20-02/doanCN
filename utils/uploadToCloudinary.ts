import axios from "axios";

export async function uploadToCloudinary(localUri: string) {
  // THAY ĐỔI THÔNG TIN CỦA BẠN TẠI ĐÂY
  const CLOUD_NAME = "dx3uyf8sz"; 
  const UPLOAD_PRESET = "mobile_unsigned"; 

  const formData = new FormData();

  // Lấy tên file và định dạng từ URI
  const filename = localUri.split("/").pop();
  const match = /\.(\w+)$/.exec(filename || "");
  const type = match ? `image/${match[1]}` : `image`;

  // @ts-ignore - FormData trong React Native chấp nhận object này
  formData.append("file", {
    uri: localUri,
    name: filename || "upload.jpg",
    type: type,
  });

  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data.secure_url; // Trả về URL ảnh sau khi upload thành công
  } catch (error: any) {
    console.error("Cloudinary Upload Error:", error?.response?.data || error.message);
    throw new Error("Không thể upload ảnh lên Cloudinary");
  }
}
import axios from "axios";
import FormData from "form-data";
import crypto from "crypto";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    const formData = new FormData();

    formData.append("file", buffer, {
      filename: "upload",
    });

    // ✅ STEP 1: DEFINE timestamp FIRST
    const timestamp = Math.floor(Date.now() / 1000);

    // ✅ STEP 2: append it
    formData.append("api_key", process.env.CLOUD_API_KEY);
    formData.append("timestamp", timestamp);

    // ✅ STEP 3: THEN use it
    const signature = crypto
      .createHash("sha1")
      .update(`timestamp=${timestamp}${process.env.CLOUD_API_SECRET}`)
      .digest("hex");

    formData.append("signature", signature);

    // ✅ STEP 4: upload
    const uploadRes = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUD_NAME}/auto/upload`,
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    res.json(uploadRes.data);

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Upload failed" });
  }
}
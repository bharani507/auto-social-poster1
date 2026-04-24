import Busboy from "busboy";
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
    const busboy = Busboy({ headers: req.headers });

    let fileBuffer = null;

    await new Promise((resolve, reject) => {
      busboy.on("file", (fieldname, file) => {
        const chunks = [];

        file.on("data", (data) => chunks.push(data));
        file.on("end", () => {
          fileBuffer = Buffer.concat(chunks);
        });
      });

      busboy.on("finish", resolve);
      busboy.on("error", reject);

      req.pipe(busboy);
    });

    if (!fileBuffer) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const formData = new FormData();

    formData.append("file", fileBuffer, {
      filename: "upload.jpg",
    });

    const timestamp = Math.floor(Date.now() / 1000);

    formData.append("api_key", process.env.CLOUD_API_KEY);
    formData.append("timestamp", timestamp);

    const signature = crypto
      .createHash("sha1")
      .update(`timestamp=${timestamp}${process.env.CLOUD_API_SECRET}`)
      .digest("hex");

    formData.append("signature", signature);

    const uploadRes = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUD_NAME}/image/upload`,
      formData,
      { headers: formData.getHeaders() }
    );

    res.json(uploadRes.data);

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Upload failed" });
  }
}
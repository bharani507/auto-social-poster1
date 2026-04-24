import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import { getPageId, getPageToken } from "./authController.js";
import path from "path";

// ---------------- FACEBOOK ----------------

export const fbText = async (req, res) => {
  const { message } = req.body;
  const PAGE_ID = getPageId();
  const token = getPageToken();

  const response = await axios.post(
    `https://graph.facebook.com/v19.0/${PAGE_ID}/feed`,
    { message, access_token: token }
  );

  res.json(response.data);
};



export const fbImage = async (req, res) => {
  console.log("REQ.FILE:", req.file);

  if (!req.file) {
    return res.status(400).send("❌ No file uploaded");
  }

  const PAGE_ID = getPageId();
  const token = getPageToken();

  const form = new FormData();
  form.append("caption", req.body.caption);
  form.append("access_token", token);
  form.append("source", req.file.buffer, {
    filename: req.file.originalname,
  });

  const response = await axios.post(
    `https://graph.facebook.com/v19.0/${PAGE_ID}/photos`,
    form,
    { headers: form.getHeaders() }
  );

  res.json(response.data);
};

export const fbVideo = async (req, res) => {
  console.log("REQ.FILE:", req.file);

  if (!req.file) {
    return res.status(400).send("❌ No file uploaded");
  }

  const PAGE_ID = getPageId();
  const token = getPageToken();

  const form = new FormData();
  form.append("description", req.body.caption);
  form.append("access_token", token);
  form.append("source", req.file.buffer, {
    filename: req.file.originalname,
  });

  const response = await axios.post(
    `https://graph.facebook.com/v19.0/${PAGE_ID}/videos`,
    form,
    { headers: form.getHeaders() }
  );

  res.json(response.data);
};



// ---------------- INSTAGRAM ----------------

const getIG = async (token, PAGE_ID) => {
  const res = await axios.get(
    `https://graph.facebook.com/v19.0/${PAGE_ID}`,
    {
      params: {
        fields: "instagram_business_account",
        access_token: token,
      },
    }
  );
  return res.data.instagram_business_account.id;
};

import cloudinary from "../config/cloudinary.js";

export const igImage = async (req, res) => {
  try {
    const token = getPageToken();
    const PAGE_ID = getPageId();

    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    // 🔥 Upload to Cloudinary
    const uploadRes = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "auto-poster" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    const imageUrl = uploadRes.secure_url;
    console.log("Cloudinary URL:", imageUrl);

    // 🔥 Get IG ID
    const IG_ID = await getIG(token, PAGE_ID);

    // 🔥 Create media
    const media = await axios.post(
      `https://graph.facebook.com/v19.0/${IG_ID}/media`,
      {
        image_url: imageUrl,
        caption: req.body.caption,
        access_token: token,
      }
    );

    // 🔥 Publish
    const publish = await axios.post(
      `https://graph.facebook.com/v19.0/${IG_ID}/media_publish`,
      {
        creation_id: media.data.id,
        access_token: token,
      }
    );

    res.json(publish.data);

  } catch (err) {
    console.error("IG ERROR:", err.response?.data || err.message);
    res.status(500).json(err.response?.data || err.message);
  }
};

const waitForProcessing = async (creationId, token) => {
  let status = "IN_PROGRESS";

  while (status === "IN_PROGRESS") {
    await new Promise((resolve) => setTimeout(resolve, 5000)); // wait 5 sec

    const res = await axios.get(
      `https://graph.facebook.com/v19.0/${creationId}`,
      {
        params: {
          fields: "status_code",
          access_token: token,
        },
      }
    );

    status = res.data.status_code;
    console.log("IG STATUS:", status);
  }

  if (status !== "FINISHED") {
    throw new Error("Video processing failed");
  }
};

export const igVideo = async (req, res) => {
  try {
    const token = getPageToken();
    const PAGE_ID = getPageId();

    if (!req.file) {
      return res.status(400).send("❌ No file uploaded");
    }

    // 🔥 Upload video to Cloudinary
    const uploadRes = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: "video", folder: "auto-poster" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    const videoUrl = uploadRes.secure_url;
    console.log("Video URL:", videoUrl);

    const IG_ID = await getIG(token, PAGE_ID);

    // 🔥 STEP 1 — create media
    const media = await axios.post(
      `https://graph.facebook.com/v19.0/${IG_ID}/media`,
      {
        media_type: "REELS",
        video_url: videoUrl,
        caption: req.body.caption,
        access_token: token,
      }
    );

    const creationId = media.data.id;

    // 🔥 STEP 2 — WAIT until ready
    await waitForProcessing(creationId, token);

    // 🔥 STEP 3 — publish
    const publish = await axios.post(
      `https://graph.facebook.com/v19.0/${IG_ID}/media_publish`,
      {
        creation_id: creationId,
        access_token: token,
      }
    );

    res.json(publish.data);

  } catch (err) {
    console.error("IG VIDEO ERROR:", err.response?.data || err.message);
    res.status(500).json(err.response?.data || err.message);
  }
};
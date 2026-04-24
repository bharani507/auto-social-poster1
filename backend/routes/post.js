import express from "express";
import multer from "multer";

import path from "path";

import {
  fbText,
  fbImage,
  fbVideo,
  igImage,
  igVideo,
} from "../controllers/postController.js";

const router = express.Router();






const upload = multer();

// FACEBOOK
router.post("/facebook/text", fbText);
router.post("/facebook/image", upload.single("image"), fbImage);
router.post("/facebook/video", upload.single("video"), fbVideo);

// INSTAGRAM
router.post("/instagram/image", upload.single("image"), igImage);
router.post("/instagram/video", upload.single("video"), igVideo);



export default router;
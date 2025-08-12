import express from "express";
import multer from "multer";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Store uploaded image URLs in memory
let uploadedImages = [];

// Multer setup (store files in memory before uploading to Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload route
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload_stream(
      { folder: "sample_uploads" },
      (error, result) => {
        if (error) return res.status(500).json({ error });

        uploadedImages.push(result.secure_url); // store URL
        res.json({ url: result.secure_url });
      }
    );

    // Pipe file buffer to Cloudinary
    result.end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all uploaded image links
app.get("/images", (req, res) => {
  res.json(uploadedImages);
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));

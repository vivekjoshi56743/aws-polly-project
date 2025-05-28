import React, { useState } from "react";
import "./ImageUpload.css";
/**
 * Image‑to‑audio workflow
 * 1. POST /upload  – stores the image (base64) and triggers the backend pipeline.
 * 2. GET  /audio   – returns a JSON payload { url } with a pre‑signed S3 link to the audio once ready.
 *
 * 🔄  Replace `API_BASE` with the stage URL of your API Gateway.
 */

const API_BASE = "https://5xjamreg36.execute-api.ap-south-1.amazonaws.com/dev";
const API_UPLOAD = API_BASE; // POST – uploads image
const API_GET_AUDIO_URL = API_BASE; // GET  – returns { url }

export default function ImageUpload() {
  const [image, setImage] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [status, setStatus] = useState("idle");

  /* Handle file selection */
  const handleFileChange = (e) => {
    setImage(e.target.files[0] ?? null);
    setAudioUrl(null);
    setStatus("idle");
  };

  /* Convert file → base64 (strip data prefix) */
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
    });

  /* Upload & poll */
  const handleUpload = async () => {
    if (!image) return;

    try {
      setStatus("Uploading image…");

      /* 1️⃣  POST /upload */
      const base64 = await fileToBase64(image);
      const uploadRes = await fetch(API_UPLOAD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: image.name, file: base64 }),
      });

      if (!uploadRes.ok) throw new Error("Image upload failed");
     
      const imageKey = image.name;

      /* 2️⃣  Poll /audio?image_key=… until we get the URL */
      setStatus("Waiting for audio generation…");

      
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Make the GET request
      const response = await fetch(`${API_GET_AUDIO_URL}?image_key=${encodeURIComponent(imageKey)}`);
      const data = await response.json();
      const url = data.url;

      /* eslint-enable no-await-in-loop */

      if (!url) throw new Error("Timed out waiting for audio");

      setAudioUrl(url);
      setStatus("Audio ready!");
    } catch (err) {
      console.error(err);
      setStatus(err.message || "Unexpected error");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold">Upload Image</h2>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-lg file:bg-blue-600 file:text-white hover:file:bg-blue-700"
      />

      <button
        onClick={handleUpload}
        disabled={!image || status.startsWith("Uploading")}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 disabled:bg-gray-400"
      >
        {status.startsWith("Uploading") ? "Uploading…" : "Upload"}
      </button>

      {status !== "idle" && <p className="text-sm text-gray-700">{status}</p>}

      {audioUrl && (
        <audio controls src={audioUrl} className="w-full mt-4 rounded-lg shadow" />
      )}
    </div>
  );
}

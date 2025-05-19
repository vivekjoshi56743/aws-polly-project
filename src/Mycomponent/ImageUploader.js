import React, { useState } from 'react';

const ImageUpload = () => {
  const [image, setImage] = useState(null);

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!image) return;

    // Convert image to base64
    const base64 = await convertToBase64(image);

    const payload = {
      filename: image.name,
      file: base64,
    };

    // Send POST request with base64 image data
    const response = await fetch('https://5xjamreg36.execute-api.ap-south-1.amazonaws.com/dev', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log(result); // Handle the response
  };

  // Convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]); // Get base64 without 'data:image/jpeg;base64,' prefix
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div>
      <h2>Upload Image</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default ImageUpload;
// This component allows users to upload an image file, converts it to base64, and sends it to a specified API endpoint.
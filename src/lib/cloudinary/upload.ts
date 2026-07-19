/**
 * Utility for uploading files to Cloudinary directly from the browser (unsigned).
 */
export async function uploadToCloudinary(file: File, resourceType: 'image' | 'video' | 'raw' | 'auto' = 'image'): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset || uploadPreset === 'your_upload_preset_here') {
    throw new Error("Cloudinary configuration is missing. Harap masukkan nama Upload Preset di file .env.local");
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to upload file to Cloudinary');
    }

    const data = await response.json();
    // Return the secure HTTPS URL provided by Cloudinary
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
}

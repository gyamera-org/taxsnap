/**
 * Common image upload utilities for processing and uploading images
 * Used by avatar, progress photos, and other image upload features
 */

import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '@/lib/supabase/client';

export interface ImageUploadOptions {
  /** Maximum width/height for resizing. Default: 800 */
  maxSize?: number;
  /** Compression quality (0-1). Default: 0.7 */
  quality?: number;
  /** Output format. Default: JPEG */
  format?: ImageManipulator.SaveFormat;
  /** Whether to force square aspect ratio. Default: true for backwards compatibility */
  forceSquare?: boolean;
}

export interface ProcessedImage {
  /** Binary data ready for upload */
  bytes: Uint8Array;
  /** Generated filename */
  fileName: string;
  /** MIME type for the file */
  contentType: string;
}

/**
 * Process and convert an image URI to binary data for upload
 * Uses FileSystem and ImageManipulator for reliable mobile compatibility
 */
export const processImageForUpload = async (
  imageUri: string,
  options: ImageUploadOptions = {}
): Promise<ProcessedImage> => {
  const {
    maxSize = 800,
    quality = 0.7,
    format = ImageManipulator.SaveFormat.JPEG,
    forceSquare = true,
  } = options;

  try {
    // Determine resize strategy based on forceSquare setting
    let resizeAction: ImageManipulator.Action[];
    
    if (forceSquare) {
      // Force square: set both width and height to maxSize
      resizeAction = [{ resize: { width: maxSize, height: maxSize } }];
    } else {
      // Preserve aspect ratio: set max width or height
      resizeAction = [{ resize: { width: maxSize } }];
    }

    // Resize and compress image
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      resizeAction,
      {
        compress: quality,
        format,
      }
    );

    // Read the processed image file as base64
    const base64 = await FileSystem.readAsStringAsync(manipulatedImage.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    if (!base64) throw new Error('Failed to convert image to base64');

    // Convert base64 to binary for upload
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Generate filename and content type based on format
    const extension = format === ImageManipulator.SaveFormat.PNG ? 'png' : 'jpg';
    const fileName = `${Date.now()}.${extension}`;
    const contentType = format === ImageManipulator.SaveFormat.PNG ? 'image/png' : 'image/jpeg';

    return { bytes, fileName, contentType };
  } catch (error) {
    console.error('Error processing image for upload:', error);
    throw new Error('Failed to process image');
  }
};

/**
 * Upload processed image to Supabase Storage bucket
 */
export const uploadImageToStorage = async (
  bucketName: string,
  filePath: string,
  processedImage: ProcessedImage,
  options: { upsert?: boolean } = {}
) => {
  const { upsert = false } = options;

  try {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, processedImage.bytes, {
        contentType: processedImage.contentType,
        upsert,
      });

    if (uploadError) {
      console.error(`Storage upload error to ${bucketName}:`, uploadError);
      throw uploadError;
    }

    return uploadData;
  } catch (error) {
    console.error(`Failed to upload to ${bucketName}:`, error);
    throw error;
  }
};

/**
 * Get public URL for uploaded image
 */
export const getPublicUrl = (bucketName: string, filePath: string): string => {
  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return data.publicUrl;
};

/**
 * Complete image upload workflow: process image and upload to storage
 */
export const uploadImage = async (
  imageUri: string,
  bucketName: string,
  filePath: string,
  uploadOptions: ImageUploadOptions & { upsert?: boolean } = {}
): Promise<{ uploadData: any; publicUrl: string }> => {
  const { upsert, ...imageOptions } = uploadOptions;

  // Process the image
  const processedImage = await processImageForUpload(imageUri, imageOptions);

  // Upload to storage
  const uploadData = await uploadImageToStorage(bucketName, filePath, processedImage, { upsert });

  // Get public URL
  const publicUrl = getPublicUrl(bucketName, filePath);

  return { uploadData, publicUrl };
};
/**
 * Generate a thumbnail from a video file
 * @param videoFile - The video file to generate thumbnail from
 * @param timeInSeconds - Time position to capture thumbnail (default: 1 second)
 * @returns Promise<Blob> - The thumbnail image as a Blob
 */
export const generateVideoThumbnail = (
  videoFile: File | Blob,
  timeInSeconds = 1,
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    if (!context) {
      reject(new Error('Could not get canvas context'))
      return
    }

    // Create object URL for the video
    const videoUrl = URL.createObjectURL(videoFile)
    video.src = videoUrl
    video.crossOrigin = 'anonymous'
    video.preload = 'metadata'

    // When metadata is loaded, set the time to capture
    video.onloadedmetadata = () => {
      // Ensure we don't seek beyond video duration
      const captureTime = Math.min(timeInSeconds, video.duration - 0.1)
      video.currentTime = captureTime
    }

    // When the frame is loaded at the specified time
    video.onseeked = () => {
      try {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw the current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            // Clean up
            URL.revokeObjectURL(videoUrl)
            video.remove()
            canvas.remove()

            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to generate thumbnail blob'))
            }
          },
          'image/jpeg',
          0.8, // Quality: 0.8 (80%)
        )
      } catch (error) {
        URL.revokeObjectURL(videoUrl)
        video.remove()
        canvas.remove()
        reject(error)
      }
    }

    video.onerror = () => {
      URL.revokeObjectURL(videoUrl)
      video.remove()
      canvas.remove()
      reject(new Error('Failed to load video for thumbnail generation'))
    }
  })
}

/**
 * Generate a thumbnail and upload it to Supabase Storage
 * @param videoFile - The video file to generate thumbnail from
 * @param videoId - The video ID to associate the thumbnail with
 * @param userId - The user ID for the storage path
 * @returns Promise<string> - The thumbnail URL
 */
export const generateAndUploadThumbnail = async (
  videoFile: File | Blob,
  filePath: string,
  userId: string,
): Promise<Blob> => {
  try {
    // Generate thumbnail from video
    const thumbnailBlob = await generateVideoThumbnail(videoFile, 1)

    return thumbnailBlob
  } catch (error) {
    console.error('Error generating thumbnail:', error)
    throw error
  }
}

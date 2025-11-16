import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'

let ffmpeg: FFmpeg | null = null

export async function loadFFmpeg(
  onProgress?: (progress: number) => void,
): Promise<FFmpeg> {
  if (ffmpeg) return ffmpeg

  ffmpeg = new FFmpeg()

  // Set up logging
  ffmpeg.on('log', ({ message }) => {
    console.log('[FFmpeg]', message)
  })

  // Set up progress listener
  if (onProgress) {
    ffmpeg.on('progress', ({ progress }) => {
      const percent = Math.round(progress * 100)
      console.log('[FFmpeg] Progress:', percent + '%')
      onProgress(percent)
    })
  }

  // Load FFmpeg
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'

  console.log('[FFmpeg] Loading FFmpeg...')

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  })

  console.log('[FFmpeg] FFmpeg loaded successfully')

  return ffmpeg
}

/**
 * Convert video to 9:16 aspect ratio (vertical/portrait)
 * This crops the video to fit 9:16 while maintaining quality
 */
export async function convertVideoTo9x16(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<File> {
  console.log('[VideoConverter] Starting conversion to 9:16...')
  console.log('[VideoConverter] Input file:', file.name, file.size, 'bytes')

  try {
    const ffmpeg = await loadFFmpeg(onProgress)

    // Read the input file
    const inputName = 'input.mp4'
    const outputName = 'output.mp4'

    console.log('[VideoConverter] Writing input file to FFmpeg...')
    const arrayBuffer = await file.arrayBuffer()
    await ffmpeg.writeFile(inputName, new Uint8Array(arrayBuffer))

    console.log('[VideoConverter] Running FFmpeg conversion...')

    // Get video info first to determine if it's landscape or portrait
    const { aspectRatio } = await getVideoDimensions(file)
    console.log('[VideoConverter] Input aspect ratio:', aspectRatio)

    let cropFilter: string

    if (aspectRatio > 1) {
      // Landscape video (wider than tall) - crop width
      // crop from center: width = height * (9/16)
      cropFilter = 'crop=ih*9/16:ih'
    } else {
      // Portrait or square - crop height or both
      // If already portrait, might need to crop height
      // width should be height * (9/16), so height = width / (9/16) = width * 16/9
      cropFilter = 'crop=iw:iw*16/9'
    }

    console.log('[VideoConverter] Using crop filter:', cropFilter)

    // FFmpeg command to crop and scale to 9:16 (1080x1920)
    await ffmpeg.exec([
      '-i',
      inputName,
      '-vf',
      `${cropFilter},scale=1080:1920`,
      '-c:v',
      'libx264',
      '-preset',
      'ultrafast',
      '-crf',
      '28',
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      '-y',
      outputName,
    ])

    console.log('[VideoConverter] Reading output file...')
    const data = await ffmpeg.readFile(outputName)

    console.log('[VideoConverter] Output size:', data.length, 'bytes')

    // Clean up
    console.log('[VideoConverter] Cleaning up temporary files...')
    await ffmpeg.deleteFile(inputName)
    await ffmpeg.deleteFile(outputName)

    // Convert to File object
    const blob = new Blob([data], { type: 'video/mp4' })
    const originalName = file.name.replace(/\.[^/.]+$/, '')
    const newFile = new File([blob], `${originalName}_9x16.mp4`, {
      type: 'video/mp4',
    })

    console.log('[VideoConverter] Conversion successful!', newFile.name)
    return newFile
  } catch (error) {
    console.error('[VideoConverter] Conversion failed:', error)
    throw error
  }
}

/**
 * Get video dimensions without full conversion
 */
export async function getVideoDimensions(
  file: File,
): Promise<{ width: number; height: number; aspectRatio: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src)
      const width = video.videoWidth
      const height = video.videoHeight
      const aspectRatio = width / height

      resolve({ width, height, aspectRatio })
    }

    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      reject(new Error('Failed to load video metadata'))
    }

    video.src = URL.createObjectURL(file)
  })
}

/**
 * Check if video needs conversion to 9:16
 * Returns true if aspect ratio is not close to 9:16 (0.5625)
 */
export async function needsConversion(file: File): Promise<boolean> {
  try {
    const { aspectRatio } = await getVideoDimensions(file)
    const target = 9 / 16 // 0.5625
    const tolerance = 0.05 // 5% tolerance

    return Math.abs(aspectRatio - target) > tolerance
  } catch (error) {
    console.error('Error checking video dimensions:', error)
    // If we can't determine, assume it needs conversion
    return true
  }
}

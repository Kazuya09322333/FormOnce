'use client'

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  Input,
  Label,
} from '@components/ui'
import { useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '~/lib/supabase'
import { api } from '~/utils/api'

export const VideoUploadDialog = ({
  isOpen,
  setIsOpen,
  onVideoUploaded,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onVideoUploaded?: (videoId: string, videoUrl: string) => void
}) => {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [videoId, setVideoId] = useState<string | null>(null)

  const { mutateAsync: getUploadUrl } = api.video.getUploadUrl.useMutation()
  const { mutateAsync: finalizeVideo } = api.video.finalizeVideo.useMutation()

  const { data: videoStatus } = api.video.getVideoStatus.useQuery(
    { videoId: videoId! },
    { enabled: !!videoId, refetchInterval: 5000 },
  )

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event?.target?.files?.[0]) {
      setVideoFile(event.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!videoFile) {
      toast.error('Please select a video file')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // 1. Get signed upload URL from backend
      const { uploadUrl, filePath, token } = await getUploadUrl({
        filename: videoFile.name,
        fileType: videoFile.type,
      })

      // 2. Upload file directly to Supabase Storage using signed URL
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentage = Math.round((e.loaded / e.total) * 100)
          setUploadProgress(percentage)
        }
      })

      xhr.addEventListener('load', async () => {
        if (xhr.status === 200) {
          try {
            // 3. Finalize video and save metadata
            const result = await finalizeVideo({
              filePath: filePath,
              title: videoFile.name,
            })

            setVideoId(result.videoId)
            setUploadProgress(100)
            toast.success('Video uploaded successfully!')

            // Callback with video info
            if (onVideoUploaded) {
              onVideoUploaded(result.videoId, result.url)
            }

            // Close dialog after short delay
            setTimeout(() => {
              setIsOpen(false)
              resetForm()
            }, 1500)
          } catch (error) {
            console.error('Error finalizing video:', error)
            toast.error('Failed to finalize video upload')
            setIsUploading(false)
          }
        } else {
          console.error('Upload failed with status:', xhr.status)
          toast.error('Upload failed. Please try again.')
          setIsUploading(false)
          setUploadProgress(0)
        }
      })

      xhr.addEventListener('error', () => {
        console.error('Upload error')
        toast.error('Upload failed. Please try again.')
        setIsUploading(false)
        setUploadProgress(0)
      })

      xhr.open('PUT', uploadUrl)
      xhr.setRequestHeader('Content-Type', videoFile.type)
      xhr.send(videoFile)
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('Failed to start upload')
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const resetForm = () => {
    setVideoFile(null)
    setUploadProgress(0)
    setIsUploading(false)
    setVideoId(null)
  }

  const handleOnOpenChange = (open: boolean) => {
    if (!isUploading) {
      setIsOpen(open)
      if (!open) {
        resetForm()
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <DialogContent>
        <div className="space-y-4 p-4">
          <h2 className="text-xl font-semibold">Upload Video</h2>

          <div className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col gap-2 p-8 items-center">
            <FileIcon className="w-12 h-12 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">
              Select a video file to upload
            </span>
            <span className="text-xs text-gray-500">
              Supported formats: MP4, MOV, AVI, etc.
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file" className="text-sm font-medium">
              Video File
            </Label>
            <Input
              id="file"
              type="file"
              accept="video/mp4,video/quicktime,video/x-msvideo,video/*"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {videoFile && (
              <p className="text-sm text-gray-600">
                Selected: {videoFile.name} (
                {(videoFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 text-center">
                {uploadProgress}% uploaded
              </p>
            </div>
          )}

          {uploadProgress === 100 && videoStatus && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800 text-center">
                ✓ Video uploaded successfully!
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOnOpenChange(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!videoFile || isUploading}
            loading={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M8 12h8" />
      <path d="M8 16h8" />
    </svg>
  )
}

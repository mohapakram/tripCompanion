'use client'

import { useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Upload, X, FileImage, FileVideo, Check } from 'lucide-react'

interface MediaUploadProps {
  onUpload: (files: { file: File; day?: number }[]) => Promise<void>
  isUploading: boolean
}

interface SelectedFile {
  id: string
  file: File
  day?: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  progress: number
  preview?: string
}

export function MediaUpload({ onUpload, isUploading }: MediaUploadProps) {
  const [open, setOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([])
  const [defaultDay, setDefaultDay] = useState<number>()
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateFileId = () => Math.random().toString(36).substr(2, 9)

  const createPreview = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(file)
      } else {
        resolve('')
      }
    })
  }, [])

  const handleFileSelection = async (files: FileList | null) => {
    if (!files) return

    const newFiles: SelectedFile[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      // Validate file type
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        continue
      }
      const preview = await createPreview(file)
      newFiles.push({
        id: generateFileId(),
        file,
        day: defaultDay,
        status: 'pending',
        progress: 0,
        preview,
      })
    }

    setSelectedFiles(prev => [...prev, ...newFiles])
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelection(e.dataTransfer.files)
  }

  const removeFile = (fileId: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const updateFileDay = (fileId: string, day: number | undefined) => {
    setSelectedFiles(prev => 
      prev.map(f => f.id === fileId ? { ...f, day } : f)
    )
  }

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) return

    try {
      const filesToUpload = selectedFiles.map(sf => ({
        file: sf.file,
        day: sf.day
      }))

      await onUpload(filesToUpload)
      
      // Clear files and close dialog
      setSelectedFiles([])
      setDefaultDay(undefined)
      setOpen(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  const resetDialog = () => {
    setSelectedFiles([])
    setDefaultDay(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen)
      if (!newOpen) resetDialog()
    }}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Media
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Media</DialogTitle>
          <DialogDescription>
            Upload multiple photos or videos from your trip
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* File Input with Drag & Drop */}
          <div className="space-y-2">
            <Label htmlFor="files">Select Files *</Label>
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                isDragging 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => handleFileSelection(e.target.files)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-center">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">
                  {isDragging ? 'Drop files here' : 'Click to select or drag & drop'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Images and videos up to 50MB each
                </p>
              </div>
            </div>
          </div>

          {/* Default Day Input */}
          <div className="space-y-2">
            <Label htmlFor="defaultDay">Default Day (optional)</Label>
            <Input
              id="defaultDay"
              type="number"
              min="1"
              placeholder="Apply to all files"
              value={defaultDay || ''}
              onChange={(e) => {
                const day = e.target.value ? parseInt(e.target.value) : undefined
                setDefaultDay(day)
                // Apply to all pending files
                setSelectedFiles(prev => 
                  prev.map(f => ({ ...f, day }))
                )
              }}
            />
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Selected Files ({selectedFiles.length})
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFiles([])}
                  disabled={isUploading}
                >
                  Clear All
                </Button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedFiles.map((selectedFile) => (
                  <div
                    key={selectedFile.id}
                    className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50"
                  >
                    {/* Preview */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                      {selectedFile.preview ? (
                        <img
                          src={selectedFile.preview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : selectedFile.file.type.startsWith('video/') ? (
                        <FileVideo className="w-6 h-6 text-muted-foreground" />
                      ) : (
                        <FileImage className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {selectedFile.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>

                    {/* Day Input */}
                    <div className="w-20">
                      <Input
                        type="number"
                        min="1"
                        placeholder="Day"
                        value={selectedFile.day || ''}
                        onChange={(e) => 
                          updateFileDay(
                            selectedFile.id, 
                            e.target.value ? parseInt(e.target.value) : undefined
                          )
                        }
                        disabled={isUploading}
                        className="text-xs h-8"
                      />
                    </div>

                    {/* Status */}
                    <div className="w-16 flex justify-center">
                      {selectedFile.status === 'pending' && (
                        <Badge variant="secondary" className="text-xs">
                          Ready
                        </Badge>
                      )}
                      {selectedFile.status === 'uploading' && (
                        <div className="w-full">
                          <Progress value={selectedFile.progress} className="h-2" />
                        </div>
                      )}
                      {selectedFile.status === 'completed' && (
                        <Badge variant="default" className="text-xs">
                          <Check className="w-3 h-3 mr-1" />
                          Done
                        </Badge>
                      )}
                      {selectedFile.status === 'error' && (
                        <Badge variant="destructive" className="text-xs">
                          Error
                        </Badge>
                      )}
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeFile(selectedFile.id)}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isUploading || selectedFiles.length === 0}
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

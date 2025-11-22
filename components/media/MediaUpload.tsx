'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Upload } from 'lucide-react'

interface MediaUploadProps {
  onUpload: (file: File, day?: number) => void
  isUploading: boolean
}

export function MediaUpload({ onUpload, isUploading }: MediaUploadProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [day, setDay] = useState<number>()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    if (!file) return
    onUpload(file, day)
    setFile(null)
    setDay(undefined)
    setOpen(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Media
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Media</DialogTitle>
          <DialogDescription>
            Upload photos or videos from your trip
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="file">File *</Label>
            <Input
              id="file"
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="day">Day (optional)</Label>
            <Input
              id="day"
              type="number"
              min="1"
              placeholder="Which day of the trip?"
              value={day || ''}
              onChange={(e) => setDay(e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>
          {file && (
            <div className="p-4 bg-accent rounded-md">
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isUploading || !file}>
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

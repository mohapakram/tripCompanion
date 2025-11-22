'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'

interface ActivityFormProps {
  day: number
  onSubmit: (activity: any) => void
  isSubmitting: boolean
}

export function ActivityForm({ day, onSubmit, isSubmitting }: ActivityFormProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('')
  const [description, setDescription] = useState('')
  const [locationUrl, setLocationUrl] = useState('')

  const handleSubmit = () => {
    onSubmit({
      day,
      title,
      time,
      description,
      location_url: locationUrl,
      finalized: false,
    })
    setTitle('')
    setTime('')
    setDescription('')
    setLocationUrl('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Activity
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Activity</DialogTitle>
          <DialogDescription>
            Create a new activity for Day {day}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Activity Name *</Label>
            <Input
              id="title"
              placeholder="Beach volleyball"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Time *</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Friendly game at Main Beach"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location URL</Label>
            <Input
              id="location"
              placeholder="https://maps.google.com/..."
              value={locationUrl}
              onChange={(e) => setLocationUrl(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !title || !time}
          >
            {isSubmitting && (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {isSubmitting ? 'Adding...' : 'Add Activity'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

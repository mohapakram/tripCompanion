'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus } from 'lucide-react'

interface ChallengeFormProps {
  onSubmit: (challenge: any) => void
  isSubmitting: boolean
}

export function ChallengeForm({ onSubmit, isSubmitting }: ChallengeFormProps) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [category, setCategory] = useState<'photo' | 'dare' | 'scavenger'>('photo')
  const [points, setPoints] = useState('10')
  const [locationRequired, setLocationRequired] = useState(false)

  const handleSubmit = () => {
    onSubmit({
      text,
      category,
      points: parseInt(points),
      location_required: locationRequired,
    })
    setText('')
    setCategory('photo')
    setPoints('10')
    setLocationRequired(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Challenge
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Challenge</DialogTitle>
          <DialogDescription>
            Add a new challenge for trip members to complete
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="text">Challenge Description *</Label>
            <Input
              id="text"
              placeholder="Take a photo with a camel"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="photo">Photo Challenge</SelectItem>
                <SelectItem value="dare">Dare Challenge</SelectItem>
                <SelectItem value="scavenger">Scavenger Hunt</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="points">Points *</Label>
            <Input
              id="points"
              type="number"
              min="5"
              max="100"
              step="5"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="location"
              checked={locationRequired}
              onCheckedChange={(checked) => setLocationRequired(checked as boolean)}
            />
            <Label htmlFor="location" className="text-sm font-normal">
              Require location for completion
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !text || !category}
          >
            {isSubmitting && (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {isSubmitting ? 'Creating...' : 'Create Challenge'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Project } from '../types/task'

interface AddProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onAddProject: (project: Project) => void
}

export default function AddProjectModal({ isOpen, onClose, onAddProject }: AddProjectModalProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('')

  const handleSubmit = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      color,
    }
    onAddProject(newProject)
    onClose()
    resetForm()
  }

  const resetForm = () => {
    setName('')
    setColor('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Select value={color} onValueChange={setColor}>
            <SelectTrigger>
              <SelectValue placeholder="Select Color" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bg-red-500">Red</SelectItem>
              <SelectItem value="bg-blue-500">Blue</SelectItem>
              <SelectItem value="bg-green-500">Green</SelectItem>
              <SelectItem value="bg-yellow-500">Yellow</SelectItem>
              <SelectItem value="bg-purple-500">Purple</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Add Project</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


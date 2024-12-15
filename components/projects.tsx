'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { storage, isSessionValid, updateLastUnlockTime } from '../utils/storage'
import { Task, Project, AppData } from '../types/task'
import { Button } from "@/components/ui/button"
import { Plus, Folder } from 'lucide-react'
import AddProjectModal from './add-project-modal'

export default function Projects() {
  const [appData, setAppData] = useState<AppData>(storage.getData())
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false)

  useEffect(() => {
    const fetchData = () => {
      const data = storage.getData()
      if (data.user?.encryptionEnabled && !isSessionValid()) {
        // Handle session expiration (this will be managed in the parent component)
      } else {
        updateLastUnlockTime()
        setAppData(data)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleAddProject = (newProject: Project) => {
    const updatedAppData = {
      ...appData,
      projects: [...appData.projects, newProject]
    };
    storage.setData(updatedAppData);
    setAppData(updatedAppData);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
        <Button onClick={() => setIsAddProjectModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appData.projects.map(project => {
          const projectTasks = appData.tasks.filter(t => t.projectId === project.id)
          const completedTasks = projectTasks.filter(t => t.status === 'done').length
          const totalTasks = projectTasks.length
          const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

          return (
            <Card key={project.id}>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className={`p-2 rounded-lg ${project.color}`}>
                  <Folder className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="ml-2 text-lg font-medium">{project.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-2 space-y-2">
                  <Progress value={progress} className="w-full" />
                  <div className="text-sm text-muted-foreground">
                    {completedTasks} of {totalTasks} tasks completed
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <AddProjectModal
        isOpen={isAddProjectModalOpen}
        onClose={() => setIsAddProjectModalOpen(false)}
        onAddProject={handleAddProject}
      />
    </div>
  )
}


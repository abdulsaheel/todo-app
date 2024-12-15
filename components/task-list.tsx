'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Task, Project, AppData } from '../types/task'
import { format } from 'date-fns'
import { storage, isSessionValid, updateLastUnlockTime } from '../utils/storage'

export default function TaskList() {
  const [appData, setAppData] = useState<AppData>(storage.getData())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'done'>('all')

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
    const interval = setInterval(fetchData, 10000) // Refresh data every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const dates = Array.from({ length: 5 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i - 2)
    return date
  })

  const filteredTasks = appData.tasks.filter(task => {
    const taskDate = new Date(task.date)
    return (
      format(taskDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') &&
      (filter === 'all' || task.status === filter)
    )
  })

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    const updatedAppData = {
      ...appData,
      tasks: appData.tasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    };
    storage.setData(updatedAppData);
    setAppData(updatedAppData);
  }

  const handleProjectChange = (taskId: string, newProjectId: string | null) => {
    const updatedAppData = {
      ...appData,
      tasks: appData.tasks.map(task =>
        task.id === taskId ? { ...task, projectId: newProjectId === 'no-project' ? null : newProjectId } : task
      )
    };
    storage.setData(updatedAppData);
    setAppData(updatedAppData);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-6">
      {/* Date Picker */}
      <div className="flex gap-2 overflow-x-auto py-2">
        {dates.map((date) => (
          <Button
            key={date.toISOString()}
            variant={date.toDateString() === selectedDate.toDateString() ? "default" : "outline"}
            className="flex-shrink-0"
            onClick={() => setSelectedDate(date)}
          >
            <div className="text-center">
              <div className="text-sm font-medium">
                {format(date, 'MMM')}
              </div>
              <div className="text-2xl">
                {format(date, 'd')}
              </div>
              <div className="text-xs">
                {format(date, 'EEE')}
              </div>
            </div>
          </Button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? "default" : "outline"}
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'todo' ? "default" : "outline"}
          onClick={() => setFilter('todo')}
        >
          To do
        </Button>
        <Button
          variant={filter === 'in-progress' ? "default" : "outline"}
          onClick={() => setFilter('in-progress')}
        >
          In Progress
        </Button>
        <Button
          variant={filter === 'done' ? "default" : "outline"}
          onClick={() => setFilter('done')}
        >
          Done
        </Button>
      </div>

      {/* Tasks */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card key={task.id}>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">
                <Select
                  value={task.projectId || 'no-project'}
                  onValueChange={(value) => handleProjectChange(task.id, value === 'no-project' ? null : value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="No Project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-project">No Project</SelectItem>
                    {appData.projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="font-medium">{task.title}</div>
              <div className="text-sm">{task.description}</div>
              <div className="flex items-center justify-between mt-2">
                <div className="text-sm text-muted-foreground">
                  {format(new Date(task.date), 'h:mm a')}
                </div>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                  className="text-sm border rounded p-1"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


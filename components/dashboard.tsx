'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { storage, isSessionValid, updateLastUnlockTime } from '../utils/storage'
import { Task, Project, AppData } from '../types/task'
import { Button } from "@/components/ui/button"
import { Plus, CheckCircle, Clock, AlertCircle, FolderKanban } from 'lucide-react'
import AddTaskModal from './add-task-modal'
import AddProjectModal from './add-project-modal'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

export default function Dashboard() {
  const [appData, setAppData] = useState<AppData>(storage.getData())
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)
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

  const handleAddTask = (newTask: Task) => {
    const updatedAppData = {
      ...appData,
      tasks: [...appData.tasks, newTask]
    };
    storage.setData(updatedAppData);
    setAppData(updatedAppData);
  }

  const handleAddProject = (newProject: Project) => {
    const updatedAppData = {
      ...appData,
      projects: [...appData.projects, newProject]
    };
    storage.setData(updatedAppData);
    setAppData(updatedAppData);
  }

  const todayTasks = appData.tasks.filter(task => {
    const taskDate = new Date(task.date);
    const today = new Date();
    return taskDate.toDateString() === today.toDateString();
  });

  const todayProgress = todayTasks.length > 0
    ? Math.round((todayTasks.filter(t => t.status === 'done').length / todayTasks.length) * 100)
    : 0;

  const taskStatusData = [
    { name: 'To Do', value: appData.tasks.filter(t => t.status === 'todo').length },
    { name: 'In Progress', value: appData.tasks.filter(t => t.status === 'in-progress').length },
    { name: 'Done', value: appData.tasks.filter(t => t.status === 'done').length },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  const projectData = appData.projects.map(project => {
    const tasks = appData.tasks.filter(t => t.projectId === project.id);
    return {
      name: project.name,
      tasks: tasks.length,
      completed: tasks.filter(t => t.status === 'done').length,
    };
  });

  // Add data for tasks without a project
  const tasksWithoutProject = appData.tasks.filter(t => t.projectId === null);
  projectData.push({
    name: 'No Project',
    tasks: tasksWithoutProject.length,
    completed: tasksWithoutProject.filter(t => t.status === 'done').length,
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appData.tasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appData.tasks.filter(t => t.status === 'done').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appData.tasks.filter(t => t.status === 'in-progress').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appData.projects.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tasks" fill="#8884d8" name="Total Tasks" />
                <Bar dataKey="completed" fill="#82ca9d" name="Completed Tasks" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end space-x-4">
        <Button onClick={() => setIsAddTaskModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Task
        </Button>
        <Button onClick={() => setIsAddProjectModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Project
        </Button>
      </div>

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onAddTask={handleAddTask}
        projects={appData.projects}
      />

      <AddProjectModal
        isOpen={isAddProjectModalOpen}
        onClose={() => setIsAddProjectModalOpen(false)}
        onAddProject={handleAddProject}
      />
    </div>
  )
}


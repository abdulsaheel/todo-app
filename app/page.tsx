"use client"

import { useState, useEffect, useCallback } from 'react'
import Welcome from '../components/welcome'
import Dashboard from '../components/dashboard'
import TaskList from '../components/task-list'
import Projects from '../components/projects'
import Profile from '../components/profile'
import PasswordPrompt from '../components/password-prompt'
import Header from '../components/header'
import Sidebar from '../components/sidebar'
import { storage, getSessionKey, clearSessionKey, setSessionKey, isSessionValid } from '../utils/storage'

export default function Home() {
  const [initialized, setInitialized] = useState(false)
  const [currentView, setCurrentView] = useState<'welcome' | 'dashboard' | 'tasks' | 'projects' | 'profile'>('welcome')
  const [isPasswordPromptOpen, setIsPasswordPromptOpen] = useState(false)

  useEffect(() => {
    const appData = storage.getData()
    if (appData.user) {
      if (appData.user.encryptionEnabled && !getSessionKey()) {
        setIsPasswordPromptOpen(true)
      } else {
        setCurrentView('dashboard')
      }
    }
    setInitialized(true)

    const handleBeforeUnload = () => {
      clearSessionKey()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  const checkSession = useCallback(() => {
    const appData = storage.getData()
    if (appData.user?.encryptionEnabled && !isSessionValid()) {
      setIsPasswordPromptOpen(true)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(checkSession, 10000)
    return () => clearInterval(interval)
  }, [checkSession])

  const handlePasswordSubmit = (password: string) => {
    setSessionKey(password)
    setCurrentView('dashboard')
  }

  const handleViewChange = (view: string) => {
    setCurrentView(view as typeof currentView)
  }

  if (!initialized) {
    return null
  }

  if (currentView === 'welcome') {
    return <Welcome onStart={() => setCurrentView('dashboard')} />
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar currentView={currentView} onViewChange={handleViewChange} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            {currentView === 'dashboard' && <Dashboard />}
            {currentView === 'tasks' && <TaskList />}
            {currentView === 'projects' && <Projects />}
            {currentView === 'profile' && <Profile />}
          </div>
        </main>
      </div>
      <PasswordPrompt
        isOpen={isPasswordPromptOpen}
        onClose={() => setIsPasswordPromptOpen(false)}
        onSubmit={handlePasswordSubmit}
      />
    </div>
  )
}


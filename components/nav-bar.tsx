import { Button } from "@/components/ui/button"
import { Home, Calendar, FileText, UserIcon } from 'lucide-react'

interface NavBarProps {
  onViewChange: (view: string) => void;
  currentView: string;
}

export default function NavBar({ onViewChange, currentView }: NavBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-2">
      <div className="flex justify-around items-center">
        <Button 
          variant={currentView === 'dashboard' ? "default" : "ghost"} 
          size="icon" 
          onClick={() => onViewChange('dashboard')}
        >
          <Home className="h-5 w-5" />
        </Button>
        <Button 
          variant={currentView === 'tasks' ? "default" : "ghost"} 
          size="icon" 
          onClick={() => onViewChange('tasks')}
        >
          <Calendar className="h-5 w-5" />
        </Button>
        <Button 
          variant={currentView === 'projects' ? "default" : "ghost"} 
          size="icon" 
          onClick={() => onViewChange('projects')}
        >
          <FileText className="h-5 w-5" />
        </Button>
        <Button 
          variant={currentView === 'profile' ? "default" : "ghost"} 
          size="icon" 
          onClick={() => onViewChange('profile')}
        >
          <UserIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}


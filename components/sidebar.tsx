import { Home, Calendar, FolderKanban, User } from 'lucide-react'
import { cn } from "@/lib/utils"

interface SidebarProps {
  currentView: string
  onViewChange: (view: string) => void
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const menuItems = [
    { icon: Home, label: 'Dashboard', view: 'dashboard' },
    { icon: Calendar, label: 'Tasks', view: 'tasks' },
    { icon: FolderKanban, label: 'Projects', view: 'projects' },
    { icon: User, label: 'Profile', view: 'profile' },
  ]

  return (
    <aside className="bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
      <nav>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.view}>
              <button
                onClick={() => onViewChange(item.view)}
                className={cn(
                  "flex items-center space-x-2 w-full px-4 py-2 rounded transition duration-200",
                  currentView === item.view
                    ? "bg-gray-900 text-white"
                    : "text-gray-400 hover:bg-gray-700 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}


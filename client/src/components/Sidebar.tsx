import { NavLink } from 'react-router-dom'
import { Button, Sidebar as FlowbiteSidebar, SidebarItem, SidebarItemGroup, SidebarItems } from 'flowbite-react'
import { useAuth } from '../context/AuthContext'

export function Sidebar() {
  const { logout } = useAuth()

  return (
    <FlowbiteSidebar aria-label="Main navigation" className="flex h-screen w-64 flex-col">
      <div className="mb-4 px-2 text-lg font-semibold text-gray-900 dark:text-white">Typesense Dashboard</div>
      <SidebarItems className="flex-1">
        <SidebarItemGroup>
          <SidebarItem as={NavLink} {...{ to: '/dashboard' }}>
            Dashboard
          </SidebarItem>
        </SidebarItemGroup>
      </SidebarItems>
      <Button color="light" onClick={() => void logout()}>
        Logout
      </Button>
    </FlowbiteSidebar>
  )
}

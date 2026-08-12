import { NavLink } from 'react-router-dom'
import { Button, Sidebar as FlowbiteSidebar, SidebarItem, SidebarItemGroup, SidebarItems } from 'flowbite-react'
import { useAuth } from '../context/AuthContext'
import { CollectionsIcon, DashboardIcon, LogoutIcon } from './icons'

export function Sidebar() {
  const { logout } = useAuth()

  return (
    <FlowbiteSidebar
      aria-label="Main navigation"
      className="h-screen w-64"
      theme={{ root: { inner: 'flex h-full flex-col' } }}
    >
      <div className="mb-4 px-2 text-lg font-semibold text-gray-900 dark:text-white">Typesense Dashboard</div>
      <SidebarItems className="flex-1">
        <SidebarItemGroup>
          <SidebarItem as={NavLink} icon={DashboardIcon} {...{ to: '/dashboard' }}>
            Dashboard
          </SidebarItem>
          <SidebarItem as={NavLink} icon={CollectionsIcon} {...{ to: '/collections' }}>
            Collections
          </SidebarItem>
        </SidebarItemGroup>
      </SidebarItems>
      <Button color="red" className="m-2 flex items-center justify-center gap-2" onClick={() => void logout()}>
        <LogoutIcon className="h-5 w-5" />
        Logout
      </Button>
    </FlowbiteSidebar>
  )
}

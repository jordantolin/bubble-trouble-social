
import { NavLink } from "react-router-dom";
import { Home, User, MessageSquare, Users, Plus } from "lucide-react";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

const Sidebar = () => {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return null;
  }
  
  return (
    <ShadcnSidebar className="border-r lg:w-64 w-14">
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex items-center p-3 w-full rounded-lg ${
                    isActive
                      ? "bg-bubble-yellow-light text-bubble-yellow-dark font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
                end
              >
                <Home className="h-5 w-5" />
                <span className="ml-2 lg:block hidden">Dashboard</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `flex items-center p-3 w-full rounded-lg ${
                    isActive
                      ? "bg-bubble-yellow-light text-bubble-yellow-dark font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <User className="h-5 w-5" />
                <span className="ml-2 lg:block hidden">Profile</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/messages"
                className={({ isActive }) =>
                  `flex items-center p-3 w-full rounded-lg ${
                    isActive
                      ? "bg-bubble-yellow-light text-bubble-yellow-dark font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <MessageSquare className="h-5 w-5" />
                <span className="ml-2 lg:block hidden">Messages</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/friends"
                className={({ isActive }) =>
                  `flex items-center p-3 w-full rounded-lg ${
                    isActive
                      ? "bg-bubble-yellow-light text-bubble-yellow-dark font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <Users className="h-5 w-5" />
                <span className="ml-2 lg:block hidden">Friends</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <div className="mt-6 px-3">
            <NavLink
              to="/create"
              className={({ isActive }) =>
                `flex items-center justify-center py-2 px-4 rounded-full w-full ${
                  isActive
                    ? "bg-bubble-yellow-dark text-white"
                    : "bg-bubble-yellow text-white hover:bg-bubble-yellow-dark"
                }`
              }
            >
              <Plus className="h-5 w-5 lg:hidden" />
              <span className="lg:block hidden">Create Bubble</span>
            </NavLink>
          </div>
        </SidebarMenu>
      </SidebarContent>
    </ShadcnSidebar>
  );
};

export default Sidebar;

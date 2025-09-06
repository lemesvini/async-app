import * as React from "react";
import {
  IconDashboard,
  IconInnerShadowTop,
  IconUsers,
  IconBriefcase,
  IconSchool,
  IconBook,
  IconCreditCard,
} from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

// Define user roles as a type
type UserRole = "ADMIN" | "CONSULTANT" | "STUDENT";

interface UserData {
  name: string;
  email: string;
  avatar?: string;
  fullName?: string;
  role?: UserRole;
}

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
    role: "STUDENT" as UserRole, // Default role
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
  ],
  navManagement: [
    {
      title: "Students",
      url: "/alunos",
      icon: IconUsers,
    },
    {
      title: "Consultants",
      url: "/consultants",
      icon: IconBriefcase,
    },
    {
      title: "Classes",
      url: "/turmas",
      icon: IconSchool,
    },
    {
      title: "Payments",
      url: "/payments",
      icon: IconCreditCard,
    },
  ],
  navContents: [
    {
      title: "Contents",
      url: "/contents",
      icon: IconBook,
    },
  ],
  // navClouds: [
  //   {
  //     title: "Capture",
  //     icon: IconCamera,
  //     isActive: true,
  //     url: "/capture",
  //     items: [
  //       {
  //         title: "Active Proposals",
  //         url: "/capture/active",
  //       },
  //       {
  //         title: "Archived",
  //         url: "/capture/archived",
  //       },
  //     ],
  //   },
  //   {
  //     title: "Proposal",
  //     icon: IconFileDescription,
  //     url: "/proposal",
  //     items: [
  //       {
  //         title: "Active Proposals",
  //         url: "/proposal/active",
  //       },
  //       {
  //         title: "Archived",
  //         url: "/proposal/archived",
  //       },
  //     ],
  //   },
  //   {
  //     title: "Prompts",
  //     icon: IconFileAi,
  //     url: "/prompts",
  //     items: [
  //       {
  //         title: "Active Proposals",
  //         url: "/prompts/active",
  //       },
  //       {
  //         title: "Archived",
  //         url: "/prompts/archived",
  //       },
  //     ],
  //   },
  // ],
  // navSecondary: [
  //   {
  //     title: "Settings",
  //     url: "/settings",
  //     icon: IconSettings,
  //   },
  //   {
  //     title: "Get Help",
  //     url: "/help",
  //     icon: IconHelp,
  //   },
  //   {
  //     title: "Search",
  //     url: "/search",
  //     icon: IconSearch,
  //   },
  // ],
  // documents: [
  //   {
  //     name: "Data Library",
  //     url: "/documents/data-library",
  //     icon: IconDatabase,
  //   },
  //   {
  //     name: "Reports",
  //     url: "/documents/reports",
  //     icon: IconReport,
  //   },
  //   {
  //     name: "Word Assistant",
  //     url: "/documents/word-assistant",
  //     icon: IconFileWord,
  //   },
  // ],
};

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: UserData;
}) {
  // Use passed user or fallback to default data
  const userData = user || data.user;
  const location = useLocation();

  // Filter navigation items based on user role
  const getFilteredNavItems = () => {
    const userRole = (userData.role as UserRole) || "STUDENT";

    // Role-based filtering for management items
    switch (userRole) {
      case "ADMIN":
        // Admin gets full access to all management features
        return data.navManagement;

      case "CONSULTANT":
        // Consultant gets access to students and classes only
        return data.navManagement.filter((item) =>
          ["Students", "Classes"].includes(item.title)
        );

      case "STUDENT":
      default:
        // Students get no management items
        return [];
    }
  };

  // Show contents based on role - all roles can access contents
  const shouldShowContents = () => {
    const userRole = (userData.role as UserRole) || "STUDENT";
    // All authenticated users can access contents
    return (["ADMIN", "CONSULTANT", "STUDENT"] as UserRole[]).includes(
      userRole
    );
  };

  // Show dashboard based on role - only admins can see dashboard
  const shouldShowDashboard = () => {
    const userRole = (userData.role as UserRole) || "STUDENT";
    return userRole === "ADMIN";
  };

  // Get the default home URL based on user role
  const getDefaultHomeUrl = () => {
    const userRole = (userData.role as UserRole) || "STUDENT";
    switch (userRole) {
      case "ADMIN":
        return "/dashboard";
      case "CONSULTANT":
        return "/alunos";
      case "STUDENT":
        return "/contents";
      default:
        return "/contents";
    }
  };

  const filteredManagementItems = getFilteredNavItems();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 hover:bg-sidebar-accent hover:text-sidebar-accent-foregroundß"
            >
              <Link to={getDefaultHomeUrl()}>
                <IconInnerShadowTop className="!size-5" />
                <div className="flex flex-col">
                  <span className="text-base font-semibold tracking-wid">
                    Welcome,{" "}
                    {(() => {
                      const displayName =
                        "fullName" in userData
                          ? userData.fullName || userData.name
                          : userData.name;
                      return displayName.split(" ")[0];
                    })()}
                    {" :)"}
                  </span>
                  {/* {userData.role && (
                    <span className="text-xs text-muted-foreground capitalize">
                      {userData.role.toLowerCase()}
                    </span>
                  )} */}
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <br />
        {shouldShowDashboard() && <NavMain items={data.navMain} />}

        {filteredManagementItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredManagementItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                    >
                      <Link to={item.url}>
                        {item.icon && <item.icon />}
                        <span className="text-lg">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {shouldShowContents() && <NavMain items={data.navContents} />}
        {/* <NavDocuments items={data.documents} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}

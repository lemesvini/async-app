import * as React from "react";
import {
  IconDashboard,
  IconInnerShadowTop,
  IconUsers,
  IconBriefcase,
  IconSchool,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";

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
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
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
      title: "Turmas",
      url: "/turmas",
      icon: IconSchool,
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
  user?: {
    name: string;
    email: string;
    avatar?: string;
    fullName?: string;
  };
}) {
  // Use passed user or fallback to default data
  const userData = user || data.user;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Async.</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}

import { type Icon } from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { ChevronRight } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

interface NavItem {
  title: string;
  url?: string;
  icon?: Icon;
  items?: NavItem[];
}

export function NavMain({ items }: { items: NavItem[] }) {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(["Dashboard"]);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const renderNavItem = (item: NavItem) => {
    const isActive = item.url ? location.pathname === item.url : false;
    const hasChildren = item.items && item.items.length > 0;
    const isExpanded = expandedItems.includes(item.title);

    if (hasChildren) {
      return (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={isActive}
            onClick={() => toggleExpanded(item.title)}
            className="cursor-pointer"
          >
            {item.icon && <item.icon />}
            <span className="text-lg">{item.title}</span>
            <ChevronRight
              className={`ml-auto h-4 w-4 transition-transform duration-200 ${
                isExpanded ? "rotate-90" : ""
              }`}
            />
          </SidebarMenuButton>
          {isExpanded && (
            <SidebarMenuSub>
              {item.items?.map((subItem) => (
                <div key={subItem.title}>
                  {subItem.items ? (
                    // Handle nested groups (like Management)
                    <div className="mb-2">
                      <div className="px-2 py-1 text-xs font-medium text-sidebar-foreground/70">
                        {subItem.title}
                      </div>
                      {subItem.items.map((nestedItem) => (
                        <SidebarMenuSubItem key={nestedItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={
                              nestedItem.url
                                ? location.pathname === nestedItem.url
                                : false
                            }
                          >
                            <Link to={nestedItem.url || "#"}>
                              {nestedItem.icon && <nestedItem.icon />}
                              <span className="text-lg">
                                {nestedItem.title}
                              </span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </div>
                  ) : (
                    // Handle direct sub-items
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        asChild
                        isActive={
                          subItem.url
                            ? location.pathname === subItem.url
                            : false
                        }
                      >
                        <Link to={subItem.url || "#"}>
                          {subItem.icon && <subItem.icon />}
                          <span className="text-lg">{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  )}
                </div>
              ))}
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton tooltip={item.title} asChild isActive={isActive}>
          <Link to={item.url || "#"}>
            {item.icon && <item.icon />}
            <span className="text-lg">{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>{items.map((item) => renderNavItem(item))}</SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

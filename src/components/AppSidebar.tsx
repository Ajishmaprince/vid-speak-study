import { LayoutDashboard, MessageSquare, Calendar, FileEdit, FileText, HelpCircle, Clock, Image, Trophy, Users } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/" },
  { title: "AI Chatbot", icon: MessageSquare, path: "/chat" },
  { title: "Study Planner", icon: Calendar, path: "/planner" },
  { title: "Notes Generator", icon: FileEdit, path: "/notes-generator" },
  { title: "Notes Summarizer", icon: FileText, path: "/upload" },
  { title: "Q&A Generator", icon: HelpCircle, path: "/qa-generator" },
  { title: "Last Minute Revision Kit", icon: Clock, path: "/revision" },
  { title: "Visuals Generator", icon: Image, path: "/visuals" },
  { title: "Quiz Generator", icon: Trophy, path: "/games" },
  { title: "Study Timer", icon: Clock, path: "/study-timer" },
  { title: "Study Club", icon: Users, path: "/study-club" },
];

export const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50 bg-gradient-to-b from-card/95 to-background/95 backdrop-blur-xl">
      <SidebarContent className="pt-20">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-4">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    isActive={isActive(item.path)}
                    className={cn(
                      "transition-all hover:scale-105",
                      isActive(item.path) && "bg-primary/10 text-primary font-semibold border-l-4 border-primary shadow-accent"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

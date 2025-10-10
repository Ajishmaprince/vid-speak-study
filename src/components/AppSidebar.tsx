import { LayoutDashboard, MessageSquare, Calendar, FileEdit, FileText, HelpCircle, Clock, Image, Trophy, Users } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

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
  { title: "Study Club", icon: Users, path: "/study-club" },
];

export const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-[hsl(220,40%,12%)] to-[hsl(220,40%,8%)] border-r border-white/10 z-50 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">SB</span>
          </div>
          <span className="font-bold text-xl text-white">StudyBuddy AI</span>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left",
                isActive(item.path)
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.title}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

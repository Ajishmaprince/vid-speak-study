import { Button } from "@/components/ui/button";
import { Home, MessageSquare, Upload } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">SB</span>
          </div>
          <span className="font-bold text-lg text-foreground">StudyBuddy AI</span>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={isActive("/") ? "default" : "ghost"}
            size="sm"
            onClick={() => navigate("/")}
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
          <Button
            variant={isActive("/chat") ? "default" : "ghost"}
            size="sm"
            onClick={() => navigate("/chat")}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat
          </Button>
          <Button
            variant={isActive("/upload") ? "default" : "ghost"}
            size="sm"
            onClick={() => navigate("/upload")}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>
    </nav>
  );
};

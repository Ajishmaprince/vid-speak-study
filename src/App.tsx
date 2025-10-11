import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Upload from "./pages/Upload";
import Games from "./pages/Games";
import StudyPlanner from "./pages/StudyPlanner";
import NotesGenerator from "./pages/NotesGenerator";
import QAGenerator from "./pages/QAGenerator";
import RevisionKit from "./pages/RevisionKit";
import VisualsGenerator from "./pages/VisualsGenerator";
import StudyClub from "./pages/StudyClub";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<><AppSidebar /><Dashboard /></>} />
          <Route path="/chat" element={<><AppSidebar /><Chat /></>} />
          <Route path="/planner" element={<><AppSidebar /><StudyPlanner /></>} />
          <Route path="/notes-generator" element={<><AppSidebar /><NotesGenerator /></>} />
          <Route path="/upload" element={<><AppSidebar /><Upload /></>} />
          <Route path="/qa-generator" element={<><AppSidebar /><QAGenerator /></>} />
          <Route path="/revision" element={<><AppSidebar /><RevisionKit /></>} />
          <Route path="/visuals" element={<><AppSidebar /><VisualsGenerator /></>} />
          <Route path="/games" element={<><AppSidebar /><Games /></>} />
          <Route path="/study-club" element={<><AppSidebar /><StudyClub /></>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
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
        <AppSidebar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/planner" element={<StudyPlanner />} />
          <Route path="/notes-generator" element={<NotesGenerator />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/qa-generator" element={<QAGenerator />} />
          <Route path="/revision" element={<RevisionKit />} />
          <Route path="/visuals" element={<VisualsGenerator />} />
          <Route path="/games" element={<Games />} />
          <Route path="/study-club" element={<StudyClub />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

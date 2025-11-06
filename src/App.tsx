import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
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
import StudyTimer from "./pages/StudyTimer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider defaultOpen={false}>
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div className="flex-1">
        <Header />
        <main className="w-full">{children}</main>
      </div>
    </div>
  </SidebarProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/chat" element={<AppLayout><Chat /></AppLayout>} />
          <Route path="/planner" element={<AppLayout><StudyPlanner /></AppLayout>} />
          <Route path="/notes-generator" element={<AppLayout><NotesGenerator /></AppLayout>} />
          <Route path="/upload" element={<AppLayout><Upload /></AppLayout>} />
          <Route path="/qa-generator" element={<AppLayout><QAGenerator /></AppLayout>} />
          <Route path="/revision" element={<AppLayout><RevisionKit /></AppLayout>} />
          <Route path="/visuals" element={<AppLayout><VisualsGenerator /></AppLayout>} />
          <Route path="/games" element={<AppLayout><Games /></AppLayout>} />
          <Route path="/study-club" element={<AppLayout><StudyClub /></AppLayout>} />
          <Route path="/study-timer" element={<AppLayout><StudyTimer /></AppLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

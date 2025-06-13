
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ExamLevel from "./pages/ExamLevel";
import Departments from "./pages/Departments";
import Registration from "./pages/Registration";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/exam-level" element={<ExamLevel />} />
          <Route path="/departments" element={<Departments />} />
          {/* Add department routes */}
          <Route path="/science" element={<Departments />} />
          <Route path="/arts" element={<Departments />} />
          <Route path="/commercial" element={<Departments />} />
          <Route path="/technical" element={<Departments />} />
          <Route path="/register/:department" element={<Registration />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

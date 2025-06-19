import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { PageTransition } from "@/components/page-transition";
import Index from "./pages/Index";
import ExamLevel from "./pages/ExamLevel";
import Departments from "./pages/Departments";
import Registration from "./pages/Registration";
import PaymentSuccess from "./pages/PaymentSuccess";
import NotFound from "./pages/NotFound";
import { RouterProvider } from 'react-router-dom';
import { adminRoutes } from "./routes/admin";
import TestPage from "./pages/TestPage";

const queryClient = new QueryClient();

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={
      <PageTransition>
        <Index />
      </PageTransition>
    } />
    <Route path="/test" element={
      <PageTransition>
        <TestPage />
      </PageTransition>
    } />
    <Route path="/exam-level" element={
      <PageTransition>
        <ExamLevel />
      </PageTransition>
    } />
    <Route path="/departments" element={
      <PageTransition>
        <Departments />
      </PageTransition>
    } />
    <Route path="/science" element={
      <PageTransition>
        <Registration />
      </PageTransition>
    } />
    <Route path="/arts" element={
      <PageTransition>
        <Registration />
      </PageTransition>
    } />
    <Route path="/commercial" element={
      <PageTransition>
        <Registration />
      </PageTransition>
    } />
    <Route path="/technical" element={
      <PageTransition>
        <Registration />
      </PageTransition>
    } />
    <Route path="/register/:department" element={
      <PageTransition>
        <Registration />
      </PageTransition>
    } />
    {adminRoutes.map((route) => (
      <Route key={route.path} path={route.path} element={route.element}>
        {route.children?.map((child) => (
          <Route 
            key={child.path || 'index'} 
            index={child.path === undefined}
            path={child.path}
            element={child.element} 
          />
        ))}
      </Route>
    ))}
    <Route path="/payment/success" element={
      <PageTransition>
        <PaymentSuccess />
      </PageTransition>
    } />
    <Route path="*" element={
      <PageTransition>
        <NotFound />
      </PageTransition>
    } />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background text-foreground">
            <AppRoutes />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

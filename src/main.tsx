import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { useEffect, useState } from 'react';
import { AuthProvider } from '@/lib/auth';

// This prevents hydration mismatch errors by only rendering the app on the client side
function Main() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <Main />
);

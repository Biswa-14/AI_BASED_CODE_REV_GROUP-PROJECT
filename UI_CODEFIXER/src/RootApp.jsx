import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { SiteNavigation } from './components/site-navigation';
import { HomePage } from './pages/home-page';
import { LoginPage } from './pages/login-page';

export default function RootApp() {
  useEffect(() => {
    document.title = 'Sentient CodeFixer';
  }, []);

  return (
    <div className="app-shell">
      <div className="app-background" aria-hidden="true" />

      <div className="relative z-10 min-h-screen">
        <SiteNavigation />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Dashboard from "@/pages/Dashboard";
import CardSearch from "./components/CardSearch";
import CollectionPage from './pages/CollectionPage';
import Login from './pages/Login';
import Layout from './components/Layout';
import PublicDisplayCase from './pages/PublicDisplayCase';
import DisplayCases from './pages/DisplayCases';
import DisplayCasePage from './pages/DisplayCasePage';
import Home from './pages/index';
import { ProtectedRoute } from './components/ProtectedRoute';

const App: React.FC = () => {
  console.log('App component rendering...');
  
  return (
    <>
      <Layout>
        <Routes>
          <Route 
            path="/" 
            element={<Home />} 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/collection" 
            element={
              <ProtectedRoute>
                <CollectionPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/login" 
            element={<Login />} 
          />
          <Route 
            path="/display-cases" 
            element={<DisplayCases />} 
          />
          <Route 
            path="/display-case/:id" 
            element={<DisplayCasePage />} 
          />
          <Route 
            path="/display/:publicId" 
            element={<PublicDisplayCase />} 
          />
        </Routes>
      </Layout>
      <Toaster position="top-right" />
    </>
  );
};

export default App;
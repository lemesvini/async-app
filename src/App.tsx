import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { StudentsPage } from "./pages/StudentsPage";
import { ConsultantsPage } from "./pages/ConsultantsPage";
import { TurmasPage } from "./pages/TurmasPage";
import { ContentsPage } from "./pages/ContentsPage";
import { PaymentsPage } from "./pages/PaymentsPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/sonner";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alunos"
          element={
            <ProtectedRoute>
              <StudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/consultants"
          element={
            <ProtectedRoute>
              <ConsultantsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/turmas"
          element={
            <ProtectedRoute>
              <TurmasPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contents"
          element={
            <ProtectedRoute>
              <ContentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <PaymentsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;

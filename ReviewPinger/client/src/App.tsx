import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/ui/theme-provider"
import { Toaster } from "./components/ui/toaster"
import { AuthProvider } from "./contexts/AuthContext"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { Layout } from "./components/Layout"
import { BlankPage } from "./pages/BlankPage"
import { Dashboard } from "./pages/Dashboard"
import { SMSForm } from "./pages/SMSForm"
import { MessageHistory } from "./pages/MessageHistory"
import { Reports } from "./pages/Reports"
import { AdminSettings } from "./pages/AdminSettings"
import { Profile } from "./pages/Profile"
import { SMSTemplates } from "./pages/SMSTemplates"

function App() {
  return (
  <AuthProvider>
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute> <Layout /> </ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="sms" element={<SMSForm />} />
            <Route path="history" element={<MessageHistory />} />
            <Route path="reports" element={<Reports />} />
            <Route path="admin" element={<AdminSettings />} />
            <Route path="templates" element={<SMSTemplates />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<BlankPage />} />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  </AuthProvider>
  )
}

export default App
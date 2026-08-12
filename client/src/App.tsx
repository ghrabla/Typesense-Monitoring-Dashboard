import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { GuestRoute } from './components/GuestRoute'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { CollectionsPage } from './pages/CollectionsPage'
import { CollectionDetailPage } from './pages/CollectionDetailPage'
import { AliasesPage } from './pages/AliasesPage'
import { SynonymsPage } from './pages/SynonymsPage'
import { OverridesPage } from './pages/OverridesPage'
import { ApiKeysPage } from './pages/ApiKeysPage'
import { ServerInfoPage } from './pages/ServerInfoPage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/collections"
          element={
            <ProtectedRoute>
              <Layout>
                <CollectionsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/collections/:name"
          element={
            <ProtectedRoute>
              <Layout>
                <CollectionDetailPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/aliases"
          element={
            <ProtectedRoute>
              <Layout>
                <AliasesPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/synonyms"
          element={
            <ProtectedRoute>
              <Layout>
                <SynonymsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/overrides"
          element={
            <ProtectedRoute>
              <Layout>
                <OverridesPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/api-keys"
          element={
            <ProtectedRoute>
              <Layout>
                <ApiKeysPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/server"
          element={
            <ProtectedRoute>
              <Layout>
                <ServerInfoPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App

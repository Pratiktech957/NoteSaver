import { Routes, Route } from "react-router-dom";

import Landing from "./Pages/Landing";
import Register from "./Pages/Register";
import Login from "./Pages/Login";

import Dashboard from "./Pages/Dashboard";
import AdminDashboard from "./Pages/AdminDashboard";

import UploadNote from "./Pages/UploadNote";
import NotesList from "./Pages/NotesList";
import MyNotes from "./Pages/MyNotes";

import AdminNotes from "./Pages/AdminNotes";
import AdminUsers from "./Pages/AdminUsers";

import Profile from "./Pages/Profile";
import Categories from "./Pages/Categories";

import Notifications from "./Pages/Notifications";
import Reports from "./Pages/Reports";
import Analytics from "./Pages/Analytics";
import Settings from "./Pages/Settings";

import ProtectedRoute from "./Components/ProtectedRoute";
import AdminRoute from "./Components/AdminRoute";
import NoteViewer from "./Pages/NoteViewer";
import AdminCategories from "./Pages/AdminCategories";
import AdminNotifications from "./Pages/AdminNotifications";

function App() {
  return (
    <Routes>

      <Route
        path="/"
        element={<Landing />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/login"
        element={<Login />}
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
        path="/upload"
        element={
          <ProtectedRoute>
            <UploadNote />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notes"
        element={
          <ProtectedRoute>
            <NotesList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-notes"
        element={
          <ProtectedRoute>
            <MyNotes />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <Categories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/note/:id"
        element={
          <ProtectedRoute>
            <NoteViewer />
          </ProtectedRoute>
        }
      />


      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/notes"
        element={
          <AdminRoute>
            <AdminNotes />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/reports"
        element={
          <AdminRoute>
            <Reports />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/analytics"
        element={
          <AdminRoute>
            <Analytics />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/categories"
        element={
          <AdminRoute>
            <AdminCategories />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/notifications"
        element={
          <AdminRoute>
            <AdminNotifications />
          </AdminRoute>
        }
      />

    </Routes>
  );
}

export default App;
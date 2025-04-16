import axios from "axios";
import {
  // Link,
  // Outlet,
  Navigate,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";

import "./App.css";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  axios.defaults.baseURL = "https://talk-to-me-anand.onrender.com";
  // axios.defaults.baseURL = "http://localhost:5000";
  axios.defaults.withCredentials = true;

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
          errorElement={<NotFoundPage />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:id" element={<Chat />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    )
  );

  return <RouterProvider router={router} />;
}

export default App;

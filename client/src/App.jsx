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
import Error from "./pages/Error";
import Chat from "./pages/Chat";

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
          errorElement={<Error />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:id" element={<Chat />} />
        <Route path="*" element={<Error />} />
      </Route>
    )
  );

  return <RouterProvider router={router} />;
}

export default App;

import {useState} from "react";
import axios from "axios";
import {
  Navigate,
  Outlet,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Error from "./pages/Error";
import Chat from "./pages/Chat";

const Layout = () => {
  return (
    <>
      {/* <Register /> */}
      <Outlet />
    </>
  );
};

function App() {
  axios.defaults.baseURL = "https://talk-to-me-anand.onrender.com";
  axios.defaults.withCredentials = true;

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route path="/" element={<Layout />} errorElement={<Error />}>
          <Route index element={<Navigate to="/login" />}></Route>
          <Route path="/chat" element={<Chat />}></Route>
          <Route path="/chat/:id" element={<Chat />}></Route>
        </Route>
        <Route path="/register" element={<Register />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/*" element={<Error />}></Route>
      </Route>
    )
  );

  return <RouterProvider router={router} />;
}

export default App;

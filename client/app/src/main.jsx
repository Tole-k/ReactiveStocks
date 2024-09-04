import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './routes/root.jsx'
import ErrorPage from './error-page.jsx';
import Root from './routes/root.jsx';
import FollowedStocks from './routes/FollowedStocks.jsx';
import Portfolio from './routes/Portfolio.jsx';
import Login from './routes/login.jsx';
import Logout from './routes/logout.jsx';
import Home from './routes/home.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/follow",
        element: <FollowedStocks />,
      },
      {
        path: "/portfolio",
        element: <Portfolio />,
      },
      {
        path: "user_auth",
        element: <Home />,
      },
      {
        path: "user_auth/login",
        element: <Login />,
      },
      {
        path: "user_auth/logout",
        element: <Logout />,
      },
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

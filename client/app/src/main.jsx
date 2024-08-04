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
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/followed-stocks",
        element: <FollowedStocks />,
      },
      {
        path: "/portfolio",
        element: <Portfolio />,
      }
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>
);

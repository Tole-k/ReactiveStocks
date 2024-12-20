import { createBrowserRouter } from 'react-router-dom';
import ErrorPage from './error-page';
import FollowedStocks from './routes/FollowedStocks';
import Login from './routes/login';
import Logout from './routes/logout';
import PieCharts from './routes/pieChart';
import Portfolio from './routes/Portfolio';
import App from './App';

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: "/",
                element: <FollowedStocks />
            },
            {
                path: "/follow",
                element: <FollowedStocks />,
            },
            {
                path: "/portfolio",
                element: <Portfolio />,
            },
            {
                path: "/pieChart",
                element: <PieCharts />,
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
export default router;
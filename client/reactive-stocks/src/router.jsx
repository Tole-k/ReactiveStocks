import { createBrowserRouter } from 'react-router-dom';
import ErrorPage from './error-page';
import FollowedStocks from './routes/FollowedStocks';
import Login from './routes/login';
import Logout from './routes/logout';
import PieCharts from './routes/pieChart';
import Portfolio from './routes/Portfolio';
import App from './App';
import NotFound from './not-found';
import ProtectedRoute from './components/ProtectedRoute';

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: "/",
                element: <ProtectedRoute>
                    <FollowedStocks />
                </ProtectedRoute>
            },
            {
                path: "/follow",
                element: <ProtectedRoute>
                    <FollowedStocks />
                </ProtectedRoute>
            },
            {
                path: "/portfolio",
                element: <ProtectedRoute>
                    <Portfolio />
                </ProtectedRoute>
            },
            {
                path: "/pieChart",
                element: <ProtectedRoute>
                    <PieCharts />
                </ProtectedRoute>
            },
            {
                path: "user_auth/login",
                element: <Login />,
            },
            {
                path: "user_auth/logout",
                element: <ProtectedRoute>
                    <Logout />
                </ProtectedRoute>
            },
        ],
    }, {
        'path': '*',
        'element': <NotFound />
    }
]);
export default router;
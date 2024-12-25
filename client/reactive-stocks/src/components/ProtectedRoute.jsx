import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { checkAuth } from '../utils/auth';

function ProtectedRoute({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const auth = await checkAuth();
                setIsAuthenticated(auth);
            } catch {
                setIsAuthenticated(false);
            }
        }
        fetchData();
    }, []);

    if (isAuthenticated === null) {
        return <div></div>;
    }

    return isAuthenticated ? children : <Navigate to="/user_auth/login" />;
}

export default ProtectedRoute;
// Import the react JS packages
import { useEffect, useState } from "react";
import axios from '../axiosConfig';

// Define the Home function.
export default function Home() {
    const [message, setMessage] = useState('');
    const accessToken = localStorage.getItem('access_token');

    useEffect(() => {
        (async () => {
            try {
                const { data } = await axios.get(
                    'http://localhost:8000/user_auth/whoami/', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
                );
                setMessage(data.username);
            } catch (e) {
                console.log('Error during authentication:', e);
                if (e.response && e.response.status === 401) {
                    console.log('Unauthorized, redirecting to login.');
                    window.location.href = '/user_auth/login';
                }
            }
        })();
    }, [accessToken]);

    return (
        <div className="form-signin mt-5 text-center">
            <h3>Hi {message}</h3>
        </div>
    );
}
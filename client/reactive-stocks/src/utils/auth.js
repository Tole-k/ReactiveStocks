import axios from '../axiosConfig';

export async function checkAuth(accessToken, navigate) {
    try {
        const response = await axios.get("http://127.0.0.1:8000/user_auth/whoami/", {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (response.status === 200) {
            return true;
        }
    } catch {
        navigate('/user_auth/login');
        return false;
    }
}

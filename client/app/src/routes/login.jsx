// Import the react JS packages 
import axios from "axios";
import { useState } from "react";
// Define the Login function.
export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    // Create the submit method.
    const submit = async e => {
        e.preventDefault();
        const user = {
            username: username,
            password: password
        };
        console.log(user);
        console.log(password)

        // Create the POST request
        try {
            const resposne = await axios.post('http://localhost:8000/token/', user, {
                headers: {
                    'Content-Type': 'application/json',
                }, withCredentials: true
            });
            const { access, refresh } = resposne.data;
            // Initialize the access & refresh token in localstorage.      
            localStorage.clear();
            console.log(access, refresh);
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            axios.defaults.headers.common['Authorization'] =
                `Bearer ${access}`;
            window.location.href = '/user_auth'
        } catch (e) {
            console.log('login not working', e)
        }
    }
    return (
        <div className="Auth-form-container">
            <form className="Auth-form" onSubmit={submit}>
                <div className="Auth-form-content">
                    <h3 className="Auth-form-title">Sign In</h3>
                    <div className="form-group mt-3">
                        <label>Username</label>
                        <input className="form-control mt-1"
                            placeholder="Enter Username"
                            name='username'
                            type='text' value={username}
                            required
                            onChange={e => setUsername(e.target.value)} />
                    </div>
                    <div className="form-group mt-3">
                        <label>Password</label>
                        <input name='password'
                            type="password"
                            className="form-control mt-1"
                            placeholder="Enter password"
                            value={password}
                            required
                            onChange={e => setPassword(e.target.value)} />
                    </div>
                    <div className="d-grid gap-2 mt-3">
                        <button type="submit"
                            className="btn btn-primary">Submit</button>
                    </div>
                </div>
            </form>
        </div>
    )
}

import axios from '../axiosConfig';
import { useState } from "react";
export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const login = async e => {
        e.preventDefault();
        const user = {
            username,
            password
        };

        try {
            const response = await axios.post('http://localhost:8000/token/', user, {
                headers: {
                    'Content-Type': 'application/json',
                }, withCredentials: true
            });
            const { access, refresh } = response.data;
            localStorage.clear();
            console.log(access, refresh);
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            axios.defaults.headers.common['Authorization'] =
                `Bearer ${access}`;
            window.location.href = '/follow'
        } catch (e) {
            console.log('login not working', e)
        }
    }
    const register = async e => {
        e.preventDefault();
        const user = {
            username,
            email,
            password,
            confirm_password: repeatPassword
        };

        try {
            const response = await axios.post('http://localhost:8000/user_auth/register/', user, {
                headers: {
                    'Content-Type': 'application/json',
                }, withCredentials: true
            });
            if (response.status === 201) {
                console.log('User created');
                login(e);
            }
            else {
                console.log('User not created');
                console.log(response['message']);
            }
        } catch (e) {
            console.log('Register not working', e)
        }
    }
    return (
        <div className="Auth-form-container">
            <form className="Auth-form" onSubmit={login}>
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
                            className="btn btn-primary" onClick={login}>Submit</button>
                    </div>
                </div>
            </form>
            <form className="Auth-form" onSubmit={login}>
                <div className="Auth-form-content">
                    <h3 className="Auth-form-title">Sign Up</h3>
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
                        <label>Email</label>
                        <input className="form-control mt-1"
                            placeholder="Enter Email"
                            name='email'
                            type='text' value={email}
                            required
                            onChange={e => setEmail(e.target.value)} />
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
                    <div className="form-group mt-3">
                        <label>Confirm Password</label>
                        <input name='confirm-password'
                            type="password"
                            className="form-control mt-1"
                            placeholder="Confirm password"
                            value={repeatPassword}
                            required
                            onChange={e => setRepeatPassword(e.target.value)} />
                    </div>
                    <div className="d-grid gap-2 mt-3">
                        <button type="submit"
                            className="btn btn-primary" onClick={register}>Submit</button>
                    </div>
                </div>
            </form>
        </div>
    )
}

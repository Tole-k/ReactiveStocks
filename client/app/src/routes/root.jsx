import { Outlet } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useState, useEffect } from 'react';
export default function Root() {
    const [isAuth, setIsAuth] = useState(false);
    useEffect(() => {
        if (localStorage.getItem('access_token') !== null) {
            setIsAuth(true);
        }
    }, [isAuth]);
    return (
        <>
            <Navbar expand="lg" className="bg-body-tertiary">
                <Container>
                    <Navbar.Brand>
                        Stock App
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            {isAuth ? <Nav.Link href="/user_auth">
                                Home
                            </Nav.Link> : null}
                            {isAuth ? <Nav.Link href="/follow">
                                Followed Stocks
                            </Nav.Link> : null}
                            {isAuth ? <Nav.Link href="/portfolio">
                                Portfolio
                            </Nav.Link> : null}
                        </Nav>
                    </Navbar.Collapse>
                    <Navbar.Collapse className="justify-content-end">
                        <Nav>
                            {isAuth ? (
                                <Nav.Link href="/user_auth/logout">
                                    Logout
                                </Nav.Link>
                            ) : (
                                <Nav.Link href="/user_auth/login">
                                    Login
                                </Nav.Link>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <div id="detail">
                <Outlet />
            </div>
        </>
    );
}
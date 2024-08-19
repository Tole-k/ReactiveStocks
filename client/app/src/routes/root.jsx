import { Outlet } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useState } from 'react';
export default function Root() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
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
                            <Nav.Link href="/follow">
                                Followed Stocks
                            </Nav.Link>
                            <Nav.Link href="/portfolio">
                                Portfolio
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                    <Navbar.Collapse className="justify-content-end">
                        <Nav>
                            {isAuthenticated ? (
                                <Nav.Link href="/user_auth">
                                    Logout
                                </Nav.Link>
                            ) : (
                                <Nav.Link href="/user_auth">
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
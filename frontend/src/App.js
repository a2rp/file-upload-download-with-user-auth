import { useEffect, useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import "./App.css";
import styles from "./styles.module.scss";
import { Welcome, Login, Register, Dashboard, Logout } from "./pages";
import DownloadFile from "./pages/downloadFile/DownloadFile";

function App() {
    const [userLoggedIn, setUserLoggedIn] = useState(() => Boolean(window.localStorage.getItem("token")));

    useEffect(() => {
        const updateAuthentication = () => setUserLoggedIn(Boolean(window.localStorage.getItem("token")));
        window.addEventListener("authchange", updateAuthentication);
        window.addEventListener("storage", updateAuthentication);
        return () => {
            window.removeEventListener("authchange", updateAuthentication);
            window.removeEventListener("storage", updateAuthentication);
        };
    }, []);

    const linkStyle = ({ isActive }) => ({ color: isActive ? "aqua" : "#fff" });

    return (
        <div className={styles.container}>
            <header className={styles.headerContainer}>
                <NavLink to="/home" className={styles.appName} style={linkStyle}>File Gallery</NavLink>
                <nav className={styles.navLinksContainer} aria-label="Main navigation">
                    {userLoggedIn ? <>
                        <NavLink className={styles.navLink} to="/dashboard" style={linkStyle}>DASHBOARD</NavLink>
                        <NavLink className={styles.navLink} to="/logout" style={linkStyle}>LOG OUT</NavLink>
                    </> : <>
                        <NavLink className={styles.navLink} to="/login" style={linkStyle}>LOGIN</NavLink>
                        <NavLink className={styles.navLink} to="/register" style={linkStyle}>REGISTER</NavLink>
                    </>}
                </nav>
            </header>
            <main className={styles.contentContainer}>
                <Routes>
                    <Route path="/" element={<Welcome />} />
                    <Route path="/home" element={<Welcome />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/logout" element={<Logout />} />
                    <Route path="/download-file/:id" element={<DownloadFile />} />
                    <Route path="*" element={<Welcome />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;

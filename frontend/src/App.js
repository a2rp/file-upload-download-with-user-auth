import { NavLink, Route, Routes } from 'react-router-dom';
import './App.css';
import styles from "./styles.module.scss";

import { Welcome, Login, Register, Dashboard, Logout } from "./pages";
import { useEffect, useState } from 'react';
import DownloadFile from './pages/downloadFile/DownloadFile';

function App() {
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    useEffect(() => {
        const token = window.localStorage.getItem("token");
        if (token && token.length > 0) {
            setUserLoggedIn(true);
        } else {
            setUserLoggedIn(false);
        }
    }, [window.localStorage.getItem("token")]);

    return (
        <div className={styles.container}>
            <div className={styles.headerContainer}>
                <NavLink to="/home" className={styles.appName} style={({ isActive }) => ({
                    color: isActive ? "aqua" : '#fff'
                })}>File Gallery</NavLink>
                <div className={styles.navLinksContainer}>
                    {userLoggedIn === false ? <>
                        <NavLink className={styles.navLink} to="/login" style={({ isActive }) => ({
                            color: isActive ? "aqua" : '#fff'
                        })}>LOGIN</NavLink>
                        <NavLink className={styles.navLink} to="/register" style={({ isActive }) => ({
                            color: isActive ? "aqua" : '#fff'
                        })}>REGISTER</NavLink>
                    </> : <>
                        <NavLink className={styles.navLink} to="/dashboard" style={({ isActive }) => ({
                            color: isActive ? "aqua" : '#fff'
                        })}>DASHBOARD</NavLink>
                        <NavLink className={styles.navLink} to="/logout" style={({ isActive }) => ({
                            color: isActive ? "aqua" : '#fff'
                        })}>LOG OUT</NavLink>
                    </>}
                </div>
            </div>
            <div className={styles.contentContainer}>
                <Routes>
                    <Route path="/" element={<Welcome />} />
                    <Route path="/home" element={<Welcome />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/logout" element={<Logout />} />
                    <Route path="/download-file/:id" element={<DownloadFile />} />
                </Routes>
            </div>
        </div>
    );
}

export default App;

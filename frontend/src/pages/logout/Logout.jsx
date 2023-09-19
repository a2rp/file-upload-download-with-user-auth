import React, { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom';

const Logout = () => {
    const navigate = useNavigate(null);

    const clearToken = () => {
        const getToken = window.localStorage.getItem("token");
        if (getToken && getToken.length > 0) {
            window.localStorage.clear();
            window.location.reload();
        }
    };
    useEffect(() => {
        clearToken();
    }, []);

    return (
        <div style={{ padding: "15px" }}>
            Logout Successful
        </div>
    )
}

export default Logout

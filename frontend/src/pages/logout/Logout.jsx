import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.localStorage.removeItem("token");
        window.dispatchEvent(new Event("authchange"));
        navigate("/home", { replace: true });
    }, [navigate]);

    return <p role="status" style={{ padding: "15px" }}>You have been logged out.</p>;
};

export default Logout;

import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./styles.module.scss";

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [inputs, setInputs] = useState({ username: "", password: "" });
    const [message, setMessage] = useState(location.state?.message || "");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (window.localStorage.getItem("token")) {
            navigate("/dashboard", { replace: true });
        }
    }, [navigate]);

    const handleChange = (event) => {
        setInputs((current) => ({ ...current, [event.target.name]: event.target.value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (inputs.username.trim().length < 3 || inputs.username.trim().length > 15 || !inputs.password) {
            setMessage("Enter a valid username and password.");
            return;
        }

        setSubmitting(true);
        setMessage("");
        try {
            const response = await axios.post("/api/login", { ...inputs, username: inputs.username.trim() });
            if (!response.data.success || !response.data.token) {
                setMessage(response.data.message || "Could not log in.");
                return;
            }

            window.localStorage.setItem("token", response.data.token);
            window.dispatchEvent(new Event("authchange"));
            navigate("/dashboard", { replace: true });
        } catch (error) {
            setMessage(error.response?.data?.message || error.message || "Could not log in.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit}>
                <h1>Log in</h1>
                <label>Username<input autoComplete="username" name="username" onChange={handleChange} required value={inputs.username} /></label>
                <label>Password<input autoComplete="current-password" name="password" onChange={handleChange} required type="password" value={inputs.password} /></label>
                {message && <p className={styles.response} role="alert">{message}</p>}
                <button disabled={submitting} type="submit">{submitting ? "Logging in…" : "Log in"}</button>
            </form>
        </div>
    );
};

export default Login;

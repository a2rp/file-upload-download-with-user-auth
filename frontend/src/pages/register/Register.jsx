import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.scss";

const Register = () => {
    const navigate = useNavigate();
    const [inputs, setInputs] = useState({ username: "", password: "", confirmPassword: "" });
    const [message, setMessage] = useState("");
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
        const username = inputs.username.trim();

        if (username.length < 3 || username.length > 15) {
            setMessage("Username must be 3 to 15 characters.");
            return;
        }
        if (inputs.password.length < 6 || new TextEncoder().encode(inputs.password).length > 72) {
            setMessage("Password must be at least 6 characters and no more than 72 UTF-8 bytes.");
            return;
        }
        if (inputs.password !== inputs.confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        setSubmitting(true);
        setMessage("");
        try {
            const response = await axios.post("/api/register", { ...inputs, username });
            if (response.data.success) {
                navigate("/login", { replace: true, state: { message: "Account created. You can now log in." } });
            } else {
                setMessage(response.data.message || "Could not create the account.");
            }
        } catch (error) {
            setMessage(error.response?.data?.message || error.message || "Could not create the account.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit}>
                <h1>Create account</h1>
                <label>Username<input autoComplete="username" maxLength={15} name="username" onChange={handleChange} required value={inputs.username} /></label>
                <label>Password<input autoComplete="new-password" name="password" onChange={handleChange} required type="password" value={inputs.password} /></label>
                <label>Confirm password<input autoComplete="new-password" name="confirmPassword" onChange={handleChange} required type="password" value={inputs.confirmPassword} /></label>
                {message && <p className={styles.response} role="alert">{message}</p>}
                <button disabled={submitting} type="submit">{submitting ? "Creating account…" : "Create account"}</button>
            </form>
        </div>
    );
};

export default Register;

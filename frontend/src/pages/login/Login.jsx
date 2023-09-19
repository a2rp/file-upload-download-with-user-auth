import React, { useEffect, useRef, useState } from "react";
import styles from "./styles.module.scss";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate(null);
    const submitButton = useRef(null);

    const [inputs, setInputs] = useState({
        username: "",
        password: ""
    });
    const [response, setResponse] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();
        // console.log(inputs);

        if (inputs.username.trim().length < 3 || inputs.username.trim().length > 15) {
            setResponse("Username length must >=3 and <=15");
            return;
        }
        if (inputs.password.trim().length < 6) {
            setResponse("Password length must >=6");
            return;
        }

        submitButton.current.style.cssText = `
            display: none;
        `;
        const postData = {
            username: inputs.username,
            password: inputs.password
        };
        axios.post("http://localhost:1198/api/login", postData).then(response => {
            // console.log(response);
            if (response.data.success === true) {
                window.localStorage.clear();
                window.localStorage.setItem("token", response.data.token);
                navigate("/dashboard");
                window.location.reload();
            } else {
                alert(response.data.message);
            }
        }).catch(err => {
            console.log(err);
            setResponse(err.message);
        }).finally(() => {
            submitButton.current.style.cssText = `
                display: block;
            `;
        });
    };

    const handleChange = (event) => {
        setInputs(prev => ({ ...prev, [event.target.name]: event.target.value }));
    };

    useEffect(() => {
        const token = window.localStorage.getItem("token") || "";
        if (token.length > 0) {
            return navigate("/dashboard");
        }
    }, []);

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit}>
                <input type="text" name="username" placeholder="Username" onChange={handleChange} value={inputs.username} required />

                <input type="password" name="password" placeholder="Password" onChange={handleChange} value={inputs.password} required />

                <div className={styles.response}>{response}</div>

                <input ref={submitButton} type="submit" />
            </form>
        </div>
    )
}

export default Login

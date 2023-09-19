import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import styles from "./styles.module.scss";
import { v4 as uuid } from 'uuid';

const Dashboard = () => {
    const navigate = useNavigate(null);
    const [token, setToken] = useState(window.localStorage.getItem("token") || "");
    const [user, setUser] = useState("");

    useEffect(() => {
        if (token.length === 0) {
            return navigate("/login");
        }
        // console.log("token", token);

        const bearerToken = {
            idToken: "Bearer " + token
        };
        axios.post("http://localhost:1198/api/user", bearerToken).then(response => {
            // console.log(response.data);
            if (response.data.user) {
                setUser(user => response.data.user.username);
            }
        }).catch(error => {
            // console.log(error);
            alert(error.message);
        });
    }, []);

    const fileInputRef = useRef(null);
    const uploadFile = async (event) => {
        event.preventDefault();
        try {
            const formData = new FormData();
            const uniqueId = uuid();
            const smallId = uniqueId.slice(0, 6);
            formData.append("id", user);
            formData.append("name", smallId);
            formData.append("file", fileInputRef.current.files[0]);
            const res = await axios.post("http://localhost:1198/api/file/upload", formData);
            console.log(res);
            if (res.data.response.file) {
                window.location.reload();
            }
        } catch (error) {
            console.log(error);
            alert(error.message);
        }
    };

    const [files, setFiles] = useState("");
    const [loading, setLoading] = useState(false);
    const getFiles = async () => {
        // console.log(user);
        setLoading(true);
        try {
            const res = await axios.post("http://localhost:1198/api/file/files", { user });
            // console.log(res.data);
            setFiles(res.data.files);
            setLoading(false);
            // console.log(res.data.files);
        } catch (error) {
            // console.log(error);
            alert(error.message);
        }
    };

    useEffect(() => {
        if (user.length > 0) {
            getFiles();
        }
    }, [user]);

    const deleteFile = async (id, code) => {
        if (!window.confirm(`Delete file with code: ${code}`)) {
            return;
        }
        try {
            const response = await axios.post(`http://localhost:1198/api/file/delete/${id}`);
            // console.log(res);
            if (response.data.success) {
                window.location.reload();
            }
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    return (
        <div className={styles.container}>
            {user.length !== 0
                ? <div className={styles.userContent}>
                    Hi {user}
                    <hr />

                    {/* upload file */}
                    <div className={styles.uploadFile}>
                        <input type="file" ref={fileInputRef} />
                        <input type="button" onClick={uploadFile} className={styles.uploadSubmit} value="UPLOAD" />
                    </div>

                    {/* see all files */}
                    <div className={styles.files}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Unique Code</th>
                                    <th>File Name</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {files ?
                                    files.map((file) => (
                                        <tr key={file._id}>
                                            <td>
                                                <span>{file.code}</span>
                                            </td>
                                            <td>
                                                <span>{file.file.split("api\\uploads\\")}</span>
                                            </td>
                                            <td>
                                                <button className={styles.delete} onClick={() => deleteFile(file._id, file.code)}>
                                                    Delete File
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                    : <tr><td></td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
                : ""}
        </div>
    )
}

export default Dashboard

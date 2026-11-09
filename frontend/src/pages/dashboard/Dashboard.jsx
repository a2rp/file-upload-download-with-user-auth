import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.scss";

const authConfig = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

const Dashboard = () => {
    const navigate = useNavigate();
    const [token] = useState(() => window.localStorage.getItem("token") || "");
    const [user, setUser] = useState(null);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");
    const fileInputRef = useRef(null);

    const handleRequestError = useCallback((error) => {
        if (error.response?.status === 401) {
            window.localStorage.removeItem("token");
            window.dispatchEvent(new Event("authchange"));
            navigate("/login", { replace: true });
            return;
        }
        setMessage(error.response?.data?.message || error.message || "The request failed.");
    }, [navigate]);

    useEffect(() => {
        if (!token) {
            navigate("/login", { replace: true });
            return undefined;
        }

        let active = true;
        const config = authConfig(token);
        Promise.all([
            axios.get("/api/user", config),
            axios.get("/api/file/files", config),
        ]).then(([userResponse, fileResponse]) => {
            if (!active) return;
            setUser(userResponse.data.user);
            setFiles(fileResponse.data.files);
        }).catch((error) => {
            if (active) handleRequestError(error);
        }).finally(() => {
            if (active) setLoading(false);
        });

        return () => { active = false; };
    }, [token, navigate, handleRequestError]);

    const uploadFile = async (event) => {
        event.preventDefault();
        const selectedFile = fileInputRef.current?.files?.[0];
        if (!selectedFile) {
            setMessage("Choose a JPEG, PNG, or PDF file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);
        setBusy(true);
        setMessage("");

        try {
            const response = await axios.post("/api/file/upload", formData, authConfig(token));
            setFiles((current) => [response.data.file, ...current]);
            setMessage("File uploaded. Share the download page and access code with its recipient.");
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (error) {
            handleRequestError(error);
        } finally {
            setBusy(false);
        }
    };

    const deleteFile = async (file) => {
        if (!window.confirm(`Delete “${file.originalName}” from your gallery?`)) return;

        setBusy(true);
        setMessage("");
        try {
            await axios.delete(`/api/file/files/${file.id}`, authConfig(token));
            setFiles((current) => current.filter((item) => item.id !== file.id));
            setMessage("File deleted.");
        } catch (error) {
            handleRequestError(error);
        } finally {
            setBusy(false);
        }
    };

    if (loading) return <p className={styles.container} role="status">Loading your gallery…</p>;
    if (!user) return <p className={styles.container} role="alert">{message || "Could not load your gallery."}</p>;

    return (
        <section className={styles.container}>
            <div className={styles.userContent}>
                <h1>Hi {user.username}</h1>
                <p>Your files are private to your account. A share code gives access only to its matching file.</p>

                <form className={styles.uploadFile} onSubmit={uploadFile}>
                    <label htmlFor="file-upload">Upload a JPEG, PNG, or PDF (up to 5 MB)</label>
                    <input accept="image/jpeg,image/png,application/pdf" id="file-upload" ref={fileInputRef} type="file" />
                    <button className={styles.uploadSubmit} disabled={busy} type="submit">{busy ? "Please wait…" : "Upload file"}</button>
                </form>

                {message && <p className={styles.message} role="status">{message}</p>}

                <div className={styles.files}>
                    <table>
                        <thead>
                            <tr><th>Access code</th><th>File name</th><th>Download page</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {files.length ? files.map((file) => (
                                <tr key={file.id}>
                                    <td><code>{file.code}</code></td>
                                    <td>{file.originalName}</td>
                                    <td><a href={`${window.location.origin}/download-file/${file.id}`}>Open share page</a></td>
                                    <td><button className={styles.delete} disabled={busy} onClick={() => deleteFile(file)} type="button">Delete</button></td>
                                </tr>
                            )) : <tr><td colSpan="4">No files yet. Upload one above to get started.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};

export default Dashboard;

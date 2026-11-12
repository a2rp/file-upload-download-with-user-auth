import axios from "axios";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import styles from "./styles.module.scss";

const getDownloadName = (contentDisposition) => {
    const encodedName = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
    if (encodedName) {
        try {
            return decodeURIComponent(encodedName);
        } catch {
            // Fall through to the quoted ASCII filename.
        }
    }

    return contentDisposition.match(/filename="?([^";]+)"?/i)?.[1] || "download";
};

const DownloadFile = () => {
    const { id } = useParams();
    const [code, setCode] = useState("");
    const [status, setStatus] = useState("");
    const [isDownloading, setIsDownloading] = useState(false);
    const [hasError, setHasError] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsDownloading(true);
        setHasError(false);
        setStatus("Preparing your download…");

        try {
            const response = await axios.post(
                `/api/file/url-download/${encodeURIComponent(id)}`,
                { code: code.trim() },
                { responseType: "arraybuffer" },
            );
            const blob = new Blob([response.data], {
                type: response.headers["content-type"] || "application/octet-stream",
            });
            const objectUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = objectUrl;
            link.download = getDownloadName(response.headers["content-disposition"] || "");
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
            setStatus("Your download has started.");
        } catch (error) {
            setHasError(true);
            setStatus(
                error.response?.status === 404
                    ? "That file or access code was not found. Check the code and try again."
                    : "Could not download the file. Please try again.",
            );
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <section className={styles.container} aria-labelledby="download-title">
            <div className={styles.card}>
                <h1 id="download-title">Download a shared file</h1>
                <p>Enter the access code provided by the file owner.</p>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <label htmlFor="file-access-code">File access code</label>
                    <input
                        id="file-access-code"
                        type="text"
                        value={code}
                        onChange={(event) => setCode(event.target.value)}
                        autoComplete="off"
                        autoCapitalize="none"
                        spellCheck="false"
                        maxLength={48}
                        pattern="[a-f0-9]{48}"
                        title="Enter the 48-character access code."
                        required
                        aria-describedby={status ? "download-status" : undefined}
                    />
                    <button type="submit" disabled={isDownloading}>
                        {isDownloading ? "Preparing download…" : "Download file"}
                    </button>
                </form>
                {status && (
                    <p
                        id="download-status"
                        className={hasError ? styles.error : styles.status}
                        role={hasError ? "alert" : "status"}
                    >
                        {status}
                    </p>
                )}
                <Link to="/home">Back to File Gallery</Link>
            </div>
        </section>
    );
};

export default DownloadFile;

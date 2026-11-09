import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

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
    const [status, setStatus] = useState("Enter the access code provided by the file owner.");

    useEffect(() => {
        const code = window.prompt("Enter the file access code:", "");
        if (!code?.trim()) {
            setStatus("No access code was entered.");
            return;
        }

        const download = async () => {
            setStatus("Preparing your download…");
            try {
                const response = await axios.post(
                    `/api/file/url-download/${encodeURIComponent(id)}`,
                    { code: code.trim() },
                    { responseType: "arraybuffer" },
                );
                const blob = new Blob([response.data], { type: response.headers["content-type"] || "application/octet-stream" });
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
                setStatus(error.response?.status === 404 ? "That file or access code was not found." : "Could not download the file.");
            }
        };

        download();
    }, [id]);

    return (
        <section style={{ padding: "24px" }}>
            <p role="status">{status}</p>
            <Link to="/home">Back to File Gallery</Link>
        </section>
    );
};

export default DownloadFile;

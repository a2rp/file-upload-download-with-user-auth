import React, { useEffect, useState } from "react";
import styles from "./styles.module.scss";
import axios from "axios";
import { NavLink } from "react-router-dom";

const Welcome = () => {
    const [files, setFiles] = useState("");
    const [loading, setLoading] = useState(false);
    const getAllFiles = async () => {
        // console.log(user);
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:1198/api/file/all-files");
            setFiles(res.data.files);
            setLoading(false);
            // console.log(res.data.files);
        } catch (error) {
            // console.log(error);
            alert(error.message);
        }
    };
    useEffect(() => {
        getAllFiles();
    }, []);

    return (
        <div className={styles.container}>
            {/* see all files */}
            <div className={styles.files}>
                <table>
                    <thead>
                        <tr>
                            <th>Unique Code</th>
                            <th>File Name</th>
                            <th>Download URL</th>
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
                                        <span>{file.file}</span>
                                    </td>
                                    <td>
                                        <a href={`http://localhost:3000/download-file/${file._id}`}>http://localhost:3000/download-file/{file._id}</a>
                                    </td>
                                </tr>
                            ))
                            : <tr><td></td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Welcome

import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';

const DownloadFile = () => {
    const { id } = useParams();
    const [status, setStatus] = useState("");
    useEffect(() => {
        let code = prompt("Please enter the unique code:", "");
        if (code == null || code == "") {
            setStatus("Unique code not found");
            return;
        }

        setStatus("Downloading File. Please wait!");;
        downloadURLFile(id, code);
    }, []);

    const navigate = useNavigate();
    const downloadURLFile = async (id, code) => {
        try {
            const response = await axios.get(`http://localhost:1198/api/file/url-download/${id}/${code}`, { responseType: "arraybuffer" });
            // console.log(response);
            const blob = new Blob([response.data], { type: response.data.type });
            // console.log(blob);
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            // link.download = "file.pdf";
            // console.log(response.headers["content-disposition"]);
            const fileName = response.headers["content-disposition"].split("filename=")[1];
            // console.log(fileName);
            const realFileName = fileName.substring(1, fileName.length - 1);
            link.download = realFileName;
            link.click();
        } catch (error) {
            // console.log(error);
            alert(error.message);
        } finally {
            return navigate("/home");
        }
    };

    return (
        <div style={{ padding: "15px" }}>
            {status}
        </div>
    )
}

export default DownloadFile

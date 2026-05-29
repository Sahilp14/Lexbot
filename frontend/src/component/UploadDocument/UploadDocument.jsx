// UploadDocument.jsx
import React, { useState } from "react";
import { Upload } from "lucide-react";
import "./UploadDocument.css";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const UploadDocument = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const toastModel = ({ title, description, variant }) => {
    console.log(`${title}: ${description} ${variant ? `(${variant})` : ""}`);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toastModel({
        title: "No file selected",
        description: "Please select a document to process",
        variant: "destructive",
      });
      toast.error("Please select a document to process", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setProcessing(true);
    setProgress(0);
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      toast.error("Authentication token not found. Please log in.", {
        position: "top-right",
        autoClose: 3000,
      });
      setProcessing(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(apiUrl + "users/upload/", formData, {
        headers: {
          "Authorization": `Token ${authToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(response.data);

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setProcessing(false);
            toast.success("Your document has been analyzed successfully", {
              position: "top-right",
              autoClose: 3000,
            });
            // Dispatch custom event to trigger history reload in Sidebar
            window.dispatchEvent(new Event("documentUploaded"));

            navigate("/viewer", {
              state: {
                fileId: response.data.file_id,
                uploadedFile: file,
                ocrResult: response.data.extracted_text || "OCR text not available",
                sometext:response.data.summarized_text || "Summarized text"
              },
            });
            return 100;
          }
          return prev + 10;
        });
      }, 500);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Error processing document: " + error.message, {
        position: "top-right",
        autoClose: 3000,
      });
      setProcessing(false);
    }
  };

  const { t } = useTranslation();

  return (
    <div className="upload-card">
      <div className="card-header">
        <h2 className="card-title">
          <Upload size={20} />
          {t("upload_legal_doc")}
        </h2>
        <p className="card-description">
          {t("upload_legal_doc_desc")}
        </p>
      </div>
      <div className="card-content">
        <form onSubmit={handleSubmit}>
          <div className="upload-area">
            <label htmlFor="document" className="upload-label">
              <Upload size={32} />
              <span>
                {file ? file.name : t("drag_drop_click")}
              </span>
              <span className="upload-info">
                {t("drag_drop_support")}
              </span>
            </label>
            <input
              id="document"
              type="file"
              className="upload-input"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileChange}
            />
          </div>

          {processing && (
            <div className="progress-section">
              <div className="progress-header">
                <span>{t("processing_doc")}</span>
                <span>{progress}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="submit-btn"
            disabled={!file || processing}
          >
            {processing ? t("processing") : t("analyze_btn")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadDocument;
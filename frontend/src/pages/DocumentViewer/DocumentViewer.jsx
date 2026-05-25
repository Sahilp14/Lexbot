import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./DocumentViewer.css";
import axios from "axios";

const DocumentViewer = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const location = useLocation();
  const navigate = useNavigate();

  // Extract initial router state parameters
  const { 
    fileId, 
    fileName, 
    fileUrl, 
    uploadedFile: initialFile, 
    ocrResult: initialOcr, 
    sometext: initialSome 
  } = location.state || {};

  // Component states
  const [uploadedFile, setUploadedFile] = useState(initialFile || null);
  const [ocrResult, setOcrResult] = useState(initialOcr || "");
  const [sometext, setSometext] = useState(initialSome || "");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [nerResult, setNerResult] = useState(null);
  const [nerLoading, setNerLoading] = useState(false);
  const [nerError, setNerError] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNerOpen, setIsNerOpen] = useState(false);

  // Fetch document details if loading from sidebar history click
  useEffect(() => {
    const fetchHistoryDetails = async () => {
      if (!fileId || initialOcr) return;

      setIsLoadingHistory(true);
      try {
        const response = await axios.get(`${apiUrl}users/history/${fileId}/`, {
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
        });
        setOcrResult(response.data.extracted_text || "OCR text not available");
        setSometext(response.data.summarized_text || "Summarized text");
      } catch (err) {
        console.error("Error loading document history details:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistoryDetails();
  }, [fileId, initialOcr, apiUrl]);

  // Fetch NER data when popup is opened
  const fetchNerData = async () => {
    if (!ocrResult || nerResult) return;

    setNerLoading(true);
    setNerError(null);

    try {
      const response = await fetch(`${apiUrl}users/ncr/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ text: ocrResult }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch NER data");
      }

      const data = await response.json();
      // Parse the response string to extract JSON
      const jsonString = data.response.replace(/```json\n|```/g, "").trim();
      const parsedNer = JSON.parse(jsonString);
      setNerResult(parsedNer);
    } catch (err) {
      setNerError(err.message);
    } finally {
      setNerLoading(false);
    }
  };

  // Handle chat submission
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatQuestion.trim() || !ocrResult) return;

    const newMessage = { question: chatQuestion, response: null, loading: true };
    setChatMessages((prev) => [...prev, newMessage]);
    setChatQuestion("");
    setChatLoading(true);

    try {
      const response = await fetch(`${apiUrl}users/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: chatQuestion + ocrResult,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get chat response");
      }

      const data = await response.json();
      setChatMessages((prev) =>
        prev.map((msg, idx) =>
          idx === prev.length - 1
            ? { ...msg, response: data.response || "No response received", loading: false }
            : msg
        )
      );
    } catch (err) {
      setChatMessages((prev) =>
        prev.map((msg, idx) =>
          idx === prev.length - 1
            ? { ...msg, response: `Error: ${err.message}`, loading: false }
            : msg
        )
      );
    } finally {
      setChatLoading(false);
    }
  };

  // Helper to determine file type from relative URL
  const getFileTypeFromUrl = (urlOrName) => {
    if (!urlOrName) return "";
    const ext = urlOrName.split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'application/pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image/' + ext;
    return '';
  };

  // Function to determine file preview
  const renderFilePreview = () => {
    // 1. If we have a local JS File object (direct upload)
    if (uploadedFile) {
      const localUrl = URL.createObjectURL(uploadedFile);
      const fileType = uploadedFile.type.toLowerCase();

      if (fileType === "application/pdf") {
        return <iframe src={localUrl} title="Document Preview" className="file-preview" />;
      } else if (fileType.startsWith("image/")) {
        return <img src={localUrl} alt="Document Preview" className="file-preview" />;
      } else {
        return (
          <p className="preview-message">
            Preview not supported directly. File: {uploadedFile.name}
          </p>
        );
      }
    }

    // 2. If we are loading from history and have fileUrl
    if (fileUrl) {
      const fullUrl = `http://localhost:8000${fileUrl}`;
      const fileType = getFileTypeFromUrl(fileUrl || fileName);

      if (fileType === "application/pdf") {
        return <iframe src={fullUrl} title="Document Preview" className="file-preview" />;
      } else if (fileType.startsWith("image/")) {
        return <img src={fullUrl} alt="Document Preview" className="file-preview" />;
      } else {
        return (
          <p className="preview-message">
            Preview not supported directly. File: {fileName}
          </p>
        );
      }
    }

    return <p className="no-content">No document uploaded</p>;
  };

  // Handle back navigation
  const handleBack = () => {
    navigate("/dashboard");
  };

  // Render NER results dynamically with bold keys and numbered bullet points
  const renderNerResult = () => {
    if (nerLoading) return <p className="loading">Analyzing entities...</p>;
    if (nerError) return <p className="error">Error: {nerError}</p>;
    if (!nerResult || Object.keys(nerResult).length === 0) {
      return <p className="no-content">No entity analysis available</p>;
    }

    return (
      <div className="ner-result">
        {Object.entries(nerResult)
          .filter(([_, value]) => value.length > 0) // Filter out empty categories
          .map(([key, value]) => (
            <div key={key} className="ner-category">
              <h3 className="ner-key">{key}</h3>
              <ol className="ner-list">
                {value.map((item, index) => (
                  <li key={index} className="ner-item">
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          ))}
      </div>
    );
  };

  if (isLoadingHistory) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "15px" }}>
          <div className="spinner" style={{
            width: "40px",
            height: "40px",
            border: "4px solid rgba(37, 99, 235, 0.1)",
            borderTop: "4px solid #2563eb",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Loading document from history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="viewer-container">
      <button className="back-btn" onClick={handleBack}>
        Back
      </button>
      <div className="split-pane">
        {/* Left Pane - Uploaded Document */}
        <div className="pane left-pane">
          <div className="pane-header">
            <h2 className="pane-title">Uploaded Document</h2>
            <p className="pane-description">Original document preview</p>
          </div>
          <div className="pane-content">
            {uploadedFile || fileUrl ? (
              <div className="document-preview">
                <p className="file-name">{uploadedFile ? uploadedFile.name : fileName}</p>
                {renderFilePreview()}
              </div>
            ) : (
              <p className="no-content">No document uploaded</p>
            )}
          </div>
        </div>

        {/* Right Pane - OCR Result */}
        <div className="pane right-pane">
          <div className="pane-header">
            <h2 className="pane-title">OCR Analysis</h2>
            <p className="pane-description">Extracted text from the document</p>
          </div>
          <div className="pane-content">
            {ocrResult ? (
              <div className="ocr-result">
                <pre className="ocr-text">{sometext}</pre>
              </div>
            ) : (
              <p className="no-content">No OCR results available</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          className="action-btn chat-btn"
          onClick={() => setIsChatOpen(true)}
          disabled={!ocrResult}
        >
          Chat with Document
        </button>
        <button
          className="action-btn ner-btn"
          onClick={() => {
            setIsNerOpen(true);
            fetchNerData();
          }}
          disabled={!ocrResult}
        >
          View NER Analysis
        </button>
      </div>

      {/* Chat Popup */}
      {isChatOpen && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setIsChatOpen(false)}>
              ×
            </button>
            <div className="pane-header">
              <h2 className="pane-title">Chat with Document</h2>
              <p className="pane-description">Ask questions about the document content</p>
            </div>
            <div className="chat-content">
              <div className="chat-messages">
                {chatMessages.length === 0 && (
                  <p className="chat-placeholder">
                    Start asking questions about your document!
                  </p>
                )}
                {chatMessages.map((msg, index) => (
                  <div key={index} className="chat-message">
                    <div className="question-bubble">
                      <strong>You:</strong> {msg.question}
                    </div>
                    <div className="response-bubble">
                      <strong>Response:</strong>{" "}
                      {msg.loading ? "Thinking..." : msg.response}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleChatSubmit} className="chat-form">
                <input
                  type="text"
                  value={chatQuestion}
                  onChange={(e) => setChatQuestion(e.target.value)}
                  placeholder="Type your question here..."
                  className="chat-input"
                  disabled={chatLoading}
                />
                <button
                  type="submit"
                  className="chat-submit-btn"
                  disabled={chatLoading}
                >
                  {chatLoading ? "Sending..." : "Send"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* NER Popup */}
      {isNerOpen && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setIsNerOpen(false)}>
              ×
            </button>
            <div className="pane-header">
              <h2 className="pane-title">Named Entity Recognition</h2>
              <p className="pane-description">Extracted entities and relationships</p>
            </div>
            <div className="pane-content">{renderNerResult()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./DocumentViewer.css";
import axios from "axios";

const DocumentViewer = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const location = useLocation();
  const navigate = useNavigate();
  const { uploadedFile, ocrResult,sometext } = location.state || {};
  const [nerResult, setNerResult] = useState(null);
  const [nerLoading, setNerLoading] = useState(false);
  const [nerError, setNerError] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNerOpen, setIsNerOpen] = useState(false);

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

  // Function to determine file preview
  const renderFilePreview = (file) => {
    if (!file) return <p className="no-content">No document uploaded</p>;

    const fileUrl = URL.createObjectURL(file);
    const fileType = file.type.toLowerCase();

    if (fileType === "application/pdf") {
      return <iframe src={fileUrl} title="Document Preview" className="file-preview" />;
    } else if (fileType.startsWith("image/")) {
      return <img src={fileUrl} alt="Document Preview" className="file-preview" />;
    } else if (
      fileType === "application/msword" ||
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return (
        <p className="preview-message">
          Word document preview not supported. File: {file.name}
        </p>
      );
    } else if (fileType === "text/plain") {
      return (
        <p className="preview-message">
          Text file preview not supported directly. File: {file.name}
        </p>
      );
    } else {
      return (
        <p className="preview-message">
          Preview not available for this file type: {file.name}
        </p>
      );
    }
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
            {uploadedFile ? (
              <div className="document-preview">
                <p className="file-name">{uploadedFile.name}</p>
                {renderFilePreview(uploadedFile)}
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
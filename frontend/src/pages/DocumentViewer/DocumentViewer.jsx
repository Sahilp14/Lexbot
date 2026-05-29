import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./DocumentViewer.css";
import axios from "axios";

const DocumentViewer = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const location = useLocation();
  const navigate = useNavigate();

  const {
    fileId,
    fileName,
    fileUrl,
    uploadedFile: initialFile,
    ocrResult: initialOcr,
    sometext: initialSome,
  } = location.state || {};

  const [uploadedFile, setUploadedFile] = useState(initialFile || null);
  const [ocrResult, setOcrResult] = useState(initialOcr || "");
  const [sometext, setSometext] = useState(initialSome || "");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Tab state: "ocr" | "summary" | "chat"
  const [activeTab, setActiveTab] = useState("ocr");

  // NER state (kept as modal)
  const [nerResult, setNerResult] = useState(null);
  const [nerLoading, setNerLoading] = useState(false);
  const [nerError, setNerError] = useState(null);
  const [isNerOpen, setIsNerOpen] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    if (activeTab === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, activeTab]);

  // Fetch document details from history if no OCR in state (sidebar click)
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
        setSometext(response.data.summarized_text || "Summary not available");
      } catch (err) {
        console.error("Error loading document history details:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistoryDetails();
  }, [fileId, initialOcr, apiUrl]);

  // Fetch NER data when NER modal is opened
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

      if (!response.ok) throw new Error("Failed to fetch NER data");

      const data = await response.json();
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
    if (!chatQuestion.trim() || !ocrResult || chatLoading) return;

    const currentQuestion = chatQuestion.trim();
    setChatMessages((prev) => [
      ...prev,
      { question: currentQuestion, response: null, loading: true },
    ]);
    setChatQuestion("");
    setChatLoading(true);

    try {
      const response = await fetch(`${apiUrl}users/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          prompt: currentQuestion,
          file_id: fileId,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = {
          success: false,
          error: "Received an invalid response from the server.",
        };
      }

      const answerText =
        data.success === false
          ? `⚠️ ${data.error || "Something went wrong. Please try again."}`
          : data.answer || data.response || "No response received.";

      setChatMessages((prev) =>
        prev.map((msg, idx) =>
          idx === prev.length - 1
            ? { ...msg, response: answerText, loading: false }
            : msg,
        ),
      );
    } catch (err) {
      setChatMessages((prev) =>
        prev.map((msg, idx) =>
          idx === prev.length - 1
            ? {
                ...msg,
                response:
                  "⚠️ Could not connect to the server. Please check your connection and try again.",
                loading: false,
              }
            : msg,
        ),
      );
    } finally {
      setChatLoading(false);
    }
  };

  // Determine file type from URL/name
  const getFileTypeFromUrl = (urlOrName) => {
    if (!urlOrName) return "";
    const ext = urlOrName.split(".").pop().toLowerCase();
    if (ext === "pdf") return "application/pdf";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext))
      return "image/" + ext;
    return "";
  };

  // Render document preview (left pane — unchanged)
  const renderFilePreview = () => {
    if (uploadedFile) {
      const localUrl = URL.createObjectURL(uploadedFile);
      const fileType = uploadedFile.type.toLowerCase();

      if (fileType === "application/pdf") {
        return (
          <iframe
            src={localUrl}
            title="Document Preview"
            className="file-preview"
          />
        );
      } else if (fileType.startsWith("image/")) {
        return (
          <img src={localUrl} alt="Document Preview" className="file-preview" />
        );
      } else {
        return (
          <p className="preview-message">
            Preview not supported. File: {uploadedFile.name}
          </p>
        );
      }
    }

    if (fileUrl) {
      const fullUrl = `http://localhost:8000${fileUrl}`;
      const fileType = getFileTypeFromUrl(fileUrl || fileName);

      if (fileType === "application/pdf") {
        return (
          <iframe
            src={fullUrl}
            title="Document Preview"
            className="file-preview"
          />
        );
      } else if (fileType.startsWith("image/")) {
        return (
          <img src={fullUrl} alt="Document Preview" className="file-preview" />
        );
      } else {
        return (
          <p className="preview-message">
            Preview not supported. File: {fileName}
          </p>
        );
      }
    }

    return <p className="no-content">No document uploaded</p>;
  };

  // Render NER results
  const renderNerResult = () => {
    if (nerLoading) return <p className="loading">Analyzing entities...</p>;
    if (nerError) return <p className="error">Error: {nerError}</p>;
    if (!nerResult || Object.keys(nerResult).length === 0) {
      return <p className="no-content">No entity analysis available</p>;
    }

    return (
      <div className="ner-result">
        {Object.entries(nerResult)
          .filter(([_, value]) => value.length > 0)
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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <div
            className="spinner"
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid rgba(37, 99, 235, 0.1)",
              borderTop: "4px solid #2563eb",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
            Loading document from history...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="viewer-container">
      <button className="back-btn" onClick={() => navigate("/dashboard")}>
        Back
      </button>

      <div className="split-pane">
        {/* ── Left pane: document preview ── */}
        <div className="pane left-pane">
          <div className="pane-header">
            <h2 className="pane-title">Uploaded Document</h2>
            <p className="pane-description">Original document preview</p>
          </div>
          <div className="pane-content">
            {uploadedFile || fileUrl ? (
              <div className="document-preview">
                <p className="file-name">
                  {uploadedFile ? uploadedFile.name : fileName}
                </p>
                {renderFilePreview()}
              </div>
            ) : (
              <p className="no-content">No document uploaded</p>
            )}
          </div>
        </div>

        {/* ── Right pane: tabbed OCR / Summary / Chat ── */}
        <div className="pane right-pane">
          {/* Tab navigation */}
          <div className="tab-nav">
            <button
              className={`tab-btn ${activeTab === "ocr" ? "active" : ""}`}
              onClick={() => setActiveTab("ocr")}
            >
              OCR Result
            </button>
            <button
              className={`tab-btn ${activeTab === "summary" ? "active" : ""}`}
              onClick={() => setActiveTab("summary")}
              disabled={!sometext}
            >
              Summary
            </button>
            <button
              className={`tab-btn ${activeTab === "chat" ? "active" : ""}`}
              onClick={() => setActiveTab("chat")}
              disabled={!ocrResult}
            >
              Chat with Doc
            </button>
          </div>

          {/* ── OCR tab ── */}
          {activeTab === "ocr" && (
            <div className="tab-panel pane-content">
              {ocrResult ? (
                <div className="ocr-result">
                  <pre className="ocr-text"
                  style={{ 
                      color: "#1e3a8a", /* Applies the chatbot response text color */
                      whiteSpace: "pre-wrap", /* Preserves paragraph formatting */
                      lineHeight: "1.7",
                      fontSize: "1.02rem"
                    }}
                  >{ocrResult}</pre>
                </div>
              ) : (
                <p className="no-content">No OCR results available</p>
              )}
            </div>
          )}

          {/* ── Summary tab ── */}
          {activeTab === "summary" && (
            <div className="tab-panel pane-content">
              {sometext ? (
                <div className="summary-result">
                  <p className="summary-text"
                  style={{ 
                      color: "#1e3a8a", /* Applies the chatbot response text color */
                      whiteSpace: "pre-wrap", /* Preserves paragraph formatting */
                      lineHeight: "1.7",
                      fontSize: "1.02rem"
                    }}
                  >{sometext}</p>
                </div>
              ) : (
                <p className="no-content">No summary available</p>
              )}
            </div>
          )}

          {/* ── Chat tab ── */}
          {activeTab === "chat" && (
            <div className="tab-panel chat-panel">
              <div className="chat-messages">
                {chatMessages.length === 0 && (
                  <p className="chat-placeholder">
                    Ask anything about this document — the AI has read the full
                    text.
                  </p>
                )}
                {chatMessages.map((msg, index) => (
                  <div key={index} className="chat-message">
                    <div className="question-bubble">
                      <strong>You:</strong> {msg.question}
                    </div>
                    <div className="response-bubble">
                      {msg.loading ? (
                        <span className="chat-thinking">
                          <span className="dot" />
                          <span className="dot" />
                          <span className="dot" />
                        </span>
                      ) : (
                        msg.response
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleChatSubmit} className="chat-form">
                <input
                  type="text"
                  value={chatQuestion}
                  onChange={(e) => setChatQuestion(e.target.value)}
                  placeholder="Ask a question about the document..."
                  className="chat-input"
                  disabled={chatLoading}
                  autoFocus
                />
                <button
                  type="submit"
                  className="chat-submit-btn"
                  disabled={chatLoading || !chatQuestion.trim()}
                >
                  {chatLoading ? "Sending…" : "Send"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* NER button — kept as action button + modal */}
      <div className="action-buttons">
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

      {/* NER Modal */}
      {isNerOpen && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setIsNerOpen(false)}>
              ×
            </button>
            <div className="pane-header">
              <h2 className="pane-title">Named Entity Recognition</h2>
              <p className="pane-description">
                Extracted entities and relationships
              </p>
            </div>
            <div className="pane-content">{renderNerResult()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;

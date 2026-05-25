import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, ArrowLeft, Loader2, Mail } from "lucide-react";
import "./Login.css";
import axios from "axios";
import { toast } from "react-toastify";

const ForgotPassword = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email) {
            toast.error("Please enter your email address", { position: "top-right", autoClose: 3000 });
            return;
        }

        setIsLoading(true);

        try {
            const res = await axios.post(`${apiUrl}users/forgot-password/`, { email });
            
            toast.success("OTP sent to your email successfully!", { position: "top-right", autoClose: 3000 });

            // If OTP is returned in the API response (during DEBUG/testing mode), show it in a premium toast so testing is super easy!
            if (res.data.otp) {
                toast.info(`Development Mode: Your OTP is ${res.data.otp}`, {
                    position: "top-right",
                    autoClose: 10000,
                    closeOnClick: false,
                    draggable: false
                });
            }

            // Redirect user to reset-password page after a short delay
            setTimeout(() => {
                // Pass the requested email in navigation state so the user doesn't have to retype it!
                navigate("/reset-password", { state: { email } });
            }, 2000);

        } catch (error) {
            console.error("Forgot Password Error:", error);
            const errMsg = error.response?.data?.error || "Failed to request password reset. Please try again.";
            toast.error(errMsg, { position: "top-right", autoClose: 3000 });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <Link to="/login" className="back-link">
                    <ArrowLeft size={16} className="back-arrow" />
                    <span>Back to Login</span>
                </Link>

                <div className="login-wrapper">
                    <div className="login-form">
                        <div className="logo-section">
                            <Link to="/" className="logo-link">
                                <div className="logo-icon">
                                    <FileText size={20} />
                                </div>
                                <span className="logo-text">LexBot</span>
                            </Link>
                        </div>

                        <div className="card" style={{ paddingBottom: "1.5rem" }}>
                            <div className="card-header">
                                <h2 className="card-title">Forgot Password</h2>
                                <p className="card-description">
                                    Enter your registered email address and we'll send you a 6-digit OTP to reset your password.
                                </p>
                            </div>
                            <div className="card-content">
                                <form onSubmit={handleSubmit} className="form">
                                    <div className="form-group">
                                        <label htmlFor="email">Email Address</label>
                                        <input
                                            id="email"
                                            type="email"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            autoComplete="email"
                                            required
                                        />
                                    </div>

                                    <button type="submit" className="submit-btn" disabled={isLoading}>
                                        {isLoading ? (
                                            <div className="loading">
                                                <Loader2 size={16} className="spinner" />
                                                <span>Sending OTP...</span>
                                            </div>
                                        ) : (
                                            "Send OTP"
                                        )}
                                    </button>
                                </form>
                            </div>

                            <div className="signup-link">
                                <p>
                                    Remember your password?{" "}
                                    <Link to="/login" className="signup">
                                        Login
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;

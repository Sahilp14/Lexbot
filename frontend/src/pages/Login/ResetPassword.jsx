import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FileText, ArrowLeft, Loader2, KeyRound } from "lucide-react";
import "./Login.css";
import axios from "axios";
import { toast } from "react-toastify";

const ResetPassword = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const location = useLocation();

    // Try to extract email from navigation state passed from ForgotPassword
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (location.state && location.state.email) {
            setEmail(location.state.email);
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !otp || !password || !confirmPassword) {
            toast.error("Please fill in all fields", { position: "top-right", autoClose: 3000 });
            return;
        }

        if (otp.length !== 6) {
            toast.error("OTP must be exactly 6 digits", { position: "top-right", autoClose: 3000 });
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match", { position: "top-right", autoClose: 3000 });
            return;
        }

        setIsLoading(true);

        try {
            const res = await axios.post(`${apiUrl}users/reset-password/`, {
                email,
                otp,
                password
            });

            toast.success("Password reset successfully! You can now log in.", {
                position: "top-right",
                autoClose: 3000
            });

            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (error) {
            console.error("Reset Password Error:", error);
            const errMsg = error.response?.data?.error || "Failed to reset password. Please verify your OTP and try again.";
            toast.error(errMsg, { position: "top-right", autoClose: 3000 });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <Link to="/forgot-password" className="back-link">
                    <ArrowLeft size={16} className="back-arrow" />
                    <span>Back to Forgot Password</span>
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
                                <h2 className="card-title">Reset Password</h2>
                                <p className="card-description">
                                    Please enter your email, the 6-digit OTP code sent to you, and choose your new password.
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

                                    <div className="form-group">
                                        <label htmlFor="otp">6-Digit OTP</label>
                                        <input
                                            id="otp"
                                            type="text"
                                            maxLength="6"
                                            placeholder="123456"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="password">New Password</label>
                                        <input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            autoComplete="new-password"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="confirmPassword">Confirm Password</label>
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            autoComplete="new-password"
                                            className={confirmPassword && password !== confirmPassword ? "error" : ""}
                                            required
                                        />
                                        {confirmPassword && password !== confirmPassword && (
                                            <p className="error-text" style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                                                Passwords do not match
                                            </p>
                                        )}
                                    </div>

                                    <button type="submit" className="submit-btn" disabled={isLoading}>
                                        {isLoading ? (
                                            <div className="loading">
                                                <Loader2 size={16} className="spinner" />
                                                <span>Resetting Password...</span>
                                            </div>
                                        ) : (
                                            "Reset Password"
                                        )}
                                    </button>
                                </form>
                            </div>

                            <div className="signup-link">
                                <p>
                                    Back to{" "}
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

export default ResetPassword;

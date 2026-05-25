import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, ArrowLeft, Loader2 } from "lucide-react";
import "./Login.css";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!username || !password) {
            toast.error("Please enter both username and password", { position: "top-right", autoClose: 3000 });
            return;
        }

        setIsLoading(true);

        try {
            const res = await axios.post(`${apiUrl}users/login/`, {
                username,
                password
            });

            if (res.data.token) {
                localStorage.setItem("authToken", res.data.token);
                localStorage.setItem("user", JSON.stringify(res.data.user));
                
                toast.success("Login Successful!", { position: "top-right", autoClose: 2000 });
                
                setTimeout(() => {
                    navigate("/dashboard");
                }, 1000);
            } else {
                toast.error("Login failed. Please try again.", { position: "top-right", autoClose: 3000 });
            }
        } catch (error) {
            console.error("Login Error:", error);
            const errMsg = error.response?.data?.error || "Invalid credentials. Please try again.";
            toast.error(errMsg, { position: "top-right", autoClose: 3000 });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <Link to="/" className="back-link">
                    <ArrowLeft size={16} className="back-arrow" />
                    <span>Back to Home</span>
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
                                <h2 className="card-title">Welcome back</h2>
                                <p className="card-description">Enter your credentials to access your account</p>
                            </div>
                            <div className="card-content">
                                <form onSubmit={handleLogin} className="form">
                                    <div className="form-group">
                                        <label htmlFor="username">Username</label>
                                        <input
                                            id="username"
                                            type="text"
                                            placeholder="Username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            autoComplete="username"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <div className="password-header">
                                            <label htmlFor="password">Password</label>
                                            <Link to="/forgot-password" className="forgot-password">
                                                Forgot Password?
                                            </Link>
                                        </div>
                                        <input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            autoComplete="current-password"
                                            required
                                        />
                                    </div>

                                    <button type="submit" className="submit-btn" disabled={isLoading}>
                                        {isLoading ? (
                                            <div className="loading">
                                                <Loader2 size={16} className="spinner" />
                                                <span>Logging in...</span>
                                            </div>
                                        ) : (
                                            "Login"
                                        )}
                                    </button>
                                </form>
                            </div>

                            <div className="signup-link">
                                <p>
                                    Don't have an account?{" "}
                                    <Link to="/register" className="signup">
                                        Sign up
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

export default Login;
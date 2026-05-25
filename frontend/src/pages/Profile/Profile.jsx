import React, { useState, useEffect } from "react";
import { User, Mail, ShieldAlert, Loader2, Save, KeyRound, Calendar, Hash } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import "./Profile.css";

const Profile = () => {
    const { t } = useTranslation();
    const apiUrl = import.meta.env.VITE_API_URL;
    
    // Core states
    const [userId, setUserId] = useState(null);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    // Metadata states
    const [isStaff, setIsStaff] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [dateJoined, setDateJoined] = useState("");
    
    // Status states
    const [isFetching, setIsFetching] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        
        // Retrieve initial user id from local storage
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            try {
                const userObj = JSON.parse(savedUser);
                if (userObj && userObj.id) {
                    setUserId(userObj.id);
                    fetchUserProfile(userObj.id);
                } else {
                    setIsFetching(false);
                }
            } catch (err) {
                console.error("Error parsing user from localStorage:", err);
                setIsFetching(false);
            }
        } else {
            setIsFetching(false);
        }
    }, []);

    // Fetch rich user details from backend
    const fetchUserProfile = async (id) => {
        try {
            const res = await axios.get(`${apiUrl}users/${id}/`);
            if (res.data) {
                setUsername(res.data.username || "");
                setEmail(res.data.email || "");
                setIsStaff(res.data.is_staff || false);
                setIsActive(res.data.is_active !== undefined ? res.data.is_active : true);
                
                // Format the join date nicely
                if (res.data.date_joined) {
                    const joined = new Date(res.data.date_joined);
                    setDateJoined(joined.toLocaleDateString("en-US", {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }));
                }
            }
        } catch (err) {
            console.error("Error fetching user profile from API:", err);
            toast.error(t("profile_fetch_fail"), { position: "top-right" });
            
            // Fallback to local storage values
            const savedUser = localStorage.getItem("user");
            if (savedUser) {
                const userObj = JSON.parse(savedUser);
                setUsername(userObj.username || "");
                setEmail(userObj.email || "");
            }
        } finally {
            setIsFetching(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!username || !email) {
            toast.error(t("profile_empty_fields"), { position: "top-right" });
            return;
        }

        // If trying to change password, make sure they match
        if (password) {
            if (password !== confirmPassword) {
                toast.error(t("passwords_dont_match"), { position: "top-right" });
                return;
            }
            if (password.length < 6) {
                toast.error(t("password_min_length"), { position: "top-right" });
                return;
            }
        }

        setIsUpdating(true);

        const updateData = {
            username,
            email
        };

        if (password) {
            updateData.password = password;
        }

        try {
            const res = await axios.put(`${apiUrl}users/update/${userId}/`, updateData);
            
            toast.success(t("profile_update_success"), { position: "top-right", autoClose: 3000 });
            
            // Update local storage user details
            const savedUser = localStorage.getItem("user");
            if (savedUser) {
                const userObj = JSON.parse(savedUser);
                userObj.username = username;
                userObj.email = email;
                localStorage.setItem("user", JSON.stringify(userObj));
            }

            // Clear passwords fields
            setPassword("");
            setConfirmPassword("");

            // Re-fetch profile to keep sync
            fetchUserProfile(userId);

        } catch (err) {
            console.error("Error updating profile:", err);
            toast.error(t("profile_update_fail"), { position: "top-right" });
        } finally {
            setIsUpdating(false);
        }
    };

    // Helper to get initials for avatar
    const getInitials = () => {
        if (!username) return "U";
        return username.slice(0, 2).toUpperCase();
    };

    if (isFetching) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                    <Loader2 size={40} className="spinner-icon" style={{ color: "#2563eb" }} />
                    <p style={{ color: "#4b5563", fontWeight: 500 }}>{t("loading_profile")}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <h1 className="profile-title">{t("my_profile")}</h1>

            <div className="profile-grid">
                
                {/* LEFT: AVATAR CARD */}
                <div className="profile-card">
                    <div className="avatar-container">
                        <div className="initials-avatar">
                            {getInitials()}
                        </div>
                    </div>
                    <h2 className="profile-username">{username || "User"}</h2>
                    <p className="profile-email-sub">{email || "user@example.com"}</p>

                    <div className="badge-group">
                        {isActive && <span className="badge badge-active">{t("active_client")}</span>}
                        {isStaff && <span className="badge badge-staff">{t("staff_member")}</span>}
                        <span className="badge badge-tier">{t("standard_plan")}</span>
                    </div>

                    <div className="metadata-list">
                        <div className="metadata-item">
                            <span className="metadata-label">
                                <Hash size={15} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                {t("user_id")}
                            </span>
                            <span className="metadata-value">{userId || "N/A"}</span>
                        </div>
                        <div className="metadata-item">
                            <span className="metadata-label">
                                <Calendar size={15} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                {t("member_since")}
                            </span>
                            <span className="metadata-value">{dateJoined || "N/A"}</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT: EDIT PROFILE DETAILS CARD */}
                <div className="profile-details-card">
                    <div className="card-header-left">
                        <h3>{t("profile_settings")}</h3>
                        <p>{t("profile_settings_desc")}</p>
                    </div>

                    <form onSubmit={handleUpdate} className="profile-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="username">{t("username")}</label>
                                <input
                                    id="username"
                                    type="text"
                                    placeholder={t("enter_username")}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">{t("email_address")}</label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder={t("name_placeholder")}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <hr style={{ border: '0', borderTop: '1px solid #f3f4f6', margin: '1rem 0' }} />

                        <div className="card-header-left" style={{ marginBottom: '1rem' }}>
                            <h4 className="change-password-header-text" style={{ fontSize: '1.1rem', fontWeight: 600, color: '#374151' }}>{t("change_password")}</h4>
                            <p style={{ fontSize: '0.825rem' }}>{t("change_password_desc")}</p>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="password">{t("new_password")}</label>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="new-password"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">{t("confirm_new_password")}</label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    autoComplete="new-password"
                                    className={confirmPassword && password !== confirmPassword ? "error" : ""}
                                />
                                {confirmPassword && password !== confirmPassword && (
                                    <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                                        {t("passwords_dont_match")}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="btn-group">
                            <button type="submit" className="update-btn" disabled={isUpdating}>
                                {isUpdating ? (
                                    <>
                                        <Loader2 size={16} className="spinner-icon" />
                                        <span>{t("saving_changes")}</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        <span>{t("save_changes")}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default Profile;

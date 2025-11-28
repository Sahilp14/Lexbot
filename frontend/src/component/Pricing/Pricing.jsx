import React from 'react'
import { Link } from 'react-router-dom'

export default function Pricing() {
    const plans = [
        { name: "Basic", price: 99, features: ["Summarize 10 documents", "Email Support"] },
        { name: "Pro", price: 299, features: ["Summarize 100 documents", "Chat with Documents", "Priority Support"] },
        { name: "Premium", price: 599, features: ["Unlimited Documents", "AI Chat", "24/7 Support"] },
    ];

    return (
        <div>
            <div style={{ textAlign: "center", padding: "40px" }}>
                <h1 style={{ color: '#1F2937', marginBottom: '10px' }}>Choose Your Plan</h1>
                <p style={{ color: '#6B7280', fontSize: '18px' }}>Select the perfect plan for your legal document needs</p>
                
                <div style={{ display: "flex", justifyContent: "center", gap: "30px", marginTop: "30px", flexWrap: "wrap" }}>
                    {plans.map((plan, index) => (
                        <div key={index} style={{ 
                            border: "1px solid #E5E7EB", 
                            padding: "30px 20px", 
                            width: "280px", 
                            borderRadius: "12px",
                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                            backgroundColor: "white",
                            transition: "all 0.3s ease",
                            position: "relative",
                            overflow: "hidden"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-5px)";
                            e.currentTarget.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.1)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.05)";
                        }}>
                            {index === 1 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '0',
                                    left: '0',
                                    right: '0',
                                    background: '#2563EB',
                                    color: 'white',
                                    padding: '5px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    textAlign: 'center'
                                }}>
                                    MOST POPULAR
                                </div>
                            )}
                            <h2 style={{ 
                                color: '#1F2937', 
                                marginTop: index === 1 ? '25px' : '0',
                                fontSize: '24px',
                                fontWeight: 'bold'
                            }}>{plan.name}</h2>
                            <h3 style={{ 
                                color: '#2563EB', 
                                fontSize: '36px',
                                fontWeight: 'bold',
                                margin: '15px 0'
                            }}>₹{plan.price}</h3>
                            <ul style={{ 
                                textAlign: "left", 
                                minHeight: "120px",
                                paddingLeft: '20px',
                                color: '#4B5563'
                            }}>
                                {plan.features.map((f, i) => (
                                    <li key={i} style={{ marginBottom: '8px', fontSize: '14px' }}>
                                        ✅ {f}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                to="/login"
                                style={{ 
                                    marginTop: "10px", 
                                    padding: "12px 24px", 
                                    background: "#2563EB", 
                                    color: "#fff", 
                                    borderRadius: "8px", 
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                    width: "100%",
                                    transition: "all 0.3s ease",
                                    display: "block",
                                    textDecoration: "none",
                                    textAlign: "center"
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.background = "#1D4ED8";
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.background = "#2563EB";
                                }}>
                                Upgrade Now
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
import React from 'react'

export default function About() {
    return (
        <div>
            <div style={{ textAlign: "center", padding: "40px" }}>
                <h1 style={{ color: '#1F2937', marginBottom: '10px', fontSize: '36px', fontWeight: 'bold' }}>
                    About <span style={{ color: '#2563EB' }}>LexBot</span>
                </h1>
                <p style={{ color: '#6B7280', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
                    LexBot is an AI-powered platform that makes complex legal documents easy to 
                    understand — designed for students, professionals, NGOs, and everyday citizens.
                </p>
                
                {/* Mission & What We Do Grid */}
                <div style={{ 
                    display: "flex", 
                    justifyContent: "center", 
                    gap: "30px", 
                    marginTop: "50px", 
                    flexWrap: "wrap",
                    maxWidth: '1200px',
                    margin: '50px auto'
                }}>
                    {/* Mission Card */}
                    <div style={{ 
                        border: "1px solid #E5E7EB", 
                        padding: "40px 30px", 
                        width: "500px", 
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
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '20px'
                        }}>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                backgroundColor: '#DBEAFE',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '15px'
                            }}>
                                <svg style={{ width: '24px', height: '24px', color: '#2563EB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h2 style={{ 
                                color: '#1F2937', 
                                fontSize: '28px',
                                fontWeight: 'bold',
                                margin: 0
                            }}>Our Mission</h2>
                        </div>
                        <p style={{ 
                            color: '#4B5563', 
                            lineHeight: '1.6',
                            fontSize: '16px',
                            textAlign: 'left'
                        }}>
                            Legal language is often filled with difficult terminology and long paragraphs 
                            that are hard to understand. Many people struggle to interpret policies, 
                            agreements, contracts, or government documents.
                            <br /><br />
                            Our mission is to make legal knowledge accessible for everyone by converting 
                            complex legal text into simple, meaningful, and easy-to-read summaries.
                        </p>
                    </div>

                    {/* What We Do Card */}
                    <div style={{ 
                        border: "1px solid #E5E7EB", 
                        padding: "40px 30px", 
                        width: "500px", 
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
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '20px'
                        }}>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                backgroundColor: '#D1FAE5',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '15px'
                            }}>
                                <svg style={{ width: '24px', height: '24px', color: '#059669' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h2 style={{ 
                                color: '#1F2937', 
                                fontSize: '28px',
                                fontWeight: 'bold',
                                margin: 0
                            }}>What We Do</h2>
                        </div>
                        <ul style={{ 
                            textAlign: "left", 
                            paddingLeft: '0px',
                            color: '#4B5563',
                            lineHeight: '1.6'
                        }}>
                            {[
                                "Upload and analyze legal documents (PDF, DOCX, TXT)",
                                "Generate simplified and context-aware summaries",
                                "Support multiple languages (English, Hindi, Marathi, etc.)",
                                "Allow users to chat with the summarized document for deeper understanding",
                                "Provide dashboards to track usage and document history"
                            ].map((feature, index) => (
                                <li key={index} style={{ 
                                    marginBottom: '12px', 
                                    fontSize: '16px',
                                    display: 'flex',
                                    alignItems: 'flex-start'
                                }}>
                                    <span style={{ 
                                        color: '#059669', 
                                        marginRight: '10px',
                                        fontWeight: 'bold'
                                    }}>✓</span>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Why LexBot Section */}
                <div style={{ 
                    backgroundColor: '#2563EB',
                    color: 'white',
                    padding: '50px 30px',
                    borderRadius: '12px',
                    marginTop: '50px',
                    maxWidth: '800px',
                    margin: '50px auto',
                    boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)'
                }}>
                    <h2 style={{ 
                        fontSize: '32px',
                        fontWeight: 'bold',
                        marginBottom: '20px'
                    }}>Why Choose LexBot?</h2>
                    <p style={{ 
                        fontSize: '18px',
                        lineHeight: '1.6',
                        opacity: '0.95',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        LexBot empowers individuals with clear legal understanding.  
                        Whether you're signing a contract, studying law, or reviewing government policies —  
                        LexBot ensures you know exactly what it means, without needing a lawyer.
                    </p>
                </div>

                {/* CTA Section */}
                <div style={{ marginTop: '50px' }}>
                    <a
                        href="/login"
                        style={{ 
                            padding: "15px 30px", 
                            background: "#2563EB", 
                            color: "#fff", 
                            borderRadius: "8px", 
                            border: "none",
                            cursor: "pointer",
                            fontSize: "18px",
                            fontWeight: "bold",
                            textDecoration: 'none',
                            display: 'inline-block',
                            transition: "all 0.3s ease"
                        }}
                        onMouseOver={(e) => {
                            e.target.style.background = "#1D4ED8";
                            e.target.style.transform = "translateY(-2px)";
                        }}
                        onMouseOut={(e) => {
                            e.target.style.background = "#2563EB";
                            e.target.style.transform = "translateY(0)";
                        }}>
                        Get Started →
                    </a>
                </div>
            </div>
        </div>
    )
}
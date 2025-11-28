import React, { useState } from 'react'

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simulate form submission
        setTimeout(() => {
            console.log('Form submitted:', formData);
            setIsSubmitting(false);
            alert('Thank you for your message! We will get back to you soon.');
            setFormData({ name: '', email: '', subject: '', message: '' });
        }, 2000);
    };

    const contactMethods = [
        {
            icon: (
                <svg style={{ width: '24px', height: '24px', color: '#2563EB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            title: "Email Us",
            description: "Send us an email anytime",
            value: "support@LexBot.com",
            link: "mailto:support@LexBot.com"
        },
        {
            icon: (
                <svg style={{ width: '24px', height: '24px', color: '#2563EB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
            ),
            title: "Call Us",
            description: "Mon to Fri, 9AM to 6PM",
            value: "+1 (555) 123-4567",
            link: "tel:+15551234567"
        },
        {
            icon: (
                <svg style={{ width: '24px', height: '24px', color: '#2563EB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            title: "Office",
            description: "Come say hello at our office",
            value: "123 Legal Street, Law District, City 10001",
            link: "https://maps.google.com"
        }
    ];

    return (
        <div>
            <div style={{ textAlign: "center", padding: "40px" }}>
                <h1 style={{ color: '#1F2937', marginBottom: '10px', fontSize: '36px', fontWeight: 'bold' }}>
                    Contact <span style={{ color: '#2563EB' }}>LexBot</span>
                </h1>
                <p style={{ color: '#6B7280', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
                    Get in touch with our team. We're here to help you with any questions about 
                    our legal document simplification services.
                </p>

                {/* Contact Methods Grid */}
                <div style={{ 
                    display: "flex", 
                    justifyContent: "center", 
                    gap: "30px", 
                    marginTop: "50px", 
                    flexWrap: "wrap",
                    maxWidth: '1200px',
                    margin: '50px auto'
                }}>
                    {contactMethods.map((method, index) => (
                        <a 
                            key={index}
                            href={method.link}
                            style={{ 
                                textDecoration: 'none',
                                border: "1px solid #E5E7EB", 
                                padding: "30px 25px", 
                                width: "300px", 
                                borderRadius: "12px",
                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                                backgroundColor: "white",
                                transition: "all 0.3s ease",
                                position: "relative",
                                overflow: "hidden",
                                display: 'block'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-5px)";
                                e.currentTarget.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.1)";
                                e.currentTarget.style.borderColor = '#2563EB';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.05)";
                                e.currentTarget.style.borderColor = '#E5E7EB';
                            }}
                        >
                            <div style={{
                                width: '60px',
                                height: '60px',
                                backgroundColor: '#DBEAFE',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px'
                            }}>
                                {method.icon}
                            </div>
                            <h3 style={{ 
                                color: '#1F2937', 
                                fontSize: '20px',
                                fontWeight: 'bold',
                                marginBottom: '8px'
                            }}>{method.title}</h3>
                            <p style={{ 
                                color: '#6B7280', 
                                fontSize: '14px',
                                marginBottom: '15px'
                            }}>{method.description}</p>
                            <p style={{ 
                                color: '#2563EB', 
                                fontSize: '16px',
                                fontWeight: '600',
                                margin: 0
                            }}>{method.value}</p>
                        </a>
                    ))}
                </div>

                {/* Contact Form */}
                <div style={{ 
                    display: "flex", 
                    justifyContent: "center", 
                    marginTop: "50px",
                    maxWidth: '1200px',
                    margin: '50px auto'
                }}>
                    <div style={{ 
                        border: "1px solid #E5E7EB", 
                        padding: "40px", 
                        width: "600px", 
                        borderRadius: "12px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                        backgroundColor: "white",
                        transition: "all 0.3s ease"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-5px)";
                        e.currentTarget.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.05)";
                    }}>
                        <h2 style={{ 
                            color: '#1F2937', 
                            fontSize: '28px',
                            fontWeight: 'bold',
                            marginBottom: '30px',
                            textAlign: 'center'
                        }}>Send us a Message</h2>
                        
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ 
                                        display: 'block', 
                                        color: '#374151', 
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        marginBottom: '8px'
                                    }}>
                                        Your Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            border: '1px solid #D1D5DB',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#2563EB';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#D1D5DB';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ 
                                        display: 'block', 
                                        color: '#374151', 
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        marginBottom: '8px'
                                    }}>
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            border: '1px solid #D1D5DB',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#2563EB';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#D1D5DB';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                            </div>
                            
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ 
                                    display: 'block', 
                                    color: '#374151', 
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    marginBottom: '8px'
                                }}>
                                    Subject *
                                </label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '1px solid #D1D5DB',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#2563EB';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#D1D5DB';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                            
                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ 
                                    display: 'block', 
                                    color: '#374151', 
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    marginBottom: '8px'
                                }}>
                                    Message *
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="6"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '1px solid #D1D5DB',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        resize: 'vertical',
                                        transition: 'all 0.3s ease',
                                        fontFamily: 'inherit'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#2563EB';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#D1D5DB';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                ></textarea>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{ 
                                    width: "100%",
                                    padding: "15px 30px", 
                                    background: isSubmitting ? "#9CA3AF" : "#2563EB", 
                                    color: "#fff", 
                                    borderRadius: "8px", 
                                    border: "none",
                                    cursor: isSubmitting ? "not-allowed" : "pointer",
                                    fontSize: "18px",
                                    fontWeight: "bold",
                                    transition: "all 0.3s ease"
                                }}
                                onMouseOver={(e) => {
                                    if (!isSubmitting) {
                                        e.target.style.background = "#1D4ED8";
                                        e.target.style.transform = "translateY(-2px)";
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (!isSubmitting) {
                                        e.target.style.background = "#2563EB";
                                        e.target.style.transform = "translateY(0)";
                                    }
                                }}
                            >
                                {isSubmitting ? "Sending..." : "Send Message"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* FAQ Section */}
                <div style={{ 
                    backgroundColor: '#F9FAFB',
                    padding: '50px 30px',
                    borderRadius: '12px',
                    marginTop: '50px',
                    maxWidth: '800px',
                    margin: '50px auto'
                }}>
                    <h2 style={{ 
                        color: '#1F2937',
                        fontSize: '28px',
                        fontWeight: 'bold',
                        marginBottom: '30px',
                        textAlign: 'center'
                    }}>Frequently Asked Questions</h2>
                    
                    <div style={{ textAlign: 'left' }}>
                        {[
                            {
                                question: "How quickly do you respond to inquiries?",
                                answer: "We typically respond within 24 hours during business days."
                            },
                            {
                                question: "Do you offer custom enterprise solutions?",
                                answer: "Yes, we provide customized solutions for businesses and organizations."
                            },
                            {
                                question: "Can I integrate LexBot with my existing systems?",
                                answer: "We offer API access for seamless integration with your current workflow."
                            }
                        ].map((faq, index) => (
                            <div key={index} style={{ 
                                marginBottom: '20px',
                                padding: '20px',
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB'
                            }}>
                                <h3 style={{ 
                                    color: '#1F2937',
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    marginBottom: '10px'
                                }}>Q: {faq.question}</h3>
                                <p style={{ 
                                    color: '#6B7280',
                                    fontSize: '16px',
                                    margin: 0
                                }}>{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
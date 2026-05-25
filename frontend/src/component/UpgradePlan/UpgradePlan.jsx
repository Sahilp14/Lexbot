import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function Pricing() {
    const { t } = useTranslation();
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);
    const [sweetalertLoaded, setSweetalertLoaded] = useState(false);
    const plans = [
        { name: t("basic_plan"), price: 99, features: [t("feat_sum_10"), t("feat_email_support")] },
        { name: t("pro_plan"), price: 299, features: [t("feat_sum_100"), t("feat_chat_docs"), t("feat_priority_support")] },
        { name: t("premium_plan"), price: 599, features: [t("feat_unlimited_docs"), t("feat_ai_chat"), t("feat_247_support")] },
    ];

    // Load Razorpay and SweetAlert scripts dynamically
    useEffect(() => {
        const loadScripts = async () => {
            // Load SweetAlert2 first
            const sweetalertLoaded = await loadSweetAlert();
            // Then load Razorpay
            await loadRazorpay();
        };

        const loadSweetAlert = () => {
            return new Promise((resolve) => {
                // Check if SweetAlert2 is already loaded
                if (window.Swal) {
                    setSweetalertLoaded(true);
                    resolve(true);
                    return;
                }

                // Create and load the script
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
                script.onload = () => {
                    setSweetalertLoaded(true);
                    resolve(true);
                };
                script.onerror = () => {
                    console.error('Failed to load SweetAlert2 script');
                    setSweetalertLoaded(false);
                    resolve(false);
                };
                document.body.appendChild(script);
            });
        };

        const loadRazorpay = () => {
            return new Promise((resolve) => {
                // Check if Razorpay is already loaded
                if (window.Razorpay) {
                    setRazorpayLoaded(true);
                    resolve(true);
                    return;
                }

                // Create and load the script
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.onload = () => {
                    setRazorpayLoaded(true);
                    resolve(true);
                };
                script.onerror = () => {
                    console.error('Failed to load Razorpay script');
                    setRazorpayLoaded(false);
                    resolve(false);
                };
                document.body.appendChild(script);
            });
        };

        loadScripts();
    }, []);

    const showSuccessAlert = () => {
        if (window.Swal) {
            window.Swal.fire({
                title: t('payment_success_title'),
                text: t('payment_success_text'),
                icon: 'success',
                confirmButtonColor: '#2563EB',
                confirmButtonText: t('continue_btn'),
                timer: 5000,
                timerProgressBar: true,
            });
        } else {
            alert(t('payment_success_title'));
        }
    };

    const showCancellationAlert = () => {
        if (window.Swal) {
            window.Swal.fire({
                title: t('payment_cancel_title'),
                text: t('payment_cancel_text'),
                icon: 'info',
                showCancelButton: true,
                confirmButtonColor: '#2563EB',
                cancelButtonColor: '#6B7280',
                confirmButtonText: t('try_again_btn'),
                cancelButtonText: t('maybe_later_btn'),
            }).then((result) => {
                if (result.isConfirmed) {
                    console.log('User wants to try payment again');
                }
            });
        } else {
            alert(t('payment_cancel_title'));
        }
    };

    const showErrorAlert = (message) => {
        if (window.Swal) {
            window.Swal.fire({
                title: t('payment_fail_title'),
                text: message || t('payment_fail_text'),
                icon: 'error',
                confirmButtonColor: '#DC2626',
                confirmButtonText: t('try_again_btn'),
            });
        } else {
            alert(t('payment_fail_title') + ': ' + message);
        }
    };

    const showLoadingAlert = () => {
        if (window.Swal) {
            window.Swal.fire({
                title: t('processing_payment_title'),
                text: t('processing_payment_text'),
                allowOutsideClick: false,
                didOpen: () => {
                    window.Swal.showLoading();
                }
            });
        }
    };

    const closeLoadingAlert = () => {
        if (window.Swal) {
            window.Swal.close();
        }
    };

    async function handlePayment(amount, e) {
        e.preventDefault();
        
        // Check if Razorpay is loaded
        if (!window.Razorpay) {
            showErrorAlert(t("payment_sys_loading"));
            return;
        }

        // Show loading alert
        showLoadingAlert();

        try {
            // For testing - you can uncomment this when your backend is ready
            // const res = await fetch("http://localhost:8000/api/create-order/", {
            //     method: "POST",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify({ amount })
            // });
            // const data = await res.json();

            // Close loading alert
            closeLoadingAlert();

            const options = {
                key: "rzp_test_R77hsIUHcTie27",
                currency: "INR",
                amount: amount, // amount in paise
                name: "LegiFy - Plan Upgrade",
                description: "Upgrading Subscription Plan",
                handler: function (response) {
                    console.log("Payment ID:", response.razorpay_payment_id);
                    console.log("Order ID:", response.razorpay_order_id);
                    console.log("Signature:", response.razorpay_signature);
                    
                    showSuccessAlert();
                    // Here you can verify the payment on your backend
                    // verifyPayment(response);
                },
                prefill: {
                    name: "User Name",
                    email: "user@example.com",
                    contact: "9000000000"
                },
                theme: {
                    color: "#2563EB"
                },
                modal: {
                    ondismiss: function() {
                        console.log("Payment modal closed by user");
                        showCancellationAlert();
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
            
        } catch (error) {
            console.error("Payment error:", error);
            closeLoadingAlert();
            showErrorAlert(error.message);
        }
    }

    // Function to verify payment (to be implemented later)
    const verifyPayment = async (response) => {
        try {
            const verifyRes = await fetch("http://localhost:8000/api/verify-payment/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature
                })
            });
            const result = await verifyRes.json();
            if (result.success) {
                showSuccessAlert();
            } else {
                showErrorAlert("Payment verification failed!");
            }
        } catch (error) {
            console.error("Verification error:", error);
            showErrorAlert("Verification failed. Please contact support.");
        }
    };

    const allScriptsLoaded = razorpayLoaded && sweetalertLoaded;

    return (
        <div>
            <div style={{ textAlign: "center", padding: "40px" }}>
                <h1 style={{ color: '#1F2937', marginBottom: '10px' }}>{t("choose_plan")}</h1>
                <p style={{ color: '#6B7280', fontSize: '18px' }}>{t("choose_plan_desc")}</p>
                
                {/* Loading indicator */}
                {!allScriptsLoaded && (
                    <div style={{ 
                        color: '#f59e0b', 
                        marginBottom: '20px',
                        padding: '10px',
                        backgroundColor: '#fffbeb',
                        borderRadius: '8px',
                        display: 'inline-block'
                    }}>
                        ⚡ {t("loading_payment_sys")}
                        {!razorpayLoaded && " (Razorpay)"}
                        {!sweetalertLoaded && " (SweetAlert)"}
                    </div>
                )}
                
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
                                    {t("most_popular")}
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
                            <button
                                onClick={(e) => handlePayment(plan.price * 100, e)}
                                disabled={!allScriptsLoaded}
                                style={{ 
                                    marginTop: "10px", 
                                    padding: "12px 24px", 
                                    background: allScriptsLoaded ? "#2563EB" : "#9CA3AF", 
                                    color: "#fff", 
                                    borderRadius: "8px", 
                                    border: "none",
                                    cursor: allScriptsLoaded ? "pointer" : "not-allowed",
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                    width: "100%",
                                    transition: "all 0.3s ease"
                                }}
                                onMouseOver={(e) => {
                                    if (allScriptsLoaded) {
                                        e.target.style.background = "#1D4ED8";
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (allScriptsLoaded) {
                                        e.target.style.background = "#2563EB";
                                    }
                                }}>
                                {allScriptsLoaded ? t("upgrade_now") : t("loading")}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
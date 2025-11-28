import React, { useState } from 'react';

const Settings = () => {
    const [theme, setTheme] = useState('light');
    const [language, setLanguage] = useState('english');
    const [notifications, setNotifications] = useState(true);
    const [autoSave, setAutoSave] = useState(true);

    const styles = {
        container: {
            maxWidth: '800px',
            margin: '0 auto',
            padding: '40px 20px',
            backgroundColor: '#f8fafc',
            minHeight: '100vh'
        },
        header: {
            textAlign: 'center',
            marginBottom: '40px'
        },
        title: {
            color: '#1f2937',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '8px'
        },
        subtitle: {
            color: '#6b7280',
            fontSize: '1.125rem'
        },
        section: {
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
        },
        sectionHeader: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '1px solid #f3f4f6'
        },
        sectionIcon: {
            fontSize: '1.5rem',
            marginRight: '12px'
        },
        sectionTitle: {
            color: '#1f2937',
            fontSize: '1.25rem',
            fontWeight: '600',
            margin: 0
        },
        settingItem: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: '16px 0',
            borderBottom: '1px solid #f9fafb'
        },
        lastSettingItem: {
            borderBottom: 'none'
        },
        settingInfo: {
            flex: 1
        },
        settingLabel: {
            display: 'block',
            color: '#1f2937',
            fontWeight: '500',
            marginBottom: '4px',
            fontSize: '1rem'
        },
        settingDescription: {
            color: '#6b7280',
            fontSize: '0.875rem',
            margin: 0,
            lineHeight: '1.4'
        },
        toggleSwitch: {
            position: 'relative',
            display: 'inline-block',
            width: '52px',
            height: '28px'
        },
        toggleInput: {
            opacity: 0,
            width: 0,
            height: 0
        },
        toggleSlider: {
            position: 'absolute',
            cursor: 'pointer',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#d1d5db',
            transition: '.4s',
            borderRadius: '34px'
        },
        toggleSliderBefore: {
            position: 'absolute',
            content: '""',
            height: '20px',
            width: '20px',
            left: '4px',
            bottom: '4px',
            backgroundColor: 'white',
            transition: '.4s',
            borderRadius: '50%'
        },
        toggleSliderChecked: {
            backgroundColor: '#2563eb'
        },
        toggleSliderBeforeChecked: {
            transform: 'translateX(24px)'
        },
        radioGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        },
        radioOption: {
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer'
        },
        radioInput: {
            marginRight: '8px',
            accentColor: '#2563eb'
        },
        radioLabel: {
            color: '#374151',
            fontSize: '0.95rem'
        },
        selectInput: {
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            backgroundColor: 'white',
            color: '#374151',
            fontSize: '0.95rem',
            minWidth: '150px'
        },
        actionButton: {
            padding: '8px 16px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.95rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
        },
        infoValue: {
            color: '#6b7280',
            fontSize: '0.95rem',
            fontWeight: '500'
        }
    };

    const settingsSections = [
        {
            
            title: "General",
            icon: "⚙️",
            settings: [
                {
                    type: "toggle",
                    label: "Notifications",
                    value: notifications,
                    onChange: setNotifications,
                    description: "Receive notifications about updates and features"
                },
                {
                    type: "toggle",
                    label: "Auto Save",
                    value: autoSave,
                    onChange: setAutoSave,
                    description: "Automatically save your document changes"
                }
            ]
        },
        {
            title: "Appearance",
            icon: "🎨",
            settings: [
                {
                    type: "radio",
                    label: "Theme",
                    value: theme,
                    onChange: setTheme,
                    options: [
                        { label: "Light", value: "light" },
                        { label: "Dark", value: "dark" },
                        { label: "System", value: "system" }
                    ]
                }
            ]
        },
        {
            title: "Language & Region",
            icon: "🌐",
            settings: [
                {
                    type: "select",
                    label: "Language",
                    value: language,
                    onChange: setLanguage,
                    options: [
                        { label: "English", value: "english" },
                        { label: "Spanish", value: "spanish" },
                        { label: "French", value: "french" },
                        { label: "German", value: "german" }
                    ]
                }
            ]
        },
        {
            title: "Data & Privacy",
            icon: "🔒",
            settings: [
                {
                    type: "button",
                    label: "Export Data",
                    action: () => alert("Exporting your data..."),
                    description: "Download all your documents and data"
                },
                {
                    type: "button",
                    label: "Clear Cache",
                    action: () => alert("Cache cleared successfully"),
                    description: "Clear temporary files and free up space"
                }
            ]
        },
        {
            title: "About",
            icon: "ℹ️",
            settings: [
                {
                    type: "info",
                    label: "Version",
                    value: "1.0.0",
                    description: "Current app version"
                },
                {
                    type: "info",
                    label: "Last Updated",
                    value: "Nov 7, 2024",
                    description: "Last app update date"
                }
            ]
        }
    ];

    const renderSetting = (setting, index, isLast) => {
        const itemStyle = {
            ...styles.settingItem,
            ...(isLast ? styles.lastSettingItem : {})
        };

        switch (setting.type) {
            case "toggle":
                return (
                    <div key={index} style={itemStyle}>
                        <div style={styles.settingInfo}>
                            <label style={styles.settingLabel}>{setting.label}</label>
                            <p style={styles.settingDescription}>{setting.description}</p>
                        </div>
                        <label style={styles.toggleSwitch}>
                            <input
                                type="checkbox"
                                checked={setting.value}
                                onChange={(e) => setting.onChange(e.target.checked)}
                                style={styles.toggleInput}
                            />
                            <span 
                                style={{
                                    ...styles.toggleSlider,
                                    ...(setting.value ? styles.toggleSliderChecked : {})
                                }}
                            >
                                <span 
                                    style={{
                                        ...styles.toggleSliderBefore,
                                        ...(setting.value ? styles.toggleSliderBeforeChecked : {})
                                    }}
                                />
                            </span>
                        </label>
                    </div>
                );

            case "radio":
                return (
                    <div key={index} style={itemStyle}>
                        <div style={styles.settingInfo}>
                            <label style={styles.settingLabel}>{setting.label}</label>
                        </div>
                        <div style={styles.radioGroup}>
                            {setting.options.map((option, optIndex) => (
                                <label key={optIndex} style={styles.radioOption}>
                                    <input
                                        type="radio"
                                        name={setting.label}
                                        value={option.value}
                                        checked={setting.value === option.value}
                                        onChange={(e) => setting.onChange(e.target.value)}
                                        style={styles.radioInput}
                                    />
                                    <span style={styles.radioLabel}>{option.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                );

            case "select":
                return (
                    <div key={index} style={itemStyle}>
                        <div style={styles.settingInfo}>
                            <label style={styles.settingLabel}>{setting.label}</label>
                        </div>
                        <select
                            value={setting.value}
                            onChange={(e) => setting.onChange(e.target.value)}
                            style={styles.selectInput}
                        >
                            {setting.options.map((option, optIndex) => (
                                <option key={optIndex} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                );

            case "button":
                return (
                    <div key={index} style={itemStyle}>
                        <div style={styles.settingInfo}>
                            <label style={styles.settingLabel}>{setting.label}</label>
                            <p style={styles.settingDescription}>{setting.description}</p>
                        </div>
                        <button
                            onClick={setting.action}
                            style={styles.actionButton}
                            onMouseOver={(e) => {
                                e.target.style.backgroundColor = '#1d4ed8';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.backgroundColor = '#2563eb';
                            }}
                        >
                            {setting.label}
                        </button>
                    </div>
                );

            case "info":
                return (
                    <div key={index} style={itemStyle}>
                        <div style={styles.settingInfo}>
                            <label style={styles.settingLabel}>{setting.label}</label>
                            <p style={styles.settingDescription}>{setting.description}</p>
                        </div>
                        <span style={styles.infoValue}>{setting.value}</span>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Settings</h1>
                <p style={styles.subtitle}>Customize your LexBot experience</p>
            </div>

            <div>
                {settingsSections.map((section, index) => (
                    <div key={index} style={styles.section}>
                        <div style={styles.sectionHeader}>
                            <span style={styles.sectionIcon}>{section.icon}</span>
                            <h2 style={styles.sectionTitle}>{section.title}</h2>
                        </div>
                        <div>
                            {section.settings.map((setting, settingIndex) => 
                                renderSetting(
                                    setting, 
                                    settingIndex, 
                                    settingIndex === section.settings.length - 1
                                )
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Settings;
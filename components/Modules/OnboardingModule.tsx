import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSystem } from '../../context/SystemContext';
import { Send, CheckCircle2, Copy, FileText, Globe, Activity, Monitor, Zap } from 'lucide-react';
import { PROFILE } from '../../constants';

// Clean, standard button
const SimpleButton = ({ children, onClick, type = "button", disabled = false, className = "" }: any) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-md hover:shadow-lg ${className}`}
    >
        {children}
    </button>
);

const OnboardingModule = () => {
    const [submitted, setSubmitted] = useState(false);
    const [copying, setCopying] = useState(false);
    const [sending, setSending] = useState(false);
    const [copyingData, setCopyingData] = useState(false);

    const [formData, setFormData] = useState({
        // Section 1
        fullName: '', businessName: '', email: '', phone: '', websiteUrl: '', businessDescription: '',
        // Section 2
        purposes: [] as string[], otherPurpose: '', goals: '', idealCustomer: '',
        // Section 3
        pageCount: '', features: [] as string[], otherFeature: '', contentStatus: '',
        // Section 4 & 5
        trafficExpectations: '', trafficPattern: '', visualIntensity: '', storageNeeds: '',
        // Section 6
        currentSetupStatus: '', currentHostingDetails: '', migrationNeeded: '', domainStatus: '',
        // Section 7
        socialAccounts: [] as string[], socialActivityLevel: '', includeSocialInQuote: '',
        // Section 8
        timeline: '', budgetRange: '',
        // Section 9
        additionalInfo: '',
    });

    const sections = [
        { id: 'contact', title: '1. Contact Info' },
        { id: 'goals', title: '2. Goals' },
        { id: 'features', title: '3. Features' },
        { id: 'media', title: '4. Hosting & Media' },
        { id: 'social', title: '5. Social Media' },
        { id: 'logistics', title: '6. Logistics' },
    ];

    const [currentStep, setCurrentStep] = useState(0);

    const handleCheckboxChange = (field: 'purposes' | 'features' | 'socialAccounts', value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(item => item !== value)
                : [...prev[field], value]
        }));
    };

    const handleCopyLink = () => {
        const url = `${window.location.origin}${window.location.pathname}?section=onboarding`;
        navigator.clipboard.writeText(url);
        setCopying(true);
        setTimeout(() => setCopying(false), 2000);
    };

    const generateEmailBody = () => {
        return `
WEBSITE & ONLINE PRESENCE QUESTIONNAIRE
--------------------------------------
NAME: ${formData.fullName}
BUSINESS: ${formData.businessName}
EMAIL: ${formData.email}
PHONE: ${formData.phone}

GOALS:
- Objectives: ${formData.purposes.join(', ')}
- Top Goals: ${formData.goals}
- Audience: ${formData.idealCustomer}

WEBSITE PROFILE:
- Pages: ${formData.pageCount}
- Features: ${formData.features.join(', ')}
- Media Intensity: ${formData.visualIntensity}
- Traffic Expectation: ${formData.trafficExpectations}

CURRENT SETUP:
- Status: ${formData.currentSetupStatus}
- Details: ${formData.currentHostingDetails}
- Domain: ${formData.domainStatus}

SOCIAL MEDIA:
- Profiles: ${formData.socialAccounts.join(', ')}
- In-Quote: ${formData.includeSocialInQuote}

LOGISTICS:
- Timeline: ${formData.timeline}
- Budget: ${formData.budgetRange}

NOTES:
${formData.additionalInfo}
`.trim();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        const bodyContent = generateEmailBody();
        const mailtoUrl = `mailto:${PROFILE.email}?subject=Project Intake: ${formData.businessName || formData.fullName}&body=${encodeURIComponent(bodyContent)}`;
        await new Promise(r => setTimeout(r, 1000));
        window.location.href = mailtoUrl;
        setSending(false);
        setSubmitted(true);
    };

    const handleCopyData = () => {
        const bodyContent = generateEmailBody();
        navigator.clipboard.writeText(bodyContent);
        setCopyingData(true);
        setTimeout(() => setCopyingData(false), 3000);
    };

    if (submitted) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white">
                <div className="text-green-500 mb-6 bg-green-50 p-6 rounded-full"><CheckCircle2 size={64} /></div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Questionnaire Sent!</h2>
                <p className="text-gray-600 mb-8 max-w-md">
                    Thank you. Your email app should have opened. If not, please copy the summary below and email it manually to <span className="text-blue-600 font-medium">{PROFILE.email}</span>.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={handleCopyData} className="px-6 py-3 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-all">
                        {copyingData ? 'Copied!' : 'Copy Summary'}
                    </button>
                    <SimpleButton onClick={() => setSubmitted(false)}>Start New</SimpleButton>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-gray-50 overflow-y-auto selection:bg-blue-100">
            <div className="max-w-3xl mx-auto px-6 py-12 md:py-20 flex flex-col min-h-full">
                
                <header className="mb-12 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Website Project Planner</h1>
                        <button onClick={handleCopyLink} className="text-xs font-semibold px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-blue-600 transition-all flex items-center gap-2 shadow-sm">
                            {copying ? <CheckCircle2 size={14}/> : <Copy size={14}/>} {copying ? 'Link Copied' : 'Share Form Link'}
                        </button>
                    </div>
                    <p className="text-gray-600 text-lg font-light leading-relaxed">
                        Fill in as little or as much as you like. We'll use this to build a custom quote for your business.
                    </p>
                </header>

                <form onSubmit={handleSubmit} className="flex-1 space-y-12 pb-32">
                    
                    {/* SECTION 1: CONTACT */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                           <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-xs">1</span>
                           Contact Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <InputField label="Full Name" required value={formData.fullName} onChange={v => setFormData({...formData, fullName: v})} />
                            <InputField label="Business Name" value={formData.businessName} onChange={v => setFormData({...formData, businessName: v})} />
                            <InputField label="Email Address" required type="email" value={formData.email} onChange={v => setFormData({...formData, email: v})} />
                            <InputField label="Phone Number" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} />
                            <div className="sm:col-span-2">
                                <InputField label="Current Website (if any)" value={formData.websiteUrl} onChange={v => setFormData({...formData, websiteUrl: v})} />
                            </div>
                            <div className="sm:col-span-2">
                               <label className="block text-sm font-semibold text-gray-700 mb-2">What does your business do?</label>
                               <textarea rows={3} value={formData.businessDescription} onChange={e => setFormData({...formData, businessDescription: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none resize-none" placeholder="Keep it simple!" />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: GOALS */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                           <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-xs">2</span>
                           Project Goals
                        </h3>
                        <div className="space-y-8">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-4">What is the aim of the website?</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {[
                                        'Brochure / Information', 'Ecommerce / Selling Online', 
                                        'Generating Leads', 'News / Blog', 
                                        'Portfolio Showcase', 'Client Portal'
                                    ].map(opt => (
                                        <CheckboxItem key={opt} label={opt} checked={formData.purposes.includes(opt)} onChange={() => handleCheckboxChange('purposes', opt)} />
                                    ))}
                                </div>
                            </div>
                            <InputField label="What are your top 3 goals?" area value={formData.goals} onChange={v => setFormData({...formData, goals: v})} />
                        </div>
                    </div>

                    {/* SECTION 3: FEATURES */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                           <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-xs">3</span>
                           Technical Features
                        </h3>
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <InputField label="Estimated Number of Pages" value={formData.pageCount} onChange={v => setFormData({...formData, pageCount: v})} />
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Content Status</label>
                                    <select value={formData.contentStatus} onChange={e => setFormData({...formData, contentStatus: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500">
                                        <option value="">Select an option</option>
                                        <option value="Ready">Everything is ready</option>
                                        <option value="Partial">I have some bits</option>
                                        <option value="Help">I need total help</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-4">Specific Features Needed</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {['Payments', 'Booking', 'Forms', 'Gallery', 'Video', 'Reviews', 'Blog', 'Login Area'].map(opt => (
                                        <CheckboxItem key={opt} label={opt} checked={formData.features.includes(opt)} onChange={() => handleCheckboxChange('features', opt)} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: MEDIA & HOSTING */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                           <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-xs">4</span>
                           Media & Hosting
                        </h3>
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Expected Monthly Traffic</label>
                                    <select value={formData.trafficExpectations} onChange={e => setFormData({...formData, trafficExpectations: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500">
                                        <option value="">Choose one...</option>
                                        <option value="Low">Low (0-500/mo)</option>
                                        <option value="Moderate">Moderate (500-2k/mo)</option>
                                        <option value="High">High (2k+/mo)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Visual Intensity</label>
                                    <select value={formData.visualIntensity} onChange={e => setFormData({...formData, visualIntensity: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500">
                                        <option value="">Choose one...</option>
                                        <option value="Simple">Text & Few Photos</option>
                                        <option value="Visual">Lots of Photos</option>
                                        <option value="Video">Video Heavy</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Migration Needed?</label>
                                    <select value={formData.migrationNeeded} onChange={e => setFormData({...formData, migrationNeeded: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500">
                                        <option value="">Is there a current site?</option>
                                        <option value="Yes">Yes, move it over</option>
                                        <option value="No">No, fresh start</option>
                                    </select>
                                </div>
                                <InputField label="Domain Preference" placeholder="e.g. example.com" value={formData.domainStatus} onChange={v => setFormData({...formData, domainStatus: v})} />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 5: LOGISTICS */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                           <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-xs">5</span>
                           Timeline & Budget
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                             <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Ideal Timeline</label>
                                <div className="flex flex-wrap gap-2">
                                    {['ASAP', '1-2 Months', 'Flexible'].map(opt => (
                                        <button key={opt} type="button" onClick={() => setFormData({...formData, timeline: opt})} className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${formData.timeline === opt ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-600'}`}>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Target Budget</label>
                                <div className="flex flex-wrap gap-2">
                                    {['< $500', '$500 - $2k', 'Premium'].map(opt => (
                                        <button key={opt} type="button" onClick={() => setFormData({...formData, budgetRange: opt})} className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${formData.budgetRange === opt ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-600'}`}>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <InputField label="Additional Notes" area value={formData.additionalInfo} onChange={v => setFormData({...formData, additionalInfo: v})} />
                    </div>

                    <div className="text-center pt-10">
                        <SimpleButton type="submit" disabled={sending} className="w-full sm:w-auto">
                            {sending ? 'Processing...' : 'Submit Finished Questionnaire'}
                        </SimpleButton>
                        <p className="mt-4 text-xs text-gray-400">
                            By clicking submit, your email app will open to send these details to Issa.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Sub-components
const InputField = ({ label, required, type = "text", placeholder = "", value, onChange, area = false }: any) => (
    <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {area ? (
            <textarea value={value} onChange={e => onChange(e.target.value)} required={required} placeholder={placeholder} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none resize-none" rows={3} />
        ) : (
            <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required} placeholder={placeholder} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none" />
        )}
    </div>
);

const CheckboxItem = ({ label, checked, onChange }: any) => (
    <button type="button" onClick={onChange} className={`flex items-center gap-3 p-4 rounded-xl border text-left text-sm transition-all ${checked ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}>
        <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${checked ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
            {checked && <CheckCircle2 size={12} className="text-white" />}
        </div>
        <span className="font-medium text-xs">{label}</span>
    </button>
);

export default OnboardingModule;

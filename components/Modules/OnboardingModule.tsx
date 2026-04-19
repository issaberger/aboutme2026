import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../../context/SystemContext';
import { Send, CheckCircle2, Copy, FileText, Globe, Activity, Monitor, ArrowRight, Zap } from 'lucide-react';
import { PROFILE } from '../../constants';

const OnboardingModule = () => {
    const { themeMode } = useSystem();
    const isDark = themeMode === 'dark';
    
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
        // Section 4
        trafficExpectations: '', trafficPattern: '', 
        // Section 5
        visualIntensity: '', storageNeeds: '',
        // Section 6
        hasHosting: '', currentWebsite: '', currentHosting: '', migrationNeeded: '',
        hasDomain: '', domainName: '',
        // Section 7
        social: { instagram: '', facebook: '', tiktok: '', linkedin: '', twitter: '', youtube: '', other: '' },
        socialActivityLevel: '', includeSocialInQuote: '',
        // Section 8
        timeline: '', budgetRange: '',
        // Section 9
        additionalInfo: '',
    });

    const handleCopyLink = () => {
        const url = `${window.location.origin}${window.location.pathname}?section=onboarding`;
        navigator.clipboard.writeText(url);
        setCopying(true);
        setTimeout(() => setCopying(false), 2000);
    };

    const handleSocialChange = (platform: keyof typeof formData.social, value: string) => {
        setFormData(prev => ({
            ...prev,
            social: { ...prev.social, [platform]: value }
        }));
    };

    const generateEmailBody = () => {
        return `
CLIENT WEBSITE & ONLINE PRESENCE QUESTIONNAIRE
----------------------------------------------

SECTION 1: CONTACT & BASIC BUSINESS INFO
1. Full name: ${formData.fullName}
2. Business name: ${formData.businessName || 'N/A'}
3. Email: ${formData.email}
4. Phone: ${formData.phone || 'N/A'}
5. Website URL: ${formData.websiteUrl || 'New website - not launched yet'}
6. Business Description: ${formData.businessDescription}

SECTION 2: BUSINESS GOALS & OBJECTIVES
7. Main purpose: ${formData.purposes.join(', ')} ${formData.otherPurpose ? `(Other: ${formData.otherPurpose})` : ''}
8. Top 3 goals (12mo): ${formData.goals}
9. Ideal customer: ${formData.idealCustomer}

SECTION 3: WEBSITE CONTENT & FEATURES
10. Pages needed: ${formData.pageCount}
11. Special features: ${formData.features.join(', ')} ${formData.otherFeature ? `(Other: ${formData.otherFeature})` : ''}
12. Content readiness: ${formData.contentStatus}

SECTION 4: EXPECTED TRAFFIC
13. Monthly visitors: ${formData.trafficExpectations}
14. Traffic pattern: ${formData.trafficPattern}

SECTION 5: PHOTOS, VIDEOS & STORAGE
15. Media intensity: ${formData.visualIntensity}
16. Expected storage: ${formData.storageNeeds}

SECTION 6: CURRENT ONLINE SETUP
17. Existing website/hosting? ${formData.hasHosting}
    - Current URL: ${formData.currentWebsite || 'N/A'}
    - Host: ${formData.currentHosting || 'N/A'}
    - Migration needed? ${formData.migrationNeeded || 'N/A'}
18. Domain name? ${formData.hasDomain} 
    - Domain: ${formData.domainName || 'N/A'}

SECTION 7: SOCIAL MEDIA PRESENCE
19. Accounts:
    - Instagram: ${formData.social.instagram}
    - Facebook: ${formData.social.facebook}
    - TikTok: ${formData.social.tiktok}
    - LinkedIn: ${formData.social.linkedin}
    - X (Twitter): ${formData.social.twitter}
    - YouTube: ${formData.social.youtube}
    - Other: ${formData.social.other}
20. Current activity level: ${formData.socialActivityLevel}
21. Include in quote? ${formData.includeSocialInQuote}

SECTION 8: TIMELINE & BUDGET
22. Desired live date: ${formData.timeline}
23. Budget range: ${formData.budgetRange}

SECTION 9: ANYTHING ELSE
24. Extra Info: ${formData.additionalInfo || 'None provided'}
`.trim();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        const bodyContent = generateEmailBody();
        const subject = `New Client Questionnaire: ${formData.businessName || formData.fullName}`;
        const mailtoUrl = `mailto:${PROFILE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyContent)}`;
        
        await new Promise(r => setTimeout(r, 800));
        window.location.href = mailtoUrl;
        setSending(false);
        setSubmitted(true);
    };

    // Style Helpers mapped to Dark/Light mode
    const bgApp = isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50';
    const bgCard = isDark ? 'bg-[#111] border-gray-800 shadow-2xl' : 'bg-white border-gray-100 shadow-sm';
    const textMain = isDark ? 'text-gray-100' : 'text-gray-900';
    const textSub = isDark ? 'text-gray-400' : 'text-gray-600';
    const primaryBg = isDark ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-600 hover:bg-blue-700';

    if (submitted) {
        return (
            <div className={`h-full flex flex-col items-center justify-center p-8 text-center ${bgApp} transition-colors duration-300`}>
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`mb-6 p-6 rounded-full ${isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-500'}`}>
                    <CheckCircle2 size={64} />
                </motion.div>
                <h2 className={`text-3xl md:text-4xl font-bold ${textMain} mb-4 tracking-tight`}>Answers Prepared!</h2>
                <p className={`${textSub} mb-8 max-w-lg text-lg leading-relaxed`}>
                    Your email app should have opened automatically with the answers attached. If it didn't, click below to copy your summary and send it directly to <span className="font-semibold text-blue-500">{PROFILE.email}</span>.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                    <button onClick={() => {
                        navigator.clipboard.writeText(generateEmailBody());
                        setCopyingData(true);
                        setTimeout(() => setCopyingData(false), 3000);
                    }} className={`flex-1 px-6 py-4 border rounded-xl text-sm font-semibold transition-all ${isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                        {copyingData ? 'Copied to Clipboard!' : 'Copy Summary as Backup'}
                    </button>
                    <button onClick={() => setSubmitted(false)} className={`flex-1 px-6 py-4 ${primaryBg} text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg`}>
                        Return to Form
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`h-full overflow-y-auto ${bgApp} transition-colors duration-300 w-full selection:bg-blue-500/30`}>
            {/* Header Content */}
            <div className="max-w-4xl mx-auto px-4 py-12 md:py-24">
                <header className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                        <div className="space-y-3">
                            <h1 className={`text-3xl md:text-5xl font-extrabold ${textMain} tracking-tight leading-tight`}>
                                Client Website & <br className="hidden md:block" />Online Presence Questionnaire
                            </h1>
                            <p className="text-blue-500 font-semibold tracking-wide uppercase text-sm flex items-center gap-2">
                                <Zap size={16} /> Easy-to-fill template • No tech knowledge required!
                            </p>
                        </div>
                        <button onClick={handleCopyLink} className={`shrink-0 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border font-semibold text-sm transition-all shadow-sm ${isDark ? 'border-gray-700 bg-gray-800/50 text-gray-300 hover:text-white hover:border-gray-500' : 'border-gray-200 bg-white text-gray-600 hover:text-blue-600 hover:border-blue-200'}`}>
                            {copying ? <CheckCircle2 size={16}/> : <Copy size={16}/>} 
                            {copying ? 'Link Copied' : 'Share Form Link'}
                        </button>
                    </div>
                    <div className={`p-6 rounded-2xl border ${isDark ? 'bg-blue-900/10 border-blue-900/30' : 'bg-blue-50 border-blue-100'}`}>
                        <p className={`text-base md:text-lg leading-relaxed ${textSub}`}>
                            We’ve designed this form in plain English with simple explanations and examples so anyone can complete it. 
                            The more details you give us, the more accurate and customized your quote will be. We’ll use this to recommend the perfect hosting plan, any extras you might need, and even social media management if you want us to handle that too.
                        </p>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="space-y-10 md:space-y-16 pb-32">
                    
                    {/* SECTION 1: CONTACT */}
                    <SectionCard title="SECTION 1: Your Contact & Basic Business Information" subtitle="(So we know who we’re talking to and can send the quote)" icon={<Globe />} isDark={isDark}>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Question isDark={isDark} num={1} label="Full name:" required>
                                    <TextInput isDark={isDark} required value={formData.fullName} onChange={v => setFormData({...formData, fullName: v})} placeholder="Jane Doe" />
                                </Question>
                                <Question isDark={isDark} num={2} label="Business / Company name (if different):">
                                    <TextInput isDark={isDark} value={formData.businessName} onChange={v => setFormData({...formData, businessName: v})} placeholder="Doe Enterprises" />
                                </Question>
                                <Question isDark={isDark} num={3} label="Email address:" required>
                                    <TextInput type="email" isDark={isDark} required value={formData.email} onChange={v => setFormData({...formData, email: v})} placeholder="jane@example.com" />
                                </Question>
                                <Question isDark={isDark} num={4} label="Phone number (with country code):">
                                    <TextInput isDark={isDark} value={formData.phone} onChange={v => setFormData({...formData, phone: v})} placeholder="+1 (555) 123-4567" />
                                </Question>
                                <div className="md:col-span-2">
                                    <Question isDark={isDark} num={5} label="Website URL if you already have one:" helper='If you don’t have a website yet, just write "New website – not launched yet"'>
                                        <TextInput isDark={isDark} value={formData.websiteUrl} onChange={v => setFormData({...formData, websiteUrl: v})} placeholder="www.yourbusiness.com" />
                                    </Question>
                                </div>
                            </div>
                            <Question isDark={isDark} num={6} label="What does your business do? (1-2 sentences is perfect)" helper='Example: "We sell handmade jewelry online" or "I’m a local real estate agent helping people buy homes in Maryland"'>
                                <TextArea isDark={isDark} required value={formData.businessDescription} onChange={v => setFormData({...formData, businessDescription: v})} />
                            </Question>
                        </div>
                    </SectionCard>

                    {/* SECTION 2: GOALS */}
                    <SectionCard title="SECTION 2: Your Business Goals & Objectives" subtitle="(This helps us build a website that actually helps your business grow)" icon={<CheckCircle2 />} isDark={isDark}>
                        <div className="space-y-10">
                            <Question isDark={isDark} num={7} label="What is the main purpose of your website? (Check all that apply and add details)">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                    {[
                                        'Just a simple “brochure” site to show who we are and how to contact us',
                                        'Sell products or services online (online store / e-commerce)',
                                        'Collect leads / get people to contact us or book appointments',
                                        'Blog or share articles / news / updates',
                                        'Show a portfolio of work (photos, videos, projects)',
                                        'Member area / login for clients'
                                    ].map(opt => (
                                        <CheckboxCard key={opt} opt={opt} isDark={isDark} checked={formData.purposes.includes(opt)} onChange={() => {
                                            setFormData(p => ({
                                                ...p, purposes: p.purposes.includes(opt) ? p.purposes.filter(o => o !== opt) : [...p.purposes, opt]
                                            }))
                                        }} />
                                    ))}
                                </div>
                                <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                                    <span className={`${textMain} font-medium`}>Other:</span>
                                    <TextInput isDark={isDark} value={formData.otherPurpose} onChange={v => setFormData({...formData, otherPurpose: v})} placeholder="Specify other purpose..." className="flex-1" />
                                </div>
                            </Question>

                            <Question isDark={isDark} num={8} label="What are your top 3 goals for the website in the next 12 months?" helper='Example: "Get 20 new customers per month", "Make $5,000 in online sales monthly", "Build an email list of 1,000 people"'>
                                <TextArea isDark={isDark} required value={formData.goals} onChange={v => setFormData({...formData, goals: v})} />
                            </Question>

                            <Question isDark={isDark} num={9} label="Who is your ideal customer / audience? (age, location, interests)" helper='Example: "Women 25-45 in the DC/Maryland area who love unique jewelry"'>
                                <TextInput isDark={isDark} required value={formData.idealCustomer} onChange={v => setFormData({...formData, idealCustomer: v})} />
                            </Question>
                        </div>
                    </SectionCard>

                    {/* SECTION 3: CONTENT & FEATURES */}
                    <SectionCard title="SECTION 3: Website Content & Features You Want" subtitle="(Help us understand what will actually be on the site)" icon={<FileText />} isDark={isDark}>
                        <div className="space-y-10">
                            <Question isDark={isDark} num={10} label="How many pages do you think you’ll need?" helper='Example: Home, About, Services, Shop, Contact → 5 pages'>
                                <TextInput isDark={isDark} required value={formData.pageCount} onChange={v => setFormData({...formData, pageCount: v})} />
                            </Question>

                            <Question isDark={isDark} num={11} label="Will you have any of these special features? (Check all that apply)">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                    {[
                                        'Online store / shopping cart',
                                        'Booking / appointment calendar',
                                        'Contact form or quote request form',
                                        'Photo gallery or portfolio',
                                        'Video gallery or embedded videos',
                                        'Blog / news section',
                                        'Testimonials / reviews section',
                                        'Newsletter signup',
                                        'Login area for customers'
                                    ].map(opt => (
                                        <CheckboxCard key={opt} opt={opt} isDark={isDark} checked={formData.features.includes(opt)} onChange={() => {
                                            setFormData(p => ({
                                                ...p, features: p.features.includes(opt) ? p.features.filter(o => o !== opt) : [...p.features, opt]
                                            }))
                                        }} />
                                    ))}
                                </div>
                                <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                                    <span className={`${textMain} font-medium`}>Anything else:</span>
                                    <TextInput isDark={isDark} value={formData.otherFeature} onChange={v => setFormData({...formData, otherFeature: v})} placeholder="Specify additional features..." className="flex-1" />
                                </div>
                            </Question>

                            <Question isDark={isDark} num={12} label="Do you already have all the text, photos, and logos ready?">
                                <RadioGroup isDark={isDark} options={[
                                    'Yes, everything is ready',
                                    'I have some, but will need help',
                                    'No – I’ll need you to help create or organize content'
                                ]} value={formData.contentStatus} onChange={v => setFormData({...formData, contentStatus: v})} />
                            </Question>
                        </div>
                    </SectionCard>

                    {/* SECTION 4: TRAFFIC */}
                    <SectionCard title="SECTION 4: How Busy Will the Website Be? (Traffic Expectations)" subtitle="(Don’t worry about exact numbers – rough guesses are fine!)" icon={<Activity />} isDark={isDark}>
                        <div className="space-y-10">
                            <Question isDark={isDark} num={13} label="How many people do you expect to visit your website each month?">
                                <RadioGroup isDark={isDark} options={[
                                    'Very small / new site → under 1,000 visitors per month',
                                    'Small business → 1,000 – 5,000 visitors per month',
                                    'Growing business → 5,000 – 20,000 visitors per month',
                                    'Busy site → more than 20,000 visitors per month',
                                    'Not sure yet – please estimate for me'
                                ]} value={formData.trafficExpectations} onChange={v => setFormData({...formData, trafficExpectations: v})} />
                            </Question>

                            <Question isDark={isDark} num={14} label="Will traffic be steady or have big peaks?" helper='Example: "Steady all year" or "Huge spike every December during holiday shopping"'>
                                <TextInput isDark={isDark} required value={formData.trafficPattern} onChange={v => setFormData({...formData, trafficPattern: v})} />
                            </Question>
                        </div>
                    </SectionCard>

                    {/* SECTION 5: PHOTOS */}
                    <SectionCard title="SECTION 5: Photos, Videos & Storage Needs" subtitle="(How much “stuff” will be on your site)" icon={<Monitor />} isDark={isDark}>
                        <div className="space-y-10">
                            <Question isDark={isDark} num={15} label="Will your site have lots of photos or videos?">
                                <RadioGroup isDark={isDark} options={[
                                    'A few photos (under 50 total)',
                                    'Many photos or a big gallery (50–500 photos)',
                                    'Videos or product videos',
                                    'Not sure – I’ll probably add a lot over time'
                                ]} value={formData.visualIntensity} onChange={v => setFormData({...formData, visualIntensity: v})} />
                            </Question>

                            <Question isDark={isDark} num={16} label="Do you have any idea how much total space you might need?" helper='(We can guess for you if you’re not sure) Example: "Mostly text and 100 photos" or "Lots of high-resolution product images"'>
                                <TextInput isDark={isDark} required value={formData.storageNeeds} onChange={v => setFormData({...formData, storageNeeds: v})} />
                            </Question>
                        </div>
                    </SectionCard>

                    {/* SECTION 6: CURRENT SETUP */}
                    <SectionCard title="SECTION 6: Your Current Online Setup (If Any)" icon={<Monitor />} isDark={isDark}>
                        <div className="space-y-10">
                            <Question isDark={isDark} num={17} label="Do you already have a website or hosting?">
                                <div className="space-y-4">
                                   <RadioGroup isDark={isDark} options={['No - brand new', 'Yes - I have an existing setup']} value={formData.hasHosting} onChange={v => setFormData({...formData, hasHosting: v})} />
                                   
                                   {formData.hasHosting === 'Yes - I have an existing setup' && (
                                       <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`mt-4 p-5 rounded-xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} space-y-4`}>
                                           <div>
                                               <label className={`block text-sm font-semibold mb-1 ${textMain}`}>Current website address:</label>
                                               <TextInput isDark={isDark} value={formData.currentWebsite} onChange={v => setFormData({...formData, currentWebsite: v})} />
                                           </div>
                                           <div>
                                               <label className={`block text-sm font-semibold mb-1 ${textMain}`}>Current hosting company (if you know):</label>
                                               <TextInput isDark={isDark} value={formData.currentHosting} onChange={v => setFormData({...formData, currentHosting: v})} />
                                           </div>
                                           <div>
                                               <label className={`block text-sm font-semibold mb-2 ${textMain}`}>Would you like us to move everything over for you?</label>
                                               <RadioGroup isDark={isDark} options={['Yes', 'No']} value={formData.migrationNeeded} onChange={v => setFormData({...formData, migrationNeeded: v})} />
                                           </div>
                                       </motion.div>
                                   )}
                                </div>
                            </Question>

                            <Question isDark={isDark} num={18} label="Do you already have a domain name (yourname.com)?">
                                <RadioGroup isDark={isDark} options={['Yes - I have a domain', 'No - I need help buying one']} value={formData.hasDomain} onChange={v => setFormData({...formData, hasDomain: v})} />
                                {formData.hasDomain === 'Yes - I have a domain' && (
                                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                                        <span className={`${textMain} font-medium`}>Domain is:</span>
                                        <TextInput isDark={isDark} value={formData.domainName} onChange={v => setFormData({...formData, domainName: v})} placeholder="e.g., example.com" className="flex-1" />
                                    </div>
                                )}
                            </Question>
                        </div>
                    </SectionCard>

                    {/* SECTION 7: SOCIAL MEDIA */}
                    <SectionCard title="SECTION 7: Social Media Presence" subtitle="(We also offer full social media management – posting, growing followers, etc.)" icon={<Globe />} isDark={isDark}>
                        <div className="space-y-10">
                            <Question isDark={isDark} num={19} label="Which social media accounts do you currently have? (Please list handles/usernames)">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                    {[
                                        { id: 'instagram', label: 'Instagram', prefix: '@' },
                                        { id: 'facebook', label: 'Facebook', prefix: '' },
                                        { id: 'tiktok', label: 'TikTok', prefix: '@' },
                                        { id: 'linkedin', label: 'LinkedIn', prefix: '' },
                                        { id: 'twitter', label: 'X (Twitter)', prefix: '@' },
                                        { id: 'youtube', label: 'YouTube', prefix: '' },
                                        { id: 'other', label: 'Other', prefix: '' },
                                    ].map(social => (
                                        <div key={social.id} className="flex items-center gap-3">
                                            <span className={`w-28 text-sm font-semibold ${textMain}`}>{social.label}:</span>
                                            <div className="relative flex-1">
                                                {social.prefix && <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${textSub}`}>{social.prefix}</span>}
                                                <input 
                                                    type="text" 
                                                    value={formData.social[social.id as keyof typeof formData.social]}
                                                    onChange={e => handleSocialChange(social.id as any, e.target.value)}
                                                    className={`w-full py-3 rounded-lg border outline-none disabled:opacity-50 transition-all text-sm font-medium ${social.prefix ? 'pl-8' : 'pl-4'} pr-4 ${isDark ? 'bg-[#1a1a1a] border-gray-700 text-white focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 shadow-sm focus:ring-4 focus:ring-blue-50'}`} 
                                                    placeholder="username..."
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Question>

                            <Question isDark={isDark} num={20} label="How active are you on social media right now?">
                                <RadioGroup isDark={isDark} options={[
                                    'Not active at all',
                                    'I post occasionally myself',
                                    'I post regularly but want help growing',
                                    'I want you to fully manage my social media for me'
                                ]} value={formData.socialActivityLevel} onChange={v => setFormData({...formData, socialActivityLevel: v})} />
                            </Question>

                            <Question isDark={isDark} num={21} label="Would you like us to include social media management in your quote?">
                                <RadioGroup isDark={isDark} options={[
                                    'Yes – please quote me for posting 3–5 times per week',
                                    'Yes – please quote me for posting 1–2 times per week',
                                    'No thanks, just the website for now'
                                ]} value={formData.includeSocialInQuote} onChange={v => setFormData({...formData, includeSocialInQuote: v})} />
                            </Question>
                        </div>
                    </SectionCard>

                    {/* SECTION 8: TIMELINE & BUDGET */}
                    <SectionCard title="SECTION 8: Timeline & Budget" icon={<Activity />} isDark={isDark}>
                        <div className="space-y-10">
                            <Question isDark={isDark} num={22} label="When do you want your website to be live?">
                                <RadioGroup isDark={isDark} options={[
                                    'As soon as possible (next 2-4 weeks)',
                                    'Within 1-2 months',
                                    'Within 3-6 months',
                                    'Flexible - just let me know what’s realistic'
                                ]} value={formData.timeline} onChange={v => setFormData({...formData, timeline: v})} />
                            </Question>

                            <Question isDark={isDark} num={23} label="Do you have a rough budget range in mind for the whole project (hosting + any extras)?" helper="(This is optional but helps us suggest the best options)">
                                <RadioGroup isDark={isDark} options={[
                                    'Under $500 one-time + monthly hosting',
                                    '$500 - $1,500 one-time + monthly hosting',
                                    '$1,500 - $3,000 one-time + monthly hosting',
                                    'No budget limit - just show me the best options'
                                ]} value={formData.budgetRange} onChange={v => setFormData({...formData, budgetRange: v})} />
                            </Question>
                        </div>
                    </SectionCard>

                    {/* SECTION 9: EXTRA INFO */}
                    <SectionCard title="SECTION 9: Anything Else We Should Know?" icon={<Send />} isDark={isDark} noBorderBottom>
                        <Question isDark={isDark} num={24} label="Is there anything special or important we haven’t asked about? (security needs, languages, accessibility, etc.)">
                            <TextArea isDark={isDark} value={formData.additionalInfo} onChange={v => setFormData({...formData, additionalInfo: v})} />
                        </Question>
                    </SectionCard>

                    {/* SUBMISSION FOOTER */}
                    <div className={`mt-16 p-8 md:p-12 rounded-3xl ${bgCard} text-center space-y-8 border shadow-xl relative overflow-hidden`}>
                        <div className={`absolute top-0 left-0 w-full h-2 ${isDark ? 'bg-blue-600' : 'bg-blue-500'}`} />
                        <h3 className={`text-2xl font-bold ${textMain}`}>Thank you!</h3>
                        <p className={`text-lg leading-relaxed max-w-2xl mx-auto ${textSub}`}>
                            Just send this completed form back to me and I’ll prepare a clear, customized quote within 1-2 business days. If anything is confusing, reply with questions — I’m happy to walk you through it over email or a quick call.
                            <br/><br/>
                            Looking forward to helping your business grow online.<br/>
                            <a href="https://issaberger.com" className="font-bold text-blue-500 mt-2 block hover:underline">issaberger.com</a>
                        </p>
                        <div className="pt-8 flex flex-col items-center justify-center gap-4">
                            <button type="submit" disabled={sending} className={`w-full sm:w-auto px-10 py-5 ${primaryBg} text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3`}>
                                {sending ? 'Processing...' : <>Prepare Quote Request <ArrowRight size={20} /></>}
                            </button>
                            <span className={`text-sm ${textSub} flex items-center gap-2`}>
                                <Info size={14} /> This will securely open your default email application.
                            </span>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
};

// UI Components
const SectionCard = ({ title, subtitle, icon, children, isDark, noBorderBottom }: any) => (
    <div className={`rounded-3xl border shadow-sm ${isDark ? 'bg-[#111] border-gray-800' : 'bg-white border-gray-100'} overflow-hidden transition-colors duration-300`}>
        <div className={`p-6 md:px-10 md:py-8 border-b ${isDark ? 'bg-gray-900/40 border-gray-800' : 'bg-gray-50/50 border-gray-100'}`}>
            <div className="flex items-start gap-4">
                <div className={`shrink-0 p-3 rounded-xl hidden sm:block ${isDark ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                    {icon}
                </div>
                <div>
                    <h2 className={`text-xl md:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
                    {subtitle && <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</p>}
                </div>
            </div>
        </div>
        <div className="p-6 md:p-10">
            {children}
        </div>
    </div>
);

const Question = ({ num, label, helper, required, children, isDark }: any) => (
    <div>
        <label className={`block text-base md:text-lg font-semibold mb-2 sm:mb-3 leading-snug flex items-start gap-3 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
            <span className={`shrink-0 flex items-center justify-center w-7 h-7 text-sm font-bold rounded-lg mt-0.5 ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-500'}`}>{num}</span>
            <span>
                {label} {required && <span className="text-red-500 ml-1" title="Required">*</span>}
                {helper && <span className={`block text-sm font-normal mt-1 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{helper}</span>}
            </span>
        </label>
        <div className="pl-0 sm:pl-10 mt-4">
            {children}
        </div>
    </div>
);

const TextInput = ({ isDark, className = "", onChange, ...props }: any) => (
    <input 
        {...props} 
        onChange={e => onChange && onChange(e.target.value)}
        className={`w-full px-5 py-4 rounded-xl border outline-none disabled:opacity-50 transition-all font-medium text-base ${isDark ? 'bg-[#1a1a1a] border-gray-700 text-white placeholder:text-gray-600 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 shadow-sm'} ${className}`} 
    />
);

const TextArea = ({ isDark, className = "", onChange, ...props }: any) => (
    <textarea 
        rows={4} 
        {...props} 
        onChange={e => onChange && onChange(e.target.value)}
        className={`w-full px-5 py-4 rounded-xl border outline-none disabled:opacity-50 transition-all font-medium text-base resize-y ${isDark ? 'bg-[#1a1a1a] border-gray-700 text-white placeholder:text-gray-600 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 shadow-sm'} ${className}`} 
    />
);

const CheckboxCard = ({ opt, checked, onChange, isDark }: any) => (
    <button type="button" onClick={onChange} className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all group ${
        checked 
            ? (isDark ? 'bg-blue-600/10 border-blue-500 text-blue-200' : 'bg-blue-50 border-blue-400 text-blue-900 shadow-sm') 
            : (isDark ? 'bg-[#1a1a1a] border-gray-700 text-gray-300 hover:border-gray-500' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50')
    }`}>
        <div className={`mt-0.5 w-6 h-6 rounded border flex items-center justify-center shrink-0 transition-colors ${
            checked ? 'bg-blue-500 border-blue-500' : (isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300 group-hover:border-gray-400')
        }`}>
            {checked && <CheckCircle2 size={16} className="text-white" />}
        </div>
        <span className="font-semibold text-sm leading-tight">{opt}</span>
    </button>
);

const RadioGroup = ({ options, value, onChange, isDark }: any) => (
    <div className="flex flex-col gap-3">
        {options.map((opt: string) => (
            <button key={opt} type="button" onClick={() => onChange(opt)} className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all group ${
                value === opt 
                    ? (isDark ? 'bg-blue-600/10 border-blue-500 text-blue-200' : 'bg-blue-50 border-blue-400 text-blue-900 shadow-sm') 
                    : (isDark ? 'bg-[#1a1a1a] border-gray-700 text-gray-300 hover:border-gray-500' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50')
            }`}>
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    value === opt ? 'bg-blue-500 border-blue-500' : (isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300 group-hover:border-gray-400')
                }`}>
                    {value === opt && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                </div>
                <span className="font-semibold text-sm leading-tight">{opt}</span>
            </button>
        ))}
    </div>
);

export default OnboardingModule;

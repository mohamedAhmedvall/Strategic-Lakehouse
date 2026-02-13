import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
    MOCK_DOCTORS, 
    SPECIALTY_TRANSLATIONS, 
    SPECIALTY_KEYS, 
    CITIES, 
    MOCK_ARTICLES,
    UI_TRANSLATIONS
} from './constants';
import { Doctor, SortOption, Article, SlotInfo, Language, Review, Appointment, User, Role, FamilyMember, ChatMessage } from './types';

// --- Helpers ---

// Haversine formula to calculate distance in km
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; // Distance in km
};

const deg2rad = (deg: number) => {
    return deg * (Math.PI/180);
};

// --- Subcomponents ---

const ReminderToast = ({ appt, onClose, t, lang }: { appt: Appointment, onClose: () => void, t: (k: string) => string, lang: Language }) => (
    <div className="fixed top-20 right-4 z-[100] bg-white rounded-2xl shadow-2xl border-l-4 border-accent p-4 max-w-sm w-full animate-[slideInRight_0.5s_ease-out] flex items-start gap-3">
        <div className="bg-accent/10 p-2 rounded-full text-accent">
            <span className="material-icons-round">notifications_active</span>
        </div>
        <div className="flex-1">
            <h4 className="font-bold text-slate-900 text-sm mb-1">{t('reminderTitle')}</h4>
            <p className="text-slate-600 text-xs">
                {t('reminderBody')} : <span className="font-bold">{appt.doctorName}</span>
            </p>
            <p className="text-slate-500 text-xs mt-1">
                {appt.time} • {SPECIALTY_TRANSLATIONS[appt.specialty]?.[lang] || appt.specialty}
            </p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <span className="material-icons-round text-sm">close</span>
        </button>
    </div>
);

const Chatbot = ({ t, isOpen, onClose, onOpen }: { t: (k: string) => string, isOpen: boolean, onClose: () => void, onOpen: () => void }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', text: t('chatbotWelcome'), sender: 'bot', timestamp: new Date() }
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const newUserMsg: ChatMessage = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInputValue('');

        // Simulate AI response
        setTimeout(() => {
            const responses = [
                "Je comprends. Pourriez-vous préciser vos symptômes ?",
                "Nous avons plusieurs spécialistes disponibles. Souhaitez-vous prendre rendez-vous ?",
                "Je peux vous aider à trouver une pharmacie de garde.",
                "C'est noté. Autre chose ?"
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            
            const botMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: randomResponse,
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
        }, 1000);
    };

    if (!isOpen) {
        return (
            <button 
                onClick={onOpen}
                className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-primary text-slate-900 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 group"
            >
                <span className="material-icons-round text-3xl">smart_toy</span>
                <span className="absolute right-0 top-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 w-80 md:w-96 h-[500px] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-[fadeInUp_0.3s_ease-out]">
            {/* Header */}
            <div className="bg-slate-900 p-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-slate-900">
                        <span className="material-icons-round">smart_toy</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">{t('chatbotName')}</h3>
                        <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-xs text-slate-300">Online</span>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                    <span className="material-icons-round">close</span>
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                            msg.sender === 'user' 
                                ? 'bg-primary text-slate-900 rounded-tr-none' 
                                : 'bg-white border border-gray-200 text-slate-700 rounded-tl-none shadow-sm'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-gray-100">
                <div className="flex gap-2">
                    <input 
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={t('typeMessage')}
                        className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                    <button 
                        onClick={handleSend}
                        className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-primary hover:text-slate-900 transition-colors"
                    >
                        <span className="material-icons-round text-sm">send</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const AuthModal = ({ 
    isOpen, 
    onClose, 
    onLogin, 
    t 
}: { 
    isOpen: boolean, 
    onClose: () => void, 
    onLogin: (user: User) => void, 
    t: (k: string) => string 
}) => {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [role, setRole] = useState<Role>('patient');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        let determinedRole = role;
        // Simple Admin Backdoor for demo
        if (email.toLowerCase() === 'admin@maurisante.mr') {
            determinedRole = 'admin';
        }

        const newUser: User = {
            id: 'u-' + Date.now(),
            name: name || (determinedRole === 'doctor' ? 'Dr. Demo' : (determinedRole === 'admin' ? 'Admin User' : 'Patient Demo')),
            email: email,
            role: determinedRole,
            avatar: `https://ui-avatars.com/api/?name=${name || 'User'}&background=random`
        };
        onLogin(newUser);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-[fadeInUp_0.3s_ease-out]">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">
                            {mode === 'login' ? t('login') : t('signup')}
                        </h2>
                        <p className="text-slate-500 text-sm">
                            {t('heroSubtitle')}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'signup' && (
                            <>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">{t('iAm')}</label>
                                    <div className="flex p-1 bg-slate-100 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => setRole('patient')}
                                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${role === 'patient' ? 'bg-white shadow text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            {t('patient')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRole('doctor')}
                                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${role === 'doctor' ? 'bg-white shadow text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            {t('doctor')}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">{t('name')}</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-3 rounded-xl border border-gray-200 bg-slate-50 focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all outline-none"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                    />
                                </div>
                            </>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">{t('email')}</label>
                            <input 
                                type="email" 
                                className="w-full p-3 rounded-xl border border-gray-200 bg-slate-50 focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all outline-none"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">{t('password')}</label>
                            <input 
                                type="password" 
                                className="w-full p-3 rounded-xl border border-gray-200 bg-slate-50 focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all outline-none"
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-primary hover:text-slate-900 transition-all shadow-lg shadow-slate-900/10 mt-4"
                        >
                            {mode === 'login' ? t('login') : t('signup')}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button 
                            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                            className="text-sm font-bold text-primary hover:underline"
                        >
                            {mode === 'login' ? t('needAccount') : t('haveAccount')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Navbar = ({ 
    lang, 
    setLang, 
    t, 
    user, 
    onLogout, 
    setView,
    openAuth 
}: { 
    lang: Language, 
    setLang: (l: Language) => void, 
    t: (k: string) => string, 
    user: User | null, 
    onLogout: () => void,
    setView: (v: 'home' | 'searchResults' | 'dashboard' | 'admin') => void,
    openAuth: () => void
}) => (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm" dir="ltr">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setView('home')}
            >
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                    <span className="material-icons-round text-xl">medical_services</span>
                </div>
                <span className="text-xl font-extrabold tracking-tight text-slate-800">
                    Mauri<span className="text-primary">Santé</span>
                </span>
            </div>
            
            <div className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-600">
                <button onClick={() => setView('home')} className="hover:text-primary transition-colors">{t('navDoctors')}</button>
                <button onClick={() => setView('home')} className="hover:text-primary transition-colors">{t('navHealth')}</button>
                {user?.role === 'admin' && (
                     <button 
                     onClick={() => setView('admin')}
                     className="text-red-600 hover:text-red-700 transition-colors"
                 >
                     {t('adminPanel')}
                 </button>
                )}
            </div>

            <div className="flex items-center gap-3">
                <div className="relative group z-50">
                    <button className="flex items-center gap-1 text-sm font-bold text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                        <span className="uppercase">{lang}</span>
                        <span className="material-icons-round text-sm">expand_more</span>
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-24 bg-white rounded-xl shadow-xl border border-gray-100 hidden group-hover:block overflow-hidden animate-[fadeIn_0.1s_ease-out]">
                        {(['fr', 'ar', 'en'] as Language[]).map((l) => (
                            <button 
                                key={l}
                                onClick={() => setLang(l)}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 font-medium ${lang === l ? 'text-primary' : 'text-slate-600'}`}
                            >
                                {l === 'ar' ? 'العربية' : l === 'fr' ? 'Français' : 'English'}
                            </button>
                        ))}
                    </div>
                </div>

                {user ? (
                    <div className="relative group z-50">
                        <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-gray-200 hover:border-primary/50 transition-all bg-white">
                            <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full bg-slate-100" />
                            <span className="text-xs font-bold text-slate-700 max-w-[80px] truncate">{user.name}</span>
                            <span className="material-icons-round text-slate-400 text-sm">expand_more</span>
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 hidden group-hover:block overflow-hidden animate-[fadeIn_0.1s_ease-out]">
                            <div className="px-4 py-3 border-b border-gray-50">
                                <p className="text-xs text-slate-500 font-medium uppercase">{user.role}</p>
                                <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                            </div>
                            <button 
                                onClick={() => setView('dashboard')}
                                className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 font-medium text-slate-700 flex items-center gap-2"
                            >
                                <span className="material-icons-round text-primary">dashboard</span>
                                {t('dashboard')}
                            </button>
                            <button 
                                onClick={onLogout}
                                className="w-full text-left px-4 py-3 text-sm hover:bg-red-50 font-medium text-red-600 flex items-center gap-2"
                            >
                                <span className="material-icons-round">logout</span>
                                {t('logout')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                         <button 
                            onClick={openAuth}
                            className="hidden md:block text-slate-600 hover:text-slate-900 font-bold text-sm px-3 py-2"
                        >
                            {t('login')}
                        </button>
                        <button 
                            onClick={openAuth}
                            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary hover:text-slate-900 transition-colors shadow-lg shadow-slate-900/10"
                        >
                            {t('signup')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    </nav>
);

const OfflinePaymentBanner = ({ t }: { t: (k: string) => string }) => (
    <div className="bg-amber-50 border-b border-amber-100 text-amber-800 px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 relative z-50">
        <span className="material-icons-round text-lg">payments</span>
        <span>{t('offlinePayment')}</span>
    </div>
);

const LandingPage = ({
    t,
    lang,
    searchState,
    setSearchState,
    onSearch
}: {
    t: (k: string) => string,
    lang: Language,
    searchState: any,
    setSearchState: any,
    onSearch: () => void
}) => {
    return (
        <div className="flex flex-col min-h-[calc(100vh-64px)] bg-white">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-50/50 via-white to-primary/5 py-16 md:py-24 relative overflow-hidden">
                 {/* Decorative background blobs */}
                 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                 <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-100/50 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
                        {t('heroTitle')}
                    </h1>
                    <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-medium">
                        {t('heroSubtitle')}
                    </p>

                    {/* Doctolib-style Search Bar */}
                    <div className="max-w-4xl mx-auto bg-white p-2 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 flex flex-col md:flex-row items-center gap-2">
                        {/* Input 1: Specialty/Name */}
                        <div className="flex-1 w-full relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <span className="material-icons-round text-2xl group-focus-within:text-primary transition-colors">search</span>
                            </div>
                            <input 
                                type="text" 
                                placeholder={t('searchPlaceholder')}
                                className="w-full h-14 pl-12 pr-4 bg-transparent border-none outline-none text-slate-900 font-semibold placeholder:font-medium placeholder:text-slate-400 rounded-2xl focus:bg-slate-50 transition-colors"
                                value={searchState.query}
                                onChange={(e) => setSearchState({...searchState, query: e.target.value})}
                            />
                        </div>
                        
                        <div className="hidden md:block w-px h-10 bg-gray-200"></div>

                        {/* Input 2: Location */}
                        <div className="flex-1 w-full relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <span className="material-icons-round text-2xl group-focus-within:text-primary transition-colors">location_on</span>
                            </div>
                            <select 
                                className="w-full h-14 pl-12 pr-4 bg-transparent border-none outline-none text-slate-900 font-semibold cursor-pointer rounded-2xl focus:bg-slate-50 transition-colors appearance-none"
                                value={searchState.city}
                                onChange={(e) => setSearchState({...searchState, city: e.target.value})}
                            >
                                <option value="">{t('allCities')}</option>
                                {CITIES.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>

                        {/* Search Button */}
                        <button 
                            onClick={onSearch}
                            className="w-full md:w-auto px-8 h-14 bg-primary text-slate-900 font-bold text-lg rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95"
                        >
                            {t('searchBtn')}
                        </button>
                    </div>

                    {/* Popular searches pills */}
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                         <span className="text-sm font-bold text-slate-400 py-2">{t('popularCategories')} :</span>
                         {[SPECIALTY_KEYS.GENERALIST, SPECIALTY_KEYS.DENTIST, SPECIALTY_KEYS.OPHTHALMOLOGIST].map(key => (
                             <button 
                                key={key}
                                onClick={() => {
                                    setSearchState({...searchState, specialty: key});
                                    onSearch();
                                }}
                                className="bg-white border border-gray-200 hover:border-primary hover:text-primary hover:bg-primary/5 text-slate-600 px-4 py-2 rounded-full text-sm font-bold transition-all"
                             >
                                 {SPECIALTY_TRANSLATIONS[key][lang]}
                             </button>
                         ))}
                    </div>
                </div>
            </div>

            {/* Value Props Section */}
            <div className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-center text-slate-900 mb-16">
                        {t('whyChooseUs')}
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="flex flex-col items-center text-center group">
                            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                                <span className="material-icons-round text-4xl">schedule</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{t('access247')}</h3>
                            <p className="text-slate-500 leading-relaxed max-w-xs">{t('access247Desc')}</p>
                        </div>

                        <div className="flex flex-col items-center text-center group">
                            <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                                <span className="material-icons-round text-4xl">notifications_active</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{t('reminders')}</h3>
                            <p className="text-slate-500 leading-relaxed max-w-xs">{t('remindersDesc')}</p>
                        </div>

                        <div className="flex flex-col items-center text-center group">
                            <div className="w-20 h-20 bg-purple-50 rounded-3xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                                <span className="material-icons-round text-4xl">history_edu</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{t('history')}</h3>
                            <p className="text-slate-500 leading-relaxed max-w-xs">{t('historyDesc')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Doctor CTA */}
            <div className="bg-slate-900 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                            {t('areYouDoctor')}
                        </h2>
                        <p className="text-slate-400 font-medium">Rejoignez la plateforme leader de la e-santé en Mauritanie.</p>
                    </div>
                    <button className="bg-primary text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-white transition-colors shadow-lg shadow-primary/20">
                        {t('discoverPro')}
                    </button>
                </div>
            </div>

            {/* Simple Footer */}
            <footer className="bg-slate-50 py-8 border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm font-medium">
                    <p>&copy; 2024 MauriSanté. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

const SearchResults = ({ 
    filteredDoctors, 
    searchState, 
    setSearchState, 
    sortBy, 
    setSortBy, 
    showNearbyOnly, 
    handleLocationClick, 
    handleBookClick,
    userLocation,
    getDoctorExtraRating,
    selectedType,
    setSelectedType,
    priceRange,
    setPriceRange,
    t, 
    lang 
}: any) => {
    // Derived Lists for Select Options
    const specialtiesList = Object.keys(SPECIALTY_TRANSLATIONS);
    
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Compact Search Bar for Results Page */}
            <div className="bg-white border-b border-gray-200 shadow-sm sticky top-16 z-30 px-4 py-3">
                 <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-3 items-center">
                    <div className="flex-1 w-full relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons-round text-slate-400">search</span>
                        <input 
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-lg border-none text-sm font-semibold focus:ring-2 focus:ring-primary/50"
                            placeholder={t('searchPlaceholder')}
                            value={searchState.query}
                            onChange={(e) => setSearchState({...searchState, query: e.target.value})}
                        />
                    </div>
                    <div className="w-full md:w-48 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons-round text-slate-400">medical_services</span>
                        <select 
                            className="w-full pl-10 pr-8 py-2 bg-slate-100 rounded-lg border-none text-sm font-semibold focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                            value={searchState.specialty}
                            onChange={(e) => setSearchState({...searchState, specialty: e.target.value})}
                        >
                            <option value="">{t('allSpecialties')}</option>
                            {specialtiesList.map(key => (
                                <option key={key} value={key}>{SPECIALTY_TRANSLATIONS[key][lang]}</option>
                            ))}
                        </select>
                    </div>
                     <div className="w-full md:w-48 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons-round text-slate-400">location_on</span>
                        <select 
                            className="w-full pl-10 pr-8 py-2 bg-slate-100 rounded-lg border-none text-sm font-semibold focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                            value={searchState.city}
                            onChange={(e) => setSearchState({...searchState, city: e.target.value})}
                        >
                            <option value="">{t('allCities')}</option>
                            {CITIES.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>
                 </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
                         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="font-extrabold text-slate-900 text-lg">{t('filters')}</h3>
                                        <button 
                                            onClick={() => {
                                                setSearchState({query: '', specialty: '', city: ''});
                                                setPriceRange(3000);
                                                setSortBy(SortOption.RECOMMENDED);
                                                setSelectedType('all');
                                            }}
                                            className="text-xs font-bold text-primary hover:underline"
                                        >
                                            {t('reset')}
                                        </button>
                                    </div>

                                    {/* Type Filter (Doctor/Clinic) */}
                                    <div className="mb-8">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                            {t('typeFilter')}
                                        </label>
                                        <div className="flex flex-col gap-2">
                                            {[
                                                { id: 'all', label: t('allTypes') },
                                                { id: 'doctor', label: t('doctors') },
                                                { id: 'clinic', label: t('clinics') }
                                            ].map((type) => (
                                                <label key={type.id} className="flex items-center gap-3 cursor-pointer group">
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedType === type.id ? 'border-primary' : 'border-gray-300 group-hover:border-primary/50'}`}>
                                                        {selectedType === type.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                                    </div>
                                                    <input 
                                                        type="radio" 
                                                        name="type" 
                                                        className="hidden"
                                                        checked={selectedType === type.id}
                                                        onChange={() => setSelectedType(type.id as any)}
                                                    />
                                                    <span className={`text-sm font-medium ${selectedType === type.id ? 'text-slate-900' : 'text-slate-600'}`}>{type.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Location Button */}
                                    <button 
                                        onClick={handleLocationClick}
                                        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold mb-8 border transition-all ${showNearbyOnly ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-inner' : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'}`}
                                    >
                                        <span className="material-icons-round text-lg">{showNearbyOnly ? 'my_location' : 'near_me'}</span>
                                        {showNearbyOnly ? `${t('distance')} < 10km` : t('nearMe')}
                                    </button>
                                    
                                    {/* Price Filter */}
                                    <div className="mb-8">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                            {t('maxPrice')}
                                        </label>
                                        <div className="px-1">
                                            <input 
                                                type="range" 
                                                min="500" 
                                                max="5000" 
                                                step="100" 
                                                value={priceRange} 
                                                onChange={(e) => setPriceRange(Number(e.target.value))}
                                                className="w-full accent-primary h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                style={{ direction: 'ltr' }}
                                            />
                                        </div>
                                        <div className="flex justify-between items-center mt-3">
                                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">500 MRU</span>
                                            <span className="text-sm font-bold text-primary">{priceRange} MRU</span>
                                        </div>
                                    </div>
                         </div>
                    </aside>

                    {/* Results Grid */}
                    <div className="flex-1 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-800">
                                {filteredDoctors.length} {t('availableDoctors')}
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <span>{t('sortBy')}:</span>
                                <select 
                                    className="bg-transparent border-none font-bold text-slate-700 focus:ring-0 cursor-pointer"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                                >
                                    <option value={SortOption.RECOMMENDED}>{t('recommended')}</option>
                                    <option value={SortOption.PRICE_LOW}>{t('priceLow')}</option>
                                    <option value={SortOption.RATING}>{t('rating')}</option>
                                    {userLocation && <option value={SortOption.DISTANCE}>{t('sortDistance')}</option>}
                                </select>
                            </div>
                        </div>

                         {filteredDoctors.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredDoctors.map((doctor: Doctor) => (
                                    <DoctorCard 
                                        key={doctor.id} 
                                        doctor={doctor} 
                                        onBook={handleBookClick} 
                                        lang={lang} 
                                        t={t}
                                        userLocation={userLocation}
                                        extraRating={getDoctorExtraRating(doctor.id)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                                <span className="material-icons-round text-4xl text-slate-300 mb-3">search_off</span>
                                <h3 className="text-lg font-bold text-slate-700">{t('noResults')}</h3>
                                <p className="text-slate-500">{t('tryAdjusting')}</p>
                            </div>
                        )}
                        
                        {/* Feed at bottom of results */}
                        <section className="pt-8 border-t border-gray-200 mt-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900">{t('healthWellness')}</h2>
                                            <p className="text-slate-500">{t('dailyTips')}</p>
                                        </div>
                                        <a href="#" className="text-primary font-bold text-sm hover:underline">{t('viewAll')}</a>
                                    </div>
                                    
                                    <div className="flex gap-6 overflow-x-auto no-scrollbar pb-6 -mx-4 px-4 lg:mx-0 lg:px-0" style={{ direction: 'ltr' }}>
                                        {MOCK_ARTICLES.map(article => (
                                            <HealthArticleCard key={article.id} article={article} />
                                        ))}
                                    </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ... (AdminDashboard, DashboardView, BookingModal, DoctorCard, HealthArticleCard, ReminderToast, Chatbot, AuthModal remain same)
// Re-declaring component parts that weren't changed to ensure context for the full file replacement, 
// or I can assume they are available if I were just editing parts. 
// Since I must output full file content for App.tsx, I will include all of them.

const AdminDashboard = ({ 
    doctors, 
    setDoctors, 
    users, 
    setUsers, 
    t 
}: { 
    doctors: Doctor[], 
    setDoctors: (d: Doctor[]) => void, 
    users: User[], 
    setUsers: (u: User[]) => void, 
    t: (k: string) => string 
}) => {
    const toggleVerification = (docId: string) => {
        setDoctors(doctors.map(d => d.id === docId ? { ...d, verified: !d.verified } : d));
    };

    const deleteUser = (userId: string) => {
        if(confirm('Are you sure?')) {
            setUsers(users.filter(u => u.id !== userId));
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold text-slate-900 mb-8">{t('adminPanel')}</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Doctor Validation */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="font-bold text-lg mb-4">{t('navDoctors')} ({doctors.length})</h2>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto">
                        {doctors.map(doc => (
                            <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <img src={doc.image} className="w-10 h-10 rounded-full object-cover" alt="" />
                                    <div>
                                        <p className="font-bold text-sm">{doc.name}</p>
                                        <p className="text-xs text-slate-500">{doc.specialty}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => toggleVerification(doc.id)}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${doc.verified ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}
                                >
                                    {doc.verified ? 'Verified' : t('validate')}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* User Management */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="font-bold text-lg mb-4">{t('users')} ({users.length})</h2>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto">
                        {users.map(u => (
                            <div key={u.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                        {u.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{u.name}</p>
                                        <p className="text-xs text-slate-500">{u.role} • {u.email}</p>
                                    </div>
                                </div>
                                {u.role !== 'admin' && (
                                    <button 
                                        onClick={() => deleteUser(u.id)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                                    >
                                        <span className="material-icons-round text-sm">delete</span>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const DashboardView = ({ 
    user, 
    appointments, 
    t, 
    lang,
    onAddFamilyMember 
}: { 
    user: User, 
    appointments: Appointment[], 
    t: (k: string) => string, 
    lang: Language,
    onAddFamilyMember: (member: FamilyMember) => void
}) => {
    // Filter appointments based on role
    const relevantAppointments = user.role === 'patient' 
        ? appointments.filter(a => a.patientId === user.id)
        : appointments.filter(a => true);

    const upcoming = relevantAppointments.filter(a => a.status === 'upcoming');
    const past = relevantAppointments.filter(a => a.status !== 'upcoming');
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberRelation, setNewMemberRelation] = useState('');
    const [showAddFamily, setShowAddFamily] = useState(false);

    const handleAddMember = () => {
        if (newMemberName && newMemberRelation) {
            onAddFamilyMember({
                id: Date.now().toString(),
                name: newMemberName,
                relation: newMemberRelation
            });
            setNewMemberName('');
            setNewMemberRelation('');
            setShowAddFamily(false);
        }
    };

    const AppointmentCard = ({ appt }: { appt: Appointment }) => (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4 shadow-sm hover:shadow-md transition-all">
            <img src={appt.image} alt={appt.doctorName} className="w-16 h-16 rounded-xl object-cover bg-gray-100" />
            <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-900">{user.role === 'patient' ? appt.doctorName : appt.patientName}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${appt.status === 'upcoming' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                        {appt.status === 'upcoming' ? t('upcoming') : t('past')}
                    </span>
                </div>
                <p className="text-primary font-bold text-xs uppercase mb-1">
                    {SPECIALTY_TRANSLATIONS[appt.specialty]?.[lang] || appt.specialty}
                </p>
                {appt.forWho === 'family' && (
                    <p className="text-xs text-orange-500 font-bold mb-2">
                         <span className="material-icons-round text-[10px] align-middle mr-1">family_restroom</span>
                         {appt.patientName}
                    </p>
                )}
                <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                        <span className="material-icons-round text-sm text-slate-400">event</span>
                        <span className="font-semibold text-slate-700">{appt.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="material-icons-round text-sm text-slate-400">schedule</span>
                        <span className="font-semibold text-slate-700">{appt.time}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="flex items-center gap-4 mb-8">
                <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full border-4 border-white shadow-lg" />
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{t('welcome')}, {user.name}</h1>
                    <p className="text-slate-500 font-medium">{user.role === 'patient' ? t('patient') : user.role === 'doctor' ? t('doctor') : 'Admin'}</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <section>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            {t('upcoming')}
                        </h3>
                        {upcoming.length > 0 ? (
                            <div className="grid gap-4">
                                {upcoming.map(appt => <AppointmentCard key={appt.id} appt={appt} />)}
                            </div>
                        ) : (
                            <div className="text-slate-400 italic text-sm">{t('noAppointments')}</div>
                        )}
                    </section>

                    <section>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                            {t('past')}
                        </h3>
                        {past.length > 0 ? (
                            <div className="grid gap-4">
                                {past.map(appt => <AppointmentCard key={appt.id} appt={appt} />)}
                            </div>
                        ) : (
                            <div className="text-slate-400 italic text-sm">{t('noAppointments')}</div>
                        )}
                    </section>
                </div>
                
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4">{t('status')}</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500 text-sm">Rendez-vous</span>
                                <span className="font-bold text-slate-900">{relevantAppointments.length}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-primary h-full rounded-full" style={{ width: '70%' }}></div>
                            </div>
                        </div>
                    </div>

                    {user.role === 'patient' && (
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-800">{t('familyMembers')}</h3>
                                <button onClick={() => setShowAddFamily(!showAddFamily)} className="text-primary hover:bg-primary/10 p-1 rounded">
                                    <span className="material-icons-round">add</span>
                                </button>
                            </div>
                            
                            {showAddFamily && (
                                <div className="mb-4 bg-slate-50 p-3 rounded-xl animate-[fadeIn_0.2s]">
                                    <input 
                                        type="text" 
                                        placeholder="Nom"
                                        className="w-full mb-2 px-3 py-2 text-sm rounded-lg border-none bg-white"
                                        value={newMemberName}
                                        onChange={e => setNewMemberName(e.target.value)}
                                    />
                                    <input 
                                        type="text" 
                                        placeholder={t('relation')}
                                        className="w-full mb-2 px-3 py-2 text-sm rounded-lg border-none bg-white"
                                        value={newMemberRelation}
                                        onChange={e => setNewMemberRelation(e.target.value)}
                                    />
                                    <button onClick={handleAddMember} className="w-full bg-slate-900 text-white text-xs font-bold py-2 rounded-lg">{t('addMember')}</button>
                                </div>
                            )}

                            <div className="space-y-3">
                                {user.familyMembers?.map(member => (
                                    <div key={member.id} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-700">{member.name}</p>
                                            <p className="text-xs text-slate-400">{member.relation}</p>
                                        </div>
                                    </div>
                                ))}
                                {(!user.familyMembers || user.familyMembers.length === 0) && (
                                    <p className="text-xs text-slate-400 italic">Aucun membre ajouté</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const BookingModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    onReviewSubmit,
    data, 
    isSuccess,
    t,
    user
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    onConfirm: (patientName: string, forWho: 'self' | 'family') => void; 
    onReviewSubmit: (review: Omit<Review, 'id' | 'doctorId' | 'date'>) => void;
    data: { doctor: Doctor; slot: SlotInfo } | null;
    isSuccess: boolean;
    t: (k: string) => string;
    user: User | null;
}) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [reviewSubmitted, setReviewSubmitted] = useState(false);
    
    // Booking for Family Logic
    const [forWho, setForWho] = useState<'self' | 'family'>('self');
    const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState<string>('');

    if (!isOpen || !data) return null;
    const { doctor, slot } = data;

    const handleConfirm = () => {
        let name = user?.name || 'Guest';
        if (forWho === 'family' && user?.familyMembers) {
            const member = user.familyMembers.find(m => m.id === selectedFamilyMemberId);
            if (member) name = member.name;
        }
        onConfirm(name, forWho);
    };

    const handleReviewSubmit = () => {
        onReviewSubmit({ rating, comment });
        setReviewSubmitted(true);
        setTimeout(() => {
            onClose();
            // Reset state after close animation
            setTimeout(() => {
                setReviewSubmitted(false);
                setRating(0);
                setComment('');
            }, 300);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-[fadeInUp_0.3s_ease-out]">
                {isSuccess ? (
                    <div className="p-8 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-[bounce_1s_infinite]">
                            <span className="material-icons-round text-4xl text-green-600">check_circle</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('successTitle')}</h3>
                        <p className="text-slate-500 mb-8">
                            {t('successMsg')} <span className="font-bold text-slate-700 block mt-1">{slot.dayName} - {slot.time}</span>
                        </p>
                        
                        {!reviewSubmitted ? (
                            <div className="w-full bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                <h4 className="font-bold text-slate-800 mb-3">{t('leaveReview')}</h4>
                                <div className="flex justify-center gap-2 mb-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button 
                                            key={star} 
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <span className={`material-icons-round text-3xl ${rating >= star ? 'text-amber-400' : 'text-gray-300'}`}>star</span>
                                        </button>
                                    ))}
                                </div>
                                <textarea 
                                    className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none resize-none bg-white"
                                    rows={3}
                                    placeholder={t('reviewPlaceholder')}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                                <button 
                                    onClick={handleReviewSubmit}
                                    disabled={rating === 0}
                                    className="w-full mt-3 bg-slate-900 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-primary hover:text-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {t('submitReview')}
                                </button>
                                <button 
                                    onClick={onClose}
                                    className="mt-3 text-xs font-bold text-slate-400 hover:text-slate-600"
                                >
                                    {t('finish')}
                                </button>
                            </div>
                        ) : (
                            <div className="text-primary font-bold animate-[fadeIn_0.5s_ease-out]">
                                Merci pour votre avis !
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="bg-slate-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 text-lg">{t('confirmTitle')}</h3>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>
                        
                        <div className="p-6">
                            {/* Doctor Summary */}
                            <div className="flex items-center gap-4 mb-6">
                                <img src={doctor.image} alt={doctor.name} className="w-16 h-16 rounded-xl object-cover" />
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg">{doctor.name}</h4>
                                    <p className="text-primary font-bold text-xs uppercase">
                                        {SPECIALTY_TRANSLATIONS[doctor.specialty]?.[t('lang') as any] || doctor.specialty}
                                    </p>
                                </div>
                            </div>

                            {/* Booking For Whom Selection */}
                            {user?.familyMembers && user.familyMembers.length > 0 && (
                                <div className="mb-6 bg-slate-50 p-4 rounded-xl">
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-3">{t('bookFor')}</p>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="forWho" 
                                                checked={forWho === 'self'} 
                                                onChange={() => setForWho('self')}
                                                className="accent-primary"
                                            />
                                            <span className="text-sm font-medium">{t('myself')}</span>
                                        </label>
                                        {user.familyMembers.map(member => (
                                            <label key={member.id} className="flex items-center gap-3 cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    name="forWho"
                                                    checked={forWho === 'family' && selectedFamilyMemberId === member.id}
                                                    onChange={() => {
                                                        setForWho('family');
                                                        setSelectedFamilyMemberId(member.id);
                                                    }}
                                                    className="accent-primary"
                                                />
                                                <span className="text-sm font-medium">{member.name} ({member.relation})</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Details List */}
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-500 shadow-sm">
                                            <span className="material-icons-round">calendar_today</span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-medium">Date & Heure</p>
                                            <p className="font-bold text-slate-800">{slot.dayName} • {slot.time}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-amber-500 shadow-sm">
                                            <span className="material-icons-round">payments</span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-amber-700 font-medium">Paiement sur place</p>
                                            <p className="font-bold text-amber-900">{doctor.price} MRU</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={onClose}
                                    className="py-3 px-4 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    {t('cancel')}
                                </button>
                                <button 
                                    onClick={handleConfirm}
                                    disabled={forWho === 'family' && !selectedFamilyMemberId}
                                    className="py-3 px-4 rounded-xl font-bold bg-slate-900 text-white hover:bg-primary hover:text-slate-900 transition-colors shadow-lg shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {t('confirmBody')}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

interface DoctorCardProps {
    doctor: Doctor;
    onBook: (doctor: Doctor, slot: SlotInfo) => void;
    lang: Language;
    t: (k: string) => string;
    userLocation: { lat: number; lng: number } | null;
    extraRating: { count: number; sum: number } | null;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onBook, lang, t, userLocation, extraRating }) => {
    const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);

    const displayRating = useMemo(() => {
        if (!extraRating || extraRating.count === 0) return doctor.rating;
        const totalSum = (doctor.rating * doctor.reviewCount) + extraRating.sum;
        const totalCount = doctor.reviewCount + extraRating.count;
        return (totalSum / totalCount).toFixed(1);
    }, [doctor, extraRating]);

    const displayReviewCount = useMemo(() => {
        return doctor.reviewCount + (extraRating?.count || 0);
    }, [doctor, extraRating]);

    const distance = useMemo(() => {
        if (userLocation && doctor.coordinates) {
            return calculateDistance(userLocation.lat, userLocation.lng, doctor.coordinates.lat, doctor.coordinates.lng).toFixed(1);
        }
        return null;
    }, [userLocation, doctor.coordinates]);

    useEffect(() => {
        const firstAvailableDay = doctor.availability.find(d => d.slots.length > 0);
        if (firstAvailableDay && firstAvailableDay.slots.length > 0) {
            setSelectedSlot({
                date: firstAvailableDay.date,
                dayName: firstAvailableDay.dayName,
                time: firstAvailableDay.slots[0]
            });
        }
    }, [doctor]);

    const handleSlotClick = (day: typeof doctor.availability[0], slotTime: string) => {
        setSelectedSlot({
            date: day.date,
            dayName: day.dayName,
            time: slotTime
        });
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full group">
            <div className="p-5 flex gap-4">
                <div className="relative flex-shrink-0">
                    <img 
                        src={doctor.image} 
                        alt={doctor.name} 
                        className="w-20 h-20 rounded-xl object-cover border border-gray-100 group-hover:scale-105 transition-transform duration-500"
                    />
                    {doctor.verified && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full border-2 border-white">
                            <span className="material-icons-round text-[12px] block">check</span>
                        </div>
                    )}
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-900 truncate text-lg">{doctor.name}</h3>
                                {doctor.type === 'clinic' && (
                                    <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">{t('clinics')}</span>
                                )}
                            </div>
                            <p className="text-primary font-bold text-xs uppercase tracking-wider mb-1">
                                {SPECIALTY_TRANSLATIONS[doctor.specialty]?.[lang] || doctor.specialty}
                            </p>
                        </div>
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                            <span className="material-icons-round text-accent text-sm">star</span>
                            <span className="text-xs font-bold text-slate-700">{displayRating}</span>
                            <span className="text-[10px] text-slate-400">({displayReviewCount})</span>
                        </div>
                    </div>
                    
                    <div className="mt-2 text-sm text-slate-500 space-y-1">
                        <div className="flex items-center gap-1.5">
                            <span className="material-icons-round text-sm opacity-60">location_on</span>
                            <span className="truncate">{doctor.location}</span>
                            {distance && (
                                <span className="ml-auto text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                    {distance} km
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="material-icons-round text-sm opacity-60">payments</span>
                            <span className="font-semibold text-slate-700">{doctor.price} MRU</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-auto border-t border-gray-50 bg-gray-50/50 p-4">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('nextSlots')}</p>
                    <span className="material-icons-round text-slate-300 text-sm">calendar_month</span>
                </div>
                
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1" style={{ direction: 'ltr' }}>
                    {doctor.availability.map((day, idx) => {
                        const hasSlots = day.slots.length > 0;
                        const firstSlot = hasSlots ? day.slots[0] : null;
                        const isSelected = selectedSlot?.date === day.date && selectedSlot?.time === firstSlot;
                        const dateObj = new Date(day.date);
                        const dateNum = dateObj.getDate();

                        return (
                            <div 
                                key={idx} 
                                onClick={() => hasSlots && firstSlot && handleSlotClick(day, firstSlot)}
                                className={`flex-shrink-0 w-16 flex flex-col items-center p-2 rounded-xl border transition-all duration-200 
                                    ${isSelected 
                                        ? 'bg-primary text-slate-900 border-primary shadow-md ring-2 ring-primary/30 transform -translate-y-1' 
                                        : hasSlots 
                                            ? 'bg-white border-gray-200 cursor-pointer hover:border-primary/50 hover:bg-slate-50 hover:shadow-sm' 
                                            : 'bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed'
                                    }`}
                            >
                                <span className={`text-[10px] font-bold uppercase mb-0.5 ${isSelected ? 'text-slate-800' : 'text-slate-400'}`}>
                                    {day.dayName}
                                </span>
                                <span className={`text-lg font-extrabold mb-1 leading-none ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                                    {dateNum}
                                </span>
                                <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                    {firstSlot || '-'}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <button 
                    onClick={() => selectedSlot && onBook(doctor, selectedSlot)}
                    disabled={!selectedSlot}
                    className="w-full mt-4 bg-slate-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-primary hover:text-slate-900 transition-all shadow-lg shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                    {t('bookAppt')}
                </button>
            </div>
        </div>
    );
};

const HealthArticleCard: React.FC<{ article: Article }> = ({ article }) => (
    <div className="relative group rounded-2xl overflow-hidden cursor-pointer h-64 flex-shrink-0 w-72 md:w-80">
        <img src={article.image} alt={article.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-center gap-2 mb-2">
                <span className="bg-primary/90 text-slate-900 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide backdrop-blur-sm">
                    {article.category}
                </span>
                <span className="text-slate-300 text-[10px] font-medium flex items-center gap-1">
                    <span className="material-icons-round text-[10px]">schedule</span> {article.readTime}
                </span>
            </div>
            <h4 className="text-white font-bold text-lg leading-tight line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                {article.title}
            </h4>
        </div>
    </div>
);

export default function App() {
    // State
    const [lang, setLang] = useState<Language>('fr');
    const [currentView, setCurrentView] = useState<'home' | 'searchResults' | 'dashboard' | 'admin'>('home');
    const [searchState, setSearchState] = useState({ query: '', specialty: '', city: '' });
    const [priceRange, setPriceRange] = useState<number>(3000);
    const [sortBy, setSortBy] = useState<SortOption>(SortOption.RECOMMENDED);
    const [showNearbyOnly, setShowNearbyOnly] = useState<boolean>(false);
    const [selectedType, setSelectedType] = useState<'all' | 'doctor' | 'clinic'>('all');
    const [doctors, setDoctors] = useState<Doctor[]>(MOCK_DOCTORS);
    const [users, setUsers] = useState<User[]>([
        { id: 'u1', name: 'Patient Test', email: 'test@maurisante.mr', role: 'patient', avatar: 'https://ui-avatars.com/api/?name=P+T&background=random' },
        { id: 'u2', name: 'Dr. Test', email: 'dr@maurisante.mr', role: 'doctor', avatar: 'https://ui-avatars.com/api/?name=D+T&background=random' }
    ]);
    
    // Auth State
    const [user, setUser] = useState<User | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // User Location State
    const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

    // Reviews State
    const [reviews, setReviews] = useState<Record<string, Review[]>>({});
    
    // Appointments State
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    
    // Reminder State
    const [notifiedIds, setNotifiedIds] = useState<Set<string>>(new Set());
    const [activeReminder, setActiveReminder] = useState<Appointment | null>(null);

    // Modal State
    const [bookingData, setBookingData] = useState<{ doctor: Doctor, slot: SlotInfo } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Translation Helper
    const t = (key: string) => {
        if (key === 'lang') return lang;
        const entry = UI_TRANSLATIONS[key];
        return entry ? entry[lang] : key;
    };

    // Calculate aggregated ratings from local state
    const getDoctorExtraRating = (doctorId: string) => {
        const doctorReviews = reviews[doctorId] || [];
        if (doctorReviews.length === 0) return { count: 0, sum: 0 };
        return {
            count: doctorReviews.length,
            sum: doctorReviews.reduce((acc, r) => acc + r.rating, 0)
        };
    };

    // Advanced Filtering Logic
    const filteredDoctors = useMemo(() => {
        // 1. Filter base
        let results = doctors.filter(doc => {
            const matchesSpecialty = searchState.specialty ? doc.specialty === searchState.specialty : true;
            const matchesCity = searchState.city ? doc.city === searchState.city : true;
            const matchesPrice = doc.price <= priceRange;
            const matchesType = selectedType === 'all' ? true : doc.type === selectedType;
            return matchesSpecialty && matchesCity && matchesPrice && matchesType;
        });

        // 2. Fuzzy Search
        if (searchState.query) {
            const queryTokens = searchState.query.toLowerCase().split(' ').filter((x: string) => x);
            results = results.map(doc => {
                let score = 0;
                const name = doc.name.toLowerCase();
                const specialty = SPECIALTY_TRANSLATIONS[doc.specialty][lang].toLowerCase();
                const city = doc.city.toLowerCase();

                queryTokens.forEach((token: string) => {
                    if (name.includes(token)) score += 3;
                    if (specialty.includes(token)) score += 2;
                    if (city.includes(token)) score += 1;
                });
                return { doc, score };
            })
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(item => item.doc);
        }

        // 3. Location Radius Filter
        if (showNearbyOnly && userLocation) {
            results = results.filter(doc => {
                if (!doc.coordinates) return false;
                const dist = calculateDistance(userLocation.lat, userLocation.lng, doc.coordinates.lat, doc.coordinates.lng);
                return dist <= 10; // 10km radius
            });
        }

        // 4. Sorting
        results.sort((a, b) => {
            if (sortBy === SortOption.DISTANCE && userLocation) {
                if (!a.coordinates || !b.coordinates) return 0;
                const distA = calculateDistance(userLocation.lat, userLocation.lng, a.coordinates.lat, a.coordinates.lng);
                const distB = calculateDistance(userLocation.lat, userLocation.lng, b.coordinates.lat, b.coordinates.lng);
                return distA - distB;
            }
            if (sortBy === SortOption.PRICE_LOW) return a.price - b.price;
            if (sortBy === SortOption.RATING) return b.rating - a.rating;
            return 0; // Default or recommended
        });
        
        // Fallback: Location Sort (if user location available and default sort active with no search query)
        if (userLocation && sortBy === SortOption.RECOMMENDED && !searchState.query && !showNearbyOnly) {
            results.sort((a, b) => {
                if (!a.coordinates || !b.coordinates) return 0;
                const distA = calculateDistance(userLocation.lat, userLocation.lng, a.coordinates.lat, a.coordinates.lng);
                const distB = calculateDistance(userLocation.lat, userLocation.lng, b.coordinates.lat, b.coordinates.lng);
                return distA - distB;
            });
        }

        return results;
    }, [searchState, priceRange, userLocation, lang, sortBy, showNearbyOnly, selectedType, doctors]);

    // Check for reminders logic
    useEffect(() => {
        const checkReminders = () => {
            const now = new Date();
            appointments.forEach(appt => {
                if (appt.status !== 'upcoming' || notifiedIds.has(appt.id)) return;
                
                // Construct date object from appointment string (YYYY-MM-DD) and time (HH:MM)
                const apptDate = new Date(`${appt.date}T${appt.time}`);
                const diffInMs = apptDate.getTime() - now.getTime();
                const diffInHours = diffInMs / (1000 * 60 * 60);

                if (diffInHours >= 20 && diffInHours <= 28) {
                    console.log(`Reminder: Appointment with ${appt.doctorName} is tomorrow at ${appt.time}.`);
                    setActiveReminder(appt);
                    setNotifiedIds(prev => {
                        const next = new Set(prev);
                        next.add(appt.id);
                        return next;
                    });
                    
                    setTimeout(() => setActiveReminder(null), 8000);
                }
            });
        };

        const interval = setInterval(checkReminders, 30000); // Check every 30s
        checkReminders(); 

        return () => clearInterval(interval);
    }, [appointments, notifiedIds]);

    const handleLocationClick = () => {
        if (showNearbyOnly) {
            setShowNearbyOnly(false);
            return;
        }

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setShowNearbyOnly(true);
                setSortBy(SortOption.DISTANCE); 
            }, (error) => {
                console.error("Error getting location", error);
                // Fallback for demo
                setUserLocation({ lat: 18.0735, lng: -15.9582 });
                setShowNearbyOnly(true);
                setSortBy(SortOption.DISTANCE);
            });
        }
    };

    const handleBookClick = (doctor: Doctor, slot: SlotInfo) => {
        if (!user) {
            setIsAuthModalOpen(true);
            return;
        }
        setBookingData({ doctor, slot });
        setIsModalOpen(true);
        setShowSuccess(false);
    };

    const confirmBooking = (patientName: string, forWho: 'self' | 'family') => {
        if (bookingData && user) {
            const newAppointment: Appointment = {
                id: Date.now().toString(),
                doctorId: bookingData.doctor.id,
                doctorName: bookingData.doctor.name,
                patientId: user.id,
                patientName: patientName,
                forWho: forWho,
                specialty: bookingData.doctor.specialty,
                location: bookingData.doctor.location,
                date: bookingData.slot.date,
                time: bookingData.slot.time,
                image: bookingData.doctor.image,
                price: bookingData.doctor.price,
                status: 'upcoming'
            };
            setAppointments(prev => [newAppointment, ...prev]);
        }
        
        setTimeout(() => {
            setShowSuccess(true);
        }, 500);
    };

    const handleReviewSubmit = (reviewData: Omit<Review, 'id' | 'doctorId' | 'date'>) => {
        if (!bookingData) return;
        const doctorId = bookingData.doctor.id;
        const newReview: Review = {
            id: Date.now().toString(),
            doctorId,
            date: new Date().toISOString(),
            ...reviewData
        };

        setReviews(prev => ({
            ...prev,
            [doctorId]: [...(prev[doctorId] || []), newReview]
        }));
    };

    const closeBookingModal = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            setBookingData(null);
            setShowSuccess(false);
        }, 300);
    };

    const handleLogin = (u: User) => {
        setUser(u);
        setIsAuthModalOpen(false);
        if (!users.find(existing => existing.id === u.id)) {
            setUsers(prev => [...prev, u]);
        }
    };

    const handleAddFamilyMember = (member: FamilyMember) => {
        if (user) {
            setUser({
                ...user,
                familyMembers: [...(user.familyMembers || []), member]
            });
        }
    };

    return (
        <div className={`min-h-screen pb-12 ${lang === 'ar' ? 'font-arabic' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <OfflinePaymentBanner t={t} />
            <Navbar 
                lang={lang} 
                setLang={setLang} 
                t={t} 
                user={user} 
                onLogout={() => { setUser(null); setCurrentView('home'); }} 
                setView={setCurrentView}
                openAuth={() => setIsAuthModalOpen(true)}
            />
            
            <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)} 
                onLogin={handleLogin} 
                t={t} 
            />

            <BookingModal 
                isOpen={isModalOpen} 
                onClose={closeBookingModal} 
                onConfirm={confirmBooking} 
                onReviewSubmit={handleReviewSubmit}
                data={bookingData}
                isSuccess={showSuccess}
                t={t}
                user={user}
            />

            <Chatbot t={t} isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} onOpen={() => setIsChatOpen(true)} />
            
            {activeReminder && (
                <ReminderToast 
                    appt={activeReminder} 
                    onClose={() => setActiveReminder(null)} 
                    t={t} 
                    lang={lang} 
                />
            )}

            {currentView === 'home' ? (
                <LandingPage 
                    t={t} 
                    lang={lang} 
                    searchState={searchState} 
                    setSearchState={setSearchState}
                    onSearch={() => setCurrentView('searchResults')}
                />
            ) : currentView === 'searchResults' ? (
                <SearchResults 
                    filteredDoctors={filteredDoctors}
                    searchState={searchState}
                    setSearchState={setSearchState}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    showNearbyOnly={showNearbyOnly}
                    handleLocationClick={handleLocationClick}
                    handleBookClick={handleBookClick}
                    userLocation={userLocation}
                    getDoctorExtraRating={getDoctorExtraRating}
                    selectedType={selectedType}
                    setSelectedType={setSelectedType}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    t={t}
                    lang={lang}
                />
            ) : currentView === 'admin' && user?.role === 'admin' ? (
                <AdminDashboard doctors={doctors} setDoctors={setDoctors} users={users} setUsers={setUsers} t={t} />
            ) : currentView === 'dashboard' && user ? (
                <DashboardView 
                    user={user} 
                    appointments={appointments} 
                    t={t} 
                    lang={lang} 
                    onAddFamilyMember={handleAddFamilyMember}
                />
            ) : null}
        </div>
    );
}
import { Doctor, Article, TranslationMap, Language } from './types';

export const CITIES = ['Nouakchott', 'Nouadhibou', 'Rosso', 'Kiffa', 'Atar'];

export const SPECIALTY_KEYS = {
    CARDIOLOGIST: 'CARDIOLOGIST',
    DENTIST: 'DENTIST',
    GENERALIST: 'GENERALIST',
    PEDIATRICIAN: 'PEDIATRICIAN',
    DERMATOLOGIST: 'DERMATOLOGIST',
    NEUROLOGIST: 'NEUROLOGIST',
    OPHTHALMOLOGIST: 'OPHTHALMOLOGIST',
    CLINIC_GENERAL: 'CLINIC_GENERAL', // Generic for clinics
};

// Mapping for doctor specialties to translated keys
export const SPECIALTY_TRANSLATIONS: Record<string, TranslationMap> = {
    [SPECIALTY_KEYS.CARDIOLOGIST]: {
        fr: 'Cardiologue',
        ar: 'طبيب القلب',
        en: 'Cardiologist'
    },
    [SPECIALTY_KEYS.DENTIST]: {
        fr: 'Dentiste',
        ar: 'طبيب أسنان',
        en: 'Dentist'
    },
    [SPECIALTY_KEYS.GENERALIST]: {
        fr: 'Médecin Généraliste',
        ar: 'طبيب عام',
        en: 'General Practitioner'
    },
    [SPECIALTY_KEYS.PEDIATRICIAN]: {
        fr: 'Pédiatre',
        ar: 'طبيب أطفال',
        en: 'Pediatrician'
    },
    [SPECIALTY_KEYS.DERMATOLOGIST]: {
        fr: 'Dermatologue',
        ar: 'طبيب جلدية',
        en: 'Dermatologist'
    },
    [SPECIALTY_KEYS.NEUROLOGIST]: {
        fr: 'Neurologue',
        ar: 'طبيب أعصاب',
        en: 'Neurologist'
    },
    [SPECIALTY_KEYS.OPHTHALMOLOGIST]: {
        fr: 'Ophtalmologue',
        ar: 'طبيب عيون',
        en: 'Ophthalmologist'
    },
    [SPECIALTY_KEYS.CLINIC_GENERAL]: {
        fr: 'Clinique Multidisciplinaire',
        ar: 'عيادة متعددة التخصصات',
        en: 'Multidisciplinary Clinic'
    }
};

export const UI_TRANSLATIONS: Record<string, TranslationMap> = {
    searchPlaceholder: { fr: 'Médecin, établissement, spécialité...', ar: 'طبيب، مؤسسة، تخصص...', en: 'Doctor, clinic, specialty...' },
    searchBtn: { fr: 'Rechercher', ar: 'بحث', en: 'Search' },
    allSpecialties: { fr: 'Spécialités', ar: 'التخصصات', en: 'Specialties' },
    allCities: { fr: 'Villes', ar: 'المدن', en: 'Cities' },
    filters: { fr: 'Filtres', ar: 'تصفية', en: 'Filters' },
    reset: { fr: 'Réinitialiser', ar: 'إعادة تعيين', en: 'Reset' },
    maxPrice: { fr: 'Honoraires max', ar: 'أقصى رسوم', en: 'Max Fees' },
    popularCategories: { fr: 'Recherches fréquentes', ar: 'البحث المتكرر', en: 'Popular Searches' },
    availableDoctors: { fr: 'praticien(s)', ar: 'ممارس', en: 'practitioner(s)' },
    sortBy: { fr: 'Trier par', ar: 'ترتيب حسب', en: 'Sort by' },
    recommended: { fr: 'Pertinence', ar: 'ملاءمة', en: 'Relevance' },
    priceLow: { fr: 'Prix croissant', ar: 'السعر: من الأقل', en: 'Price: Low to High' },
    rating: { fr: 'Avis patients', ar: 'تقييم المرضى', en: 'Patient Reviews' },
    noResults: { fr: 'Aucun résultat trouvé', ar: 'لم يتم العثور على نتائج', en: 'No results found' },
    tryAdjusting: { fr: 'Modifiez votre recherche.', ar: 'تعديل البحث.', en: 'Modify your search.' },
    healthWellness: { fr: 'Magazine Santé', ar: 'مجلة الصحة', en: 'Health Magazine' },
    dailyTips: { fr: 'Conseils et actualités', ar: 'نصائح وأخبار', en: 'Tips and News' },
    viewAll: { fr: 'Voir plus', ar: 'عرض المزيد', en: 'See more' },
    nextSlots: { fr: 'Prochaines disponibilités', ar: 'المواعيد القادمة', en: 'Next availabilities' },
    bookAppt: { fr: 'Prendre rendez-vous', ar: 'حجز موعد', en: 'Book Appointment' },
    seeMore: { fr: 'Voir plus', ar: 'المزيد', en: 'See more' },
    heroTitle: { fr: 'Trouvez un rendez-vous avec un médecin', ar: 'اعثر على موعد مع طبيب', en: 'Find an appointment with a doctor' },
    heroSubtitle: { fr: 'Réservez en ligne, 24h/24 et 7j/7', ar: 'احجز عبر الإنترنت، 24/7', en: 'Book online, 24/7' },
    navDoctors: { fr: 'Médecins', ar: 'الأطباء', en: 'Doctors' },
    navClinics: { fr: 'Cliniques', ar: 'العيادات', en: 'Clinics' },
    navHealth: { fr: 'Santé', ar: 'الصحة', en: 'Health' },
    navAppointments: { fr: 'Mes Rendez-vous', ar: 'مواعيدي', en: 'My Appointments' },
    offlinePayment: { fr: 'Paiement sur place au cabinet', ar: 'الدفع في الموقع في العيادة', en: 'Payment at the clinic' },
    confirmTitle: { fr: 'Confirmation du RDV', ar: 'تأكيد الموعد', en: 'Booking Confirmation' },
    confirmBody: { fr: 'Confirmer le rendez-vous', ar: 'تأكيد الموعد', en: 'Confirm Appointment' },
    cancel: { fr: 'Annuler', ar: 'إلغاء', en: 'Cancel' },
    successTitle: { fr: 'Rendez-vous confirmé', ar: 'تم تأكيد الموعد', en: 'Appointment Confirmed' },
    successMsg: { fr: 'Votre rendez-vous est programmé.', ar: 'تم تحديد موعدك.', en: 'Your appointment is scheduled.' },
    leaveReview: { fr: 'Notez votre consultation', ar: 'قيم زيارتك', en: 'Rate your visit' },
    submitReview: { fr: 'Envoyer l\'avis', ar: 'إرسال التقييم', en: 'Submit Review' },
    reviewPlaceholder: { fr: 'Votre avis nous intéresse...', ar: 'رأيك يهمنا...', en: 'Your feedback matters...' },
    howWasExperience: { fr: 'Votre expérience', ar: 'تجربتك', en: 'Your experience' },
    finish: { fr: 'Fermer', ar: 'إغلاق', en: 'Close' },
    distance: { fr: 'Distance', ar: 'المسافة', en: 'Distance' },
    nearMe: { fr: 'Autour de moi', ar: 'بالقرب مني', en: 'Near Me' },
    sortDistance: { fr: 'Distance', ar: 'المسافة', en: 'Distance' },
    upcoming: { fr: 'À venir', ar: 'القادمة', en: 'Upcoming' },
    past: { fr: 'Passés', ar: 'الماضية', en: 'Past' },
    noAppointments: { fr: 'Aucun rendez-vous.', ar: 'لا توجد مواعيد.', en: 'No appointments.' },
    status: { fr: 'Statut', ar: 'الحالة', en: 'Status' },
    login: { fr: 'Se connecter', ar: 'تسجيل الدخول', en: 'Login' },
    signup: { fr: 'S\'inscrire', ar: 'تسجيل', en: 'Sign Up' },
    email: { fr: 'Email', ar: 'البريد الإلكتروني', en: 'Email' },
    password: { fr: 'Mot de passe', ar: 'كلمة المرور', en: 'Password' },
    name: { fr: 'Prénom et Nom', ar: 'الاسم الكامل', en: 'Full Name' },
    iAm: { fr: 'Je suis', ar: 'أنا', en: 'I am' },
    patient: { fr: 'Patient', ar: 'مريض', en: 'Patient' },
    doctor: { fr: 'Praticien', ar: 'طبيب', en: 'Practitioner' },
    logout: { fr: 'Se déconnecter', ar: 'خروج', en: 'Logout' },
    dashboard: { fr: 'Mon compte', ar: 'حسابي', en: 'My Account' },
    needAccount: { fr: 'Nouveau ? S\'inscrire', ar: 'جديد؟ سجل', en: 'New? Sign up' },
    haveAccount: { fr: 'Déjà inscrit ? Se connecter', ar: 'مسجل بالفعل؟ دخول', en: 'Already registered? Login' },
    typeFilter: { fr: 'Type d\'établissement', ar: 'نوع المؤسسة', en: 'Establishment Type' },
    allTypes: { fr: 'Tous', ar: 'الكل', en: 'All' },
    clinics: { fr: 'Établissements', ar: 'المؤسسات', en: 'Establishments' },
    doctors: { fr: 'Praticiens', ar: 'الأطباء', en: 'Practitioners' },
    welcome: { fr: 'Bonjour', ar: 'مرحباً', en: 'Hello' },
    myPatients: { fr: 'Mes Patients', ar: 'مرضاي', en: 'My Patients' },
    adminPanel: { fr: 'Administration', ar: 'الإدارة', en: 'Admin Panel' },
    users: { fr: 'Utilisateurs', ar: 'المستخدمين', en: 'Users' },
    validate: { fr: 'Valider', ar: 'تأكيد', en: 'Validate' },
    delete: { fr: 'Supprimer', ar: 'حذف', en: 'Delete' },
    familyMembers: { fr: 'Proches', ar: 'الأقارب', en: 'Relatives' },
    addMember: { fr: 'Ajouter un proche', ar: 'إضافة قريب', en: 'Add Relative' },
    relation: { fr: 'Lien (ex: Enfant)', ar: 'العلاقة', en: 'Relation' },
    bookFor: { fr: 'Pour qui prenez-vous rendez-vous ?', ar: 'لمن تحجز الموعد؟', en: 'Who is this appointment for?' },
    myself: { fr: 'Moi-même', ar: 'أنا', en: 'Myself' },
    chatbotName: { fr: 'Assistant MauriSanté', ar: 'مساعد', en: 'MauriSanté Assistant' },
    chatbotWelcome: { fr: 'Bonjour, je suis votre assistant virtuel. Comment puis-je vous aider ?', ar: 'مرحباً، أنا مساعدك الافتراضي. كيف يمكنني مساعدتك؟', en: 'Hello, I am your virtual assistant. How can I help you?' },
    typeMessage: { fr: 'Votre message...', ar: 'رسالتك...', en: 'Your message...' },
    reminderTitle: { fr: 'Rappel de Rendez-vous', ar: 'تذكير بالمود', en: 'Appointment Reminder' },
    reminderBody: { fr: 'Vous avez un rendez-vous demain', ar: 'لديك موعد غدا', en: 'You have an appointment tomorrow' },
    whyChooseUs: { fr: 'Pourquoi choisir MauriSanté ?', ar: 'لماذا تختار MauriSanté؟', en: 'Why choose MauriSanté?' },
    access247: { fr: 'Accès 24h/24 7j/7', ar: 'وصول 24/7', en: '24/7 Access' },
    access247Desc: { fr: 'Trouvez un rendez-vous avec un dentiste, un cardiologue... et réservez en ligne.', ar: 'اعثر على موعد مع طبيب أسنان، طبيب قلب... واحجز عبر الإنترنت.', en: 'Find an appointment with a dentist, cardiologist... and book online.' },
    reminders: { fr: 'Rappels SMS / Email', ar: 'تذكير عبر الرسائل القصيرة / البريد الإلكتروني', en: 'SMS / Email Reminders' },
    remindersDesc: { fr: 'Ne manquez plus aucun rendez-vous grâce à nos rappels automatiques.', ar: 'لا تفوت أي موعد بفضل تذكيراتنا التلقائية.', en: 'Never miss an appointment with our automatic reminders.' },
    history: { fr: 'Historique des soins', ar: 'تاريخ العلاج', en: 'Care History' },
    historyDesc: { fr: 'Retrouvez l\'historique de tous vos rendez-vous médicaux en un clic.', ar: 'اعثر على تاريخ جميع مواعيدك الطبية بنقرة واحدة.', en: 'Find the history of all your medical appointments in one click.' },
    areYouDoctor: { fr: 'Vous êtes professionnel de santé ?', ar: 'هل أنت متخصص في الرعاية الصحية؟', en: 'Are you a health professional?' },
    discoverPro: { fr: 'Découvrir MauriSanté Pro', ar: 'اكتشف MauriSanté Pro', en: 'Discover MauriSanté Pro' },
    footerCopyright: { fr: '© 2024 MauriSanté. Tous droits réservés.', ar: '© 2024 MauriSanté. جميع الحقوق محفوظة.', en: '© 2024 MauriSanté. All rights reserved.' }
};

const generateAvailability = (): Doctor['availability'] => {
    // Generate next 3 days
    const days = [];
    const today = new Date();
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    
    for (let i = 0; i < 4; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const dayName = dayNames[d.getDay()];
        const dateStr = d.toISOString().split('T')[0];
        
        // Random slots
        const slots = Math.random() > 0.3 ? ['09:00', '10:30', '14:00', '16:30'].slice(0, Math.floor(Math.random() * 4) + 1) : [];
        
        days.push({
            date: dateStr,
            dayName: dayName,
            slots: slots
        });
    }
    return days;
};

// Mock coordinates roughly around Nouakchott (18.0735, -15.9582)
export const MOCK_DOCTORS: Doctor[] = [
    {
        id: '1',
        type: 'doctor',
        name: 'Dr. Ahmed Salem',
        specialty: SPECIALTY_KEYS.CARDIOLOGIST,
        location: 'Clinique Chifa, Tevragh Zeina',
        city: 'Nouakchott',
        price: 1500,
        rating: 4.9,
        reviewCount: 124,
        image: 'https://picsum.photos/id/1005/400/400',
        verified: true,
        availability: generateAvailability(),
        coordinates: { lat: 18.1000, lng: -15.9700 }
    },
    {
        id: '2',
        type: 'doctor',
        name: 'Dr. Aminata Diallo',
        specialty: SPECIALTY_KEYS.PEDIATRICIAN,
        location: 'Hôpital Militaire, Ksar',
        city: 'Nouakchott',
        price: 1000,
        rating: 4.8,
        reviewCount: 89,
        image: 'https://picsum.photos/id/338/400/400',
        verified: true,
        availability: generateAvailability(),
        coordinates: { lat: 18.0850, lng: -15.9600 }
    },
    {
        id: '3',
        type: 'doctor',
        name: 'Dr. Sidi Mohamed',
        specialty: SPECIALTY_KEYS.DENTIST,
        location: 'Cabinet Al-Afia, Centre Ville',
        city: 'Nouadhibou',
        price: 800,
        rating: 4.5,
        reviewCount: 56,
        image: 'https://picsum.photos/id/64/400/400',
        verified: false,
        availability: generateAvailability(),
        coordinates: { lat: 20.9300, lng: -17.0300 } // Nouadhibou coords
    },
    {
        id: '4',
        type: 'doctor',
        name: 'Dr. Mariem Mint Vall',
        specialty: SPECIALTY_KEYS.DERMATOLOGIST,
        location: 'Polyclinique, Tevragh Zeina',
        city: 'Nouakchott',
        price: 2000,
        rating: 4.9,
        reviewCount: 210,
        image: 'https://picsum.photos/id/342/400/400',
        verified: true,
        availability: generateAvailability(),
        coordinates: { lat: 18.0950, lng: -15.9750 }
    },
    {
        id: '5',
        type: 'doctor',
        name: 'Dr. Oumar Ba',
        specialty: SPECIALTY_KEYS.GENERALIST,
        location: 'Clinique Espoir, Rosso',
        city: 'Rosso',
        price: 500,
        rating: 4.2,
        reviewCount: 30,
        image: 'https://picsum.photos/id/1012/400/400',
        verified: true,
        availability: generateAvailability(),
        coordinates: { lat: 16.5130, lng: -15.8050 } // Rosso coords
    },
    {
        id: '6',
        type: 'clinic',
        name: 'Clinique El Voulan',
        specialty: SPECIALTY_KEYS.CLINIC_GENERAL,
        location: 'Tevragh Zeina',
        city: 'Nouakchott',
        price: 2500,
        rating: 4.6,
        reviewCount: 340,
        image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400',
        verified: true,
        availability: generateAvailability(),
        coordinates: { lat: 18.1100, lng: -15.9800 }
    }
];

export const MOCK_ARTICLES: Article[] = [
    {
        id: '101',
        category: 'Santé Féminine',
        title: 'Comprendre votre cycle hormonal et son impact sur l\'énergie',
        readTime: '5 min',
        image: 'https://picsum.photos/id/449/600/400'
    },
    {
        id: '102',
        category: 'Nutrition',
        title: 'Les bienfaits du thé à la menthe mauritanien pour la digestion',
        readTime: '3 min',
        image: 'https://picsum.photos/id/225/600/400'
    },
    {
        id: '103',
        category: 'Prévention',
        title: 'Comment protéger votre peau du soleil et de la poussière',
        readTime: '4 min',
        image: 'https://picsum.photos/id/1004/600/400'
    }
];
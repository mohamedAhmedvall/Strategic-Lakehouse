export interface TranslationMap {
    fr: string;
    ar: string;
    en: string;
}

export interface DoctorAvailability {
    date: string; // ISO date string YYYY-MM-DD
    dayName: string;
    slots: string[];
}

export interface Doctor {
    id: string;
    type: 'doctor' | 'clinic';
    name: string;
    specialty: string; // Key for translation
    location: string;
    city: string;
    price: number;
    rating: number;
    reviewCount: number;
    image: string;
    verified: boolean;
    availability: DoctorAvailability[];
    coordinates?: {
        lat: number;
        lng: number;
    };
}

export interface Review {
    id: string;
    doctorId: string;
    rating: number;
    comment: string;
    date: string;
}

export interface Article {
    id: string;
    category: string;
    title: string;
    readTime: string;
    image: string;
}

export enum SortOption {
    RECOMMENDED = 'RECOMMENDED',
    PRICE_LOW = 'PRICE_LOW',
    PRICE_HIGH = 'PRICE_HIGH',
    RATING = 'RATING',
    DISTANCE = 'DISTANCE'
}

export type Language = 'fr' | 'ar' | 'en';
export type Role = 'patient' | 'doctor' | 'admin';

export interface FamilyMember {
    id: string;
    name: string;
    relation: string; // e.g., 'child', 'spouse', 'parent'
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatar?: string;
    familyMembers?: FamilyMember[];
}

export interface SlotInfo {
    date: string;
    dayName: string;
    time: string;
}

export interface Appointment {
    id: string;
    doctorId: string;
    doctorName: string;
    patientId: string; // Link to user account
    patientName: string; // Actual patient name (could be family member)
    forWho: 'self' | 'family';
    specialty: string;
    location: string;
    date: string;
    time: string;
    image: string;
    price: number;
    status: 'upcoming' | 'completed' | 'cancelled';
}

export interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}
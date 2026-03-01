import { create } from 'zustand';
import { Shop, Service, Barber } from '../types/firestore.types';

interface BookingStore {
    selectedShop: Shop | null;
    selectedService: Service | null;
    selectedBarber: Barber | null;
    selectedDate: string | null;
    selectedTime: string | null;
    notes: string;
    setSelectedShop: (shop: Shop | null) => void;
    setSelectedService: (service: Service | null) => void;
    setSelectedBarber: (barber: Barber | null) => void;
    setSelectedDate: (date: string | null) => void;
    setSelectedTime: (time: string | null) => void;
    setNotes: (notes: string) => void;
    resetBooking: () => void;
}

export const useBookingStore = create<BookingStore>((set) => ({
    selectedShop: null,
    selectedService: null,
    selectedBarber: null,
    selectedDate: null,
    selectedTime: null,
    notes: '',
    setSelectedShop: (shop) => set({ selectedShop: shop }),
    setSelectedService: (service) => set({ selectedService: service }),
    setSelectedBarber: (barber) => set({ selectedBarber: barber }),
    setSelectedDate: (date) => set({ selectedDate: date }),
    setSelectedTime: (time) => set({ selectedTime: time }),
    setNotes: (notes) => set({ notes }),
    resetBooking: () =>
        set({
            selectedShop: null,
            selectedService: null,
            selectedBarber: null,
            selectedDate: null,
            selectedTime: null,
            notes: '',
        }),
}));

import {
    collection, doc, addDoc, updateDoc, onSnapshot,
    query, where, orderBy, getDocs, runTransaction, increment,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { ChatRoom, ChatMessage } from '../types/firestore.types';

export const chatService = {
    getOrCreateChatRoom: async (
        customerId: string,
        shopId: string,
        partnerId: string,
        partnerName: string,
        partnerPhoto: string | null,
        customerName: string,
        customerPhoto: string | null
    ): Promise<string> => {
        const roomsRef = collection(db, 'chatRooms');
        const q = query(roomsRef, where('participantIds', 'array-contains', customerId));
        const snap = await getDocs(q);

        const existing = snap.docs.find((d) => {
            const data = d.data() as ChatRoom;
            return data.shopId === shopId && data.participantIds.includes(partnerId);
        });

        if (existing) {
            return existing.id;
        }

        const docRef = await addDoc(roomsRef, {
            participantIds: [customerId, partnerId],
            participantNames: {
                [customerId]: customerName,
                [partnerId]: partnerName,
            },
            participantPhotos: {
                [customerId]: customerPhoto,
                [partnerId]: partnerPhoto,
            },
            shopId,
            lastMessage: '',
            lastMessageAt: new Date().toISOString(),
            lastSenderId: '',
            unreadCount: {
                [customerId]: 0,
                [partnerId]: 0,
            },
            createdAt: new Date().toISOString(),
        });

        return docRef.id;
    },

    subscribeToChatRooms: (userId: string, callback: (rooms: ChatRoom[]) => void) => {
        const q = query(
            collection(db, 'chatRooms'),
            where('participantIds', 'array-contains', userId),
            orderBy('lastMessageAt', 'desc')
        );
        return onSnapshot(q, (snap) => {
            callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChatRoom)));
        });
    },

    subscribeToMessages: (roomId: string, callback: (messages: ChatMessage[]) => void) => {
        const q = query(collection(db, `chatRooms/${roomId}/messages`), orderBy('createdAt', 'desc'));
        return onSnapshot(q, (snap) => {
            callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChatMessage)));
        });
    },

    sendMessage: async (
        roomId: string,
        senderId: string,
        senderName: string,
        text: string,
        recipientId: string
    ): Promise<void> => {
        const messagesRef = collection(db, `chatRooms/${roomId}/messages`);
        const now = new Date().toISOString();

        await addDoc(messagesRef, {
            roomId,
            senderId,
            senderName,
            text,
            imageURL: null,
            readBy: [senderId],
            createdAt: now,
        });

        const roomRef = doc(db, 'chatRooms', roomId);
        await updateDoc(roomRef, {
            lastMessage: text,
            lastMessageAt: now,
            lastSenderId: senderId,
            [`unreadCount.${recipientId}`]: increment(1),
        });
    },

    sendImageMessage: async (
        roomId: string,
        senderId: string,
        senderName: string,
        imageUri: string,
        recipientId: string
    ): Promise<void> => {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const storageRef = ref(storage, `chat/${roomId}/${Date.now()}.jpg`);
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);

        const messagesRef = collection(db, `chatRooms/${roomId}/messages`);
        const now = new Date().toISOString();

        await addDoc(messagesRef, {
            roomId,
            senderId,
            senderName,
            text: '',
            imageURL: downloadURL,
            readBy: [senderId],
            createdAt: now,
        });

        const roomRef = doc(db, 'chatRooms', roomId);
        await updateDoc(roomRef, {
            lastMessage: '[Photo]',
            lastMessageAt: now,
            lastSenderId: senderId,
            [`unreadCount.${recipientId}`]: increment(1),
        });
    },

    markMessagesRead: async (roomId: string, userId: string): Promise<void> => {
        const roomRef = doc(db, 'chatRooms', roomId);
        await updateDoc(roomRef, {
            [`unreadCount.${userId}`]: 0,
        });
    },
};

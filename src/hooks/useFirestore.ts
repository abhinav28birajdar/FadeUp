import { useState, useEffect } from 'react';
import { doc, collection, onSnapshot, query, QueryConstraint, DocumentData } from 'firebase/firestore';
import { db } from '../config/firebase';

// Generic firestore hooks if needed, otherwise rely on services
export function useFirestoreDoc<T>(path: string, pathSegments?: string[]) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribe: () => void;
        if (path) {
            const docRef = doc(db, path, ...(pathSegments || []));
            unsubscribe = onSnapshot(docRef, (snap) => {
                if (snap.exists()) {
                    setData({ id: snap.id, ...snap.data() } as unknown as T);
                } else {
                    setData(null);
                }
                setLoading(false);
            });
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [path]);

    return { data, loading };
}

export function useFirestoreCollection<T>(path: string, constraints: QueryConstraint[] = []) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribe: () => void;
        if (path) {
            const q = query(collection(db, path), ...constraints);
            unsubscribe = onSnapshot(q, (snap) => {
                setData(snap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as T)));
                setLoading(false);
            });
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [path, constraints]);

    return { data, loading };
}

import { useState, useEffect, useRef } from 'react';
import { doc, collection, onSnapshot, query, QueryConstraint } from 'firebase/firestore';
import { db } from '../config/firebase';

// Generic firestore hooks if needed, otherwise rely on services
export function useFirestoreDoc<T>(path: string, pathSegments?: string[]) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);

    // Stringify path segments to avoid object-reference re-renders
    const segmentsKey = JSON.stringify(pathSegments);

    useEffect(() => {
        if (!path) return;
        const docRef = doc(db, path, ...(pathSegments || []));
        const unsubscribe = onSnapshot(docRef, (snap) => {
            if (snap.exists()) {
                setData({ id: snap.id, ...snap.data() } as unknown as T);
            } else {
                setData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [path, segmentsKey]);

    return { data, loading };
}

export function useFirestoreCollection<T>(path: string, constraints: QueryConstraint[] = []) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);

    // Use a ref to hold constraints to avoid stale closures while preventing infinite re-renders
    const constraintsRef = useRef(constraints);
    constraintsRef.current = constraints;

    useEffect(() => {
        if (!path) return;
        const q = query(collection(db, path), ...constraintsRef.current);
        const unsubscribe = onSnapshot(q, (snap) => {
            setData(snap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as T)));
            setLoading(false);
        });

        return () => unsubscribe();
    }, [path]);

    return { data, loading };
}

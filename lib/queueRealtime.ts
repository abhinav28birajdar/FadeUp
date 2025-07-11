import { collection, query, where, orderBy, onSnapshot, QuerySnapshot, DocumentData } from "firebase/firestore";
import { db } from "./firebase";

export const subscribeToQueueUpdates = (
  shopId: string,
  onUpdate: (snapshot: QuerySnapshot<DocumentData>) => void
): (() => void) => {
  // Create a query for queue entries that are waiting, for this shop, ordered by position
  const queueQuery = query(
    collection(db, "queue"),
    where("shop_id", "==", shopId),
    where("status", "==", "waiting"),
    orderBy("position", "asc")
  );

  // Set up the real-time listener
  const unsubscribe = onSnapshot(
    queueQuery,
    (snapshot) => {
      onUpdate(snapshot);
    },
    (error) => {
      console.error("Error listening to queue updates:", error);
    }
  );

  // Return the unsubscribe function for cleanup
  return unsubscribe;
};
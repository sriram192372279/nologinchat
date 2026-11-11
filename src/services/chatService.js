import {
  db,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  updateDoc
} from '../firebase';

// Generates a 4-digit numeric room code (1000 - 9999)
export function generateRoomCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Creates a new room in Firestore and registers the creator as member
 */
export async function createRoom({ user, username, customName = '' }) {
  if (!user) throw new Error('User must be signed in to create a room.');

  const roomCode = generateRoomCode();
  const roomRef = doc(db, 'rooms', roomCode);

  // Check collision just in case
  const existing = await getDoc(roomRef);
  if (existing.exists()) {
    // Retry once with a new code
    return createRoom({ user, username, customName });
  }

  const roomData = {
    roomCode: roomCode,
    name: customName?.trim() || `Room #${roomCode}`,
    createdBy: user.uid,
    creatorName: username,
    createdAt: serverTimestamp(),
    isActive: true
  };

  await setDoc(roomRef, roomData);

  // Register creator as active room member
  const memberRef = doc(db, 'roomMembers', `${roomCode}_${user.uid}`);
  await setDoc(memberRef, {
    roomId: roomCode,
    userId: user.uid,
    username: username || 'Creator',
    joinedAt: serverTimestamp(),
    lastSeen: Date.now()
  });

  return { id: roomCode, ...roomData };
}

/**
 * Validates room existence and joins user as a member
 */
export async function joinRoom({ roomCode, user, username }) {
  if (!user) throw new Error('User must be signed in to join a room.');
  const cleanCode = roomCode?.toString().replace(/\D/g, '').trim();
  if (!cleanCode || cleanCode.length !== 4) {
    throw new Error('Please enter a 4-digit room code (e.g. 4829).');
  }

  const roomRef = doc(db, 'rooms', cleanCode);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    throw new Error(`Room "${cleanCode}" was not found. Please double-check the code.`);
  }

  const roomData = roomSnap.data();
  if (roomData.isActive === false) {
    throw new Error(`Room "${cleanCode}" has been closed.`);
  }

  // Register or update member in roomMembers
  const memberRef = doc(db, 'roomMembers', `${cleanCode}_${user.uid}`);
  await setDoc(memberRef, {
    roomId: cleanCode,
    userId: user.uid,
    username: username || 'Guest',
    joinedAt: serverTimestamp(),
    lastSeen: Date.now()
  }, { merge: true });

  return { id: cleanCode, ...roomData };
}

/**
 * Real-time listener for room messages
 */
export function subscribeToMessages(roomCode, onMessages, onError) {
  if (!roomCode) return () => {};

  // Query by roomId only so Firestore doesn't require a manual composite index
  const q = query(
    collection(db, 'messages'),
    where('roomId', '==', roomCode)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs
        .map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }))
        .sort((a, b) => {
          const timeA = a.createdAt?.toMillis 
            ? a.createdAt.toMillis() 
            : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (a.createdAt || 0));
          const timeB = b.createdAt?.toMillis 
            ? b.createdAt.toMillis() 
            : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (b.createdAt || 0));
          return timeA - timeB;
        });
      onMessages(messages);
    },
    (err) => {
      console.error('Firestore messages subscription error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Send a message to the room
 */
export async function sendMessage({ roomCode, user, username, messageText }) {
  const text = messageText?.trim();
  if (!text) {
    throw new Error('Message cannot be empty.');
  }
  if (text.length > 1000) {
    throw new Error('Message is too long (maximum 1000 characters).');
  }

  // 1. Add message doc
  const docRef = await addDoc(collection(db, 'messages'), {
    roomId: roomCode,
    senderId: user.uid,
    username: username || 'Anonymous',
    message: text,
    createdAt: serverTimestamp()
  });

  // 2. Touch member presence lastSeen
  try {
    const memberRef = doc(db, 'roomMembers', `${roomCode}_${user.uid}`);
    await updateDoc(memberRef, {
      lastSeen: Date.now()
    });
  } catch {
    // Non-critical if presence touch fails
  }

  return docRef.id;
}

/**
 * Real-time listener for room members
 */
export function subscribeToMembers(roomCode, onMembers, onError) {
  if (!roomCode) return () => {};

  const q = query(
    collection(db, 'roomMembers'),
    where('roomId', '==', roomCode)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const members = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      onMembers(members);
    },
    (err) => {
      console.error('Firestore members subscription error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Leave a room and clean up member record
 */
export async function leaveRoom({ roomCode, userId }) {
  if (!roomCode || !userId) return;
  try {
    const memberRef = doc(db, 'roomMembers', `${roomCode}_${userId}`);
    await deleteDoc(memberRef);
  } catch (err) {
    console.warn('Error removing member doc upon leaving:', err);
  }
}

/**
 * Ping user presence in room (heartbeat)
 */
export async function updatePresence({ roomCode, userId, username }) {
  if (!roomCode || !userId) return;
  try {
    const memberRef = doc(db, 'roomMembers', `${roomCode}_${userId}`);
    await setDoc(memberRef, {
      roomId: roomCode,
      userId: userId,
      username: username || 'User',
      lastSeen: Date.now()
    }, { merge: true });
  } catch (err) {
    // Ignored in heartbeat
  }
}


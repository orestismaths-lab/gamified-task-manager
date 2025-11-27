// Firestore Members API

import { 
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Member } from '@/types';

const MEMBERS_COLLECTION = 'members';

// Convert Firestore document to Member
const firestoreToMember = (doc: DocumentData): Member => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name || '',
    xp: data.xp || 0,
    level: data.level || 1,
    avatar: data.avatar,
    userId: data.userId, // Link to Firebase Auth user
    email: data.email,
  };
};

export const membersAPI = {
  // Get all members
  getMembers: async (): Promise<Member[]> => {
    const membersRef = collection(db, MEMBERS_COLLECTION);
    const q = query(membersRef, orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(firestoreToMember);
  },

  // Get single member
  getMember: async (memberId: string): Promise<Member | null> => {
    const memberRef = doc(db, MEMBERS_COLLECTION, memberId);
    const snapshot = await getDoc(memberRef);
    if (!snapshot.exists()) return null;
    return firestoreToMember(snapshot);
  },

  // Get member by userId (Firebase Auth)
  getMemberByUserId: async (userId: string): Promise<Member | null> => {
    const membersRef = collection(db, MEMBERS_COLLECTION);
    const q = query(membersRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return firestoreToMember(snapshot.docs[0]);
  },

  // Create member
  createMember: async (member: Omit<Member, 'id' | 'xp' | 'level'>, userId: string): Promise<string> => {
    // Validate inputs
    if (!member.name || member.name.trim().length === 0) {
      throw new Error('Member name is required');
    }
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
    
    const membersRef = collection(db, MEMBERS_COLLECTION);
    const memberData = {
      ...member,
      name: member.name.trim(),
      userId,
      xp: 0,
      level: 1,
    };
    const docRef = await addDoc(membersRef, memberData);
    return docRef.id;
  },

  // Update member
  updateMember: async (memberId: string, updates: Partial<Member>): Promise<void> => {
    if (!memberId || memberId.trim().length === 0) {
      throw new Error('Member ID is required');
    }
    
    const memberRef = doc(db, MEMBERS_COLLECTION, memberId);
    const updateData: Record<string, unknown> = { ...updates };
    // Remove id if present (should not be updated)
    delete updateData.id;
    // Trim name if present
    if (updates.name && typeof updates.name === 'string') {
      const trimmedName = updates.name.trim();
      if (trimmedName.length === 0) {
        throw new Error('Member name cannot be empty');
      }
      updateData.name = trimmedName;
    }
    
    await updateDoc(memberRef, updateData);
  },

  // Delete member
  deleteMember: async (memberId: string): Promise<void> => {
    const memberRef = doc(db, MEMBERS_COLLECTION, memberId);
    await deleteDoc(memberRef);
  },

  // Real-time listener
  subscribeToMembers: (callback: (members: Member[]) => void): (() => void) => {
    const membersRef = collection(db, MEMBERS_COLLECTION);
    const q = query(membersRef, orderBy('name', 'asc'));

    return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const members = snapshot.docs.map(firestoreToMember);
      callback(members);
    });
  },
};


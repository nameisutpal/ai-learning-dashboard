import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase/firebase.js'
import { COLLECTIONS } from '../constants/firestoreCollections.js'
import { toIso } from '../lib/firestoreTimestamps.js'

function chatRef(chatId) {
  return doc(db, COLLECTIONS.chats, chatId)
}

function messagesRef(chatId) {
  return collection(db, COLLECTIONS.chats, chatId, 'messages')
}

function mapChatDoc(d) {
  const x = d.data()
  return {
    id: d.id,
    userId: x.userId,
    title: x.title ?? 'New chat',
    createdAt: toIso(x.createdAt),
    updatedAt: toIso(x.updatedAt) || toIso(x.createdAt),
  }
}

function mapMessageDoc(d) {
  const x = d.data()
  return {
    id: d.id,
    role: x.role ?? 'assistant',
    content: x.content ?? '',
    createdAt: toIso(x.createdAt),
  }
}

export function titleFromPrompt(prompt) {
  const clean = prompt.replace(/\s+/g, ' ').trim()
  if (!clean) return 'New chat'
  return clean.length > 48 ? `${clean.slice(0, 45)}...` : clean
}

export function subscribeChats(userId, onNext, onError) {
  const q = query(collection(db, COLLECTIONS.chats), where('userId', '==', userId))
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map(mapChatDoc).sort((a, b) => {
        const ad = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
        const bd = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
        return bd - ad
      })
      onNext(rows)
    },
    onError,
  )
}

export function subscribeMessages(chatId, onNext, onError) {
  const q = query(messagesRef(chatId), orderBy('createdAt', 'asc'))
  return onSnapshot(q, (snap) => onNext(snap.docs.map(mapMessageDoc)), onError)
}

export async function createChat(userId, title = 'New chat') {
  const ref = await addDoc(collection(db, COLLECTIONS.chats), {
    userId,
    title,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function touchChat(chatId, patch = {}) {
  await updateDoc(chatRef(chatId), {
    ...patch,
    updatedAt: serverTimestamp(),
  })
}

export async function addChatMessage(chatId, { role, content }) {
  const ref = await addDoc(messagesRef(chatId), {
    role,
    content,
    createdAt: serverTimestamp(),
  })
  await touchChat(chatId)
  return ref.id
}

export async function deleteChatWithMessages(chatId) {
  while (true) {
    const snap = await getDocs(query(messagesRef(chatId), limit(450)))
    if (snap.empty) break

    const batch = writeBatch(db)
    snap.docs.forEach((messageDoc) => batch.delete(messageDoc.ref))
    await batch.commit()
  }

  await deleteDoc(chatRef(chatId))
}

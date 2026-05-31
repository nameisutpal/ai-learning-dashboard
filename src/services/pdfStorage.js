import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from '../firebase/firebase.js'

/**
 * Upload a PDF file to Firebase Storage
 * @param {File} file - The PDF file to upload
 * @param {string} userId - User's Firebase Auth UID
 * @param {AbortSignal} signal - Abort signal for cancellation
 * @returns {Promise<string>} Download URL of the uploaded file
 */
export async function uploadPDF(file, userId, signal) {
  if (!file || !userId) {
    throw new Error('File and userId are required')
  }

  if (file.type !== 'application/pdf') {
    throw new Error('Only PDF files are allowed')
  }

  const fileName = `${Date.now()}-${file.name}`
  const storageRef = ref(storage, `documents/${userId}/${fileName}`)

  await uploadBytes(storageRef, file, signal)
  const downloadUrl = await getDownloadURL(storageRef)

  return downloadUrl
}

/**
 * Delete a PDF file from Firebase Storage
 * @param {string} fileUrl - The download URL of the file
 * @returns {Promise<void>}
 */
export async function deletePDF(fileUrl) {
  if (!fileUrl) {
    throw new Error('File URL is required')
  }

  try {
    // Extract the path from the URL
    const url = new URL(fileUrl)
    const pathParts = url.pathname.split('/o/')
    if (pathParts.length < 2) {
      throw new Error('Invalid file URL')
    }

    const encodedPath = pathParts[1].split('?')[0]
    const path = decodeURIComponent(encodedPath)

    // Note: Firebase Storage delete requires additional setup
    // For now, we'll rely on Firestore metadata deletion
    console.log('File deletion from Storage not implemented yet:', path)
  } catch (err) {
    console.error('Failed to delete file from Storage:', err)
    // Continue with Firestore deletion even if Storage deletion fails
  }
}

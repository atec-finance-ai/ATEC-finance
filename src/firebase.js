// Firebase 초기화
// 콘솔(https://console.firebase.google.com) > 프로젝트 설정 > 일반 > 내 앱 에서 확인한 값입니다.
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyAu_9hR8sSzFvczpZqyI34lOZloWyeXPcc',
  authDomain: 'finance-a1f82.firebaseapp.com',
  projectId: 'finance-a1f82',
  storageBucket: 'finance-a1f82.firebasestorage.app',
  messagingSenderId: '1016777775678',
  appId: '1:1016777775678:web:0c9e3f397d683ffc590f6f',
  measurementId: 'G-209C1LCY7R',
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)
export default app

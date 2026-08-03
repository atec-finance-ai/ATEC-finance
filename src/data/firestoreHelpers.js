import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'
import { CHECKLIST_TEMPLATE } from './checklistTemplate'

// 결산은 다음 달 초에 전월 것을 진행하므로, 기본 조회 기간은 "오늘이 속한 달의 전월"입니다.
// 예: 오늘이 2026-08-04 이면 "2026-07"을 반환 (YYYY-MM)
export function currentPeriodId(date = new Date()) {
  const prevMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1)
  const y = prevMonth.getFullYear()
  const m = String(prevMonth.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

// "2026-06" -> "2026년 6월" (화면 표시용, 저장되는 id 자체는 그대로 YYYY-MM 유지)
export function formatPeriodLabel(periodId) {
  const [y, m] = periodId.split('-')
  return `${y}년 ${Number(m)}월`
}

export function periodsCollection() {
  return collection(db, 'periods')
}

export function periodDoc(periodId) {
  return doc(db, 'periods', periodId)
}

export function itemsCollection(periodId) {
  return collection(db, 'periods', periodId, 'items')
}

// 해당 월 문서가 없으면 템플릿으로 새로 생성 (관리자 전용 - 규칙상 로그인 필요)
export async function ensurePeriod(periodId, meta = {}) {
  const ref = periodDoc(periodId)
  const snap = await getDoc(ref)
  if (snap.exists()) return false

  await setDoc(ref, {
    manager: meta.manager || '',
    reviewer: meta.reviewer || '',
    reviewRequestDate: meta.reviewRequestDate || '',
    reviewCompleteDate: meta.reviewCompleteDate || '',
    startDate: meta.startDate || '',
    endDate: meta.endDate || '',
    createdAt: Date.now(),
  })

  const batch = writeBatch(db)
  CHECKLIST_TEMPLATE.forEach((tpl, idx) => {
    const itemRef = doc(itemsCollection(periodId), `item-${idx}`)
    batch.set(itemRef, { ...tpl, status: '', assignee: '' })
  })
  await batch.commit()
  return true
}

export function subscribeItems(periodId, cb) {
  const q = query(itemsCollection(periodId), orderBy('order'))
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export function subscribePeriodMeta(periodId, cb) {
  return onSnapshot(periodDoc(periodId), (snap) => {
    cb(snap.exists() ? { id: snap.id, ...snap.data() } : null)
  })
}

export async function updateItemStatus(periodId, itemId, status) {
  await updateDoc(doc(itemsCollection(periodId), itemId), { status })
}

export async function updateItemNote(periodId, itemId, note) {
  await updateDoc(doc(itemsCollection(periodId), itemId), { note })
}

export async function updateItemAssignee(periodId, itemId, assignee) {
  await updateDoc(doc(itemsCollection(periodId), itemId), { assignee })
}

export async function updateItemFields(periodId, itemId, fields) {
  await updateDoc(doc(itemsCollection(periodId), itemId), fields)
}

export async function deleteItem(periodId, itemId) {
  await deleteDoc(doc(itemsCollection(periodId), itemId))
}

export async function addCustomItem(periodId, { category, item, content }) {
  const snap = await getDocs(itemsCollection(periodId))
  const nextOrder = snap.size
  const ref = doc(itemsCollection(periodId))
  await setDoc(ref, {
    category,
    item,
    content,
    note: '',
    status: '',
    assignee: '',
    order: nextOrder,
    custom: true,
  })
}

export async function updatePeriodMeta(periodId, meta) {
  await updateDoc(periodDoc(periodId), meta)
}

export async function listAllPeriods() {
  const snap = await getDocs(query(periodsCollection(), orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

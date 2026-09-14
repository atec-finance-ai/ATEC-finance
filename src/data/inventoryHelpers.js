import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase'

// 유럽법인 재고 수불부
// - stockItems/{itemId}            : 품목 마스터 (코드/품목명/단위/현재 재고)
// - stockItems/{itemId}/movements  : 입고/출고 이력 (회계장부이므로 추가만 가능, 수정 시 반대전표로 정정)

export function stockItemsCollection() {
  return collection(db, 'stockItems')
}

export function stockItemDoc(itemId) {
  return doc(db, 'stockItems', itemId)
}

export function movementsCollection(itemId) {
  return collection(db, 'stockItems', itemId, 'movements')
}

export function subscribeStockItems(cb) {
  const q = query(stockItemsCollection(), orderBy('code'))
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export function subscribeStockItem(itemId, cb) {
  return onSnapshot(stockItemDoc(itemId), (snap) => {
    cb(snap.exists() ? { id: snap.id, ...snap.data() } : null)
  })
}

export function subscribeMovements(itemId, cb) {
  const q = query(movementsCollection(itemId), orderBy('date'), orderBy('createdAt'))
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

// 품목 코드 중복 체크 후 생성 (관리자 전용 - 규칙상 로그인 필요)
export async function addStockItem({ code, name, unit, note = '' }) {
  const trimmedCode = code.trim()
  const ref = stockItemDoc(trimmedCode)
  const existing = await getDoc(ref)
  if (existing.exists()) {
    throw new Error(`이미 등록된 품목코드입니다: ${trimmedCode}`)
  }
  await setDoc(ref, {
    code: trimmedCode,
    name: name.trim(),
    unit: unit.trim(),
    note,
    currentQty: 0,
    currentAmountEur: 0,
    currentAmountKrw: 0,
    createdAt: serverTimestamp(),
  })
  return trimmedCode
}

export async function updateStockItem(itemId, fields) {
  await updateDoc(stockItemDoc(itemId), fields)
}

// 품목 삭제 (하위 movements 서브컬렉션은 삭제되지 않으므로, 실제 이력이 있는 품목은 삭제하지 않는 것을 권장)
export async function deleteStockItem(itemId) {
  await deleteDoc(stockItemDoc(itemId))
}

// 입고/출고 등록: 품목의 현재 잔고를 읽어 새 잔고를 계산하고,
// movements 문서 추가 + stockItems 문서의 currentQty/currentAmount 갱신을 하나의 트랜잭션으로 처리합니다.
export async function addMovement(itemId, { date, type, quantity, unitPriceEur, exchangeRate, note = '' }, createdBy = '') {
  const qty = Number(quantity)
  const price = Number(unitPriceEur)
  const rate = Number(exchangeRate)
  if (!date) throw new Error('일자를 입력해주세요.')
  if (!(qty > 0)) throw new Error('수량은 0보다 커야 합니다.')
  if (!(price >= 0)) throw new Error('단가(€)를 입력해주세요.')
  if (!(rate > 0)) throw new Error('환율을 입력해주세요.')

  const amountEur = qty * price
  const amountKrw = amountEur * rate
  const itemRef = stockItemDoc(itemId)
  const movementRef = doc(movementsCollection(itemId))

  await runTransaction(db, async (tx) => {
    const itemSnap = await tx.get(itemRef)
    if (!itemSnap.exists()) throw new Error('품목을 찾을 수 없습니다.')
    const item = itemSnap.data()
    const prevQty = item.currentQty || 0
    const prevAmountEur = item.currentAmountEur || 0

    const signedQty = type === 'in' ? qty : -qty
    const signedAmountEur = type === 'in' ? amountEur : -amountEur
    const balanceQty = prevQty + signedQty
    const balanceAmountEur = prevAmountEur + signedAmountEur
    const balanceAmountKrw = balanceAmountEur * rate

    tx.set(movementRef, {
      date,
      type,
      quantity: qty,
      unitPriceEur: price,
      amountEur,
      exchangeRate: rate,
      amountKrw,
      note,
      balanceQty,
      balanceAmountEur,
      balanceAmountKrw,
      createdBy,
      createdAt: serverTimestamp(),
    })
    tx.update(itemRef, {
      currentQty: balanceQty,
      currentAmountEur: balanceAmountEur,
      currentAmountKrw: balanceAmountKrw,
    })
  })
}

export async function listAllStockItems() {
  const snap = await getDocs(query(stockItemsCollection(), orderBy('code')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

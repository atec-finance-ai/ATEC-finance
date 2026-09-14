import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import {
  subscribeStockItem,
  subscribeMovements,
  addMovement,
} from '../data/inventoryHelpers'

function fmt(n) {
  return Number(n || 0).toLocaleString('ko-KR', { maximumFractionDigits: 2 })
}

const EMPTY_FORM = {
  date: new Date().toISOString().slice(0, 10),
  type: 'in',
  quantity: '',
  unitPriceEur: '',
  exchangeRate: '',
  note: '',
}

export default function InventoryLedger() {
  const { user } = useAuth()
  const { itemId } = useParams()
  const [item, setItem] = useState(undefined)
  const [movements, setMovements] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => subscribeStockItem(itemId, setItem), [itemId])
  useEffect(() => subscribeMovements(itemId, setMovements), [itemId])

  const preview = useMemo(() => {
    const qty = Number(form.quantity) || 0
    const price = Number(form.unitPriceEur) || 0
    const rate = Number(form.exchangeRate) || 0
    const amountEur = qty * price
    return { amountEur, amountKrw: amountEur * rate }
  }, [form.quantity, form.unitPriceEur, form.exchangeRate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await addMovement(
        itemId,
        {
          date: form.date,
          type: form.type,
          quantity: form.quantity,
          unitPriceEur: form.unitPriceEur,
          exchangeRate: form.exchangeRate,
          note: form.note,
        },
        user?.email || ''
      )
      setForm({ ...EMPTY_FORM, date: form.date, exchangeRate: form.exchangeRate })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (item === undefined || movements === null) return <p>불러오는 중...</p>
  if (item === null) return <p>품목을 찾을 수 없습니다. <Link to="/inventory">목록으로</Link></p>

  return (
    <>
      <p><Link to="/inventory">← 품목 목록</Link></p>
      <h3 className="page-title-center" style={{ marginTop: 0 }}>
        {item.name} ({item.code}) 수불부
      </h3>

      <div className="summary-card">
        <div className="meta-grid" style={{ marginBottom: 0 }}>
          <div>
            <label>단위</label>
            <div>{item.unit}</div>
          </div>
          <div>
            <label>현재 재고수량</label>
            <div>{fmt(item.currentQty)}</div>
          </div>
          <div>
            <label>현재 재고금액(€)</label>
            <div>€{fmt(item.currentAmountEur)}</div>
          </div>
          <div>
            <label>원화환산(₩)</label>
            <div>₩{fmt(item.currentAmountKrw)}</div>
          </div>
        </div>
      </div>

      {user && (
        <form className="add-item-form" onSubmit={handleSubmit} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="in">입고</option>
              <option value="out">출고</option>
            </select>
            <input
              type="number"
              step="any"
              min="0"
              placeholder="수량"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              style={{ flex: 1, minWidth: 100 }}
              required
            />
            <input
              type="number"
              step="any"
              min="0"
              placeholder="단가(€)"
              value={form.unitPriceEur}
              onChange={(e) => setForm({ ...form, unitPriceEur: e.target.value })}
              style={{ flex: 1, minWidth: 100 }}
              required
            />
            <input
              type="number"
              step="any"
              min="0"
              placeholder="환율 (EUR→KRW)"
              value={form.exchangeRate}
              onChange={(e) => setForm({ ...form, exchangeRate: e.target.value })}
              style={{ flex: 1, minWidth: 120 }}
              required
            />
            <input
              placeholder="적요/비고"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              style={{ flex: 2, minWidth: 140 }}
            />
          </div>
          <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
            금액 미리보기: €{fmt(preview.amountEur)} / ₩{fmt(preview.amountKrw)}
          </div>
          {error && <p className="error-text" style={{ marginTop: 8 }}>{error}</p>}
          <button className="btn-primary" type="submit" disabled={saving} style={{ marginTop: 8 }}>
            {saving ? '저장 중...' : `${form.type === 'in' ? '입고' : '출고'} 등록`}
          </button>
        </form>
      )}

      {movements.length === 0 && <p>등록된 입출고 이력이 없습니다.</p>}

      {movements.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table className="print-item-table">
            <thead>
              <tr>
                <th>일자</th>
                <th>구분</th>
                <th>적요</th>
                <th>입고수량</th>
                <th>입고단가(€)</th>
                <th>입고금액(€)</th>
                <th>출고수량</th>
                <th>출고단가(€)</th>
                <th>출고금액(€)</th>
                <th>잔고수량</th>
                <th>잔고금액(€)</th>
                <th>잔고(₩)</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id}>
                  <td>{m.date}</td>
                  <td className="print-status">{m.type === 'in' ? '입고' : '출고'}</td>
                  <td>{m.note}</td>
                  <td style={{ textAlign: 'right' }}>{m.type === 'in' ? fmt(m.quantity) : ''}</td>
                  <td style={{ textAlign: 'right' }}>{m.type === 'in' ? fmt(m.unitPriceEur) : ''}</td>
                  <td style={{ textAlign: 'right' }}>{m.type === 'in' ? fmt(m.amountEur) : ''}</td>
                  <td style={{ textAlign: 'right' }}>{m.type === 'out' ? fmt(m.quantity) : ''}</td>
                  <td style={{ textAlign: 'right' }}>{m.type === 'out' ? fmt(m.unitPriceEur) : ''}</td>
                  <td style={{ textAlign: 'right' }}>{m.type === 'out' ? fmt(m.amountEur) : ''}</td>
                  <td style={{ textAlign: 'right' }}>{fmt(m.balanceQty)}</td>
                  <td style={{ textAlign: 'right' }}>{fmt(m.balanceAmountEur)}</td>
                  <td style={{ textAlign: 'right' }}>{fmt(m.balanceAmountKrw)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { subscribeStockItems, addStockItem, deleteStockItem } from '../data/inventoryHelpers'

function fmt(n) {
  return Number(n || 0).toLocaleString('ko-KR', { maximumFractionDigits: 2 })
}

export default function Inventory() {
  const { user } = useAuth()
  const [items, setItems] = useState(null)
  const [newItem, setNewItem] = useState({ code: '', name: '', unit: '', note: '' })
  const [error, setError] = useState('')

  useEffect(() => subscribeStockItems(setItems), [])

  async function handleAddItem(e) {
    e.preventDefault()
    setError('')
    if (!newItem.code.trim() || !newItem.name.trim() || !newItem.unit.trim()) return
    try {
      await addStockItem(newItem)
      setNewItem({ code: '', name: '', unit: '', note: '' })
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`"${item.name}" 품목을 삭제할까요? (수불부 이력은 남아있지만 목록에서 사라집니다)`)) return
    await deleteStockItem(item.id)
  }

  return (
    <>
      <h3 className="page-title-center" style={{ marginTop: 0 }}>유럽법인 재고 수불부</h3>

      {user && (
        <form className="add-item-form" onSubmit={handleAddItem}>
          <input
            placeholder="품목코드"
            value={newItem.code}
            onChange={(e) => setNewItem({ ...newItem, code: e.target.value })}
          />
          <input
            placeholder="품목명"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          />
          <input
            placeholder="단위 (EA/KG 등)"
            value={newItem.unit}
            onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
          />
          <input
            placeholder="비고 (선택)"
            value={newItem.note}
            onChange={(e) => setNewItem({ ...newItem, note: e.target.value })}
          />
          <button className="btn-secondary" type="submit">
            품목 추가
          </button>
        </form>
      )}
      {error && <p className="error-text">{error}</p>}

      {items === null && <p>불러오는 중...</p>}
      {items && items.length === 0 && <p>등록된 품목이 없습니다.</p>}

      {items && items.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table className="print-item-table">
            <thead>
              <tr>
                <th>코드</th>
                <th>품목명</th>
                <th>단위</th>
                <th>현재 재고수량</th>
                <th>현재 재고금액(€)</th>
                <th>원화환산(₩)</th>
                {user && <th></th>}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Link to={`/inventory/${item.id}`}>{item.code}</Link>
                  </td>
                  <td>
                    <Link to={`/inventory/${item.id}`}>{item.name}</Link>
                  </td>
                  <td>{item.unit}</td>
                  <td style={{ textAlign: 'right' }}>{fmt(item.currentQty)}</td>
                  <td style={{ textAlign: 'right' }}>€{fmt(item.currentAmountEur)}</td>
                  <td style={{ textAlign: 'right' }}>₩{fmt(item.currentAmountKrw)}</td>
                  {user && (
                    <td>
                      <button className="item-delete-btn" onClick={() => handleDelete(item)}>
                        ×
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

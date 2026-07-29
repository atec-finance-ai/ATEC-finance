import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import Login from '../components/Login.jsx'
import ChecklistTable from '../components/ChecklistTable.jsx'
import {
  currentPeriodId,
  formatPeriodLabel,
  ensurePeriod,
  subscribeItems,
  subscribePeriodMeta,
  updateItemStatus,
  updateItemNote,
  updateItemAssignee,
  updateItemFields,
  updatePeriodMeta,
  addCustomItem,
} from '../data/firestoreHelpers'
import { CATEGORIES } from '../data/checklistTemplate'

export default function Admin() {
  const { user, loading, logout } = useAuth()
  const [periodId, setPeriodId] = useState(currentPeriodId())
  const periodLabel = formatPeriodLabel(periodId)
  const [items, setItems] = useState(null)
  const [meta, setMeta] = useState(null)
  const [newItem, setNewItem] = useState({ category: CATEGORIES[0], item: '', content: '' })

  useEffect(() => {
    if (!user) return
    setItems(null)
    setMeta(null)
    const unsubItems = subscribeItems(periodId, setItems)
    const unsubMeta = subscribePeriodMeta(periodId, setMeta)
    return () => {
      unsubItems()
      unsubMeta()
    }
  }, [user, periodId])

  if (loading) return <p>확인 중...</p>
  if (!user) return <Login />

  async function handleCreatePeriod() {
    await ensurePeriod(periodId)
  }

  function handleMetaBlur(field, value) {
    if (!meta) return
    updatePeriodMeta(periodId, { [field]: value })
  }

  async function handleAddItem(e) {
    e.preventDefault()
    if (!newItem.item.trim()) return
    await addCustomItem(periodId, newItem)
    setNewItem({ category: CATEGORIES[0], item: '', content: '' })
  }

  return (
    <>
      <div className="admin-header">
        <h3 style={{ margin: 0 }}>관리 · {periodLabel}</h3>
        <button className="btn-secondary" onClick={logout}>
          로그아웃
        </button>
      </div>

      <div className="period-picker-row">
        <label htmlFor="period-picker">조회/생성할 월</label>
        <input
          id="period-picker"
          type="month"
          value={periodId}
          onChange={(e) => e.target.value && setPeriodId(e.target.value)}
        />
      </div>

      {items === null && <p>불러오는 중...</p>}

      {items && items.length === 0 && (
        <div className="summary-card">
          <p>{periodLabel} 체크리스트가 아직 없습니다.</p>
          <button className="btn-primary" onClick={handleCreatePeriod}>
            {periodLabel} 체크리스트 생성
          </button>
        </div>
      )}

      {items && items.length > 0 && (
        <>
          <div className="meta-grid">
            <div>
              <label>담당자</label>
              <input defaultValue={meta?.manager} onBlur={(e) => handleMetaBlur('manager', e.target.value)} />
            </div>
            <div>
              <label>검토자</label>
              <input defaultValue={meta?.reviewer} onBlur={(e) => handleMetaBlur('reviewer', e.target.value)} />
            </div>
            <div>
              <label>검토요청일자</label>
              <input
                type="date"
                defaultValue={meta?.reviewRequestDate}
                onBlur={(e) => handleMetaBlur('reviewRequestDate', e.target.value)}
              />
            </div>
            <div>
              <label>검토완료일자</label>
              <input
                type="date"
                defaultValue={meta?.reviewCompleteDate}
                onBlur={(e) => handleMetaBlur('reviewCompleteDate', e.target.value)}
              />
            </div>
          </div>

          <form className="add-item-form" onSubmit={handleAddItem}>
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              placeholder="항목"
              value={newItem.item}
              onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
            />
            <input
              placeholder="내용"
              value={newItem.content}
              onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
            />
            <button className="btn-secondary" type="submit">
              항목 추가
            </button>
          </form>

          <ChecklistTable
            items={items}
            editable
            onStatusChange={(item, status) => updateItemStatus(periodId, item.id, status)}
            onNoteChange={(item, note) => updateItemNote(periodId, item.id, note)}
            onAssigneeChange={(item, assignee) => updateItemAssignee(periodId, item.id, assignee)}
            onItemTextChange={(item, fields) => updateItemFields(periodId, item.id, fields)}
          />
        </>
      )}
    </>
  )
}

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  currentPeriodId,
  formatPeriodLabel,
  subscribeItems,
  updateItemStatus,
  updateItemNote,
  updateItemAssignee,
} from '../data/firestoreHelpers'
import { useAuth } from '../context/AuthContext.jsx'
import ChecklistTable from '../components/ChecklistTable.jsx'

export default function Checklist() {
  const { user } = useAuth()
  const { periodId: paramPeriodId } = useParams()
  const periodId = paramPeriodId || currentPeriodId()
  const periodLabel = formatPeriodLabel(periodId)
  const [items, setItems] = useState(null)

  useEffect(() => {
    return subscribeItems(periodId, setItems)
  }, [periodId])

  if (items === null) return <p>불러오는 중...</p>
  if (items.length === 0) {
    return <p>{periodLabel} 결산 체크리스트가 아직 생성되지 않았습니다. (관리 화면에서 생성)</p>
  }

  return (
    <>
      <h3 className="page-title-center" style={{ marginTop: 0 }}>{periodLabel} 결산분개 체크리스트</h3>
      <ChecklistTable
        items={items}
        editable={!!user}
        onStatusChange={(item, status) => updateItemStatus(periodId, item.id, status)}
        onNoteChange={(item, note) => updateItemNote(periodId, item.id, note)}
        onAssigneeChange={(item, assignee) => updateItemAssignee(periodId, item.id, assignee)}
      />
    </>
  )
}

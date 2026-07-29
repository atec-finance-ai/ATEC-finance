import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { currentPeriodId, formatPeriodLabel, subscribeItems, subscribePeriodMeta } from '../data/firestoreHelpers'

export default function Print() {
  const { periodId: paramPeriodId } = useParams()
  const periodId = paramPeriodId || currentPeriodId()
  const periodLabel = formatPeriodLabel(periodId)
  const [items, setItems] = useState(null)
  const [meta, setMeta] = useState(null)

  useEffect(() => {
    const unsubItems = subscribeItems(periodId, setItems)
    const unsubMeta = subscribePeriodMeta(periodId, setMeta)
    return () => {
      unsubItems()
      unsubMeta()
    }
  }, [periodId])

  if (items === null) return <p>불러오는 중...</p>
  if (items.length === 0) {
    return <p>{periodLabel} 결산 체크리스트가 아직 생성되지 않았습니다.</p>
  }

  const doneCount = items.filter((i) => i.status === 'O').length

  return (
    <div className="print-page">
      <div className="print-toolbar">
        <button className="btn-primary" onClick={() => window.print()}>
          인쇄 / PDF로 저장
        </button>
      </div>

      <h2 className="print-title">{periodLabel} 월 결산 체크리스트</h2>

      <table className="print-meta-table">
        <tbody>
          <tr>
            <th>담당자</th>
            <td>{meta?.manager || '-'}</td>
            <th>검토자</th>
            <td>{meta?.reviewer || '-'}</td>
          </tr>
          <tr>
            <th>검토요청일자</th>
            <td>{meta?.reviewRequestDate || '-'}</td>
            <th>검토완료일자</th>
            <td>{meta?.reviewCompleteDate || '-'}</td>
          </tr>
          <tr>
            <th>완료 현황</th>
            <td colSpan={3}>{doneCount} / {items.length}개 완료</td>
          </tr>
        </tbody>
      </table>

      <table className="print-item-table">
        <thead>
          <tr>
            <th>구분</th>
            <th>항목</th>
            <th>내용</th>
            <th>담당자</th>
            <th>상태</th>
            <th>비고</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id}>
              <td>{i.category}</td>
              <td>{i.item}</td>
              <td>{i.content}</td>
              <td>{i.assignee || ''}</td>
              <td className="print-status">{i.status || '-'}</td>
              <td>{i.note || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="print-sign-row">
        <div className="print-sign-box">
          <span>담당자</span>
          <span className="print-sign-line">{meta?.manager || ''}</span>
          <span>(서명)</span>
        </div>
        <div className="print-sign-box">
          <span>검토자</span>
          <span className="print-sign-line">{meta?.reviewer || ''}</span>
          <span>(서명)</span>
        </div>
      </div>
    </div>
  )
}

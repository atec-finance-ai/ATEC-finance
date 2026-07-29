import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { currentPeriodId, formatPeriodLabel, subscribeItems, subscribePeriodMeta } from '../data/firestoreHelpers'

export default function Home() {
  const periodId = currentPeriodId()
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

  if (items === null) {
    return <p>불러오는 중...</p>
  }

  if (items.length === 0) {
    return (
      <div className="summary-card">
        <div className="summary-label">{periodLabel} 결산 체크리스트가 아직 생성되지 않았습니다.</div>
        <div className="summary-label">관리 화면에서 로그인 후 이번 달 체크리스트를 생성해주세요.</div>
      </div>
    )
  }

  const incomplete = items.filter((i) => i.status !== 'O')
  const doneCount = items.length - incomplete.length
  const percent = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0

  return (
    <>
      <div className="summary-card">
        <div className="progress-row">
          <div className="progress-bar">
            <div
              className={`progress-fill${percent === 100 ? ' full' : ''}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="progress-percent">{percent}%</div>
        </div>
        <div className="progress-detail">
          {doneCount} / {items.length}개 완료
        </div>
        <div className={`summary-count${incomplete.length === 0 ? ' zero' : ''}`}>
          {incomplete.length}
        </div>
        <div className="summary-label">
          {periodLabel} 결산 · 미완료 항목
          {meta?.manager ? ` · 담당자: ${meta.manager}` : ''}
        </div>
        <Link to="/print" className="btn-secondary print-link">
          인쇄 / PDF로 보기
        </Link>
      </div>

      <div className="summary-card">
        <ul className="incomplete-list">
          {incomplete.length === 0 && <li className="incomplete-item">모든 항목이 완료되었습니다.</li>}
          {incomplete.map((i) => (
            <li key={i.id} className="incomplete-item">
              <span>
                <span className={`status-badge status-${i.status || 'none'}`}>{i.status || '-'}</span>
                <span className={`tag tag-${i.category}`}>{i.category}</span>
                {i.item}
              </span>
              <span style={{ color: '#888' }}>{i.content}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

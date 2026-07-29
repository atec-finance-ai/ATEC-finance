import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listAllPeriods, formatPeriodLabel } from '../data/firestoreHelpers'

export default function History() {
  const [periods, setPeriods] = useState(null)

  useEffect(() => {
    listAllPeriods().then(setPeriods)
  }, [])

  if (periods === null) return <p>불러오는 중...</p>
  if (periods.length === 0) return <p>아직 생성된 결산 기록이 없습니다.</p>

  return (
    <>
      <h3 style={{ marginTop: 0 }}>지난 결산 기록</h3>
      <div className="summary-card">
        <ul className="incomplete-list">
          {periods.map((p) => (
            <li key={p.id} className="incomplete-item history-item">
              <span>
                {formatPeriodLabel(p.id)}
                {p.manager ? ` · 담당자: ${p.manager}` : ''}
              </span>
              <span className="history-actions">
                <Link to={`/checklist/${p.id}`} className="btn-secondary">
                  보기
                </Link>
                <Link to={`/print/${p.id}`} className="btn-secondary">
                  인쇄
                </Link>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

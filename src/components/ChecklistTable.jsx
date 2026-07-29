import { useState } from 'react'
import { CATEGORIES } from '../data/checklistTemplate'
import { STAFF_NAMES } from '../data/staff'

export const STATUS_OPTIONS = ['O', '△', 'X']

// editable=false 이면 읽기 전용 (체크리스트 화면), true면 상태/담당자/비고 수정 가능 (관리 화면)
export default function ChecklistTable({ items, editable = false, onStatusChange, onNoteChange, onAssigneeChange }) {
  const [tab, setTab] = useState(CATEGORIES[0])
  const filtered = items.filter((i) => i.category === tab)

  return (
    <>
      <div className="tabs">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`tab-btn${tab === c ? ' active' : ''}`}
            onClick={() => setTab(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.map((i) => (
        <div key={i.id} className={`item-card${i.status === 'O' ? ' item-checked' : ''}`}>
          {editable ? (
            <div className="status-group">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`status-btn status-${s}${i.status === s ? ' active' : ''}`}
                  onClick={() => onStatusChange && onStatusChange(i, i.status === s ? '' : s)}
                >
                  {s}
                </button>
              ))}
            </div>
          ) : (
            <span className={`status-badge status-${i.status || 'none'}`}>{i.status || '-'}</span>
          )}
          <div className="item-body">
            <div className="item-title">{i.item}</div>
            <div className="item-content">{i.content}</div>
            {editable ? (
              <div className="item-edit-row">
                <select
                  className="item-assignee"
                  defaultValue={i.assignee || ''}
                  onChange={(e) => onAssigneeChange && onAssigneeChange(i, e.target.value)}
                >
                  <option value="">담당자 선택</option>
                  {STAFF_NAMES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <input
                  className="item-note"
                  placeholder="비고"
                  defaultValue={i.note || ''}
                  onBlur={(e) => onNoteChange && onNoteChange(i, e.target.value)}
                />
              </div>
            ) : (
              <div className="item-content item-note-readonly">
                담당자: {i.assignee || '-'} · 비고: {i.note || '-'}
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  )
}

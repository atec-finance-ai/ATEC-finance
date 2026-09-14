import { NavLink } from 'react-router-dom'

export default function Nav() {
  return (
    <nav className="nav">
      <span className="nav-title">
        <img src="/logo-atec-white-only.png" alt="ATEC" className="nav-logo" />
        월 결산 체크리스트
      </span>
      <div className="nav-links">
        <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          홈
        </NavLink>
        <NavLink to="/checklist" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          체크리스트
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          지난 기록
        </NavLink>
        <NavLink to="/inventory" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          재고 수불부
        </NavLink>
        <NavLink to="/admin" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          관리
        </NavLink>
      </div>
    </nav>
  )
}

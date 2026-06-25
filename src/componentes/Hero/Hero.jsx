import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import PopUpMejoresTerceros from '../PopUpMejoresTerceros/PopUpMejoresTerceros'
import PopUpPartidosDeHoy from '../PopUpPartidosDeHoy/PopUpPartidosDeHoy'
import './styles.css'

function Hero({
  isAdmin,
  onAdminClick,
  onLogout,
  partidosDeHoy,
  partidosHoy,
  todayMatches,
  onClosePartidosHoy,
  mejoresTercerosOpen,
  mejoresTerceros,
  onOpenMejoresTerceros,
  onCloseMejoresTerceros,
  saveStatus,
}) {
  return (
    <section className="hero-section" id="inicio">
      <div className="hero-media" aria-hidden="true">
        <div className="stadium-grid"></div>
        <div className="pitch-lines"></div>
      </div>
      <div className="hero-content">
        <div className="cont-login">
          <div className="admin-access">
            {isAdmin && <span className="admin-live-badge">Admin activo</span>}
            <button
              className={`admin-door-button ${isAdmin ? 'is-logout' : ''}`}
              type="button"
              onClick={isAdmin ? onLogout : onAdminClick}
              aria-label={isAdmin ? 'Salir del modo admin' : 'Ingresar al modo admin'}
              title={isAdmin ? 'Salir' : 'Admin'}
            >
              {isAdmin ? <LogoutIcon className="icono-log" fontSize="small" /> : <LoginIcon className="icono-log" fontSize="small" />}
            </button>
          </div>
        </div>

        <div className="hero-copy">
          <div>
            <span className="eyebrow">Canadá / México / Estados Unidos</span>
            <h1>Fixture Mundial FIFA 2026</h1>
            <p>
              Grupos, cruces, horarios y planteles en una landing oscura que se actualiza automaticamente con datos del back.
            </p>
            <div className="hero-actions">
              <a href="#grupos" className="primary-action">Ver grupos</a>
              <a href="#eliminatorias" className="ghost-action">Ver llaves</a>
              <button className="primary-action" type="button" onClick={partidosDeHoy}>Partidos de hoy</button>
              <button className="ghost-action" type="button" onClick={onOpenMejoresTerceros}>Mejores terceros</button>
            </div>
          </div>
        </div>

        <div className="hero-stats" aria-label="Resumen del torneo">
          <span><strong>48</strong> selecciones</span>
          <span><strong>12</strong> grupos</span>
          <span><strong>104</strong> partidos</span>
        </div>
        {isAdmin && saveStatus?.text && (
          <div className={`save-status ${saveStatus.type}`} role="status">
            {saveStatus.text}
          </div>
        )}
      </div>
      <PopUpPartidosDeHoy open={partidosHoy} matches={todayMatches} onClose={onClosePartidosHoy} />
      <PopUpMejoresTerceros open={mejoresTercerosOpen} rows={mejoresTerceros} onClose={onCloseMejoresTerceros} />
    </section>
  )
}

export default Hero

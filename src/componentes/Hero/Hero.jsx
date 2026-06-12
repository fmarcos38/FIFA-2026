import { useState } from 'react'
import PopUpPartidosDeHoy from '../PopUpPartidosDeHoy/PopUpPartidosDeHoy'
import './styles.css'

function Hero({ isAdmin, onAdminClick, onLogout, partidosDeHoy, partidosHoy, todayMatches, onClosePartidosHoy }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <section className="hero-section" id="inicio">
      <div className="hero-media" aria-hidden="true">
        <div className="stadium-grid"></div>
        <div className="pitch-lines"></div>
      </div>
      <div className="hero-content">
        <nav className="topbar" aria-label="Navegacion principal">
          <span className="brand-mark">FWC26</span>

          <button
            className="menu-toggle"
            type="button"
            onClick={() => setMenuOpen((currentState) => !currentState)}
            aria-expanded={menuOpen}
            aria-controls="hero-navigation"
            aria-label="Abrir menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className={`nav-links ${menuOpen ? 'is-open' : ''}`} id="hero-navigation">
            <a href="#grupos" onClick={closeMenu}>Grupos</a>
            <a href="#eliminatorias" onClick={closeMenu}>Eliminatorias</a>
            {isAdmin ? (
              <button
                type="button"
                onClick={() => {
                  onLogout()
                  closeMenu()
                }}
              >
                Salir
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onAdminClick()
                  closeMenu()
                }}
              >
                Admin
              </button>
            )}
          </div>
        </nav>

        <div className="hero-copy">
          <div>
            <span className="eyebrow">Canada / Mexico / United States</span>
            <h1>Fixture Mundial FIFA 2026</h1>
            <p>
              Grupos, cruces, horarios y planteles en una landing oscura que se actualiza automaticamente con datos del back.
            </p>
            <div className="hero-actions">
              <a href="#grupos" className="primary-action">Ver grupos</a>
              <a href="#eliminatorias" className="ghost-action">Ver llaves</a>
              <button className="primary-action" type="button" onClick={partidosDeHoy}>Partidos de hoy</button>
            </div>
          </div>
        </div>

        <div className="hero-stats" aria-label="Resumen del torneo">
          <span><strong>48</strong> selecciones</span>
          <span><strong>12</strong> grupos</span>
          <span><strong>104</strong> partidos</span>
        </div>
      </div>
      <PopUpPartidosDeHoy open={partidosHoy} matches={todayMatches} onClose={onClosePartidosHoy} />
    </section>
  )
}

export default Hero

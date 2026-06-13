import MatchCard from '../MatchCard/MatchCard'
import './styles.css'

function PopUpPartidosDeHoy({ open, matches = [], onClose }) {
  if (!open) return null

  return (
    <div className="today-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="today-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="today-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="today-modal-close" type="button" onClick={onClose} aria-label="Cerrar">
          x
        </button>

        <span className="eyebrow">Agenda diaria</span>
        <h2 id="today-modal-title">Partidos de hoy</h2>

        {matches.length > 0 ? (
          <div className="today-match-list">
            {matches.map((match) => (
              <MatchCard match={match} result={match.result} key={match.id} />
            ))}
          </div>
        ) : (
          <div className="today-empty">
            <strong>No hay partidos programados para hoy.</strong>
            <span>El calendario se mostrara automaticamente cuando la fecha coincida con un partido.</span>
          </div>
        )}
      </section>
    </div>
  )
}

export default PopUpPartidosDeHoy

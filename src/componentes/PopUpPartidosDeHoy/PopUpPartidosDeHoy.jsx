import { getFlagUrl } from '../../data/worldCupData'
import './styles.css'

function hasResult(result) {
  return (
    result?.homeGoals !== undefined &&
    result?.awayGoals !== undefined &&
    result.homeGoals !== '' &&
    result.awayGoals !== ''
  )
}

function formatKickoff(kickoff) {
  if (!kickoff) return ''

  const date = new Date(kickoff)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

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
            {matches.map((match) => {
              const finished = hasResult(match.result)

              return (
                <article className="today-match-card" key={match.id}>
                  <div className="today-match-meta">
                    <span>{match.groupName}</span>
                    <time dateTime={match.kickoff}>{formatKickoff(match.kickoff)}</time>
                  </div>

                  <div className="today-match-teams">
                    <div className="today-team">
                      <img src={getFlagUrl(match.home)} alt="" loading="lazy" />
                      <p>{match.home}</p>
                    </div>

                    <div className="today-score" aria-label={finished ? 'Resultado cargado' : 'Partido pendiente'}>
                      {finished ? (
                        <>
                          <strong>{match.result.homeGoals}</strong>
                          <span>-</span>
                          <strong>{match.result.awayGoals}</strong>
                        </>
                      ) : (
                        <span>vs</span>
                      )}
                    </div>

                    <div className="today-team away">
                      <p>{match.away}</p>
                      <img src={getFlagUrl(match.away)} alt="" loading="lazy" />
                    </div>
                  </div>
                </article>
              )
            })}
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

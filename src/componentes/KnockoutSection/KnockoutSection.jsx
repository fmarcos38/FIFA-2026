import './styles.css'

function hasResult(result) {
  return (
    result?.homeGoals !== undefined &&
    result?.awayGoals !== undefined &&
    result.homeGoals !== '' &&
    result.awayGoals !== ''
  )
}

function hasPenalties(result) {
  return (
    result?.homePenalties !== undefined &&
    result?.awayPenalties !== undefined &&
    result.homePenalties !== '' &&
    result.awayPenalties !== ''
  )
}

function formatKickoff(kickoff) {
  if (!kickoff) return null

  const date = new Date(kickoff)
  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function KnockoutSection({ rounds, results }) {
  return (
    <section className="section knockout-section" id="eliminatorias">
      <div className="section-heading">
        <span className="eyebrow">Siguiente etapa</span>
        <h2>Llaves eliminatorias</h2>
      </div>
      <div className="rounds-grid">
        {rounds.map((round) => (
          <article className="round-card" key={round.id}>
            <h3>{round.title}</h3>
            <div className="slot-list">
              {round.matches.map((match, index) => {
                const result = results[match.id]
                const finished = hasResult(result)
                const penalties = hasPenalties(result)
                const kickoff = formatKickoff(result?.kickoff)

                return (
                  <div className={`match-slot knockout-slot ${match.winner ? 'has-winner' : ''}`} key={match.id}>
                    <span>{match.id || `Partido ${index + 1}`}</span>
                    {kickoff && <time className="knockout-kickoff" dateTime={result.kickoff}>{kickoff}</time>}
                    <div className="knockout-team-line">
                      <strong>{match.homeLabel}</strong>
                      <em>{finished ? result.homeGoals : '-'}</em>
                    </div>
                    <div className="knockout-team-line">
                      <strong>{match.awayLabel}</strong>
                      <em>{finished ? result.awayGoals : '-'}</em>
                    </div>
                    {penalties && (
                      <div className="penalty-line">
                        Penales: <strong>{result.homePenalties}</strong> - <strong>{result.awayPenalties}</strong>
                      </div>
                    )}
                    <small>{match.winner ? `Avanza: ${match.winner}` : 'Pendiente'}</small>
                  </div>
                )
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default KnockoutSection

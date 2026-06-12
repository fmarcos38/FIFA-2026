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

function toDatetimeLocalValue(kickoff) {
  if (!kickoff) return ''

  const date = new Date(kickoff)
  if (Number.isNaN(date.getTime())) return ''

  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return offsetDate.toISOString().slice(0, 16)
}

function fromDatetimeLocalValue(value) {
  return value ? new Date(value).toISOString() : null
}

function KnockoutSection({ isAdmin, rounds, results, onResultChange, onResultDelete }) {
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
                const isDraw =
                  result?.homeGoals !== undefined &&
                  result?.awayGoals !== undefined &&
                  result.homeGoals !== '' &&
                  result.awayGoals !== '' &&
                  Number(result.homeGoals) === Number(result.awayGoals)

                return (
                  <div className={`match-slot knockout-slot ${match.winner ? 'has-winner' : ''}`} key={match.id}>
                    <div className="knockout-meta">
                      <span>{match.id || `Partido ${index + 1}`}</span>
                      {isAdmin ? (
                        <input
                          className="knockout-date-input"
                          type="datetime-local"
                          value={toDatetimeLocalValue(result?.kickoff)}
                          onChange={(event) => onResultChange(match.id, { kickoff: fromDatetimeLocalValue(event.target.value) })}
                        />
                      ) : (
                        kickoff && <time className="knockout-kickoff" dateTime={result.kickoff}>{kickoff}</time>
                      )}
                    </div>
                    <div className="knockout-team-line">
                      <strong>{match.homeLabel}</strong>
                      {isAdmin ? (
                        <input
                          aria-label={`Goles de ${match.homeLabel}`}
                          min="0"
                          type="number"
                          value={result?.homeGoals ?? ''}
                          onChange={(event) =>
                            onResultChange(match.id, { homeGoals: event.target.value, awayGoals: result?.awayGoals ?? '' })
                          }
                        />
                      ) : (
                        <em>{finished ? result.homeGoals : '-'}</em>
                      )}
                    </div>
                    <div className="knockout-team-line">
                      <strong>{match.awayLabel}</strong>
                      {isAdmin ? (
                        <input
                          aria-label={`Goles de ${match.awayLabel}`}
                          min="0"
                          type="number"
                          value={result?.awayGoals ?? ''}
                          onChange={(event) =>
                            onResultChange(match.id, { homeGoals: result?.homeGoals ?? '', awayGoals: event.target.value })
                          }
                        />
                      ) : (
                        <em>{finished ? result.awayGoals : '-'}</em>
                      )}
                    </div>
                    {isAdmin && isDraw && (
                      <div className="knockout-penalty-editor">
                        <span>Penales</span>
                        <input
                          aria-label={`Penales de ${match.homeLabel}`}
                          min="0"
                          type="number"
                          value={result?.homePenalties ?? ''}
                          onChange={(event) => onResultChange(match.id, { homePenalties: event.target.value })}
                        />
                        <strong>-</strong>
                        <input
                          aria-label={`Penales de ${match.awayLabel}`}
                          min="0"
                          type="number"
                          value={result?.awayPenalties ?? ''}
                          onChange={(event) => onResultChange(match.id, { awayPenalties: event.target.value })}
                        />
                      </div>
                    )}
                    {!isAdmin && penalties && (
                      <div className="penalty-line">
                        Penales: <strong>{result.homePenalties}</strong> - <strong>{result.awayPenalties}</strong>
                      </div>
                    )}
                    <small>{match.winner ? `Avanza: ${match.winner}` : 'Pendiente'}</small>
                    {isAdmin && (
                      <button className="knockout-clear" type="button" onClick={() => onResultDelete(match.id)}>
                        Limpiar
                      </button>
                    )}
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

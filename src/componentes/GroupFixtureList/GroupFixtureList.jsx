import { createGroupMatches, getFlagUrl } from '../../data/worldCupData'
import { formatKickoff, fromDatetimeLocalValue, toDatetimeLocalValue } from '../../helpers/dateTime'
import './styles.css'

function hasResult(result) {
  return (
    result?.homeGoals !== undefined &&
    result?.awayGoals !== undefined &&
    result.homeGoals !== '' &&
    result.awayGoals !== ''
  )
}

function GroupFixtureList({ group, isAdmin, results, onResultChange, onResultDelete, onSelectCountry }) {
  return (
    <article className="group-fixtures" id={`fixtures-${group.id}`}>
      <div className="fixtures-heading">
        <span>Partidos del Grupo {group.id}</span>
        <small>Fase de grupos</small>
      </div>

      <div className="fixture-list">
        {createGroupMatches(group).map((match) => {
          const result = results[match.id] || {}
          const kickoff = result.kickoff || match.kickoff
          const finished = hasResult(result)

          return (
            <article className={`fixture-row ${finished ? 'is-finished' : ''}`} key={match.id}>
              {isAdmin ? (
                <input
                  className="fixture-date-input"
                  type="datetime-local"
                  value={toDatetimeLocalValue(kickoff)}
                  onChange={(event) => onResultChange(match.id, { kickoff: fromDatetimeLocalValue(event.target.value) })}
                />
              ) : (
                <time className="fixture-kickoff" dateTime={kickoff || ''}>
                  {formatKickoff(kickoff)}
                </time>
              )}

              <button className="fixture-team" type="button" onClick={() => onSelectCountry(match.home)}>
                <img src={getFlagUrl(match.home)} alt="" loading="lazy" />
                <span>{match.home}</span>
              </button>

              {isAdmin ? (
                <div className="inline-score-editor">
                  <input
                    aria-label={`Goles de ${match.home}`}
                    min="0"
                    type="number"
                    value={result.homeGoals ?? ''}
                    onChange={(event) => onResultChange(match.id, { homeGoals: event.target.value, awayGoals: result.awayGoals ?? '' })}
                  />
                  <span>-</span>
                  <input
                    aria-label={`Goles de ${match.away}`}
                    min="0"
                    type="number"
                    value={result.awayGoals ?? ''}
                    onChange={(event) => onResultChange(match.id, { homeGoals: result.homeGoals ?? '', awayGoals: event.target.value })}
                  />
                </div>
              ) : (
                <div className="fixture-score" aria-label={finished ? 'Resultado cargado' : 'Partido pendiente'}>
                  {finished ? (
                    <>
                      <strong>{result.homeGoals}</strong>
                      <span>-</span>
                      <strong>{result.awayGoals}</strong>
                    </>
                  ) : (
                    <span className="pending-score">vs</span>
                  )}
                </div>
              )}

              <button className="fixture-team away" type="button" onClick={() => onSelectCountry(match.away)}>
                <span>{match.away}</span>
                <img src={getFlagUrl(match.away)} alt="" loading="lazy" />
              </button>

              {isAdmin && (
                <button className="inline-clear" type="button" onClick={() => onResultDelete(match.id)}>
                  Limpiar
                </button>
              )}
            </article>
          )
        })}
      </div>
    </article>
  )
}

export default GroupFixtureList

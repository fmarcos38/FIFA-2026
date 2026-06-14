import {
  createGroupMatches,
  getFlagUrl,
  getMatchStatus,
  getMatchStatusLabel,
  hasMatchScore,
  hasMinimumMatchDurationElapsed,
} from '../../data/worldCupData'
import { formatKickoff, fromDatetimeLocalValue, toDatetimeLocalValue } from '../../helpers/dateTime'
import './styles.css'

function buildScoreChange(result, field, value) {
  const nextResult = {
    [field]: value,
    [field === 'homeGoals' ? 'awayGoals' : 'homeGoals']: result[field === 'homeGoals' ? 'awayGoals' : 'homeGoals'] ?? '',
  }

  if (nextResult.homeGoals !== '' && nextResult.awayGoals !== '') {
    nextResult.status = result.status || 'partial'
  }

  return nextResult
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
          const hasScore = hasMatchScore(result)
          const status = getMatchStatus(result, kickoff)
          const statusLabel = getMatchStatusLabel(result, kickoff)
          const canFinish = hasMinimumMatchDurationElapsed(kickoff)

          return (
            <article className={`fixture-row ${hasScore ? 'has-score' : ''} status-${status || 'pending'}`} key={match.id}>
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
                    onChange={(event) => onResultChange(match.id, buildScoreChange(result, 'homeGoals', event.target.value))}
                  />
                  <span>-</span>
                  <input
                    aria-label={`Goles de ${match.away}`}
                    min="0"
                    type="number"
                    value={result.awayGoals ?? ''}
                    onChange={(event) => onResultChange(match.id, buildScoreChange(result, 'awayGoals', event.target.value))}
                  />
                </div>
              ) : (
                <div className="fixture-score" aria-label={hasScore ? 'Resultado cargado' : 'Partido pendiente'}>
                  {hasScore ? (
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

              {isAdmin && hasScore && (
                <select
                  className="fixture-status-select"
                  aria-label={`Estado de ${match.home} contra ${match.away}`}
                  value={status || 'partial'}
                  onChange={(event) => onResultChange(match.id, { status: event.target.value })}
                >
                  <option value="partial">Parcial</option>
                  <option value="extraTime">Alargue</option>
                  <option value="penalties">Penales</option>
                  <option value="finished" disabled={!canFinish}>Finalizado</option>
                </select>
              )}

              {!isAdmin && statusLabel && <span className={`fixture-status status-${status}`}>{statusLabel}</span>}

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

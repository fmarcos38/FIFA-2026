import { useState } from 'react'
import { createGroupMatches, getFlagUrl } from '../../data/worldCupData'
import './styles.css'

function AdminPanel({ groups, knockoutRounds, results, onResultChange, onResultDelete, onSyncResults, onLogout }) {
  const [syncStatus, setSyncStatus] = useState({ type: 'idle', text: '' })
  const sortByKickoff = (a, b) =>
    new Date(results[a.id]?.kickoff || a.kickoff).getTime() -
    new Date(results[b.id]?.kickoff || b.kickoff).getTime()

  const handleSyncClick = async () => {
    setSyncStatus({ type: 'loading', text: 'Sincronizando API...' })

    try {
      const data = await onSyncResults()
      setSyncStatus({
        type: 'success',
        text: `Sincronizados ${data.syncedCount} de ${data.fixturesCount} partidos`,
      })
    } catch (error) {
      setSyncStatus({ type: 'error', text: error.message })
    }
  }

  const handleGoalChange = (matchId, field, value) => {
    const nextResult = {
      ...results[matchId],
      [field]: value === '' ? '' : Math.max(0, Number(value)),
    }

    if (field === 'homeGoals' || field === 'awayGoals') {
      const homeGoals = field === 'homeGoals' ? nextResult.homeGoals : results[matchId]?.homeGoals
      const awayGoals = field === 'awayGoals' ? nextResult.awayGoals : results[matchId]?.awayGoals
      const goalsAreComplete = homeGoals !== undefined && awayGoals !== undefined && homeGoals !== '' && awayGoals !== ''

      if (goalsAreComplete && Number(homeGoals) !== Number(awayGoals)) {
        delete nextResult.homePenalties
        delete nextResult.awayPenalties
      }
    }

    onResultChange(matchId, {
      ...nextResult,
    })
  }

  const isKnockoutDraw = (result) =>
    result?.homeGoals !== undefined &&
    result?.awayGoals !== undefined &&
    result.homeGoals !== '' &&
    result.awayGoals !== '' &&
    Number(result.homeGoals) === Number(result.awayGoals)

  return (
    <section className="admin-panel">
      <div className="admin-header">
        <div>
          <span className="eyebrow">Panel admin</span>
          <h2>Cargar resultados</h2>
        </div>
        <button className="ghost-action" type="button" onClick={onLogout}>
          Salir
        </button>
      </div>
      <div className="admin-sync-bar">
        <button className="primary-action" type="button" onClick={handleSyncClick}>
          Sincronizar API
        </button>
        {syncStatus.text && <span className={`sync-status ${syncStatus.type}`}>{syncStatus.text}</span>}
      </div>

      <div className="admin-groups">
        {groups.map((group) => (
          <article className="admin-group" key={group.id}>
            <h3>Grupo {group.id}</h3>
            <div className="admin-match-list">
              {createGroupMatches(group).sort(sortByKickoff).map((match) => {
                const result = results[match.id] || {}

                return (
                  <div className="admin-match" key={match.id}>
                    <span className="admin-team">
                      <img src={getFlagUrl(match.home)} alt="" />
                      {match.home}
                    </span>
                    <input
                      aria-label={`Goles de ${match.home}`}
                      min="0"
                      type="number"
                      value={result.homeGoals ?? ''}
                      onChange={(event) => handleGoalChange(match.id, 'homeGoals', event.target.value)}
                    />
                    <span className="match-separator">-</span>
                    <input
                      aria-label={`Goles de ${match.away}`}
                      min="0"
                      type="number"
                      value={result.awayGoals ?? ''}
                      onChange={(event) => handleGoalChange(match.id, 'awayGoals', event.target.value)}
                    />
                    <span className="admin-team away">
                      {match.away}
                      <img src={getFlagUrl(match.away)} alt="" />
                    </span>
                    <button
                      className="clear-result"
                      type="button"
                      onClick={() => onResultDelete(match.id)}
                      aria-label={`Limpiar resultado de ${match.home} contra ${match.away}`}
                    >
                      Limpiar
                    </button>
                  </div>
                )
              })}
            </div>
          </article>
        ))}
      </div>

      <div className="admin-section-heading">
        <span className="eyebrow">Eliminatorias</span>
        <h3>Cargar llaves</h3>
      </div>

      <div className="admin-knockout-rounds">
        {knockoutRounds.map((round) => (
          <article className="admin-group" key={round.id}>
            <h3>{round.title}</h3>
            <div className="admin-match-list">
              {round.matches.map((match) => {
                const result = results[match.id] || {}
                const showPenalties = isKnockoutDraw(result)

                return (
                  <div className="admin-knockout-match" key={match.id}>
                    <div className="admin-match knockout-admin-match">
                      <span className="admin-team text-only">{match.homeLabel}</span>
                      <input
                        aria-label={`Goles de ${match.homeLabel}`}
                        min="0"
                        type="number"
                        value={result.homeGoals ?? ''}
                        onChange={(event) => handleGoalChange(match.id, 'homeGoals', event.target.value)}
                      />
                      <span className="match-separator">-</span>
                      <input
                        aria-label={`Goles de ${match.awayLabel}`}
                        min="0"
                        type="number"
                        value={result.awayGoals ?? ''}
                        onChange={(event) => handleGoalChange(match.id, 'awayGoals', event.target.value)}
                      />
                      <span className="admin-team away text-only">{match.awayLabel}</span>
                      <button
                        className="clear-result"
                        type="button"
                        onClick={() => onResultDelete(match.id)}
                        aria-label={`Limpiar resultado de ${match.homeLabel} contra ${match.awayLabel}`}
                      >
                        Limpiar
                      </button>
                    </div>
                    {showPenalties && (
                      <div className="admin-penalties">
                        <span>Penales</span>
                        <input
                          aria-label={`Penales de ${match.homeLabel}`}
                          min="0"
                          type="number"
                          value={result.homePenalties ?? ''}
                          onChange={(event) => handleGoalChange(match.id, 'homePenalties', event.target.value)}
                        />
                        <span className="match-separator">-</span>
                        <input
                          aria-label={`Penales de ${match.awayLabel}`}
                          min="0"
                          type="number"
                          value={result.awayPenalties ?? ''}
                          onChange={(event) => handleGoalChange(match.id, 'awayPenalties', event.target.value)}
                        />
                      </div>
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

export default AdminPanel

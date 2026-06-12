import { useMemo, useState } from 'react'
import { getFlagUrl } from '../../data/worldCupData'
import './styles.css'

function formatDateKey(date) {
  return new Intl.DateTimeFormat('en-CA').format(date)
}

function addDays(date, days) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

function hasResult(result) {
  return (
    result?.homeGoals !== undefined &&
    result?.awayGoals !== undefined &&
    result.homeGoals !== '' &&
    result.awayGoals !== ''
  )
}

function formatKickoff(kickoff) {
  const date = new Date(kickoff)

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const filters = [
  { id: 'today', label: 'Hoy' },
  { id: 'tomorrow', label: 'Mañana' },
  { id: 'week', label: 'Próximos 7 días' },
]

function TournamentDashboard({ matches, results }) {
  const [activeFilter, setActiveFilter] = useState('today')
  const stats = useMemo(() => {
    const played = matches.filter((match) => hasResult(results[match.id])).length

    return {
      played,
      pending: matches.length - played,
    }
  }, [matches, results])

  const filteredMatches = useMemo(() => {
    const today = new Date()
    const todayKey = formatDateKey(today)
    const tomorrowKey = formatDateKey(addDays(today, 1))
    const weekLimit = addDays(today, 7)

    return matches
      .filter((match) => {
        if (!match.kickoff) return false

        const matchDate = new Date(results[match.id]?.kickoff || match.kickoff)
        const matchKey = formatDateKey(matchDate)

        if (activeFilter === 'today') return matchKey === todayKey
        if (activeFilter === 'tomorrow') return matchKey === tomorrowKey

        return matchDate >= today && matchDate <= weekLimit
      })
      .sort((a, b) => new Date(results[a.id]?.kickoff || a.kickoff) - new Date(results[b.id]?.kickoff || b.kickoff))
  }, [activeFilter, matches, results])

  return (
    <section className="tournament-dashboard" aria-label="Panel del torneo">
      <div className="upcoming-panel">
        <div className="upcoming-header">
          <div>
            <span className="eyebrow">Agenda</span>
            <h2>Próximos partidos</h2>
          </div>
          <div className="upcoming-filters" aria-label="Filtros de agenda">
            {filters.map((filter) => (
              <button
                className={activeFilter === filter.id ? 'is-active' : ''}
                type="button"
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="upcoming-list">
          {filteredMatches.length > 0 ? (
            filteredMatches.slice(0, 8).map((match) => {
              const result = results[match.id] || {}
              const kickoff = result.kickoff || match.kickoff
              const finished = hasResult(result)

              return (
                <article className="upcoming-match" key={match.id}>
                  <time dateTime={kickoff}>{formatKickoff(kickoff)}</time>
                  <div className="upcoming-teams">
                    <span>
                      <img src={getFlagUrl(match.home)} alt="" />
                      {match.home}
                    </span>
                    <strong>{finished ? `${result.homeGoals} - ${result.awayGoals}` : 'vs'}</strong>
                    <span className="away">
                      {match.away}
                      <img src={getFlagUrl(match.away)} alt="" />
                    </span>
                  </div>
                  <small>{match.groupName}</small>
                </article>
              )
            })
          ) : (
            <p className="upcoming-empty">No hay partidos para este filtro.</p>
          )}
        </div>
      </div>
    </section>
  )
}

export default TournamentDashboard

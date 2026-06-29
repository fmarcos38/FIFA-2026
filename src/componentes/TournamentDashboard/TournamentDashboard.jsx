import { useMemo, useState } from 'react'
import { addDays, formatDateKey } from '../../helpers/dateTime'
import { getFlagUrl, knockoutRounds } from '../../data/worldCupData'
import MatchCard from '../MatchCard/MatchCard'
import './styles.css'

const FAVORITE_TEAM_STORAGE_KEY = 'fifa-2026-favorite-team'

const filters = [
  { id: 'today', label: 'Hoy' },
  { id: 'tomorrow', label: 'Mañana' },
  { id: 'week', label: 'Próximos 7 días' },
]

function normalizeSearch(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function getUpcomingMatch(matches, results, teamName) {
  const now = Date.now()

  return matches
    .filter((match) => match.home === teamName || match.away === teamName)
    .filter((match) => {
      const kickoff = results[match.id]?.kickoff || match.kickoff
      return kickoff && new Date(kickoff).getTime() >= now
    })
    .sort((a, b) => new Date(results[a.id]?.kickoff || a.kickoff) - new Date(results[b.id]?.kickoff || b.kickoff))[0]
}

function hasGroupCompleted(group) {
  const standings = group?.standings || []

  return standings.length > 0 && standings.every((row) => row.played === 3 && !row.hasPartialMatch)
}

function normalizeSeed(value) {
  return normalizeSearch(value).replace(/\u00c2/g, '').replace(/a°/g, '°')
}

function getSeedDetails(seed, groups) {
  const normalizedSeed = seed.replace(/\u00c2/g, '')
  const groupSeedMatch = normalizedSeed.match(/^(\d+)\u00b0 Grupo ([A-L])$/)

  if (groupSeedMatch) {
    const position = Number(groupSeedMatch[1])
    const groupId = groupSeedMatch[2]
    const group = groups.find((currentGroup) => currentGroup.id === groupId)
    const row = group?.standings?.[position - 1]
    const team = row?.team || group?.teams?.[position - 1]

    return team ? `${team} (${position}\u00b0 puesto, Grupo ${groupId})` : seed
  }

  const bestThirdSeedMatch = normalizedSeed.match(/^Mejor 3\u00b0 ([A-L](?:\/[A-L])*)$/)

  if (bestThirdSeedMatch) {
    const groupIds = bestThirdSeedMatch[1].split('/')
    const possibleThirds = groupIds
      .map((groupId) => {
        const group = groups.find((currentGroup) => currentGroup.id === groupId)
        const row = group?.standings?.[2]

        return hasGroupCompleted(group) && row ? { ...row, groupId } : null
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor
        return a.team.localeCompare(b.team)
      })

    const possibleTeam = possibleThirds[0]

    return possibleTeam ? `${possibleTeam.team} (3\u00b0 puesto, Grupo ${possibleTeam.groupId})` : seed
  }

  return seed
}

function getPossibleCross(seed, groups) {
  const round32 = knockoutRounds.find((round) => round.id === 'round32')
  if (!round32 || !seed) return null

  const targetSeed = normalizeSeed(seed)
  const match = round32.matches.find((currentMatch) =>
    [currentMatch.home, currentMatch.away].some((participant) => normalizeSeed(participant.seed || '') === targetSeed),
  )

  if (!match) return null

  const opponent = normalizeSeed(match.home.seed || '') === targetSeed ? match.away.seed : match.home.seed

  return `vs ${getSeedDetails(opponent, groups)}`
}

function getTeamContext(groups, matches, results, teamName) {
  if (!teamName) return null

  const group = groups.find((currentGroup) => currentGroup.teams.includes(teamName))
  if (!group) return null

  const standings = group.standings || []
  const position = standings.findIndex((row) => row.team === teamName) + 1
  const upcomingMatch = getUpcomingMatch(matches, results, teamName)
  const knockoutSeed = position > 0 && position <= 2 ? `${position}° Grupo ${group.id}` : null
  const possibleCross = getPossibleCross(knockoutSeed, groups) || (knockoutSeed ? `Clasifica como ${getSeedDetails(knockoutSeed, groups)}` : 'Debe subir posiciones')

  return {
    group,
    position,
    upcomingMatch,
    possibleCross,
  }
}

function TournamentDashboard({ matches, groups, results, onSelectCountry }) {
  const [activeFilter, setActiveFilter] = useState('today')
  const [searchTerm, setSearchTerm] = useState('')
  const [favoriteTeam, setFavoriteTeam] = useState(() => localStorage.getItem(FAVORITE_TEAM_STORAGE_KEY) || '')
  const teamOptions = useMemo(() => groups.flatMap((group) => group.teams).sort((a, b) => a.localeCompare(b)), [groups])
  const favoriteContext = useMemo(
    () => getTeamContext(groups, matches, results, favoriteTeam),
    [favoriteTeam, groups, matches, results],
  )

  const filteredMatches = useMemo(() => {
    const today = new Date()
    const todayKey = formatDateKey(today)
    const tomorrowKey = formatDateKey(addDays(today, 1))
    const weekLimitKey = formatDateKey(addDays(today, 7))
    const query = normalizeSearch(searchTerm)

    return matches
      .filter((match) => {
        if (!match.kickoff) return false

        const matchDate = new Date(results[match.id]?.kickoff || match.kickoff)
        const matchKey = formatDateKey(matchDate)

        if (activeFilter === 'today') return matchKey === todayKey
        if (activeFilter === 'tomorrow') return matchKey === tomorrowKey

        return matchKey >= todayKey && matchKey <= weekLimitKey
      })
      .filter((match) => {
        if (!query) return true

        const searchable = normalizeSearch(
          `${match.home} ${match.away} ${match.home} vs ${match.away} ${match.away} vs ${match.home} ${match.groupName}`,
        )

        return searchable.includes(query)
      })
      .sort((a, b) => new Date(results[a.id]?.kickoff || a.kickoff) - new Date(results[b.id]?.kickoff || b.kickoff))
  }, [activeFilter, matches, results, searchTerm])

  const handleFavoriteTeamChange = (teamName) => {
    setFavoriteTeam(teamName)

    if (teamName) {
      localStorage.setItem(FAVORITE_TEAM_STORAGE_KEY, teamName)
      return
    }

    localStorage.removeItem(FAVORITE_TEAM_STORAGE_KEY)
  }

  return (
    <section className="tournament-dashboard" aria-label="Panel del torneo">
      <div className="favorite-team-panel">
        <div className="favorite-team-heading">
          <div>
            <span className="eyebrow">Mi selección</span>
            <h2>{favoriteTeam || 'Elegí una favorita'}</h2>
          </div>
          <select
            aria-label="Elegir mi selección"
            value={favoriteTeam}
            onChange={(event) => handleFavoriteTeamChange(event.target.value)}
          >
            <option value="">Sin favorita</option>
            {teamOptions.map((teamName) => (
              <option value={teamName} key={teamName}>
                {teamName}
              </option>
            ))}
          </select>
        </div>

        {favoriteContext ? (
          <div className="favorite-team-grid">
            <div className="favorite-team-main">
              <img src={getFlagUrl(favoriteTeam)} alt="" />
              <div>
                <strong>{favoriteTeam}</strong>
                <span>Grupo {favoriteContext.group.id} · {favoriteContext.position || '-'}° puesto</span>
              </div>
            </div>

            <div className="favorite-team-next">
              <small>Próximo partido</small>
              {favoriteContext.upcomingMatch ? (
                <MatchCard
                  match={favoriteContext.upcomingMatch}
                  result={results[favoriteContext.upcomingMatch.id] || {}}
                  className="compact-match-card"
                />
              ) : (
                <span className="favorite-team-empty">Sin partidos pendientes</span>
              )}
            </div>

            <div className="favorite-team-facts">
              <span>
                Posible cruce <span>{favoriteContext.possibleCross}</span>
              </span>
              <button type="button" onClick={() => onSelectCountry(favoriteTeam)}>
                Plantel
              </button>
            </div>
          </div>
        ) : (
          <p className="favorite-team-empty">Seleccioná un equipo para ver su resumen, próximo partido y acceso al plantel.</p>
        )}
      </div>

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

        <div className="upcoming-tools">
          <label>
            <span>Buscar</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Argentina, Grupo J, Brasil vs Marruecos"
            />
          </label>
        </div>

        <div className="upcoming-list">
          {filteredMatches.length > 0 ? (
            filteredMatches.map((match) => {
              const result = results[match.id] || {}

              return (
                <MatchCard match={match} result={result} key={match.id} />
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

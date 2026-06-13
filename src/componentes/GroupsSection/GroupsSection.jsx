import { useEffect, useState } from 'react'
import { buildInitialStandings, countries, getFlagUrl } from '../../data/worldCupData'
import GroupFixtureList from '../GroupFixtureList/GroupFixtureList'
import './styles.css'

function GroupsSection({ groups, isAdmin, results, onResultChange, onResultDelete, onSelectCountry }) {
  const [openFixtures, setOpenFixtures] = useState({})
  const [singleColumn, setSingleColumn] = useState(false)
  const groupColumns = singleColumn
    ? [groups]
    : [
        groups.filter((_, index) => index % 2 === 0),
        groups.filter((_, index) => index % 2 === 1),
      ]

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 920px)')
    const syncColumns = () => setSingleColumn(mediaQuery.matches)

    syncColumns()
    mediaQuery.addEventListener('change', syncColumns)

    return () => mediaQuery.removeEventListener('change', syncColumns)
  }, [])

  const toggleFixtures = (groupId) => {
    setOpenFixtures((currentFixtures) => ({
      ...currentFixtures,
      [groupId]: !currentFixtures[groupId],
    }))
  }

  const renderGroup = (group) => {
    const standings = group.standings || buildInitialStandings(group.teams)
    const fixturesOpen = Boolean(openFixtures[group.id])

    return (
      <div className="group-block" key={group.id}>
        <article className="group-card">
          <div className="group-card-header">
            <span>Grupo {group.id}</span>
            <small>Pts, DG, GF</small>
          </div>

          <div className="standings-wrap">
            <table className="standings-table">
              <thead>
                <tr>
                  <th className="team-heading">Equipo</th>
                  <th>PJ</th>
                  <th>PG</th>
                  <th>PE</th>
                  <th>PP</th>
                  <th>GF</th>
                  <th>GC</th>
                  <th>DG</th>
                  <th>Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((row, index) => {
                  const country = countries[row.team]

                  return (
                    <tr key={row.team}>
                      <td>
                        <button className="standing-team" type="button" onClick={() => onSelectCountry(row.team)}>
                          <span className="standings-position">{index + 1}</span>
                          <span className="flag-button" aria-hidden="true">
                            <img src={getFlagUrl(row.team)} alt="" loading="lazy" />
                          </span>
                          <span>{row.team}</span>
                          <small>{country.confederation}</small>
                        </button>
                      </td>
                      <td>{row.played}</td>
                      <td>{row.won}</td>
                      <td>{row.drawn}</td>
                      <td>{row.lost}</td>
                      <td>{row.goalsFor}</td>
                      <td>{row.goalsAgainst}</td>
                      <td>{row.goalDifference}</td>
                      <td className="points-cell">{row.points}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="group-card-footer">
            <button
              className="fixtures-toggle"
              type="button"
              onClick={() => toggleFixtures(group.id)}
              aria-expanded={fixturesOpen}
              aria-controls={`fixtures-${group.id}`}
            >
              Partidos
              <span aria-hidden="true">{fixturesOpen ? '-' : '+'}</span>
            </button>
          </div>
        </article>

        {fixturesOpen && (
          <GroupFixtureList
            group={group}
            isAdmin={isAdmin}
            results={results}
            onResultChange={onResultChange}
            onResultDelete={onResultDelete}
            onSelectCountry={onSelectCountry}
          />
        )}
      </div>
    )
  }

  return (
    <section className="section" id="grupos">
      <div className="section-heading">
        <span className="eyebrow">Fase de grupos</span>
        <h2>Los 12 grupos del Mundial</h2>
      </div>

      <div className="groups-grid">
        {groupColumns.map((columnGroups, columnIndex) => (
          <div className="groups-column" key={`groups-column-${columnIndex}`}>
            {columnGroups.map(renderGroup)}
          </div>
        ))}
      </div>
    </section>
  )
}

export default GroupsSection

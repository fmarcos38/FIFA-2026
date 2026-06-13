import { getFlagUrl } from '../../data/worldCupData'
import { countrySquads, squadSourceUrl } from '../../data/squads'
import './styles.css'

const positionSections = [
  { id: 'ARQ', label: 'ARQ', title: 'Arqueros' },
  { id: 'DEF', label: 'DEF', title: 'Defensores' },
  { id: 'MED', label: 'MED', title: 'Mediocampistas' },
  { id: 'DEL', label: 'DEL', title: 'Delanteros' },
]

function buildFallbackSquad(players = []) {
  return players.map((name, index) => ({
    no: index + 1,
    name,
    position: 'DEL',
    club: 'Club a confirmar',
    age: null,
    caps: null,
    goals: null,
  }))
}

function groupSquad(players) {
  return positionSections.reduce(
    (groups, position) => ({
      ...groups,
      [position.id]: players.filter((player) => player.position === position.id),
    }),
    {},
  )
}

function CountryModal({ country, name, onClose }) {
  if (!country) return null
  const squad = countrySquads[name] || buildFallbackSquad(country.players)
  const groupedSquad = groupSquad(squad)

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <article
        className="country-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="country-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal-close" type="button" onClick={onClose} aria-label="Cerrar">
          x
        </button>

        <header className="country-modal-header">
          <div className="modal-flag" aria-hidden="true">
            <img src={getFlagUrl(name)} alt="" />
          </div>
          <div className="country-title-block">
            <span className="eyebrow">{country.confederation}</span>
            <h2 id="country-title">{name}</h2>
            <div className="country-facts">
              <span>
                Capital <strong>{country.capital}</strong>
              </span>
              <span>
                DT <strong>{country.coach}</strong>
              </span>
              <span>
                Plantel <strong>{squad.length} jugadores</strong>
              </span>
            </div>
          </div>
        </header>

        <div className="squad-panel">
          <div className="squad-heading">
            <div>
              <span className="eyebrow">Lista oficial</span>
              <h3>Plantel por posición</h3>
            </div>
            <a href={squadSourceUrl} target="_blank" rel="noreferrer">
              Fuente
            </a>
          </div>

          <div className="squad-position-grid">
            {positionSections.map((section) => {
              const players = groupedSquad[section.id]

              return (
                <section className="position-group" key={section.id}>
                  <div className="position-heading">
                    <span>{section.label}</span>
                    <strong>{section.title}</strong>
                    <small>{players.length}</small>
                  </div>

                  <ul className="player-list">
                    {players.map((player) => (
                      <li className="player-card" key={`${player.no}-${player.name}`}>
                        <span className="player-number">{String(player.no).padStart(2, '0')}</span>
                        <div className="player-main">
                          <strong>{player.name}</strong>
                          <small>{player.club}</small>
                        </div>
                        <span className={`position-badge position-${player.position.toLowerCase()}`}>
                          {player.position}
                        </span>
                        <div className="player-stats">
                          {player.age && <span>{player.age} años</span>}
                          {player.caps !== null && <span>{player.caps} PJ</span>}
                          {player.goals !== null && <span>{player.goals} G</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )
            })}
          </div>
        </div>
      </article>
    </div>
  )
}

export default CountryModal

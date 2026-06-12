import { getFlagUrl } from '../../data/worldCupData'
import './styles.css'

function CountryModal({ country, name, onClose }) {
  if (!country) return null

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
        <div className="modal-flag" aria-hidden="true">
          <img src={getFlagUrl(name)} alt="" />
        </div>
        <div>
          <span className="eyebrow">{country.confederation}</span>
          <h2 id="country-title">{name}</h2>
          <div className="country-facts">
            <span>
              Capital: <strong>{country.capital}</strong>
            </span>
            <span>
              DT: <strong>{country.coach}</strong>
            </span>
          </div>
        </div>
        <div className="squad-panel">
          <h3>Plantel destacado</h3>
          <ul>
            {country.players.map((player) => (
              <li key={player}>{player}</li>
            ))}
          </ul>
        </div>
      </article>
    </div>
  )
}

export default CountryModal

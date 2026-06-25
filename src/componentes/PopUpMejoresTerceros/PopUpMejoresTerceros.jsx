import GroupsIcon from '@mui/icons-material/Groups'
import { getFlagUrl } from '../../data/worldCupData'
import './styles.css'

function PopUpMejoresTerceros({ open, rows = [], onClose }) {
  if (!open) return null

  return (
    <div className="thirds-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="thirds-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="thirds-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="thirds-modal-close" type="button" onClick={onClose} aria-label="Cerrar">
          x
        </button>

        <span className="eyebrow">Clasificacion en vivo</span>
        <h2 id="thirds-modal-title">Mejores terceros</h2>

        {rows.length > 0 ? (
          <div className="thirds-table-wrap">
            <table className="thirds-table">
              <thead>
                <tr>
                  <th className="thirds-team-heading">Equipo</th>
                  <th>Grupo</th>
                  <th>Pts</th>
                  <th>PJ</th>
                  <th>GF</th>
                  <th>GC</th>
                  <th>DG</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr className={index < 8 ? 'is-qualified' : ''} key={`${row.groupId}-${row.team}`}>
                    <td>
                      <div className="thirds-team">
                        <span className="thirds-position">{index + 1}</span>
                        <span className="thirds-flag" aria-hidden="true">
                          <img src={getFlagUrl(row.team)} alt="" loading="lazy" />
                        </span>
                        <span className="thirds-name">{row.team}</span>
                        {row.hasPartialMatch && <span className="thirds-partial">Parcial</span>}
                        {index < 8 && (
                          <span className="thirds-qualified" title="Clasifica a ronda de 32">
                            <GroupsIcon fontSize="inherit" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{row.groupId}</td>
                    <td className="thirds-points">{row.points}</td>
                    <td>{row.played}</td>
                    <td>{row.goalsFor}</td>
                    <td>{row.goalsAgainst}</td>
                    <td>{row.goalDifference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="thirds-empty">
            <strong>Todavia no hay grupos con partidos cargados.</strong>
            <span>La tabla se arma automaticamente cuando empiezan a registrarse resultados.</span>
          </div>
        )}
      </section>
    </div>
  )
}

export default PopUpMejoresTerceros

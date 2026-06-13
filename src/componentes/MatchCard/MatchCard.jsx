import { getFlagUrl } from '../../data/worldCupData'
import { formatKickoffParts } from '../../helpers/dateTime'
import './styles.css'

function hasResult(result) {
  return (
    result?.homeGoals !== undefined &&
    result?.awayGoals !== undefined &&
    result.homeGoals !== '' &&
    result.awayGoals !== ''
  )
}

function MatchCard({ match, result = {}, className = '' }) {
  const kickoff = result.kickoff || match.kickoff
  const finished = hasResult(result)
  const formattedKickoff = formatKickoffParts(kickoff)

  return (
    <article className={`match-card ${className}`.trim()}>
      <time className="match-card-kickoff" dateTime={kickoff || ''}>
        <span>{formattedKickoff.date}</span>
        <span>{formattedKickoff.time}</span>
      </time>

      <div className="match-card-teams">
        <span className="match-card-team">
          <img src={getFlagUrl(match.home)} alt="" loading="lazy" />
          <span>{match.home}</span>
        </span>

        <strong className="match-card-score">
          {finished ? `${result.homeGoals} - ${result.awayGoals}` : 'vs'}
        </strong>

        <span className="match-card-team away">
          <span>{match.away}</span>
          <img src={getFlagUrl(match.away)} alt="" loading="lazy" />
        </span>
      </div>

      <small className="match-card-group">{match.groupName}</small>
    </article>
  )
}

export default MatchCard

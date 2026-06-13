import { getFlagUrl, getMatchStatus, getMatchStatusLabel, hasMatchScore } from '../../data/worldCupData'
import { formatKickoffParts } from '../../helpers/dateTime'
import './styles.css'

function MatchCard({ match, result = {}, className = '' }) {
  const kickoff = result.kickoff || match.kickoff
  const hasScore = hasMatchScore(result)
  const status = getMatchStatus(result, kickoff)
  const statusLabel = getMatchStatusLabel(result, kickoff)
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
          {hasScore ? `${result.homeGoals} - ${result.awayGoals}` : 'vs'}
        </strong>

        <span className="match-card-team away">
          <span>{match.away}</span>
          <img src={getFlagUrl(match.away)} alt="" loading="lazy" />
        </span>
      </div>

      <small className="match-card-group">
        <span>{match.groupName}</span>
        {statusLabel && <span className={`match-status status-${status}`}>{statusLabel}</span>}
      </small>
    </article>
  )
}

export default MatchCard

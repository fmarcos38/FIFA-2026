import { useState } from 'react'
import { formatKickoff, fromDatetimeLocalValue, toDatetimeLocalValue } from '../../helpers/dateTime'
import { getFlagUrl, getMatchStatus, getMatchStatusLabel, hasMatchScore, hasMinimumMatchDurationElapsed } from '../../data/worldCupData'
import './styles.css'

function buildScoreChange(result, field, value) {
  const otherField = field === 'homeGoals' ? 'awayGoals' : 'homeGoals'
  const nextResult = {
    [field]: value,
    [otherField]: result?.[otherField] ?? '',
  }

  if (nextResult.homeGoals !== '' && nextResult.awayGoals !== '') {
    nextResult.status = result?.status || 'partial'
  }

  return nextResult
}

function hasPenalties(result) {
  return (
    result?.homePenalties !== undefined &&
    result?.awayPenalties !== undefined &&
    result.homePenalties !== '' &&
    result.awayPenalties !== ''
  )
}

function isResolvedParticipant(label) {
  return !/^(Ganador|Mejor|\d+(?:Ã‚Â°|Â°) Grupo)/.test(label)
}

function getRoundProgress(round) {
  return round.matches.filter((match) => match.winner).length
}

function getChampion(rounds) {
  return rounds.at(-1)?.matches[0]?.winner || ''
}

function splitRound(round) {
  const half = Math.ceil(round.matches.length / 2)

  return {
    left: { ...round, matches: round.matches.slice(0, half) },
    right: { ...round, matches: round.matches.slice(half) },
  }
}

function TeamLine({ isAdmin, label, score, hasScore, inputLabel, onScoreChange }) {
  const isResolved = isResolvedParticipant(label)
  const flagUrl = isResolved ? getFlagUrl(label) : ''

  return (
    <div className={`knockout-team-line ${isResolved ? 'is-resolved' : 'is-seed'}`}>
      <span className="knockout-team-name">
        {flagUrl && <img src={flagUrl} alt="" loading="lazy" />}
        <strong>{label}</strong>
      </span>
      {isAdmin ? (
        <input aria-label={inputLabel} min="0" type="number" value={score ?? ''} onChange={onScoreChange} />
      ) : (
        <em>{hasScore ? score : '-'}</em>
      )}
    </div>
  )
}

function MatchSlot({ isAdmin, match, index, isConnected, isFinal, results, rounds, roundIndex, onResultChange, onResultDelete }) {
  const result = results[match.id]
  const hasScore = hasMatchScore(result)
  const rawKickoff = result?.kickoff || match.kickoff
  const status = getMatchStatus(result, rawKickoff)
  const statusLabel = getMatchStatusLabel(result, rawKickoff)
  const canFinish = hasMinimumMatchDurationElapsed(rawKickoff)
  const penalties = hasPenalties(result)
  const kickoff = formatKickoff(rawKickoff, '')
  const isDraw =
    result?.homeGoals !== undefined &&
    result?.awayGoals !== undefined &&
    result.homeGoals !== '' &&
    result.awayGoals !== '' &&
    Number(result.homeGoals) === Number(result.awayGoals)

  return (
    <div
      className={`match-slot knockout-slot ${match.winner ? 'has-winner' : ''} ${isConnected ? 'has-connector' : ''} ${isFinal ? 'center-final' : ''}`}
    >
      <div className="knockout-meta">
        <span>{match.id || `Partido ${index + 1}`}</span>
        {isAdmin ? (
          <input
            className="knockout-date-input"
            type="datetime-local"
            value={toDatetimeLocalValue(result?.kickoff)}
            onChange={(event) => onResultChange(match.id, { kickoff: fromDatetimeLocalValue(event.target.value) })}
          />
        ) : (
          kickoff && <time className="knockout-kickoff" dateTime={rawKickoff}>{kickoff}</time>
        )}
      </div>
      <TeamLine
        isAdmin={isAdmin}
        label={match.homeLabel}
        score={result?.homeGoals}
        hasScore={hasScore}
        inputLabel={`Goles de ${match.homeLabel}`}
        onScoreChange={(event) => onResultChange(match.id, buildScoreChange(result, 'homeGoals', event.target.value))}
      />
      <TeamLine
        isAdmin={isAdmin}
        label={match.awayLabel}
        score={result?.awayGoals}
        hasScore={hasScore}
        inputLabel={`Goles de ${match.awayLabel}`}
        onScoreChange={(event) => onResultChange(match.id, buildScoreChange(result, 'awayGoals', event.target.value))}
      />
      {isAdmin && hasScore && (
        <select
          className="knockout-status-select"
          aria-label={`Estado de ${match.homeLabel} contra ${match.awayLabel}`}
          value={status || 'partial'}
          onChange={(event) => onResultChange(match.id, { status: event.target.value })}
        >
          <option value="partial">Parcial</option>
          <option value="extraTime">Alargue</option>
          <option value="penalties">Penales</option>
          <option value="finished" disabled={!canFinish}>Finalizado</option>
        </select>
      )}
      {!isAdmin && statusLabel && <span className={`knockout-status status-${status}`}>{statusLabel}</span>}
      {isAdmin && isDraw && (
        <div className="knockout-penalty-editor">
          <span>Penales</span>
          <input
            aria-label={`Penales de ${match.homeLabel}`}
            min="0"
            type="number"
            value={result?.homePenalties ?? ''}
            onChange={(event) => onResultChange(match.id, { homePenalties: event.target.value })}
          />
          <strong>-</strong>
          <input
            aria-label={`Penales de ${match.awayLabel}`}
            min="0"
            type="number"
            value={result?.awayPenalties ?? ''}
            onChange={(event) => onResultChange(match.id, { awayPenalties: event.target.value })}
          />
        </div>
      )}
      {!isAdmin && penalties && (
        <div className="penalty-line">
          Penales: <strong>{result.homePenalties}</strong> - <strong>{result.awayPenalties}</strong>
        </div>
      )}
      <small className="knockout-path">
        {match.winner ? `Avanza: ${match.winner}` : roundIndex === rounds.length - 1 ? 'Define el campeon' : `Ganador hacia ${rounds[roundIndex + 1]?.title || 'siguiente ronda'}`}
      </small>
      {isAdmin && (
        <button className="knockout-clear" type="button" onClick={() => onResultDelete(match.id)}>
          Limpiar
        </button>
      )}
    </div>
  )
}

function RoundColumn({ round, side, roundIndex, rounds, isAdmin, results, onResultChange, onResultDelete }) {
  return (
    <article className={`round-card round-${round.id} bracket-column side-${side}`} key={`${round.id}-${side}`}>
      <div className="round-card-heading">
        <h3>{round.title}</h3>
        <span>{getRoundProgress(round)}/{round.matches.length}</span>
      </div>
      <div className="slot-list">
        {round.matches.map((match, index) => (
          <MatchSlot
            isAdmin={isAdmin}
            isConnected={roundIndex > 0}
            isFinal={false}
            key={match.id}
            match={match}
            index={index}
            results={results}
            rounds={rounds}
            roundIndex={roundIndex}
            onResultChange={onResultChange}
            onResultDelete={onResultDelete}
          />
        ))}
      </div>
    </article>
  )
}

function FinalColumn({ round, roundIndex, rounds, isAdmin, results, onResultChange, onResultDelete }) {
  return (
    <article className={`round-card round-${round.id} bracket-column side-center`} key={round.id}>
      <div className="round-card-heading">
        <h3>{round.title}</h3>
        <span>{getRoundProgress(round)}/{round.matches.length}</span>
      </div>
      <div className="slot-list final-slot-list">
        {round.matches.map((match, index) => (
          <MatchSlot
            isAdmin={isAdmin}
            isConnected
            isFinal
            key={match.id}
            match={match}
            index={index}
            results={results}
            rounds={rounds}
            roundIndex={roundIndex}
            onResultChange={onResultChange}
            onResultDelete={onResultDelete}
          />
        ))}
      </div>
    </article>
  )
}

function KnockoutSection({ isAdmin, rounds, results, onResultChange, onResultDelete }) {
  const [fitToScreen, setFitToScreen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const totalMatches = rounds.reduce((total, round) => total + round.matches.length, 0)
  const resolvedMatches = rounds.reduce((total, round) => total + getRoundProgress(round), 0)
  const champion = getChampion(rounds)
  const [round32, round16, quarterfinals, semifinals, finalRound] = rounds
  const round32Sides = splitRound(round32)
  const round16Sides = splitRound(round16)
  const quarterfinalSides = splitRound(quarterfinals)
  const semifinalSides = splitRound(semifinals)

  const sharedProps = { isAdmin, results, rounds, onResultChange, onResultDelete }
  const zoomClass = ['zoom-small', 'zoom-medium', 'zoom-large'][zoomLevel]

  return (
    <section className={`section knockout-section ${fitToScreen ? 'is-fit-mode' : ''}`} id="eliminatorias">
      <div className="section-heading knockout-heading">
        <div>
          <span className="eyebrow">Mapa de cruces</span>
          <h2>Llaves eliminatorias</h2>
        </div>
        <div className="knockout-summary">
          <span>{resolvedMatches}/{totalMatches} definidos</span>
          {champion && <strong>Campeon: {champion}</strong>}
          <button
            className="bracket-fit-toggle"
            type="button"
            aria-pressed={fitToScreen}
            onClick={() => setFitToScreen((current) => !current)}
          >
            {fitToScreen ? 'Vista normal' : 'Ajustar a pantalla'}
          </button>
          <div className="bracket-zoom-controls" aria-label="Tamaño de llaves">
            <button
              type="button"
              aria-label="Achicar llaves"
              onClick={() => setZoomLevel((current) => Math.max(0, current - 1))}
              disabled={zoomLevel === 0}
            >
              -
            </button>
            <button
              type="button"
              aria-label="Agrandar llaves"
              onClick={() => setZoomLevel((current) => Math.min(2, current + 1))}
              disabled={zoomLevel === 2}
            >
              +
            </button>
          </div>
        </div>
      </div>
      <div className={`bracket-map ${fitToScreen ? 'is-fit' : ''} ${zoomClass}`} aria-label="Mapa de llaves eliminatorias">
        <RoundColumn round={round32Sides.left} side="left outer" roundIndex={0} {...sharedProps} />
        <RoundColumn round={round16Sides.left} side="left" roundIndex={1} {...sharedProps} />
        <RoundColumn round={quarterfinalSides.left} side="left" roundIndex={2} {...sharedProps} />
        <RoundColumn round={semifinalSides.left} side="left inner" roundIndex={3} {...sharedProps} />
        <FinalColumn round={finalRound} roundIndex={4} {...sharedProps} />
        <RoundColumn round={semifinalSides.right} side="right inner" roundIndex={3} {...sharedProps} />
        <RoundColumn round={quarterfinalSides.right} side="right" roundIndex={2} {...sharedProps} />
        <RoundColumn round={round16Sides.right} side="right" roundIndex={1} {...sharedProps} />
        <RoundColumn round={round32Sides.right} side="right outer" roundIndex={0} {...sharedProps} />
      </div>
    </section>
  )
}

export default KnockoutSection

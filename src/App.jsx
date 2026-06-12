import { useEffect, useMemo, useState } from 'react'
import CountryModal from './componentes/CountryModal/CountryModal'
import GroupsSection from './componentes/GroupsSection/GroupsSection'
import Hero from './componentes/Hero/Hero'
import KnockoutSection from './componentes/KnockoutSection/KnockoutSection'
import LoginPanel from './componentes/LoginPanel/LoginPanel'
import { buildKnockoutBracket, calculateGroupStandings, countries, createGroupMatches, groups, knockoutRounds } from './data/worldCupData'
import './App.css'

const RESULTS_STORAGE_KEY = 'fifa-2026-results'
const API_BASE_URL = 'http://localhost:4000'

function App() {
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [loginOpen, setLoginOpen] = useState(false)
  const [partidosHoy, setPartidosHoy] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [results, setResults] = useState(() => {
    const savedResults = localStorage.getItem(RESULTS_STORAGE_KEY)

    return savedResults ? JSON.parse(savedResults) : {}
  })

  useEffect(() => {
    localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(results))
  }, [results])

  useEffect(() => {
    async function loadResults() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/results`)
        const data = await response.json()

        if (response.ok && data.results) {
          setResults(data.results)
        }
      } catch (error) {
        console.info('Usando resultados locales: el back no esta disponible.')
      }
    }

    loadResults()
    const intervalId = setInterval(loadResults, 60 * 1000)

    return () => clearInterval(intervalId)
  }, [])

  const groupsWithStandings = useMemo(
    () =>
      groups.map((group) => ({
        ...group,
        standings: calculateGroupStandings(group, results),
      })),
    [results],
  )

  const knockoutBracket = useMemo(() => buildKnockoutBracket(results, knockoutRounds), [results])
  const todayMatches = useMemo(() => {
    const todayKey = new Intl.DateTimeFormat('en-CA').format(new Date())

    return groups.flatMap((group) =>
      createGroupMatches(group)
        .map((match) => ({
          ...match,
          groupName: `Grupo ${group.id}`,
          result: results[match.id] || {},
          kickoff: results[match.id]?.kickoff || match.kickoff,
        }))
        .filter((match) => {
          if (!match.kickoff) return false

          return new Intl.DateTimeFormat('en-CA').format(new Date(match.kickoff)) === todayKey
        }),
    )
  }, [results])

  const handleResultChange = async (matchId, result) => {
    setResults((currentResults) => ({
      ...currentResults,
      [matchId]: {
        ...currentResults[matchId],
        ...result,
      },
    }))

    const editsGoals = result.homeGoals !== undefined || result.awayGoals !== undefined
    const nextHomeGoals = result.homeGoals
    const nextAwayGoals = result.awayGoals
    const hasPartialScore =
      editsGoals &&
      ((nextHomeGoals === undefined || nextHomeGoals === '') || (nextAwayGoals === undefined || nextAwayGoals === ''))

    if (hasPartialScore) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/results/${encodeURIComponent(matchId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      })
      const data = await response.json()

      if (response.ok && data.results) {
        setResults(data.results)
      }
    } catch (error) {
      console.info('Resultado guardado localmente: el back no esta disponible.')
    }
  }

  const handleResultDelete = async (matchId) => {
    setResults((currentResults) => {
      const nextResults = { ...currentResults }
      delete nextResults[matchId]
      return nextResults
    })

    try {
      const response = await fetch(`${API_BASE_URL}/api/results/${encodeURIComponent(matchId)}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (response.ok && data.results) {
        setResults(data.results)
      }
    } catch (error) {
      console.info('Resultado eliminado localmente: el back no esta disponible.')
    }
  }

  return (
    <>
      <Hero 
        isAdmin={isAdmin} 
        onAdminClick={() => setLoginOpen(true)} 
        onLogout={() => setIsAdmin(false)} 
        partidosDeHoy={() => setPartidosHoy(true)}
        partidosHoy={partidosHoy}
        todayMatches={todayMatches}
        onClosePartidosHoy={() => setPartidosHoy(false)}
      />
      <main>
        <GroupsSection
          groups={groupsWithStandings}
          isAdmin={isAdmin}
          results={results}
          onResultChange={handleResultChange}
          onResultDelete={handleResultDelete}
          onSelectCountry={setSelectedCountry}
        />
        <KnockoutSection
          isAdmin={isAdmin}
          rounds={knockoutBracket}
          results={results}
          onResultChange={handleResultChange}
          onResultDelete={handleResultDelete}
        />
      </main>
      <footer className="site-footer">
        <span>Fixture FIFA World Cup 2026</span>
        <span>Datos editables desde la estructura modular del proyecto.</span>
      </footer>
      <CountryModal
        country={selectedCountry ? countries[selectedCountry] : null}
        name={selectedCountry}
        onClose={() => setSelectedCountry(null)}
      />
      <LoginPanel open={loginOpen} onClose={() => setLoginOpen(false)} onLogin={() => setIsAdmin(true)} />
    </>
  )
}

export default App

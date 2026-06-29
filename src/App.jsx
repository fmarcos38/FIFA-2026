import { useEffect, useMemo, useState } from 'react'
import InstagramIcon from '@mui/icons-material/Instagram'
import CountryModal from './componentes/CountryModal/CountryModal'
import GroupsSection from './componentes/GroupsSection/GroupsSection'
import Hero from './componentes/Hero/Hero'
import KnockoutSection from './componentes/KnockoutSection/KnockoutSection'
import LoginPanel from './componentes/LoginPanel/LoginPanel'
import TournamentDashboard from './componentes/TournamentDashboard/TournamentDashboard'
import { buildKnockoutBracket, calculateGroupStandings, collectBestThirdRows, countries, createGroupMatches, flattenKnockoutMatches, groups, knockoutRounds } from './data/worldCupData'
import { formatDateKey } from './helpers/dateTime'
import { clearAdminToken, deleteResult, getApiBaseUrl, getResults, saveResult, setAdminToken } from './services/api'
import './App.css'

const RESULTS_STORAGE_KEY = 'fifa-2026-results'
const ADMIN_STORAGE_KEY = 'fifa-2026-admin'
const INSTAGRAM_URL = 'https://www.instagram.com/fmarcos_casla/'
const APP_UPDATE_CHECK_INTERVAL = 60 * 1000

function getAppAssetSignature(documentRoot = document) {
  const scripts = Array.from(documentRoot.querySelectorAll('script[type="module"][src]')).map((element) =>
    element.getAttribute('src'),
  )
  const styles = Array.from(documentRoot.querySelectorAll('link[rel="stylesheet"][href]')).map((element) =>
    element.getAttribute('href'),
  )

  return [...scripts, ...styles].filter(Boolean).sort().join('|')
}

async function getLatestAppAssetSignature() {
  const response = await fetch(`${window.location.pathname}?update-check=${Date.now()}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
  })

  if (!response.ok) return ''

  const html = await response.text()
  const documentSnapshot = new DOMParser().parseFromString(html, 'text/html')

  return getAppAssetSignature(documentSnapshot)
}

function App() {
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [loginOpen, setLoginOpen] = useState(false)
  const [partidosHoy, setPartidosHoy] = useState(false)
  const [mejoresTercerosOpen, setMejoresTercerosOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem(ADMIN_STORAGE_KEY) === 'true')
  const [saveStatus, setSaveStatus] = useState({
    type: getApiBaseUrl() ? 'idle' : 'offline',
    text: getApiBaseUrl() ? '' : 'Modo local: back no configurado',
  })
  const [results, setResults] = useState(() => {
    const savedResults = localStorage.getItem(RESULTS_STORAGE_KEY)

    return savedResults ? JSON.parse(savedResults) : {}
  })

  useEffect(() => {
    localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(results))
  }, [results])

  useEffect(() => {
    if (import.meta.env.DEV) return undefined

    const currentAssetSignature = getAppAssetSignature()
    if (!currentAssetSignature) return undefined

    const checkForUpdate = async () => {
      if (document.visibilityState !== 'visible') return

      try {
        const latestAssetSignature = await getLatestAppAssetSignature()

        if (latestAssetSignature && latestAssetSignature !== currentAssetSignature) {
          window.location.reload()
        }
      } catch {
        console.info('No se pudo comprobar si hay una nueva version disponible.')
      }
    }

    const intervalId = window.setInterval(checkForUpdate, APP_UPDATE_CHECK_INTERVAL)
    window.addEventListener('focus', checkForUpdate)
    document.addEventListener('visibilitychange', checkForUpdate)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', checkForUpdate)
      document.removeEventListener('visibilitychange', checkForUpdate)
    }
  }, [])

  useEffect(() => {
    async function loadResults() {
      if (!getApiBaseUrl()) return

      try {
        const data = await getResults()

        if (data.results) {
          setResults(data.results)
        }
      } catch {
        console.info('Usando resultados locales: el back no esta disponible.')
        setSaveStatus({ type: 'offline', text: 'Sin conexion con el back' })
      }
    }

    loadResults()
    if (!getApiBaseUrl()) return undefined

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

  const knockoutBracket = useMemo(
    () => buildKnockoutBracket(results, knockoutRounds, groupsWithStandings),
    [groupsWithStandings, results],
  )
  const bestThirdRows = useMemo(() => {
    const standingsByGroup = Object.fromEntries(groupsWithStandings.map((group) => [group.id, group.standings || []]))

    return collectBestThirdRows(standingsByGroup, 12)
  }, [groupsWithStandings])

  const groupMatches = useMemo(
    () =>
      groups.flatMap((group) =>
        createGroupMatches(group).map((match) => ({
          ...match,
          groupName: `Grupo ${group.id}`,
          kickoff: results[match.id]?.kickoff || match.kickoff,
        })),
      ),
    [results],
  )
  const todayMatches = useMemo(() => {
    const todayKey = formatDateKey(new Date())
    const knockoutMatches = flattenKnockoutMatches(knockoutBracket).map((match) => ({
      ...match,
      kickoff: results[match.id]?.kickoff || match.kickoff,
    }))

    return [...groupMatches, ...knockoutMatches]
      .map((match) => ({
        ...match,
        result: results[match.id] || {},
      }))
      .filter((match) => {
        if (!match.kickoff) return false

        return formatDateKey(new Date(match.kickoff)) === todayKey
      })
      .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime())
  }, [groupMatches, knockoutBracket, results])

  const handleResultChange = async (matchId, result) => {
    const previousResults = results

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

    if (hasPartialScore) {
      setSaveStatus({ type: 'idle', text: '' })
      return
    }

    if (!getApiBaseUrl()) {
      setSaveStatus({ type: 'offline', text: 'Modo local: back no configurado' })
      return
    }

    try {
      setSaveStatus({ type: 'saving', text: 'Guardando...' })
      const data = await saveResult(matchId, result)

      if (data.results) {
        setResults(data.results)
        setSaveStatus({ type: 'success', text: 'Guardado en MongoDB' })
      }
    } catch (error) {
      console.info('Resultado guardado localmente: el back no esta disponible.')
      setResults(previousResults)
      setSaveStatus({ type: 'error', text: error.message || 'Error al guardar' })
    }
  }

  const handleResultDelete = async (matchId) => {
    const previousResults = results

    setResults((currentResults) => {
      const nextResults = { ...currentResults }
      delete nextResults[matchId]
      return nextResults
    })

    if (!getApiBaseUrl()) {
      setSaveStatus({ type: 'offline', text: 'Modo local: back no configurado' })
      return
    }

    try {
      setSaveStatus({ type: 'saving', text: 'Eliminando...' })
      const data = await deleteResult(matchId)

      if (data.results) {
        setResults(data.results)
        setSaveStatus({ type: 'success', text: 'Resultado eliminado' })
      }
    } catch (error) {
      console.info('Resultado eliminado localmente: el back no esta disponible.')
      setResults(previousResults)
      setSaveStatus({ type: 'error', text: error.message || 'Error al eliminar' })
    }
  }

  return (
    <>
      <Hero 
        isAdmin={isAdmin} 
        onAdminClick={() => setLoginOpen(true)} 
        onLogout={() => {
          localStorage.removeItem(ADMIN_STORAGE_KEY)
          clearAdminToken()
          setIsAdmin(false)
        }} 
        partidosDeHoy={() => setPartidosHoy(true)}
        partidosHoy={partidosHoy}
        todayMatches={todayMatches}
        onClosePartidosHoy={() => setPartidosHoy(false)}
        mejoresTercerosOpen={mejoresTercerosOpen}
        mejoresTerceros={bestThirdRows}
        onOpenMejoresTerceros={() => setMejoresTercerosOpen(true)}
        onCloseMejoresTerceros={() => setMejoresTercerosOpen(false)}
        saveStatus={saveStatus}
      />
      <main>
        <TournamentDashboard
          matches={groupMatches}
          groups={groupsWithStandings}
          results={results}
          onSelectCountry={setSelectedCountry}
        />
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
        <a className="footer-credit" href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="Instagram de Marcos Forastiere">
          <span>Desarrollado por Marcos Forastiere</span>
          <InstagramIcon fontSize="small" />
        </a>
      </footer>
      <CountryModal
        country={selectedCountry ? countries[selectedCountry] : null}
        name={selectedCountry}
        onClose={() => setSelectedCountry(null)}
      />
      <LoginPanel
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLogin={(token) => {
          localStorage.setItem(ADMIN_STORAGE_KEY, 'true')
          setAdminToken(token)
          setIsAdmin(true)
        }}
      />
    </>
  )
}

export default App

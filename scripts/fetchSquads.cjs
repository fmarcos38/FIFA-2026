const fs = require('fs')
const path = require('path')

const SOURCE_URL = 'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_squads'
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'data', 'squads.js')

const teamNameMap = {
  'Czech Republic': 'Czechia',
  'Curaçao': 'Curacao',
  'DR Congo': 'DR Congo',
}

const positionMap = {
  GK: 'ARQ',
  DF: 'DEF',
  MF: 'MED',
  FW: 'DEL',
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&ntilde;/g, 'ñ')
    .replace(/&aacute;/g, 'á')
    .replace(/&eacute;/g, 'é')
    .replace(/&iacute;/g, 'í')
    .replace(/&oacute;/g, 'ó')
    .replace(/&uacute;/g, 'ú')
    .replace(/&Aacute;/g, 'Á')
    .replace(/&Eacute;/g, 'É')
    .replace(/&Iacute;/g, 'Í')
    .replace(/&Oacute;/g, 'Ó')
    .replace(/&Uacute;/g, 'Ú')
}

function stripTags(value) {
  return decodeHtml(value.replace(/<sup[\s\S]*?<\/sup>/g, '').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

function extractCells(rowHtml) {
  const cells = []
  const cellPattern = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g
  let match

  while ((match = cellPattern.exec(rowHtml))) {
    cells.push(match[1])
  }

  return cells
}

function extractPlayerName(cellHtml) {
  const links = [...cellHtml.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g)]
    .map((match) => stripTags(match[1]))
    .filter((text) => text && text !== 'captain')

  return links.at(-1) || stripTags(cellHtml).replace(/\s*\(.*$/, '').trim()
}

function extractClub(cellHtml) {
  const links = [...cellHtml.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g)]
    .map((match) => stripTags(match[1]))
    .filter((text) => text && !text.startsWith('Image:'))

  return links.at(-1) || stripTags(cellHtml)
}

function extractAge(cellText) {
  const ageMatch = cellText.match(/aged\s+(\d+)/i)
  return ageMatch ? Number(ageMatch[1]) : null
}

function extractSquads(html) {
  const squads = {}
  const headingPattern = /<h3[^>]*(?:id="([^"]+)")?[^>]*>[\s\S]*?(?:<span[^>]*id="([^"]+)"[^>]*>)?[\s\S]*?<\/h3>/g
  const headings = []
  let headingMatch

  while ((headingMatch = headingPattern.exec(html))) {
    const rawName = stripTags(headingMatch[0]).replace(/^\d+(?:\.\d+)?\s*/, '')
    if (!rawName || rawName.includes('Group')) continue
    headings.push({ id: headingMatch[1] || headingMatch[2], name: rawName, index: headingMatch.index })
  }

  for (let index = 0; index < headings.length; index += 1) {
    const heading = headings[index]
    const nextIndex = headings[index + 1]?.index || html.length
    const section = html.slice(heading.index, nextIndex)
    const tableMatch = section.match(/<table[\s\S]*?<\/table>/)
    if (!tableMatch) continue

    const rows = [...tableMatch[0].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)]
    const players = []

    for (const row of rows) {
      const cells = extractCells(row[1])
      if (cells.length < 7) continue

      const no = Number(stripTags(cells[0]))
      const posRaw = stripTags(cells[1]).match(/\b(GK|DF|MF|FW)\b/)?.[1]
      const name = extractPlayerName(cells[2])
      const age = extractAge(stripTags(cells[3]))
      const caps = Number(stripTags(cells[4]))
      const goals = Number(stripTags(cells[5]))
      const club = extractClub(cells[6])

      if (!no || !posRaw || !name) continue

      players.push({
        no,
        name,
        position: positionMap[posRaw],
        club,
        age,
        caps: Number.isNaN(caps) ? null : caps,
        goals: Number.isNaN(goals) ? null : goals,
      })
    }

    if (players.length > 0) {
      squads[teamNameMap[heading.name] || heading.name] = players
    }
  }

  return squads
}

function serializeSquads(squads) {
  return `// Generated from ${SOURCE_URL}\n` +
    `// Positions use app labels: ARQ, DEF, MED, DEL.\n` +
    `export const squadSourceUrl = '${SOURCE_URL}'\n\n` +
    `export const countrySquads = ${JSON.stringify(squads, null, 2)}\n`
}

async function main() {
  const response = await fetch(SOURCE_URL, {
    headers: { 'User-Agent': 'FIFA-2026-fixture-app/1.0' },
  })

  if (!response.ok) {
    throw new Error(`Could not fetch squads: ${response.status} ${response.statusText}`)
  }

  const html = new TextDecoder('utf-8').decode(await response.arrayBuffer())
  const squads = extractSquads(html)
  fs.writeFileSync(OUTPUT_PATH, serializeSquads(squads))
  console.log(`Generated ${Object.keys(squads).length} squads at ${OUTPUT_PATH}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

#!/usr/bin/env node

import { createWriteStream } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { pipeline } from 'node:stream/promises'
import fs from 'node:fs/promises'

console.log('Fetching top CIDs')
const res = await fetch('https://orchestrator.strn.pl/top-cids')
const cids = await res.json()
const downloadedCids = []

for (const [i, cid] of cids.entries()) {
  console.log(
    `[${String(i + 1).padStart(3)}/${cids.length}] Downloading ${cid}`
  )
  let res
  const signal = AbortSignal.timeout(10_000)
  try {
    res = await fetch(`https://saturn.ms/ipfs/${cid}`, { signal })
    const ws = createWriteStream(fileURLToPath(
      new URL(`../car/${cid.split('/')[0]}.car`, import.meta.url)
    ))
    await pipeline(res.body, ws)
    downloadedCids.push(cid)
  } catch (err) {
    if (!signal.aborted) {
      throw err
    }
    console.error('Timeout!')
    continue
  }
}

await fs.writeFile(
  fileURLToPath(new URL(`../car/cids.json`, import.meta.url)),
  JSON.stringify(downloadedCids, null, 2)
)
console.log('Wrote car/cids.json')

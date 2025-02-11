import { fetchUnl } from './fetchUnl.mjs'
import 'dotenv/config'
import assert from 'assert'

const unlCacheTimeSec = 120

class UNL {
  data = {}
  hosts = []
  networkid = 0
  updated = null
  fetching = false

  constructor () {
    assert(process.env?.UNLURL, 'ENV var missing: UNLURL, containing: the URL of the Validator List')
    assert(process.env?.UNLKEY, 'ENV var missing: UNLKEY, containing: the signing (pub) key for the Validator List')
    assert(process.env?.NETWORKID, 'ENV var missing: NETWORKID, containing: the network ID (int), e.g. 0 for mainnet')

    this.networkid = Number(process.env.NETWORKID)

    this.fetch()
  }

  async refresh () {
    const timeDiffSec = Math.floor((new Date() - this.updated) / 1000)

    if (timeDiffSec > unlCacheTimeSec && !this.fetching) {
      return await this.fetch()
    }
    
    return Promise.resolve()
  }

  async fetch () {
    this.fetching = true

    try {
      const unl = await fetchUnl(process.env.UNLURL, process.env.UNLKEY)
      const unlHosts = Object.keys(unl.unl)
      console.log('Fetched UNL', process.env.UNLURL, 'found validators', unlHosts.length)

      if (unlHosts.length > 1) {
        this.data = unl
        this.hosts = unlHosts
        this.updated = new Date()
      }
    } catch (e) {
      this.fetching = false
      return e
    }

    this.fetching = false
    return
  }
}
 
const unlData = new UNL()

export {
  unlData,
}

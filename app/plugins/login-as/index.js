const browser = require('webextension-polyfill')
const axios = require("axios")
const querystring = require('querystring')
const utils = require('../../util.js')
const plugin = {
  keyword: "Login as",
  subtitle: 'Login as to shop',
  searchScope: 'Login as -',
  action,
  icon: {
    path: 'images/about-icon.svg'
  },
  failBack(keyword) {
    return [{
      keyword: `${plugin.searchScope} ${keyword}`,
      action: () => loginAs(keyword),
      icon: {
        path: 'images/blank-page-icon.svg'
      }
    }]
  },
}

console.log(Date.now())

let hints = []

browser.storage.sync.get('hintsLoginAs').then(({hintsLoginAs = []}) => {
  hints = hintsLoginAs
})

const regexUserId = /.*\/shopuser\/(\d+)\/show.*/

async function action() {
  window.failbackSearchSuggestion = plugin
  window.currentSearchSuggestions = []
  const newHints = [...new Set([...hints, plugin.searchScope])]

  if (!plugin.valid) {
    window.searchInput.value = `${plugin.searchScope} `
    window.searchResultsList.innerHTML = ""

    window.currentSearchSuggestions = newHints.map((hint) => ({
      keyword: `${hint}`,
      action: () => loginAs(hint),
      icon: {
        path: 'images/blank-page-icon.svg'
      }
    }))

    // display a message if nothing found
    if (window.currentSearchSuggestions.length !== 0) {
      utils.renderSuggestions(window.currentSearchSuggestions)
      window.suggestionElements = document.querySelectorAll('.cLauncher__suggestion')
    }

  }
}

async function loginAs(reason, shopId = null) {
  await browser.storage.sync.set({hintsLoginAs: [...new Set([...hints, reason])]})
  if (!reason) return
  try {
    const tabs = await browser.tabs.query({active: true, currentWindow: true})
    const currentTab = tabs[0]
    const [stateString] = await browser.tabs.executeScript(currentTab.id, {code: `localStorage['spotlight-ext-sbase']`})
    const state = JSON.parse(stateString)
    shopId = state.bootstrap.shopId
  } catch (e) {
    return
  }
  const resCookies = await browser.cookies.get({
    url: 'https://hive.shopbase.com',
    name: 'PHPSESSID'
  })

  const getUser = await axios.get(`https://hive.shopbase.com/admin/app/shop/${shopId}/show`, {
    headers: {
      Cookie: `PHPSESSID=${resCookies.value}`,
      "Content-Type": "application/x-www-form-urlencoded"
    }
  })

  if (getUser.request.responseURL.endsWith('/admin/login')) {
    return browser.tabs.create({url: getUser.request.responseURL})
  }

  const rs = getUser.data.match(regexUserId)

  if (!rs || !rs[1]) {
    return
  }

  const res = await axios.post(`https://hive.shopbase.com/admin/app/shopuser/${rs[1]}/login`, querystring.stringify({
    reason
  }, {
    headers: {
      Cookie: `PHPSESSID=${resCookies.value}`,
      "Content-Type": "application/x-www-form-urlencoded"
    }
  }))

  return browser.tabs.create({url: res.request.responseURL})
}

module.exports = plugin

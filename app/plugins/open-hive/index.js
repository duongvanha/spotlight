const browser = require('webextension-polyfill')
const axios = require("axios")
const querystring = require('querystring')
const utils = require('../../util.js')
const plugin = {
  keyword: "Open hive",
  subtitle: 'Open hive of the current page.',
  action: copyUrl,
  icon: {
    path: 'images/chrome-icon.svg'
  }
}

async function copyUrl() {
  let shopId = null
  try {
    const tabs = await browser.tabs.query({active: true, currentWindow: true})
    const currentTab = tabs[0]
    const [stateString] = await browser.tabs.executeScript(currentTab.id, {code: `localStorage['spotlight-ext-sbase']`})
    const state = JSON.parse(stateString)
    shopId = state.bootstrap.shopId
    browser.tabs.create({url: `https://hive.shopbase.com/admin/app/shop/${shopId}/show`})
  } catch (e) {
    return
  }
}

module.exports = plugin

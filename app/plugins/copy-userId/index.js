const browser = require('webextension-polyfill')
const axios = require("axios")
const {copyToClipboard} = require('../../util');
const plugin = {
  keyword: "Copy User Id",
  subtitle: 'Copy the User Id owner of the current page.',
  action: copyUrl,
  icon: {
    path: 'images/chrome-icon.svg'
  }
}

const regexUserId = /.*\/shopuser\/(\d+)\/show.*/

async function copyUrl() {
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

  copyToClipboard(rs[1], ev => {
    window.close();
  });
}

module.exports = plugin

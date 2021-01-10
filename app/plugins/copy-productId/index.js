const { copyToClipboard } = require('../../util');
const plugin = {
  keyword: "Copy Product Id",
  subtitle: 'Copy the Product id of the current page.',
  action: copyUrl,
  icon: {
    path: 'images/chrome-icon.svg'
  }
}

async function copyUrl() {
  try {
    const tabs = await browser.tabs.query({active: true, currentWindow: true})
    const currentTab = tabs[0]
    const [stateString] = await browser.tabs.executeScript(currentTab.id, {code: `localStorage['spotlight-ext-sbase']`})
    const state = JSON.parse(stateString)
    copyToClipboard(state.customProduct.product.id, ev => {
      window.close();
    });
  } catch (e) {
    console.error(e);
    return
  }
}

module.exports = plugin

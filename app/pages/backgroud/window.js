window.addEventListener("load", function () {
  if (window && window.__INITIAL_STATE__ && window.__INITIAL_STATE__.bootstrap && window.__INITIAL_STATE__.bootstrap.shopId) {
    localStorage.setItem('spotlight-ext-sbase', JSON.stringify(Object.assign({}, window.__INITIAL_STATE__, {
      host: window.location.host
    })))
  }
 else {
    console.log('not shopbase')
  }
});

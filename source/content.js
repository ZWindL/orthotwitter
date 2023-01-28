// import optionsStorage from './options-storage.js';

// console.log('💈 Content script loaded for', chrome.runtime.getManifest().name);

// The function evaluate Xpath
function $x(xpath) {
  return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

// Wait until an element exists
function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

// Wait until an element exists, using xpath
function waitForElmXpath(xpath) {
    return new Promise(resolve => {
        if ($x(xpath)) {
            return resolve($x(xpath));
        }

        const observer = new MutationObserver(mutations => {
            if ($x(xpath)) {
                resolve($x(xpath));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        })
    });
}

function huntXpath(xpath) {
  if ($x(xpath)) {
    const elmt = $x(xpath);
    elmt.parentNode.removeChild(elmt);
  }
}

function huntSelector(selector, parentNode=document) {
  if (parentNode.querySelector(selector)) {
    const elmt = parentNode.querySelector(selector);
    elmt.parentNode.removeChild(elmt);
  }
}

function observeXpath(xpathes) {
  const config = { attributes: true, childList: true, subtree: true };
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        xpathes.forEach(xpath => {
          huntXpath(xpath);
        });
      }
    });
  });
  observer.observe(document.body, config);
}

function observeSelector(selectors) {
  const config = { attributes: true, childList: true, subtree: true };
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        selectors.forEach(selector => {
          huntSelector(selector, mutation.target.parentNode);
        });
      }
    })
  });
  observer.observe(document.body, config);
}

const xpathes = [
  '//main//h2[@role="heading"]/parent::div/parent::div/parent::div/parent::div/parent::div/parent::div',
  // '//main//article/div/div/div/div[position()=2]/div[position()=2]/div[position()=2]/div[last()]/div/div[a/ends-with(@href, "/analytics")]',
  '//main//article/div/div/div/div[position()=2]/div[position()=2]/div[position()=2]/div[last()]/div/div[a]',
];

// function clean up UI
async function cleanUpUI() {
  observeXpath(xpathes);
}

// insert a go-back button
function insertBackButton() {
  const config = { attributes: true, childList: true, subtree: true };
  const observer = new MutationObserver(mutations => {
    mutations
      .filter(mut => mut.type === 'childList')
      .filter(mut => mut.target.matches('header[role="banner"] nav[aria-label="Primary"]'))
      .forEach(mut => {
      // const nav = document.querySelector('header[role="banner"] > div > div > div > div nav[aria-label="Primary"]');
      // const home = mutation.target.querySelector('a[href="/home"]');
      // const profile = nav.querySelector('a[aria-label="Profile"]');
      // clone the original home element
      // const back = home.cloneNode(true);
      // const path = home.querySelector('path');
      const path = mut.target.querySelector('path');
      path.setAttribute('d', 'M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z');
      // remove profile entry and insert back button
      // nav.removeChild(profile);
      // nav.prepend(back);
    })
  });
  const observerNav = new MutationObserver(mutations => {
    mutations
      .filter(mut => mut.type === 'childList')
      .filter(mut => mut.target.matches('header[role="banner"] nav[aria-label="Primary"] a[href="/home"] div'))
      .forEach(mut => {
      // const nav = document.querySelector('header[role="banner"] > div > div > div > div nav[aria-label="Primary"]');
      // const home = mutation.target.querySelector('a[href="/home"]');
      // const profile = nav.querySelector('a[aria-label="Profile"]');
      // clone the original home element
      // const back = home.cloneNode(true);
      // const path = home.querySelector('path');
      const path = mut.target.querySelector('path');
      path.setAttribute('d', 'M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z');
      // remove profile entry and insert back button
      // nav.removeChild(profile);
      // nav.prepend(back);
    })
  });
  observer.observe(document.body, config);
  observerNav.observe(document.body, config)
}

async function init() {
	// const options = await optionsStorage.getAll();
  /*
	const color = 'rgb(' + options.colorRed + ', ' + options.colorGreen + ',' + options.colorBlue + ')';
	const text = options.text;
	const notice = document.createElement('div');
	notice.innerHTML = text;
	document.body.prepend(notice);
	notice.id = 'text-notice';
	notice.style.border = '2px solid ' + color;
	notice.style.color = color;
  */
  await waitForElm('main[role="main"]');
  // clean up
  cleanUpUI();
  insertBackButton();
  // TODO: set default tab to following
  // TODO: remove the analytics button
  // TODO: make home button the go-back button
  // each tweet is an article[data-testid="tweet"]
}

init();
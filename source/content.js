import optionsStorage from './options-storage.js';

console.log('💈 Content script loaded for', chrome.runtime.getManifest().name);

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
  console.log('###### hunting ', xpath);
  if ($x(xpath)) {
    const elmt = $x(xpath);
    console.log('###### xpath found ', elmt);
    elmt.parentNode.removeChild(elmt);
  }
}

function huntSelector(selector, parentNode=document) {
  console.log('###### hunting ', selector);
  if (parentNode.querySelector(selector)) {
    const elmt = parentNode.querySelector(selector);
    console.log('###### selection found ', elmt);
    elmt.parentNode.removeChild(elmt);
  }
}

function observeXpath(xpathes) {
  const config = { attributes: true, childList: true, subtree: true };
  console.log('###### observer config ', config);
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
  console.log('###### observer config ', config);
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
];

// function clean up UI
async function cleanUpUI() {
	console.log('########################### clean up UI');
  observeXpath(xpathes);
}

async function init() {
	const options = await optionsStorage.getAll();
	const color = 'rgb(' + options.colorRed + ', ' + options.colorGreen + ',' + options.colorBlue + ')';
	const text = options.text;
	const notice = document.createElement('div');
	notice.innerHTML = text;
	document.body.prepend(notice);
	notice.id = 'text-notice';
	notice.style.border = '2px solid ' + color;
	notice.style.color = color;
  await waitForElm('main[role="main"]');
  console.log('########################### element found, clean up UI');
  // clean up
  cleanUpUI();
  // TODO: set default tab to following
  // TODO: remove the analytics button
  // TODO: make home button the go-back button
  // each tweet is an article[data-testid="tweet"]
}

init();
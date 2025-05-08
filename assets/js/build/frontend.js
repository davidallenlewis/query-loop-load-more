/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "@wordpress/dom-ready":
/*!**********************************!*\
  !*** external ["wp","domReady"] ***!
  \**********************************/
/***/ ((module) => {

module.exports = window["wp"]["domReady"];

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!***********************************!*\
  !*** ./assets/js/src/frontend.js ***!
  \***********************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_dom_ready__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/dom-ready */ "@wordpress/dom-ready");
/* harmony import */ var _wordpress_dom_ready__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_dom_ready__WEBPACK_IMPORTED_MODULE_0__);

const qllmLoadStart = new Event('qllmLoadStart');
const qllmLoadEnd = new Event('qllmLoadEnd');
const intersectionObserver = new window.IntersectionObserver(entries => {
  entries.forEach(entry => {
    // load posts
    if (entry.isIntersecting) {
      fetchPosts(entry.target);
    }
  });
}, {
  threshold: 0.5
});

/**
 * Load page from server, extract and append new posts to button's query block.
 *
 * @param {*} target
 */
const fetchPosts = target => {
  const button = target?.closest('.wp-load-more__button');
  if (!button) {
    return;
  }
  const url = button.href;
  const container = button.closest('.wp-block-query')?.querySelector('.wp-block-post-template');

  // return early if button is still loading or required data not found
  if (button.classList.contains('loading') || !container || !url) {
    return;
  }
  const fetchUrl = new URL(url, window.location.origin);

  //Not allowed to fetch from other origin
  if (fetchUrl.origin !== window.location.origin) {
    return;
  }

  //set loading text and classes
  button.classList.add('loading');

  //dispatch event
  document.dispatchEvent(qllmLoadStart);

  // Load posts via fetch from the button URL.
  fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'text/html'
    }
  }).then(function (response) {
    if (response.ok) {
      return response.text();
    }
    throw new Error('Network response was not ok.');
  }).then(function (data) {
    // create temporary container to load fetched HTML
    const temp = document.createElement('div');
    temp.innerHTML = data;

    // get region from container
    const containerRegion = container.dataset.qllmQueryRegion || '';

    // find container in fetched HTML matching container's region
    const posts = temp.querySelector(`.wp-block-post-template[data-qllm-query-region="${containerRegion}"]`);

    // append the posts
    if (posts) {
      container.insertAdjacentHTML('beforeend', posts.innerHTML);
    }
    const $button = button.closest('.wp-block-button');
    if ($button) {
      $button.classList.remove('loading');
    }
    const queryNextPage = +button.dataset.queryNextPage;
    const queryMaxPage = +button.dataset.queryMaxPage;

    //update URL
    if (button.dataset.updateUrl) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set(button.dataset.queryUrl, queryNextPage);
      window.history.pushState({}, '', newUrl);
    }

    //no more posts available -> remove button
    if (queryNextPage >= queryMaxPage) {
      if (button.classList.contains('wp-load-more__infinite-scroll')) {
        intersectionObserver.unobserve(button);
      }
      button.closest('.wp-block-buttons')?.remove();
      return;
    }

    //update button attributes
    if (queryNextPage < queryMaxPage) {
      button.dataset.queryNextPage = queryNextPage + 1;
      button.href = '?' + button.dataset.queryUrl + '=' + button.dataset.queryNextPage;
    }
  }).catch(error => {
    //eslint-disable-next-line no-console
    console.error('Fetch error:', error);
  })
  //cleanup
  .finally(() => {
    //reset loading text and classes
    button.classList.remove('loading');

    //dispatch event
    document.dispatchEvent(qllmLoadEnd);
    if (button.classList.contains('wp-load-more__infinite-scroll')) {
      const bcr = button.getBoundingClientRect();

      // fix not triggering the callback if the button is still visible
      // if button is visible - toggle observing to ensure the
      // Intersection observer triggers the callback again
      if (bcr.bottom > 0 && bcr.top < window.innerHeight) {
        intersectionObserver.unobserve(button);
        intersectionObserver.observe(button);
      }
    }
  });
};

/**
 * Setup buttons and add listeners when ready
 */
_wordpress_dom_ready__WEBPACK_IMPORTED_MODULE_0___default()(() => {
  'use strict';

  //load more buttons
  // prepare buttons and add listeners
  document.querySelectorAll('.wp-load-more__button:not(.wp-load-more__infinite-scroll)').forEach(function (button) {
    //add listener
    button.addEventListener('click', function (e) {
      e.preventDefault();
      fetchPosts(e.target);
    });
  });

  // infinite scroll
  // add listeners
  document.querySelectorAll('.wp-load-more__infinite-scroll').forEach(function (button) {
    intersectionObserver.observe(button);
  });
});
})();

/******/ })()
;
//# sourceMappingURL=frontend.js.map
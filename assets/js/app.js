/*!
 * smoothState.js is jQuery plugin that progressively enhances
 * page loads to behave more like a single-page application.
 *
 * @author  Miguel Ángel Pérez   reachme@miguel-perez.com
 * @see     http://smoothstate.com
 *
 */

(function (factory) {
    'use strict';
  
    if(typeof module === 'object' && typeof module.exports === 'object') {
      factory(require('jquery'), window, document);
    } else {
      factory(jQuery, window, document);
    }
  }(function ( $, window, document, undefined ) {
    'use strict';
  
    /** Abort if browser does not support pushState */
    if(!window.history.pushState) {
      // setup a dummy fn, but don't intercept on link clicks
      $.fn.smoothState = function() { return this; };
      $.fn.smoothState.options = {};
      return;
    }
  
    /** Abort if smoothState is already present **/
    if($.fn.smoothState) { return; }
  
    var
      /** Used later to scroll page to the top */
      $body = $('html, body'),
  
      /** Used in debug mode to console out useful warnings */
      consl = window.console,
  
      /** Plugin default options, will be exposed as $fn.smoothState.options */
      defaults = {
  
        /** If set to true, smoothState will log useful debug information instead of aborting */
        debug: false,
  
        /** jQuery selector to specify which anchors smoothState should bind to */
        anchors: 'a',
  
        /** Regex to specify which href smoothState should load. If empty, every href will be permitted. */
        hrefRegex: '',
  
        /** jQuery selector to specify which forms smoothState should bind to */
        forms: 'form',
  
        /** If set to true, smoothState will store form responses in the cache. */
        allowFormCaching: false,
  
        /** Minimum number of milliseconds between click/submit events. Events ignored beyond this rate are ignored. */
        repeatDelay: 500,
  
        /** A selector that defines what should be ignored by smoothState */
        blacklist: '.no-smoothState',
  
        /** If set to true, smoothState will prefetch a link's contents on hover */
        prefetch: false,
  
        /** The name of the event we will listen to from anchors if we're prefetching */
        prefetchOn: 'mouseover touchstart',
  
        /** jQuery selector to specify elements which should not be prefetched */
        prefetchBlacklist: '.no-prefetch',
  
        /** The response header field name defining the request's final URI. Useful for resolving redirections. */
        locationHeader: 'X-SmoothState-Location',
  
        /** The number of pages smoothState will try to store in memory */
        cacheLength: 0,
  
        /** Class that will be applied to the body while the page is loading */
        loadingClass: 'is-loading',
  
        /** Scroll to top after onStart and scroll to hash after onReady */
        scroll: true,
  
        /**
         * A function that can be used to alter the ajax request settings before it is called
         * @param  {Object} request - jQuery.ajax settings object that will be used to make the request
         * @return {Object}         Altered request object
         */
        alterRequest: function (request) {
          return request;
        },
  
        /**
         * A function that can be used to alter the state object before it is updated or added to the browsers history
         * @param  {Object} state - An object that will be assigned to history entry
         * @param  {string} title - The history entry's title. For reference only
         * @param  {string} url   - The history entry's URL. For reference only
         * @return {Object}         Altered state object
         */
        alterChangeState: function (state, title, url) {
          return state;
        },
  
        /** Run before a page load has been activated */
        onBefore: function ($currentTarget, $container) {},
  
        /** Run when a page load has been activated */
        onStart: {
          duration: 0,
          render: function ($container) {}
        },
  
        /** Run if the page request is still pending and onStart has finished animating */
        onProgress: {
          duration: 0,
          render: function ($container) {}
        },
  
        /** Run when requested content is ready to be injected into the page  */
        onReady: {
          duration: 0,
          render: function ($container, $newContent) {
            $container.html($newContent);
          }
        },
  
        /** Run when content has been injected and all animations are complete  */
        onAfter: function($container, $newContent) {}
      },
  
      /** Utility functions that are decoupled from smoothState */
      utility = {
  
        /**
         * Checks to see if the url is external
         * @param   {string}    url - url being evaluated
         * @see     http://stackoverflow.com/questions/6238351/fastest-way-to-detect-external-urls
         *
         */
        isExternal: function (url) {
          var match = url.match(/^([^:\/?#]+:)?(?:\/\/([^\/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/);
          if (typeof match[1] === 'string' && match[1].length > 0 && match[1].toLowerCase() !== window.location.protocol) {
            return true;
          }
          if (typeof match[2] === 'string' &&
            match[2].length > 0 &&
            match[2].replace(new RegExp(':(' + {'http:': 80, 'https:': 443}[window.location.protocol] +
              ')?$'), '') !== window.location.host) {
            return true;
          }
          return false;
        },
  
        /**
         * Strips the hash from a url and returns the new href
         * @param   {string}    href - url being evaluated
         *
         */
        stripHash: function(href) {
          return href.replace(/#.*/, '');
        },
  
        /**
         * Checks to see if the url is an internal hash
         * @param   {string}    href - url being evaluated
         * @param   {string}    prev - previous url (optional)
         *
         */
        isHash: function (href, prev) {
          prev = prev || window.location.href;
  
          var hasHash = (href.indexOf('#') > -1) ? true : false,
              samePath = (utility.stripHash(href) === utility.stripHash(prev)) ? true : false;
  
          return (hasHash && samePath);
        },
  
        /**
         * Translates a url string into a $.ajax settings obj
         * @param  {Object|String} request url or settings obj
         * @return {Object}        settings object
         */
        translate: function(request) {
            var defaults = {
              dataType: 'html',
              type: 'GET'
            };
            if(typeof request === 'string') {
              request = $.extend({}, defaults, { url: request });
            } else {
              request = $.extend({}, defaults, request);
            }
            return request;
        },
  
        /**
         * Checks to see if we should be loading this URL
         * @param   {string}    url - url being evaluated
         * @param   {string}    blacklist - jquery selector
         *
         */
        shouldLoadAnchor: function ($anchor, blacklist, hrefRegex) {
          var href = $anchor.prop('href');
          // URL will only be loaded if it's not an external link, hash, or
          // blacklisted
          return (
              !utility.isExternal(href) &&
              !utility.isHash(href) &&
              !$anchor.is(blacklist) &&
              !$anchor.prop('target')) &&
              (
                typeof hrefRegex === undefined ||
                hrefRegex === '' ||
                $anchor.prop('href').search(hrefRegex) !== -1
              );
        },
  
        /**
         * Resets an object if it has too many properties
         *
         * This is used to clear the 'cache' object that stores
         * all of the html. This would prevent the client from
         * running out of memory and allow the user to hit the
         * server for a fresh copy of the content.
         *
         * @param   {object}    obj
         * @param   {number}    cap
         *
         */
        clearIfOverCapacity: function (cache, cap) {
          // Polyfill Object.keys if it doesn't exist
          if (!Object.keys) {
            Object.keys = function (obj) {
              var keys = [],
                k;
              for (k in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, k)) {
                  keys.push(k);
                }
              }
              return keys;
            };
          }
  
          if (Object.keys(cache).length > cap) {
            cache = {};
          }
  
          return cache;
        },
  
        /**
         * Stores a document fragment into an object
         * @param   {object}           object - object where it will be stored
         * @param   {string}           url - name of the entry
         * @param   {string|document}  doc - entire html
         * @param   {string}           id - the id of the fragment
         * @param   {object}           [state] - the history entry's object
         * @param   {string}           [destUrl] - the destination url
         * @return  {object}           updated object store
         */
        storePageIn: function (object, url, doc, id, state, destUrl) {
          var $html = $( '<html></html>' ).append( $(doc) );
          if (typeof state === 'undefined') {
            state = {};
          }
          if (typeof destUrl === 'undefined') {
            destUrl = url;
          }
          object[url] = { // Content is indexed by the url
            status: 'loaded',
            // Stores the title of the page, .first() prevents getting svg titles
            title: $html.find('title').first().text(),
            html: $html.find('#' + id), // Stores the contents of the page
            doc: doc, // Stores the whole page document
            state: state, // Stores the history entry for comparisons,
            destUrl: destUrl // URL, which will be pushed to history stack
          };
          return object;
        },
  
        /**
         * Triggers an 'allanimationend' event when all animations are complete
         * @param   {object}    $element - jQuery object that should trigger event
         * @param   {string}    resetOn - which other events to trigger allanimationend on
         *
         */
        triggerAllAnimationEndEvent: function ($element, resetOn) {
  
          resetOn = ' ' + resetOn || '';
  
          var animationCount = 0,
            animationstart = 'animationstart webkitAnimationStart oanimationstart MSAnimationStart',
            animationend = 'animationend webkitAnimationEnd oanimationend MSAnimationEnd',
            eventname = 'allanimationend',
            onAnimationStart = function (e) {
              if ($(e.delegateTarget).is($element)) {
                e.stopPropagation();
                animationCount++;
              }
            },
            onAnimationEnd = function (e) {
              if ($(e.delegateTarget).is($element)) {
                e.stopPropagation();
                animationCount--;
                if(animationCount === 0) {
                  $element.trigger(eventname);
                }
              }
            };
  
          $element.on(animationstart, onAnimationStart);
          $element.on(animationend, onAnimationEnd);
  
          $element.on('allanimationend' + resetOn, function(){
            animationCount = 0;
            utility.redraw($element);
          });
        },
  
        /** Forces browser to redraw elements */
        redraw: function ($element) {
          $element.height();
        }
      },
  
      /** Handles the popstate event, like when the user hits 'back' */
      onPopState = function ( e ) {
        if(e.state !== null) {
          var url = window.location.href,
            $page = $('#' + e.state.id),
            page = $page.data('smoothState'),
            diffUrl = (page.href !== url && !utility.isHash(url, page.href)),
            diffState = (e.state !== page.cache[page.href].state);
  
          if(diffUrl || diffState) {
            if (diffState) {
              page.clear(page.href);
            }
            page.load(url, false);
          }
        }
      },
  
      /** Constructor function */
      Smoothstate = function ( element, options ) {
        var
          /** Container element smoothState is run on */
          $container = $(element),
  
          /** ID of the main container */
          elementId = $container.prop('id'),
  
          /** If a hash was clicked, we'll store it here so we
           *  can scroll to it once the new page has been fully
           *  loaded.
           */
          targetHash = null,
  
          /** Used to prevent fetching while we transition so
           *  that we don't mistakenly override a cache entry
           *  we need.
           */
          isTransitioning = false,
  
          /** Variable that stores pages after they are requested */
          cache = {},
  
          /** Variable that stores data for a history entry */
          state = {},
  
          /** Url of the content that is currently displayed */
          currentHref = window.location.href,
  
          /**
           * Clears a given page from the cache, if no url is provided
           * it will clear the entire cache.
           * @param  {String} url entry that is to be deleted.
           */
          clear = function(url) {
            url = url || false;
            if(url && cache.hasOwnProperty(url)) {
              delete cache[url];
            } else {
              cache = {};
            }
            $container.data('smoothState').cache = cache;
          },
  
          /**
           * Fetches the contents of a url and stores it in the 'cache' variable
           * @param  {String|Object}   request  - url or request settings object
           * @param  {Function}        callback - function that will run as soon as it finishes
           */
          fetch = function (request, callback) {
  
            // Sets a default in case a callback is not defined
            callback = callback || $.noop;
  
            // Allows us to accept a url string or object as the ajax settings
            var settings = utility.translate(request);
  
            // Check the length of the cache and clear it if needed
            cache = utility.clearIfOverCapacity(cache, options.cacheLength);
  
            // Don't prefetch if we have the content already or if it's a form
            if(cache.hasOwnProperty(settings.url) && typeof settings.data === 'undefined') {
              return;
            }
  
            // Let other parts of the code know we're working on getting the content
            cache[settings.url] = { status: 'fetching' };
  
            // Make the ajax request
            var ajaxRequest = $.ajax(settings);
  
            // Store contents in cache variable if successful
            ajaxRequest.done(function (html) {
              utility.storePageIn(cache, settings.url, html, elementId);
              $container.data('smoothState').cache = cache;
            });
  
            // Mark as error to be acted on later
            ajaxRequest.fail(function () {
              cache[settings.url].status = 'error';
            });
  
            if (options.locationHeader) {
              ajaxRequest.always(function(htmlOrXhr, status, errorOrXhr){
                // Resolve where the XHR is based on done() or fail() argument positions
                var xhr = (htmlOrXhr.statusCode ? htmlOrXhr : errorOrXhr),
                    redirectedLocation = xhr.getResponseHeader(options.locationHeader);
  
                if (redirectedLocation) {
                  cache[settings.url].destUrl = redirectedLocation;
                }
              });
            }
  
            // Call fetch callback
            if(callback) {
              ajaxRequest.always(callback);
            }
          },
  
          repositionWindow = function(){
            // Scroll to a hash anchor on destination page
            if(targetHash) {
              var $targetHashEl = $(targetHash, $container);
              if($targetHashEl.length){
                var newPosition = $targetHashEl.offset().top;
                $body.scrollTop(newPosition);
              }
              targetHash = null;
            }
          },
  
          /** Updates the contents from cache[url] */
          updateContent = function (url) {
            // If the content has been requested and is done:
            var containerId = '#' + elementId,
                $newContent = cache[url] ? $(cache[url].html.html()) : null;
  
            if($newContent.length) {
  
              // Update the title
              document.title = cache[url].title;
  
              // Update current url
              $container.data('smoothState').href = url;
  
              // Remove loading class
              if(options.loadingClass) {
                $body.removeClass(options.loadingClass);
              }
  
              // Call the onReady callback and set delay
              options.onReady.render($container, $newContent);
  
              $container.one('ss.onReadyEnd', function(){
  
                // Allow prefetches to be made again
                isTransitioning = false;
  
                // Run callback
                options.onAfter($container, $newContent);
  
                if (options.scroll) {
                  repositionWindow();
                }
                
                bindPrefetchHandlers($container);
  
              });
  
              window.setTimeout(function(){
                $container.trigger('ss.onReadyEnd');
              }, options.onReady.duration);
  
            } else if (!$newContent && options.debug && consl) {
              // Throw warning to help debug in debug mode
              consl.warn('No element with an id of ' + containerId + ' in response from ' + url + ' in ' + cache);
            } else {
              // No content availble to update with, aborting...
              window.location = url;
            }
          },
  
          /**
           * Loads the contents of a url into our container
           * @param   {string}    url
           * @param   {bool}      push - used to determine if we should
           *                      add a new item into the history object
           * @param   {bool}      cacheResponse - used to determine if
           *                      we should allow the cache to forget this
           *                      page after thid load completes.
           */
          load = function (request, push, cacheResponse) {
  
            var settings = utility.translate(request);
  
            /** Makes these optional variables by setting defaults. */
            if (typeof push === 'undefined') {
              push = true;
            }
            if (typeof cacheResponse === 'undefined') {
              cacheResponse = true;
            }
  
            var
              /** Used to check if the onProgress function has been run */
              hasRunCallback = false,
  
              callbBackEnded = false,
  
              /** List of responses for the states of the page request */
              responses = {
  
                /** Page is ready, update the content */
                loaded: function () {
                  var eventName = hasRunCallback ? 'ss.onProgressEnd' : 'ss.onStartEnd';
  
                  if (!callbBackEnded || !hasRunCallback) {
                    $container.one(eventName, function(){
                      updateContent(settings.url);
                      if (!cacheResponse) {
                        clear(settings.url);
                      }
                    });
                  }
                  else if (callbBackEnded) {
                    updateContent(settings.url);
                  }
  
                  if (push) {
                    var destUrl = cache[settings.url].destUrl;
  
                    /** Prepare a history entry */
                    state = options.alterChangeState({ id: elementId }, cache[settings.url].title, destUrl);
  
                    /** Update the cache to include the history entry for future comparisons */
                    cache[settings.url].state = state;
  
                    /** Add history entry */
                    window.history.pushState(state, cache[settings.url].title, destUrl);
                  }
  
                  if (callbBackEnded && !cacheResponse) {
                    clear(settings.url);
                  }
                },
  
                /** Loading, wait 10 ms and check again */
                fetching: function () {
  
                  if (!hasRunCallback) {
  
                    hasRunCallback = true;
  
                    // Run the onProgress callback and set trigger
                    $container.one('ss.onStartEnd', function(){
  
                      // Add loading class
                      if (options.loadingClass) {
                        $body.addClass(options.loadingClass);
                      }
  
                      options.onProgress.render($container);
  
                      window.setTimeout(function (){
                        $container.trigger('ss.onProgressEnd');
                        callbBackEnded = true;
                      }, options.onProgress.duration);
  
                    });
                  }
  
                  window.setTimeout(function () {
                    // Might of been canceled, better check!
                    if (cache.hasOwnProperty(settings.url)){
                      responses[cache[settings.url].status]();
                    }
                  }, 10);
                },
  
                /** Error, abort and redirect */
                error: function (){
                  if(options.debug && consl) {
                    consl.log('There was an error loading: ' + settings.url);
                  } else {
                    window.location = settings.url;
                  }
                }
              };
  
            if (!cache.hasOwnProperty(settings.url)) {
              fetch(settings);
            }
  
            // Run the onStart callback and set trigger
            options.onStart.render($container);
  
            window.setTimeout(function(){
              if (options.scroll) {
                $body.scrollTop(0);
              }
              $container.trigger('ss.onStartEnd');
            }, options.onStart.duration);
  
            // Start checking for the status of content
            responses[cache[settings.url].status]();
          },
  
          /**
           * Binds to the hover event of a link, used for prefetching content
           * @param   {object}    event
           */
          hoverAnchor = function (event) {
            var request,
                $anchor = $(event.currentTarget);
  
            if (utility.shouldLoadAnchor($anchor, options.blacklist, options.hrefRegex) && !isTransitioning) {
              event.stopPropagation();
              request = utility.translate($anchor.prop('href'));
              request = options.alterRequest(request);
              fetch(request);
            }
          },
  
          /**
           * Binds to the click event of a link, used to show the content
           * @param   {object}    event
           */
          clickAnchor = function (event) {
  
            // Ctrl (or Cmd) + click must open a new tab
            var $anchor = $(event.currentTarget);
            if (!event.metaKey && !event.ctrlKey && utility.shouldLoadAnchor($anchor, options.blacklist, options.hrefRegex)) {
  
              // stopPropagation so that event doesn't fire on parent containers.
              event.stopPropagation();
              event.preventDefault();
  
              // Apply rate limiting.
              if (!isRateLimited()) {
  
                // Set the delay timeout until the next event is allowed.
                setRateLimitRepeatTime();
  
                var request = utility.translate($anchor.prop('href'));
                isTransitioning = true;
                targetHash = $anchor.prop('hash');
  
                // Allows modifications to the request
                request = options.alterRequest(request);
  
                options.onBefore($anchor, $container);
  
                load(request);
              }
            }
          },
  
          /**
           * Binds to form submissions
           * @param  {Event} event
           */
          submitForm = function (event) {
            var $form = $(event.currentTarget);
  
            if (!$form.is(options.blacklist)) {
  
              event.preventDefault();
              event.stopPropagation();
  
              // Apply rate limiting.
              if (!isRateLimited()) {
  
                // Set the delay timeout until the next event is allowed.
                setRateLimitRepeatTime();
  
                var request = {
                  url: $form.prop('action'),
                  data: $form.serialize(),
                  type: $form.prop('method')
                };
  
                isTransitioning = true;
                request = options.alterRequest(request);
  
                if (request.type.toLowerCase() === 'get') {
                  request.url = request.url + '?' + request.data;
                }
  
                // Call the onReady callback and set delay
                options.onBefore($form, $container);
  
                load(request, undefined, options.allowFormCaching);
              }
            }
          },
  
          /**
           * DigitalMachinist (Jeff Rose)
           * I figured to keep these together with this above functions since they're all related.
           * Feel free to move these somewhere more appropriate if you have such places.
           */
          rateLimitRepeatTime = 0,
          isRateLimited = function () {
            var isFirstClick = (options.repeatDelay === null);
            var isDelayOver = (parseInt(Date.now()) > rateLimitRepeatTime);
            return !(isFirstClick || isDelayOver);
          },
          setRateLimitRepeatTime = function () {
            rateLimitRepeatTime = parseInt(Date.now()) + parseInt(options.repeatDelay);
          },
          
          /**
           * Binds prefetch events
           * @param   {object}    event
           */
          bindPrefetchHandlers = function ($element) {
                      
            if (options.anchors && options.prefetch) {
              $element.find(options.anchors).not(options.prefetchBlacklist).on(options.prefetchOn, null, hoverAnchor);
            }
          },
          
          /**
           * Binds all events and inits functionality
           * @param   {object}    event
           */
          bindEventHandlers = function ($element) {
  
            if (options.anchors) {
              $element.on('click', options.anchors, clickAnchor);
  
              bindPrefetchHandlers($element);
            }
  
            if (options.forms) {
              $element.on('submit', options.forms, submitForm);
            }
          },
  
          /** Restart the container's css animations */
          restartCSSAnimations = function () {
            var classes = $container.prop('class');
            $container.removeClass(classes);
            utility.redraw($container);
            $container.addClass(classes);
          };
  
        /** Merge defaults and global options into current configuration */
        options = $.extend( {}, $.fn.smoothState.options, options );
  
        /** Sets a default state */
        if(window.history.state === null) {
          state = options.alterChangeState({ id: elementId }, document.title, currentHref);
  
          /** Update history entry */
          window.history.replaceState(state, document.title, currentHref);
        } else {
          state = {};
        }
  
        /** Stores the current page in cache variable */
        utility.storePageIn(cache, currentHref, document.documentElement.outerHTML, elementId, state);
  
        /** Bind all of the event handlers on the container, not anchors */
        utility.triggerAllAnimationEndEvent($container, 'ss.onStartEnd ss.onProgressEnd ss.onEndEnd');
  
        /** Bind all of the event handlers on the container, not anchors */
        bindEventHandlers($container);
  
  
        /** Public methods */
        return {
          href: currentHref,
          cache: cache,
          clear: clear,
          load: load,
          fetch: fetch,
          restartCSSAnimations: restartCSSAnimations
        };
      },
  
      /** Returns elements with smoothState attached to it */
      declaresmoothState = function ( options ) {
        return this.each(function () {
          var tagname = this.tagName.toLowerCase();
          // Checks to make sure the smoothState element has an id and isn't already bound
          if(this.id && tagname !== 'body' && tagname !== 'html' && !$.data(this, 'smoothState')) {
            // Makes public methods available via $('element').data('smoothState');
            $.data(this, 'smoothState', new Smoothstate(this, options));
          } else if (!this.id && consl) {
            // Throw warning if in debug mode
            consl.warn('Every smoothState container needs an id but the following one does not have one:', this);
          } else if ((tagname === 'body' || tagname === 'html') && consl) {
            // We dont support making th html or the body element the smoothstate container
            consl.warn('The smoothstate container cannot be the ' + this.tagName + ' tag');
          }
        });
      };
  
    /** Sets the popstate function */
    window.onpopstate = onPopState;
  
    /** Makes utility functions public for unit tests */
    $.smoothStateUtility = utility;
  
    /** Defines the smoothState plugin */
    $.fn.smoothState = declaresmoothState;
  
    /* expose the default options */
    $.fn.smoothState.options = defaults;
  
  }));
/*
     _ _      _       _
 ___| (_) ___| | __  (_)___
/ __| | |/ __| |/ /  | / __|
\__ \ | | (__|   < _ | \__ \
|___/_|_|\___|_|\_(_)/ |___/
                   |__/

 Version: 1.8.1
  Author: Ken Wheeler
 Website: http://kenwheeler.github.io
    Docs: http://kenwheeler.github.io/slick
    Repo: http://github.com/kenwheeler/slick
  Issues: http://github.com/kenwheeler/slick/issues

 */
/* global window, document, define, jQuery, setInterval, clearInterval */
;(function(factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports !== 'undefined') {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery);
    }

}(function($) {
    'use strict';
    var Slick = window.Slick || {};

    Slick = (function() {

        var instanceUid = 0;

        function Slick(element, settings) {

            var _ = this, dataSettings;

            _.defaults = {
                accessibility: true,
                adaptiveHeight: false,
                appendArrows: $(element),
                appendDots: $(element),
                arrows: true,
                asNavFor: null,
                prevArrow: '<button class="slick-prev" aria-label="Previous" type="button">Previous</button>',
                nextArrow: '<button class="slick-next" aria-label="Next" type="button">Next</button>',
                autoplay: false,
                autoplaySpeed: 3000,
                centerMode: false,
                centerPadding: '50px',
                cssEase: 'ease',
                customPaging: function(slider, i) {
                    return $('<button type="button" />').text(i + 1);
                },
                dots: false,
                dotsClass: 'slick-dots',
                draggable: true,
                easing: 'linear',
                edgeFriction: 0.35,
                fade: false,
                focusOnSelect: false,
                focusOnChange: false,
                infinite: true,
                initialSlide: 0,
                lazyLoad: 'ondemand',
                mobileFirst: false,
                pauseOnHover: true,
                pauseOnFocus: true,
                pauseOnDotsHover: false,
                respondTo: 'window',
                responsive: null,
                rows: 1,
                rtl: false,
                slide: '',
                slidesPerRow: 1,
                slidesToShow: 1,
                slidesToScroll: 1,
                speed: 500,
                swipe: true,
                swipeToSlide: false,
                touchMove: true,
                touchThreshold: 5,
                useCSS: true,
                useTransform: true,
                variableWidth: false,
                vertical: false,
                verticalSwiping: false,
                waitForAnimate: true,
                zIndex: 1000
            };

            _.initials = {
                animating: false,
                dragging: false,
                autoPlayTimer: null,
                currentDirection: 0,
                currentLeft: null,
                currentSlide: 0,
                direction: 1,
                $dots: null,
                listWidth: null,
                listHeight: null,
                loadIndex: 0,
                $nextArrow: null,
                $prevArrow: null,
                scrolling: false,
                slideCount: null,
                slideWidth: null,
                $slideTrack: null,
                $slides: null,
                sliding: false,
                slideOffset: 0,
                swipeLeft: null,
                swiping: false,
                $list: null,
                touchObject: {},
                transformsEnabled: false,
                unslicked: false
            };

            $.extend(_, _.initials);

            _.activeBreakpoint = null;
            _.animType = null;
            _.animProp = null;
            _.breakpoints = [];
            _.breakpointSettings = [];
            _.cssTransitions = false;
            _.focussed = false;
            _.interrupted = false;
            _.hidden = 'hidden';
            _.paused = true;
            _.positionProp = null;
            _.respondTo = null;
            _.rowCount = 1;
            _.shouldClick = true;
            _.$slider = $(element);
            _.$slidesCache = null;
            _.transformType = null;
            _.transitionType = null;
            _.visibilityChange = 'visibilitychange';
            _.windowWidth = 0;
            _.windowTimer = null;

            dataSettings = $(element).data('slick') || {};

            _.options = $.extend({}, _.defaults, settings, dataSettings);

            _.currentSlide = _.options.initialSlide;

            _.originalSettings = _.options;

            if (typeof document.mozHidden !== 'undefined') {
                _.hidden = 'mozHidden';
                _.visibilityChange = 'mozvisibilitychange';
            } else if (typeof document.webkitHidden !== 'undefined') {
                _.hidden = 'webkitHidden';
                _.visibilityChange = 'webkitvisibilitychange';
            }

            _.autoPlay = $.proxy(_.autoPlay, _);
            _.autoPlayClear = $.proxy(_.autoPlayClear, _);
            _.autoPlayIterator = $.proxy(_.autoPlayIterator, _);
            _.changeSlide = $.proxy(_.changeSlide, _);
            _.clickHandler = $.proxy(_.clickHandler, _);
            _.selectHandler = $.proxy(_.selectHandler, _);
            _.setPosition = $.proxy(_.setPosition, _);
            _.swipeHandler = $.proxy(_.swipeHandler, _);
            _.dragHandler = $.proxy(_.dragHandler, _);
            _.keyHandler = $.proxy(_.keyHandler, _);

            _.instanceUid = instanceUid++;

            // A simple way to check for HTML strings
            // Strict HTML recognition (must start with <)
            // Extracted from jQuery v1.11 source
            _.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/;


            _.registerBreakpoints();
            _.init(true);

        }

        return Slick;

    }());

    Slick.prototype.activateADA = function() {
        var _ = this;

        _.$slideTrack.find('.slick-active').attr({
            'aria-hidden': 'false'
        }).find('a, input, button, select').attr({
            'tabindex': '0'
        });

    };

    Slick.prototype.addSlide = Slick.prototype.slickAdd = function(markup, index, addBefore) {

        var _ = this;

        if (typeof(index) === 'boolean') {
            addBefore = index;
            index = null;
        } else if (index < 0 || (index >= _.slideCount)) {
            return false;
        }

        _.unload();

        if (typeof(index) === 'number') {
            if (index === 0 && _.$slides.length === 0) {
                $(markup).appendTo(_.$slideTrack);
            } else if (addBefore) {
                $(markup).insertBefore(_.$slides.eq(index));
            } else {
                $(markup).insertAfter(_.$slides.eq(index));
            }
        } else {
            if (addBefore === true) {
                $(markup).prependTo(_.$slideTrack);
            } else {
                $(markup).appendTo(_.$slideTrack);
            }
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slides.each(function(index, element) {
            $(element).attr('data-slick-index', index);
        });

        _.$slidesCache = _.$slides;

        _.reinit();

    };

    Slick.prototype.animateHeight = function() {
        var _ = this;
        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.animate({
                height: targetHeight
            }, _.options.speed);
        }
    };

    Slick.prototype.animateSlide = function(targetLeft, callback) {

        var animProps = {},
            _ = this;

        _.animateHeight();

        if (_.options.rtl === true && _.options.vertical === false) {
            targetLeft = -targetLeft;
        }
        if (_.transformsEnabled === false) {
            if (_.options.vertical === false) {
                _.$slideTrack.animate({
                    left: targetLeft
                }, _.options.speed, _.options.easing, callback);
            } else {
                _.$slideTrack.animate({
                    top: targetLeft
                }, _.options.speed, _.options.easing, callback);
            }

        } else {

            if (_.cssTransitions === false) {
                if (_.options.rtl === true) {
                    _.currentLeft = -(_.currentLeft);
                }
                $({
                    animStart: _.currentLeft
                }).animate({
                    animStart: targetLeft
                }, {
                    duration: _.options.speed,
                    easing: _.options.easing,
                    step: function(now) {
                        now = Math.ceil(now);
                        if (_.options.vertical === false) {
                            animProps[_.animType] = 'translate(' +
                                now + 'px, 0px)';
                            _.$slideTrack.css(animProps);
                        } else {
                            animProps[_.animType] = 'translate(0px,' +
                                now + 'px)';
                            _.$slideTrack.css(animProps);
                        }
                    },
                    complete: function() {
                        if (callback) {
                            callback.call();
                        }
                    }
                });

            } else {

                _.applyTransition();
                targetLeft = Math.ceil(targetLeft);

                if (_.options.vertical === false) {
                    animProps[_.animType] = 'translate3d(' + targetLeft + 'px, 0px, 0px)';
                } else {
                    animProps[_.animType] = 'translate3d(0px,' + targetLeft + 'px, 0px)';
                }
                _.$slideTrack.css(animProps);

                if (callback) {
                    setTimeout(function() {

                        _.disableTransition();

                        callback.call();
                    }, _.options.speed);
                }

            }

        }

    };

    Slick.prototype.getNavTarget = function() {

        var _ = this,
            asNavFor = _.options.asNavFor;

        if ( asNavFor && asNavFor !== null ) {
            asNavFor = $(asNavFor).not(_.$slider);
        }

        return asNavFor;

    };

    Slick.prototype.asNavFor = function(index) {

        var _ = this,
            asNavFor = _.getNavTarget();

        if ( asNavFor !== null && typeof asNavFor === 'object' ) {
            asNavFor.each(function() {
                var target = $(this).slick('getSlick');
                if(!target.unslicked) {
                    target.slideHandler(index, true);
                }
            });
        }

    };

    Slick.prototype.applyTransition = function(slide) {

        var _ = this,
            transition = {};

        if (_.options.fade === false) {
            transition[_.transitionType] = _.transformType + ' ' + _.options.speed + 'ms ' + _.options.cssEase;
        } else {
            transition[_.transitionType] = 'opacity ' + _.options.speed + 'ms ' + _.options.cssEase;
        }

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }

    };

    Slick.prototype.autoPlay = function() {

        var _ = this;

        _.autoPlayClear();

        if ( _.slideCount > _.options.slidesToShow ) {
            _.autoPlayTimer = setInterval( _.autoPlayIterator, _.options.autoplaySpeed );
        }

    };

    Slick.prototype.autoPlayClear = function() {

        var _ = this;

        if (_.autoPlayTimer) {
            clearInterval(_.autoPlayTimer);
        }

    };

    Slick.prototype.autoPlayIterator = function() {

        var _ = this,
            slideTo = _.currentSlide + _.options.slidesToScroll;

        if ( !_.paused && !_.interrupted && !_.focussed ) {

            if ( _.options.infinite === false ) {

                if ( _.direction === 1 && ( _.currentSlide + 1 ) === ( _.slideCount - 1 )) {
                    _.direction = 0;
                }

                else if ( _.direction === 0 ) {

                    slideTo = _.currentSlide - _.options.slidesToScroll;

                    if ( _.currentSlide - 1 === 0 ) {
                        _.direction = 1;
                    }

                }

            }

            _.slideHandler( slideTo );

        }

    };

    Slick.prototype.buildArrows = function() {

        var _ = this;

        if (_.options.arrows === true ) {

            _.$prevArrow = $(_.options.prevArrow).addClass('slick-arrow');
            _.$nextArrow = $(_.options.nextArrow).addClass('slick-arrow');

            if( _.slideCount > _.options.slidesToShow ) {

                _.$prevArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');
                _.$nextArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');

                if (_.htmlExpr.test(_.options.prevArrow)) {
                    _.$prevArrow.prependTo(_.options.appendArrows);
                }

                if (_.htmlExpr.test(_.options.nextArrow)) {
                    _.$nextArrow.appendTo(_.options.appendArrows);
                }

                if (_.options.infinite !== true) {
                    _.$prevArrow
                        .addClass('slick-disabled')
                        .attr('aria-disabled', 'true');
                }

            } else {

                _.$prevArrow.add( _.$nextArrow )

                    .addClass('slick-hidden')
                    .attr({
                        'aria-disabled': 'true',
                        'tabindex': '-1'
                    });

            }

        }

    };

    Slick.prototype.buildDots = function() {

        var _ = this,
            i, dot;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$slider.addClass('slick-dotted');

            dot = $('<ul />').addClass(_.options.dotsClass);

            for (i = 0; i <= _.getDotCount(); i += 1) {
                dot.append($('<li />').append(_.options.customPaging.call(this, _, i)));
            }

            _.$dots = dot.appendTo(_.options.appendDots);

            _.$dots.find('li').first().addClass('slick-active');

        }

    };

    Slick.prototype.buildOut = function() {

        var _ = this;

        _.$slides =
            _.$slider
                .children( _.options.slide + ':not(.slick-cloned)')
                .addClass('slick-slide');

        _.slideCount = _.$slides.length;

        _.$slides.each(function(index, element) {
            $(element)
                .attr('data-slick-index', index)
                .data('originalStyling', $(element).attr('style') || '');
        });

        _.$slider.addClass('slick-slider');

        _.$slideTrack = (_.slideCount === 0) ?
            $('<div class="slick-track"/>').appendTo(_.$slider) :
            _.$slides.wrapAll('<div class="slick-track"/>').parent();

        _.$list = _.$slideTrack.wrap(
            '<div class="slick-list"/>').parent();
        _.$slideTrack.css('opacity', 0);

        if (_.options.centerMode === true || _.options.swipeToSlide === true) {
            _.options.slidesToScroll = 1;
        }

        $('img[data-lazy]', _.$slider).not('[src]').addClass('slick-loading');

        _.setupInfinite();

        _.buildArrows();

        _.buildDots();

        _.updateDots();


        _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

        if (_.options.draggable === true) {
            _.$list.addClass('draggable');
        }

    };

    Slick.prototype.buildRows = function() {

        var _ = this, a, b, c, newSlides, numOfSlides, originalSlides,slidesPerSection;

        newSlides = document.createDocumentFragment();
        originalSlides = _.$slider.children();

        if(_.options.rows > 0) {

            slidesPerSection = _.options.slidesPerRow * _.options.rows;
            numOfSlides = Math.ceil(
                originalSlides.length / slidesPerSection
            );

            for(a = 0; a < numOfSlides; a++){
                var slide = document.createElement('div');
                for(b = 0; b < _.options.rows; b++) {
                    var row = document.createElement('div');
                    for(c = 0; c < _.options.slidesPerRow; c++) {
                        var target = (a * slidesPerSection + ((b * _.options.slidesPerRow) + c));
                        if (originalSlides.get(target)) {
                            row.appendChild(originalSlides.get(target));
                        }
                    }
                    slide.appendChild(row);
                }
                newSlides.appendChild(slide);
            }

            _.$slider.empty().append(newSlides);
            _.$slider.children().children().children()
                .css({
                    'width':(100 / _.options.slidesPerRow) + '%',
                    'display': 'inline-block'
                });

        }

    };

    Slick.prototype.checkResponsive = function(initial, forceUpdate) {

        var _ = this,
            breakpoint, targetBreakpoint, respondToWidth, triggerBreakpoint = false;
        var sliderWidth = _.$slider.width();
        var windowWidth = window.innerWidth || $(window).width();

        if (_.respondTo === 'window') {
            respondToWidth = windowWidth;
        } else if (_.respondTo === 'slider') {
            respondToWidth = sliderWidth;
        } else if (_.respondTo === 'min') {
            respondToWidth = Math.min(windowWidth, sliderWidth);
        }

        if ( _.options.responsive &&
            _.options.responsive.length &&
            _.options.responsive !== null) {

            targetBreakpoint = null;

            for (breakpoint in _.breakpoints) {
                if (_.breakpoints.hasOwnProperty(breakpoint)) {
                    if (_.originalSettings.mobileFirst === false) {
                        if (respondToWidth < _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    } else {
                        if (respondToWidth > _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    }
                }
            }

            if (targetBreakpoint !== null) {
                if (_.activeBreakpoint !== null) {
                    if (targetBreakpoint !== _.activeBreakpoint || forceUpdate) {
                        _.activeBreakpoint =
                            targetBreakpoint;
                        if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                            _.unslick(targetBreakpoint);
                        } else {
                            _.options = $.extend({}, _.originalSettings,
                                _.breakpointSettings[
                                    targetBreakpoint]);
                            if (initial === true) {
                                _.currentSlide = _.options.initialSlide;
                            }
                            _.refresh(initial);
                        }
                        triggerBreakpoint = targetBreakpoint;
                    }
                } else {
                    _.activeBreakpoint = targetBreakpoint;
                    if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                        _.unslick(targetBreakpoint);
                    } else {
                        _.options = $.extend({}, _.originalSettings,
                            _.breakpointSettings[
                                targetBreakpoint]);
                        if (initial === true) {
                            _.currentSlide = _.options.initialSlide;
                        }
                        _.refresh(initial);
                    }
                    triggerBreakpoint = targetBreakpoint;
                }
            } else {
                if (_.activeBreakpoint !== null) {
                    _.activeBreakpoint = null;
                    _.options = _.originalSettings;
                    if (initial === true) {
                        _.currentSlide = _.options.initialSlide;
                    }
                    _.refresh(initial);
                    triggerBreakpoint = targetBreakpoint;
                }
            }

            // only trigger breakpoints during an actual break. not on initialize.
            if( !initial && triggerBreakpoint !== false ) {
                _.$slider.trigger('breakpoint', [_, triggerBreakpoint]);
            }
        }

    };

    Slick.prototype.changeSlide = function(event, dontAnimate) {

        var _ = this,
            $target = $(event.currentTarget),
            indexOffset, slideOffset, unevenOffset;

        // If target is a link, prevent default action.
        if($target.is('a')) {
            event.preventDefault();
        }

        // If target is not the <li> element (ie: a child), find the <li>.
        if(!$target.is('li')) {
            $target = $target.closest('li');
        }

        unevenOffset = (_.slideCount % _.options.slidesToScroll !== 0);
        indexOffset = unevenOffset ? 0 : (_.slideCount - _.currentSlide) % _.options.slidesToScroll;

        switch (event.data.message) {

            case 'previous':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : _.options.slidesToShow - indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide - slideOffset, false, dontAnimate);
                }
                break;

            case 'next':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide + slideOffset, false, dontAnimate);
                }
                break;

            case 'index':
                var index = event.data.index === 0 ? 0 :
                    event.data.index || $target.index() * _.options.slidesToScroll;

                _.slideHandler(_.checkNavigable(index), false, dontAnimate);
                $target.children().trigger('focus');
                break;

            default:
                return;
        }

    };

    Slick.prototype.checkNavigable = function(index) {

        var _ = this,
            navigables, prevNavigable;

        navigables = _.getNavigableIndexes();
        prevNavigable = 0;
        if (index > navigables[navigables.length - 1]) {
            index = navigables[navigables.length - 1];
        } else {
            for (var n in navigables) {
                if (index < navigables[n]) {
                    index = prevNavigable;
                    break;
                }
                prevNavigable = navigables[n];
            }
        }

        return index;
    };

    Slick.prototype.cleanUpEvents = function() {

        var _ = this;

        if (_.options.dots && _.$dots !== null) {

            $('li', _.$dots)
                .off('click.slick', _.changeSlide)
                .off('mouseenter.slick', $.proxy(_.interrupt, _, true))
                .off('mouseleave.slick', $.proxy(_.interrupt, _, false));

            if (_.options.accessibility === true) {
                _.$dots.off('keydown.slick', _.keyHandler);
            }
        }

        _.$slider.off('focus.slick blur.slick');

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow && _.$prevArrow.off('click.slick', _.changeSlide);
            _.$nextArrow && _.$nextArrow.off('click.slick', _.changeSlide);

            if (_.options.accessibility === true) {
                _.$prevArrow && _.$prevArrow.off('keydown.slick', _.keyHandler);
                _.$nextArrow && _.$nextArrow.off('keydown.slick', _.keyHandler);
            }
        }

        _.$list.off('touchstart.slick mousedown.slick', _.swipeHandler);
        _.$list.off('touchmove.slick mousemove.slick', _.swipeHandler);
        _.$list.off('touchend.slick mouseup.slick', _.swipeHandler);
        _.$list.off('touchcancel.slick mouseleave.slick', _.swipeHandler);

        _.$list.off('click.slick', _.clickHandler);

        $(document).off(_.visibilityChange, _.visibility);

        _.cleanUpSlideEvents();

        if (_.options.accessibility === true) {
            _.$list.off('keydown.slick', _.keyHandler);
        }

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().off('click.slick', _.selectHandler);
        }

        $(window).off('orientationchange.slick.slick-' + _.instanceUid, _.orientationChange);

        $(window).off('resize.slick.slick-' + _.instanceUid, _.resize);

        $('[draggable!=true]', _.$slideTrack).off('dragstart', _.preventDefault);

        $(window).off('load.slick.slick-' + _.instanceUid, _.setPosition);

    };

    Slick.prototype.cleanUpSlideEvents = function() {

        var _ = this;

        _.$list.off('mouseenter.slick', $.proxy(_.interrupt, _, true));
        _.$list.off('mouseleave.slick', $.proxy(_.interrupt, _, false));

    };

    Slick.prototype.cleanUpRows = function() {

        var _ = this, originalSlides;

        if(_.options.rows > 0) {
            originalSlides = _.$slides.children().children();
            originalSlides.removeAttr('style');
            _.$slider.empty().append(originalSlides);
        }

    };

    Slick.prototype.clickHandler = function(event) {

        var _ = this;

        if (_.shouldClick === false) {
            event.stopImmediatePropagation();
            event.stopPropagation();
            event.preventDefault();
        }

    };

    Slick.prototype.destroy = function(refresh) {

        var _ = this;

        _.autoPlayClear();

        _.touchObject = {};

        _.cleanUpEvents();

        $('.slick-cloned', _.$slider).detach();

        if (_.$dots) {
            _.$dots.remove();
        }

        if ( _.$prevArrow && _.$prevArrow.length ) {

            _.$prevArrow
                .removeClass('slick-disabled slick-arrow slick-hidden')
                .removeAttr('aria-hidden aria-disabled tabindex')
                .css('display','');

            if ( _.htmlExpr.test( _.options.prevArrow )) {
                _.$prevArrow.remove();
            }
        }

        if ( _.$nextArrow && _.$nextArrow.length ) {

            _.$nextArrow
                .removeClass('slick-disabled slick-arrow slick-hidden')
                .removeAttr('aria-hidden aria-disabled tabindex')
                .css('display','');

            if ( _.htmlExpr.test( _.options.nextArrow )) {
                _.$nextArrow.remove();
            }
        }


        if (_.$slides) {

            _.$slides
                .removeClass('slick-slide slick-active slick-center slick-visible slick-current')
                .removeAttr('aria-hidden')
                .removeAttr('data-slick-index')
                .each(function(){
                    $(this).attr('style', $(this).data('originalStyling'));
                });

            _.$slideTrack.children(this.options.slide).detach();

            _.$slideTrack.detach();

            _.$list.detach();

            _.$slider.append(_.$slides);
        }

        _.cleanUpRows();

        _.$slider.removeClass('slick-slider');
        _.$slider.removeClass('slick-initialized');
        _.$slider.removeClass('slick-dotted');

        _.unslicked = true;

        if(!refresh) {
            _.$slider.trigger('destroy', [_]);
        }

    };

    Slick.prototype.disableTransition = function(slide) {

        var _ = this,
            transition = {};

        transition[_.transitionType] = '';

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }

    };

    Slick.prototype.fadeSlide = function(slideIndex, callback) {

        var _ = this;

        if (_.cssTransitions === false) {

            _.$slides.eq(slideIndex).css({
                zIndex: _.options.zIndex
            });

            _.$slides.eq(slideIndex).animate({
                opacity: 1
            }, _.options.speed, _.options.easing, callback);

        } else {

            _.applyTransition(slideIndex);

            _.$slides.eq(slideIndex).css({
                opacity: 1,
                zIndex: _.options.zIndex
            });

            if (callback) {
                setTimeout(function() {

                    _.disableTransition(slideIndex);

                    callback.call();
                }, _.options.speed);
            }

        }

    };

    Slick.prototype.fadeSlideOut = function(slideIndex) {

        var _ = this;

        if (_.cssTransitions === false) {

            _.$slides.eq(slideIndex).animate({
                opacity: 0,
                zIndex: _.options.zIndex - 2
            }, _.options.speed, _.options.easing);

        } else {

            _.applyTransition(slideIndex);

            _.$slides.eq(slideIndex).css({
                opacity: 0,
                zIndex: _.options.zIndex - 2
            });

        }

    };

    Slick.prototype.filterSlides = Slick.prototype.slickFilter = function(filter) {

        var _ = this;

        if (filter !== null) {

            _.$slidesCache = _.$slides;

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.filter(filter).appendTo(_.$slideTrack);

            _.reinit();

        }

    };

    Slick.prototype.focusHandler = function() {

        var _ = this;

        _.$slider
            .off('focus.slick blur.slick')
            .on('focus.slick blur.slick', '*', function(event) {

            event.stopImmediatePropagation();
            var $sf = $(this);

            setTimeout(function() {

                if( _.options.pauseOnFocus ) {
                    _.focussed = $sf.is(':focus');
                    _.autoPlay();
                }

            }, 0);

        });
    };

    Slick.prototype.getCurrent = Slick.prototype.slickCurrentSlide = function() {

        var _ = this;
        return _.currentSlide;

    };

    Slick.prototype.getDotCount = function() {

        var _ = this;

        var breakPoint = 0;
        var counter = 0;
        var pagerQty = 0;

        if (_.options.infinite === true) {
            if (_.slideCount <= _.options.slidesToShow) {
                 ++pagerQty;
            } else {
                while (breakPoint < _.slideCount) {
                    ++pagerQty;
                    breakPoint = counter + _.options.slidesToScroll;
                    counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
                }
            }
        } else if (_.options.centerMode === true) {
            pagerQty = _.slideCount;
        } else if(!_.options.asNavFor) {
            pagerQty = 1 + Math.ceil((_.slideCount - _.options.slidesToShow) / _.options.slidesToScroll);
        }else {
            while (breakPoint < _.slideCount) {
                ++pagerQty;
                breakPoint = counter + _.options.slidesToScroll;
                counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
            }
        }

        return pagerQty - 1;

    };

    Slick.prototype.getLeft = function(slideIndex) {

        var _ = this,
            targetLeft,
            verticalHeight,
            verticalOffset = 0,
            targetSlide,
            coef;

        _.slideOffset = 0;
        verticalHeight = _.$slides.first().outerHeight(true);

        if (_.options.infinite === true) {
            if (_.slideCount > _.options.slidesToShow) {
                _.slideOffset = (_.slideWidth * _.options.slidesToShow) * -1;
                coef = -1

                if (_.options.vertical === true && _.options.centerMode === true) {
                    if (_.options.slidesToShow === 2) {
                        coef = -1.5;
                    } else if (_.options.slidesToShow === 1) {
                        coef = -2
                    }
                }
                verticalOffset = (verticalHeight * _.options.slidesToShow) * coef;
            }
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
                    if (slideIndex > _.slideCount) {
                        _.slideOffset = ((_.options.slidesToShow - (slideIndex - _.slideCount)) * _.slideWidth) * -1;
                        verticalOffset = ((_.options.slidesToShow - (slideIndex - _.slideCount)) * verticalHeight) * -1;
                    } else {
                        _.slideOffset = ((_.slideCount % _.options.slidesToScroll) * _.slideWidth) * -1;
                        verticalOffset = ((_.slideCount % _.options.slidesToScroll) * verticalHeight) * -1;
                    }
                }
            }
        } else {
            if (slideIndex + _.options.slidesToShow > _.slideCount) {
                _.slideOffset = ((slideIndex + _.options.slidesToShow) - _.slideCount) * _.slideWidth;
                verticalOffset = ((slideIndex + _.options.slidesToShow) - _.slideCount) * verticalHeight;
            }
        }

        if (_.slideCount <= _.options.slidesToShow) {
            _.slideOffset = 0;
            verticalOffset = 0;
        }

        if (_.options.centerMode === true && _.slideCount <= _.options.slidesToShow) {
            _.slideOffset = ((_.slideWidth * Math.floor(_.options.slidesToShow)) / 2) - ((_.slideWidth * _.slideCount) / 2);
        } else if (_.options.centerMode === true && _.options.infinite === true) {
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth;
        } else if (_.options.centerMode === true) {
            _.slideOffset = 0;
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2);
        }

        if (_.options.vertical === false) {
            targetLeft = ((slideIndex * _.slideWidth) * -1) + _.slideOffset;
        } else {
            targetLeft = ((slideIndex * verticalHeight) * -1) + verticalOffset;
        }

        if (_.options.variableWidth === true) {

            if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
            } else {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow);
            }

            if (_.options.rtl === true) {
                if (targetSlide[0]) {
                    targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
                } else {
                    targetLeft =  0;
                }
            } else {
                targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
            }

            if (_.options.centerMode === true) {
                if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
                } else {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow + 1);
                }

                if (_.options.rtl === true) {
                    if (targetSlide[0]) {
                        targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
                    } else {
                        targetLeft =  0;
                    }
                } else {
                    targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
                }

                targetLeft += (_.$list.width() - targetSlide.outerWidth()) / 2;
            }
        }

        return targetLeft;

    };

    Slick.prototype.getOption = Slick.prototype.slickGetOption = function(option) {

        var _ = this;

        return _.options[option];

    };

    Slick.prototype.getNavigableIndexes = function() {

        var _ = this,
            breakPoint = 0,
            counter = 0,
            indexes = [],
            max;

        if (_.options.infinite === false) {
            max = _.slideCount;
        } else {
            breakPoint = _.options.slidesToScroll * -1;
            counter = _.options.slidesToScroll * -1;
            max = _.slideCount * 2;
        }

        while (breakPoint < max) {
            indexes.push(breakPoint);
            breakPoint = counter + _.options.slidesToScroll;
            counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
        }

        return indexes;

    };

    Slick.prototype.getSlick = function() {

        return this;

    };

    Slick.prototype.getSlideCount = function() {

        var _ = this,
            slidesTraversed, swipedSlide, centerOffset;

        centerOffset = _.options.centerMode === true ? _.slideWidth * Math.floor(_.options.slidesToShow / 2) : 0;

        if (_.options.swipeToSlide === true) {
            _.$slideTrack.find('.slick-slide').each(function(index, slide) {
                if (slide.offsetLeft - centerOffset + ($(slide).outerWidth() / 2) > (_.swipeLeft * -1)) {
                    swipedSlide = slide;
                    return false;
                }
            });

            slidesTraversed = Math.abs($(swipedSlide).attr('data-slick-index') - _.currentSlide) || 1;

            return slidesTraversed;

        } else {
            return _.options.slidesToScroll;
        }

    };

    Slick.prototype.goTo = Slick.prototype.slickGoTo = function(slide, dontAnimate) {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'index',
                index: parseInt(slide)
            }
        }, dontAnimate);

    };

    Slick.prototype.init = function(creation) {

        var _ = this;

        if (!$(_.$slider).hasClass('slick-initialized')) {

            $(_.$slider).addClass('slick-initialized');

            _.buildRows();
            _.buildOut();
            _.setProps();
            _.startLoad();
            _.loadSlider();
            _.initializeEvents();
            _.updateArrows();
            _.updateDots();
            _.checkResponsive(true);
            _.focusHandler();

        }

        if (creation) {
            _.$slider.trigger('init', [_]);
        }

        if (_.options.accessibility === true) {
            _.initADA();
        }

        if ( _.options.autoplay ) {

            _.paused = false;
            _.autoPlay();

        }

    };

    Slick.prototype.initADA = function() {
        var _ = this,
                numDotGroups = Math.ceil(_.slideCount / _.options.slidesToShow),
                tabControlIndexes = _.getNavigableIndexes().filter(function(val) {
                    return (val >= 0) && (val < _.slideCount);
                });

        _.$slides.add(_.$slideTrack.find('.slick-cloned')).attr({
            'aria-hidden': 'true',
            'tabindex': '-1'
        }).find('a, input, button, select').attr({
            'tabindex': '-1'
        });

        if (_.$dots !== null) {
            _.$slides.not(_.$slideTrack.find('.slick-cloned')).each(function(i) {
                var slideControlIndex = tabControlIndexes.indexOf(i);

                $(this).attr({
                    'role': 'tabpanel',
                    'id': 'slick-slide' + _.instanceUid + i,
                    'tabindex': -1
                });

                if (slideControlIndex !== -1) {
                   var ariaButtonControl = 'slick-slide-control' + _.instanceUid + slideControlIndex
                   if ($('#' + ariaButtonControl).length) {
                     $(this).attr({
                         'aria-describedby': ariaButtonControl
                     });
                   }
                }
            });

            _.$dots.attr('role', 'tablist').find('li').each(function(i) {
                var mappedSlideIndex = tabControlIndexes[i];

                $(this).attr({
                    'role': 'presentation'
                });

                $(this).find('button').first().attr({
                    'role': 'tab',
                    'id': 'slick-slide-control' + _.instanceUid + i,
                    'aria-controls': 'slick-slide' + _.instanceUid + mappedSlideIndex,
                    'aria-label': (i + 1) + ' of ' + numDotGroups,
                    'aria-selected': null,
                    'tabindex': '-1'
                });

            }).eq(_.currentSlide).find('button').attr({
                'aria-selected': 'true',
                'tabindex': '0'
            }).end();
        }

        for (var i=_.currentSlide, max=i+_.options.slidesToShow; i < max; i++) {
          if (_.options.focusOnChange) {
            _.$slides.eq(i).attr({'tabindex': '0'});
          } else {
            _.$slides.eq(i).removeAttr('tabindex');
          }
        }

        _.activateADA();

    };

    Slick.prototype.initArrowEvents = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow
               .off('click.slick')
               .on('click.slick', {
                    message: 'previous'
               }, _.changeSlide);
            _.$nextArrow
               .off('click.slick')
               .on('click.slick', {
                    message: 'next'
               }, _.changeSlide);

            if (_.options.accessibility === true) {
                _.$prevArrow.on('keydown.slick', _.keyHandler);
                _.$nextArrow.on('keydown.slick', _.keyHandler);
            }
        }

    };

    Slick.prototype.initDotEvents = function() {

        var _ = this;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
            $('li', _.$dots).on('click.slick', {
                message: 'index'
            }, _.changeSlide);

            if (_.options.accessibility === true) {
                _.$dots.on('keydown.slick', _.keyHandler);
            }
        }

        if (_.options.dots === true && _.options.pauseOnDotsHover === true && _.slideCount > _.options.slidesToShow) {

            $('li', _.$dots)
                .on('mouseenter.slick', $.proxy(_.interrupt, _, true))
                .on('mouseleave.slick', $.proxy(_.interrupt, _, false));

        }

    };

    Slick.prototype.initSlideEvents = function() {

        var _ = this;

        if ( _.options.pauseOnHover ) {

            _.$list.on('mouseenter.slick', $.proxy(_.interrupt, _, true));
            _.$list.on('mouseleave.slick', $.proxy(_.interrupt, _, false));

        }

    };

    Slick.prototype.initializeEvents = function() {

        var _ = this;

        _.initArrowEvents();

        _.initDotEvents();
        _.initSlideEvents();

        _.$list.on('touchstart.slick mousedown.slick', {
            action: 'start'
        }, _.swipeHandler);
        _.$list.on('touchmove.slick mousemove.slick', {
            action: 'move'
        }, _.swipeHandler);
        _.$list.on('touchend.slick mouseup.slick', {
            action: 'end'
        }, _.swipeHandler);
        _.$list.on('touchcancel.slick mouseleave.slick', {
            action: 'end'
        }, _.swipeHandler);

        _.$list.on('click.slick', _.clickHandler);

        $(document).on(_.visibilityChange, $.proxy(_.visibility, _));

        if (_.options.accessibility === true) {
            _.$list.on('keydown.slick', _.keyHandler);
        }

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on('click.slick', _.selectHandler);
        }

        $(window).on('orientationchange.slick.slick-' + _.instanceUid, $.proxy(_.orientationChange, _));

        $(window).on('resize.slick.slick-' + _.instanceUid, $.proxy(_.resize, _));

        $('[draggable!=true]', _.$slideTrack).on('dragstart', _.preventDefault);

        $(window).on('load.slick.slick-' + _.instanceUid, _.setPosition);
        $(_.setPosition);

    };

    Slick.prototype.initUI = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.show();
            _.$nextArrow.show();

        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.show();

        }

    };

    Slick.prototype.keyHandler = function(event) {

        var _ = this;
         //Dont slide if the cursor is inside the form fields and arrow keys are pressed
        if(!event.target.tagName.match('TEXTAREA|INPUT|SELECT')) {
            if (event.keyCode === 37 && _.options.accessibility === true) {
                _.changeSlide({
                    data: {
                        message: _.options.rtl === true ? 'next' :  'previous'
                    }
                });
            } else if (event.keyCode === 39 && _.options.accessibility === true) {
                _.changeSlide({
                    data: {
                        message: _.options.rtl === true ? 'previous' : 'next'
                    }
                });
            }
        }

    };

    Slick.prototype.lazyLoad = function() {

        var _ = this,
            loadRange, cloneRange, rangeStart, rangeEnd;

        function loadImages(imagesScope) {

            $('img[data-lazy]', imagesScope).each(function() {

                var image = $(this),
                    imageSource = $(this).attr('data-lazy'),
                    imageSrcSet = $(this).attr('data-srcset'),
                    imageSizes  = $(this).attr('data-sizes') || _.$slider.attr('data-sizes'),
                    imageToLoad = document.createElement('img');

                imageToLoad.onload = function() {

                    image
                        .animate({ opacity: 0 }, 100, function() {

                            if (imageSrcSet) {
                                image
                                    .attr('srcset', imageSrcSet );

                                if (imageSizes) {
                                    image
                                        .attr('sizes', imageSizes );
                                }
                            }

                            image
                                .attr('src', imageSource)
                                .animate({ opacity: 1 }, 200, function() {
                                    image
                                        .removeAttr('data-lazy data-srcset data-sizes')
                                        .removeClass('slick-loading');
                                });
                            _.$slider.trigger('lazyLoaded', [_, image, imageSource]);
                        });

                };

                imageToLoad.onerror = function() {

                    image
                        .removeAttr( 'data-lazy' )
                        .removeClass( 'slick-loading' )
                        .addClass( 'slick-lazyload-error' );

                    _.$slider.trigger('lazyLoadError', [ _, image, imageSource ]);

                };

                imageToLoad.src = imageSource;

            });

        }

        if (_.options.centerMode === true) {
            if (_.options.infinite === true) {
                rangeStart = _.currentSlide + (_.options.slidesToShow / 2 + 1);
                rangeEnd = rangeStart + _.options.slidesToShow + 2;
            } else {
                rangeStart = Math.max(0, _.currentSlide - (_.options.slidesToShow / 2 + 1));
                rangeEnd = 2 + (_.options.slidesToShow / 2 + 1) + _.currentSlide;
            }
        } else {
            rangeStart = _.options.infinite ? _.options.slidesToShow + _.currentSlide : _.currentSlide;
            rangeEnd = Math.ceil(rangeStart + _.options.slidesToShow);
            if (_.options.fade === true) {
                if (rangeStart > 0) rangeStart--;
                if (rangeEnd <= _.slideCount) rangeEnd++;
            }
        }

        loadRange = _.$slider.find('.slick-slide').slice(rangeStart, rangeEnd);

        if (_.options.lazyLoad === 'anticipated') {
            var prevSlide = rangeStart - 1,
                nextSlide = rangeEnd,
                $slides = _.$slider.find('.slick-slide');

            for (var i = 0; i < _.options.slidesToScroll; i++) {
                if (prevSlide < 0) prevSlide = _.slideCount - 1;
                loadRange = loadRange.add($slides.eq(prevSlide));
                loadRange = loadRange.add($slides.eq(nextSlide));
                prevSlide--;
                nextSlide++;
            }
        }

        loadImages(loadRange);

        if (_.slideCount <= _.options.slidesToShow) {
            cloneRange = _.$slider.find('.slick-slide');
            loadImages(cloneRange);
        } else
        if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
            cloneRange = _.$slider.find('.slick-cloned').slice(0, _.options.slidesToShow);
            loadImages(cloneRange);
        } else if (_.currentSlide === 0) {
            cloneRange = _.$slider.find('.slick-cloned').slice(_.options.slidesToShow * -1);
            loadImages(cloneRange);
        }

    };

    Slick.prototype.loadSlider = function() {

        var _ = this;

        _.setPosition();

        _.$slideTrack.css({
            opacity: 1
        });

        _.$slider.removeClass('slick-loading');

        _.initUI();

        if (_.options.lazyLoad === 'progressive') {
            _.progressiveLazyLoad();
        }

    };

    Slick.prototype.next = Slick.prototype.slickNext = function() {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'next'
            }
        });

    };

    Slick.prototype.orientationChange = function() {

        var _ = this;

        _.checkResponsive();
        _.setPosition();

    };

    Slick.prototype.pause = Slick.prototype.slickPause = function() {

        var _ = this;

        _.autoPlayClear();
        _.paused = true;

    };

    Slick.prototype.play = Slick.prototype.slickPlay = function() {

        var _ = this;

        _.autoPlay();
        _.options.autoplay = true;
        _.paused = false;
        _.focussed = false;
        _.interrupted = false;

    };

    Slick.prototype.postSlide = function(index) {

        var _ = this;

        if( !_.unslicked ) {

            _.$slider.trigger('afterChange', [_, index]);

            _.animating = false;

            if (_.slideCount > _.options.slidesToShow) {
                _.setPosition();
            }

            _.swipeLeft = null;

            if ( _.options.autoplay ) {
                _.autoPlay();
            }

            if (_.options.accessibility === true) {
                _.initADA();

                if (_.options.focusOnChange) {
                    var $currentSlide = $(_.$slides.get(_.currentSlide));
                    $currentSlide.attr('tabindex', 0).focus();
                }
            }

        }

    };

    Slick.prototype.prev = Slick.prototype.slickPrev = function() {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'previous'
            }
        });

    };

    Slick.prototype.preventDefault = function(event) {

        event.preventDefault();

    };

    Slick.prototype.progressiveLazyLoad = function( tryCount ) {

        tryCount = tryCount || 1;

        var _ = this,
            $imgsToLoad = $( 'img[data-lazy]', _.$slider ),
            image,
            imageSource,
            imageSrcSet,
            imageSizes,
            imageToLoad;

        if ( $imgsToLoad.length ) {

            image = $imgsToLoad.first();
            imageSource = image.attr('data-lazy');
            imageSrcSet = image.attr('data-srcset');
            imageSizes  = image.attr('data-sizes') || _.$slider.attr('data-sizes');
            imageToLoad = document.createElement('img');

            imageToLoad.onload = function() {

                if (imageSrcSet) {
                    image
                        .attr('srcset', imageSrcSet );

                    if (imageSizes) {
                        image
                            .attr('sizes', imageSizes );
                    }
                }

                image
                    .attr( 'src', imageSource )
                    .removeAttr('data-lazy data-srcset data-sizes')
                    .removeClass('slick-loading');

                if ( _.options.adaptiveHeight === true ) {
                    _.setPosition();
                }

                _.$slider.trigger('lazyLoaded', [ _, image, imageSource ]);
                _.progressiveLazyLoad();

            };

            imageToLoad.onerror = function() {

                if ( tryCount < 3 ) {

                    /**
                     * try to load the image 3 times,
                     * leave a slight delay so we don't get
                     * servers blocking the request.
                     */
                    setTimeout( function() {
                        _.progressiveLazyLoad( tryCount + 1 );
                    }, 500 );

                } else {

                    image
                        .removeAttr( 'data-lazy' )
                        .removeClass( 'slick-loading' )
                        .addClass( 'slick-lazyload-error' );

                    _.$slider.trigger('lazyLoadError', [ _, image, imageSource ]);

                    _.progressiveLazyLoad();

                }

            };

            imageToLoad.src = imageSource;

        } else {

            _.$slider.trigger('allImagesLoaded', [ _ ]);

        }

    };

    Slick.prototype.refresh = function( initializing ) {

        var _ = this, currentSlide, lastVisibleIndex;

        lastVisibleIndex = _.slideCount - _.options.slidesToShow;

        // in non-infinite sliders, we don't want to go past the
        // last visible index.
        if( !_.options.infinite && ( _.currentSlide > lastVisibleIndex )) {
            _.currentSlide = lastVisibleIndex;
        }

        // if less slides than to show, go to start.
        if ( _.slideCount <= _.options.slidesToShow ) {
            _.currentSlide = 0;

        }

        currentSlide = _.currentSlide;

        _.destroy(true);

        $.extend(_, _.initials, { currentSlide: currentSlide });

        _.init();

        if( !initializing ) {

            _.changeSlide({
                data: {
                    message: 'index',
                    index: currentSlide
                }
            }, false);

        }

    };

    Slick.prototype.registerBreakpoints = function() {

        var _ = this, breakpoint, currentBreakpoint, l,
            responsiveSettings = _.options.responsive || null;

        if ( $.type(responsiveSettings) === 'array' && responsiveSettings.length ) {

            _.respondTo = _.options.respondTo || 'window';

            for ( breakpoint in responsiveSettings ) {

                l = _.breakpoints.length-1;

                if (responsiveSettings.hasOwnProperty(breakpoint)) {
                    currentBreakpoint = responsiveSettings[breakpoint].breakpoint;

                    // loop through the breakpoints and cut out any existing
                    // ones with the same breakpoint number, we don't want dupes.
                    while( l >= 0 ) {
                        if( _.breakpoints[l] && _.breakpoints[l] === currentBreakpoint ) {
                            _.breakpoints.splice(l,1);
                        }
                        l--;
                    }

                    _.breakpoints.push(currentBreakpoint);
                    _.breakpointSettings[currentBreakpoint] = responsiveSettings[breakpoint].settings;

                }

            }

            _.breakpoints.sort(function(a, b) {
                return ( _.options.mobileFirst ) ? a-b : b-a;
            });

        }

    };

    Slick.prototype.reinit = function() {

        var _ = this;

        _.$slides =
            _.$slideTrack
                .children(_.options.slide)
                .addClass('slick-slide');

        _.slideCount = _.$slides.length;

        if (_.currentSlide >= _.slideCount && _.currentSlide !== 0) {
            _.currentSlide = _.currentSlide - _.options.slidesToScroll;
        }

        if (_.slideCount <= _.options.slidesToShow) {
            _.currentSlide = 0;
        }

        _.registerBreakpoints();

        _.setProps();
        _.setupInfinite();
        _.buildArrows();
        _.updateArrows();
        _.initArrowEvents();
        _.buildDots();
        _.updateDots();
        _.initDotEvents();
        _.cleanUpSlideEvents();
        _.initSlideEvents();

        _.checkResponsive(false, true);

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on('click.slick', _.selectHandler);
        }

        _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

        _.setPosition();
        _.focusHandler();

        _.paused = !_.options.autoplay;
        _.autoPlay();

        _.$slider.trigger('reInit', [_]);

    };

    Slick.prototype.resize = function() {

        var _ = this;

        if ($(window).width() !== _.windowWidth) {
            clearTimeout(_.windowDelay);
            _.windowDelay = window.setTimeout(function() {
                _.windowWidth = $(window).width();
                _.checkResponsive();
                if( !_.unslicked ) { _.setPosition(); }
            }, 50);
        }
    };

    Slick.prototype.removeSlide = Slick.prototype.slickRemove = function(index, removeBefore, removeAll) {

        var _ = this;

        if (typeof(index) === 'boolean') {
            removeBefore = index;
            index = removeBefore === true ? 0 : _.slideCount - 1;
        } else {
            index = removeBefore === true ? --index : index;
        }

        if (_.slideCount < 1 || index < 0 || index > _.slideCount - 1) {
            return false;
        }

        _.unload();

        if (removeAll === true) {
            _.$slideTrack.children().remove();
        } else {
            _.$slideTrack.children(this.options.slide).eq(index).remove();
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slidesCache = _.$slides;

        _.reinit();

    };

    Slick.prototype.setCSS = function(position) {

        var _ = this,
            positionProps = {},
            x, y;

        if (_.options.rtl === true) {
            position = -position;
        }
        x = _.positionProp == 'left' ? Math.ceil(position) + 'px' : '0px';
        y = _.positionProp == 'top' ? Math.ceil(position) + 'px' : '0px';

        positionProps[_.positionProp] = position;

        if (_.transformsEnabled === false) {
            _.$slideTrack.css(positionProps);
        } else {
            positionProps = {};
            if (_.cssTransitions === false) {
                positionProps[_.animType] = 'translate(' + x + ', ' + y + ')';
                _.$slideTrack.css(positionProps);
            } else {
                positionProps[_.animType] = 'translate3d(' + x + ', ' + y + ', 0px)';
                _.$slideTrack.css(positionProps);
            }
        }

    };

    Slick.prototype.setDimensions = function() {

        var _ = this;

        if (_.options.vertical === false) {
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: ('0px ' + _.options.centerPadding)
                });
            }
        } else {
            _.$list.height(_.$slides.first().outerHeight(true) * _.options.slidesToShow);
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: (_.options.centerPadding + ' 0px')
                });
            }
        }

        _.listWidth = _.$list.width();
        _.listHeight = _.$list.height();


        if (_.options.vertical === false && _.options.variableWidth === false) {
            _.slideWidth = Math.ceil(_.listWidth / _.options.slidesToShow);
            _.$slideTrack.width(Math.ceil((_.slideWidth * _.$slideTrack.children('.slick-slide').length)));

        } else if (_.options.variableWidth === true) {
            _.$slideTrack.width(5000 * _.slideCount);
        } else {
            _.slideWidth = Math.ceil(_.listWidth);
            _.$slideTrack.height(Math.ceil((_.$slides.first().outerHeight(true) * _.$slideTrack.children('.slick-slide').length)));
        }

        var offset = _.$slides.first().outerWidth(true) - _.$slides.first().width();
        if (_.options.variableWidth === false) _.$slideTrack.children('.slick-slide').width(_.slideWidth - offset);

    };

    Slick.prototype.setFade = function() {

        var _ = this,
            targetLeft;

        _.$slides.each(function(index, element) {
            targetLeft = (_.slideWidth * index) * -1;
            if (_.options.rtl === true) {
                $(element).css({
                    position: 'relative',
                    right: targetLeft,
                    top: 0,
                    zIndex: _.options.zIndex - 2,
                    opacity: 0
                });
            } else {
                $(element).css({
                    position: 'relative',
                    left: targetLeft,
                    top: 0,
                    zIndex: _.options.zIndex - 2,
                    opacity: 0
                });
            }
        });

        _.$slides.eq(_.currentSlide).css({
            zIndex: _.options.zIndex - 1,
            opacity: 1
        });

    };

    Slick.prototype.setHeight = function() {

        var _ = this;

        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.css('height', targetHeight);
        }

    };

    Slick.prototype.setOption =
    Slick.prototype.slickSetOption = function() {

        /**
         * accepts arguments in format of:
         *
         *  - for changing a single option's value:
         *     .slick("setOption", option, value, refresh )
         *
         *  - for changing a set of responsive options:
         *     .slick("setOption", 'responsive', [{}, ...], refresh )
         *
         *  - for updating multiple values at once (not responsive)
         *     .slick("setOption", { 'option': value, ... }, refresh )
         */

        var _ = this, l, item, option, value, refresh = false, type;

        if( $.type( arguments[0] ) === 'object' ) {

            option =  arguments[0];
            refresh = arguments[1];
            type = 'multiple';

        } else if ( $.type( arguments[0] ) === 'string' ) {

            option =  arguments[0];
            value = arguments[1];
            refresh = arguments[2];

            if ( arguments[0] === 'responsive' && $.type( arguments[1] ) === 'array' ) {

                type = 'responsive';

            } else if ( typeof arguments[1] !== 'undefined' ) {

                type = 'single';

            }

        }

        if ( type === 'single' ) {

            _.options[option] = value;


        } else if ( type === 'multiple' ) {

            $.each( option , function( opt, val ) {

                _.options[opt] = val;

            });


        } else if ( type === 'responsive' ) {

            for ( item in value ) {

                if( $.type( _.options.responsive ) !== 'array' ) {

                    _.options.responsive = [ value[item] ];

                } else {

                    l = _.options.responsive.length-1;

                    // loop through the responsive object and splice out duplicates.
                    while( l >= 0 ) {

                        if( _.options.responsive[l].breakpoint === value[item].breakpoint ) {

                            _.options.responsive.splice(l,1);

                        }

                        l--;

                    }

                    _.options.responsive.push( value[item] );

                }

            }

        }

        if ( refresh ) {

            _.unload();
            _.reinit();

        }

    };

    Slick.prototype.setPosition = function() {

        var _ = this;

        _.setDimensions();

        _.setHeight();

        if (_.options.fade === false) {
            _.setCSS(_.getLeft(_.currentSlide));
        } else {
            _.setFade();
        }

        _.$slider.trigger('setPosition', [_]);

    };

    Slick.prototype.setProps = function() {

        var _ = this,
            bodyStyle = document.body.style;

        _.positionProp = _.options.vertical === true ? 'top' : 'left';

        if (_.positionProp === 'top') {
            _.$slider.addClass('slick-vertical');
        } else {
            _.$slider.removeClass('slick-vertical');
        }

        if (bodyStyle.WebkitTransition !== undefined ||
            bodyStyle.MozTransition !== undefined ||
            bodyStyle.msTransition !== undefined) {
            if (_.options.useCSS === true) {
                _.cssTransitions = true;
            }
        }

        if ( _.options.fade ) {
            if ( typeof _.options.zIndex === 'number' ) {
                if( _.options.zIndex < 3 ) {
                    _.options.zIndex = 3;
                }
            } else {
                _.options.zIndex = _.defaults.zIndex;
            }
        }

        if (bodyStyle.OTransform !== undefined) {
            _.animType = 'OTransform';
            _.transformType = '-o-transform';
            _.transitionType = 'OTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.MozTransform !== undefined) {
            _.animType = 'MozTransform';
            _.transformType = '-moz-transform';
            _.transitionType = 'MozTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.MozPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.webkitTransform !== undefined) {
            _.animType = 'webkitTransform';
            _.transformType = '-webkit-transform';
            _.transitionType = 'webkitTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.msTransform !== undefined) {
            _.animType = 'msTransform';
            _.transformType = '-ms-transform';
            _.transitionType = 'msTransition';
            if (bodyStyle.msTransform === undefined) _.animType = false;
        }
        if (bodyStyle.transform !== undefined && _.animType !== false) {
            _.animType = 'transform';
            _.transformType = 'transform';
            _.transitionType = 'transition';
        }
        _.transformsEnabled = _.options.useTransform && (_.animType !== null && _.animType !== false);
    };


    Slick.prototype.setSlideClasses = function(index) {

        var _ = this,
            centerOffset, allSlides, indexOffset, remainder;

        allSlides = _.$slider
            .find('.slick-slide')
            .removeClass('slick-active slick-center slick-current')
            .attr('aria-hidden', 'true');

        _.$slides
            .eq(index)
            .addClass('slick-current');

        if (_.options.centerMode === true) {

            var evenCoef = _.options.slidesToShow % 2 === 0 ? 1 : 0;

            centerOffset = Math.floor(_.options.slidesToShow / 2);

            if (_.options.infinite === true) {

                if (index >= centerOffset && index <= (_.slideCount - 1) - centerOffset) {
                    _.$slides
                        .slice(index - centerOffset + evenCoef, index + centerOffset + 1)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                } else {

                    indexOffset = _.options.slidesToShow + index;
                    allSlides
                        .slice(indexOffset - centerOffset + 1 + evenCoef, indexOffset + centerOffset + 2)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                }

                if (index === 0) {

                    allSlides
                        .eq(allSlides.length - 1 - _.options.slidesToShow)
                        .addClass('slick-center');

                } else if (index === _.slideCount - 1) {

                    allSlides
                        .eq(_.options.slidesToShow)
                        .addClass('slick-center');

                }

            }

            _.$slides
                .eq(index)
                .addClass('slick-center');

        } else {

            if (index >= 0 && index <= (_.slideCount - _.options.slidesToShow)) {

                _.$slides
                    .slice(index, index + _.options.slidesToShow)
                    .addClass('slick-active')
                    .attr('aria-hidden', 'false');

            } else if (allSlides.length <= _.options.slidesToShow) {

                allSlides
                    .addClass('slick-active')
                    .attr('aria-hidden', 'false');

            } else {

                remainder = _.slideCount % _.options.slidesToShow;
                indexOffset = _.options.infinite === true ? _.options.slidesToShow + index : index;

                if (_.options.slidesToShow == _.options.slidesToScroll && (_.slideCount - index) < _.options.slidesToShow) {

                    allSlides
                        .slice(indexOffset - (_.options.slidesToShow - remainder), indexOffset + remainder)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                } else {

                    allSlides
                        .slice(indexOffset, indexOffset + _.options.slidesToShow)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                }

            }

        }

        if (_.options.lazyLoad === 'ondemand' || _.options.lazyLoad === 'anticipated') {
            _.lazyLoad();
        }
    };

    Slick.prototype.setupInfinite = function() {

        var _ = this,
            i, slideIndex, infiniteCount;

        if (_.options.fade === true) {
            _.options.centerMode = false;
        }

        if (_.options.infinite === true && _.options.fade === false) {

            slideIndex = null;

            if (_.slideCount > _.options.slidesToShow) {

                if (_.options.centerMode === true) {
                    infiniteCount = _.options.slidesToShow + 1;
                } else {
                    infiniteCount = _.options.slidesToShow;
                }

                for (i = _.slideCount; i > (_.slideCount -
                        infiniteCount); i -= 1) {
                    slideIndex = i - 1;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '')
                        .attr('data-slick-index', slideIndex - _.slideCount)
                        .prependTo(_.$slideTrack).addClass('slick-cloned');
                }
                for (i = 0; i < infiniteCount  + _.slideCount; i += 1) {
                    slideIndex = i;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '')
                        .attr('data-slick-index', slideIndex + _.slideCount)
                        .appendTo(_.$slideTrack).addClass('slick-cloned');
                }
                _.$slideTrack.find('.slick-cloned').find('[id]').each(function() {
                    $(this).attr('id', '');
                });

            }

        }

    };

    Slick.prototype.interrupt = function( toggle ) {

        var _ = this;

        if( !toggle ) {
            _.autoPlay();
        }
        _.interrupted = toggle;

    };

    Slick.prototype.selectHandler = function(event) {

        var _ = this;

        var targetElement =
            $(event.target).is('.slick-slide') ?
                $(event.target) :
                $(event.target).parents('.slick-slide');

        var index = parseInt(targetElement.attr('data-slick-index'));

        if (!index) index = 0;

        if (_.slideCount <= _.options.slidesToShow) {

            _.slideHandler(index, false, true);
            return;

        }

        _.slideHandler(index);

    };

    Slick.prototype.slideHandler = function(index, sync, dontAnimate) {

        var targetSlide, animSlide, oldSlide, slideLeft, targetLeft = null,
            _ = this, navTarget;

        sync = sync || false;

        if (_.animating === true && _.options.waitForAnimate === true) {
            return;
        }

        if (_.options.fade === true && _.currentSlide === index) {
            return;
        }

        if (sync === false) {
            _.asNavFor(index);
        }

        targetSlide = index;
        targetLeft = _.getLeft(targetSlide);
        slideLeft = _.getLeft(_.currentSlide);

        _.currentLeft = _.swipeLeft === null ? slideLeft : _.swipeLeft;

        if (_.options.infinite === false && _.options.centerMode === false && (index < 0 || index > _.getDotCount() * _.options.slidesToScroll)) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
                    _.animateSlide(slideLeft, function() {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        } else if (_.options.infinite === false && _.options.centerMode === true && (index < 0 || index > (_.slideCount - _.options.slidesToScroll))) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
                    _.animateSlide(slideLeft, function() {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        }

        if ( _.options.autoplay ) {
            clearInterval(_.autoPlayTimer);
        }

        if (targetSlide < 0) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = _.slideCount - (_.slideCount % _.options.slidesToScroll);
            } else {
                animSlide = _.slideCount + targetSlide;
            }
        } else if (targetSlide >= _.slideCount) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = 0;
            } else {
                animSlide = targetSlide - _.slideCount;
            }
        } else {
            animSlide = targetSlide;
        }

        _.animating = true;

        _.$slider.trigger('beforeChange', [_, _.currentSlide, animSlide]);

        oldSlide = _.currentSlide;
        _.currentSlide = animSlide;

        _.setSlideClasses(_.currentSlide);

        if ( _.options.asNavFor ) {

            navTarget = _.getNavTarget();
            navTarget = navTarget.slick('getSlick');

            if ( navTarget.slideCount <= navTarget.options.slidesToShow ) {
                navTarget.setSlideClasses(_.currentSlide);
            }

        }

        _.updateDots();
        _.updateArrows();

        if (_.options.fade === true) {
            if (dontAnimate !== true) {

                _.fadeSlideOut(oldSlide);

                _.fadeSlide(animSlide, function() {
                    _.postSlide(animSlide);
                });

            } else {
                _.postSlide(animSlide);
            }
            _.animateHeight();
            return;
        }

        if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
            _.animateSlide(targetLeft, function() {
                _.postSlide(animSlide);
            });
        } else {
            _.postSlide(animSlide);
        }

    };

    Slick.prototype.startLoad = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.hide();
            _.$nextArrow.hide();

        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.hide();

        }

        _.$slider.addClass('slick-loading');

    };

    Slick.prototype.swipeDirection = function() {

        var xDist, yDist, r, swipeAngle, _ = this;

        xDist = _.touchObject.startX - _.touchObject.curX;
        yDist = _.touchObject.startY - _.touchObject.curY;
        r = Math.atan2(yDist, xDist);

        swipeAngle = Math.round(r * 180 / Math.PI);
        if (swipeAngle < 0) {
            swipeAngle = 360 - Math.abs(swipeAngle);
        }

        if ((swipeAngle <= 45) && (swipeAngle >= 0)) {
            return (_.options.rtl === false ? 'left' : 'right');
        }
        if ((swipeAngle <= 360) && (swipeAngle >= 315)) {
            return (_.options.rtl === false ? 'left' : 'right');
        }
        if ((swipeAngle >= 135) && (swipeAngle <= 225)) {
            return (_.options.rtl === false ? 'right' : 'left');
        }
        if (_.options.verticalSwiping === true) {
            if ((swipeAngle >= 35) && (swipeAngle <= 135)) {
                return 'down';
            } else {
                return 'up';
            }
        }

        return 'vertical';

    };

    Slick.prototype.swipeEnd = function(event) {

        var _ = this,
            slideCount,
            direction;

        _.dragging = false;
        _.swiping = false;

        if (_.scrolling) {
            _.scrolling = false;
            return false;
        }

        _.interrupted = false;
        _.shouldClick = ( _.touchObject.swipeLength > 10 ) ? false : true;

        if ( _.touchObject.curX === undefined ) {
            return false;
        }

        if ( _.touchObject.edgeHit === true ) {
            _.$slider.trigger('edge', [_, _.swipeDirection() ]);
        }

        if ( _.touchObject.swipeLength >= _.touchObject.minSwipe ) {

            direction = _.swipeDirection();

            switch ( direction ) {

                case 'left':
                case 'down':

                    slideCount =
                        _.options.swipeToSlide ?
                            _.checkNavigable( _.currentSlide + _.getSlideCount() ) :
                            _.currentSlide + _.getSlideCount();

                    _.currentDirection = 0;

                    break;

                case 'right':
                case 'up':

                    slideCount =
                        _.options.swipeToSlide ?
                            _.checkNavigable( _.currentSlide - _.getSlideCount() ) :
                            _.currentSlide - _.getSlideCount();

                    _.currentDirection = 1;

                    break;

                default:


            }

            if( direction != 'vertical' ) {

                _.slideHandler( slideCount );
                _.touchObject = {};
                _.$slider.trigger('swipe', [_, direction ]);

            }

        } else {

            if ( _.touchObject.startX !== _.touchObject.curX ) {

                _.slideHandler( _.currentSlide );
                _.touchObject = {};

            }

        }

    };

    Slick.prototype.swipeHandler = function(event) {

        var _ = this;

        if ((_.options.swipe === false) || ('ontouchend' in document && _.options.swipe === false)) {
            return;
        } else if (_.options.draggable === false && event.type.indexOf('mouse') !== -1) {
            return;
        }

        _.touchObject.fingerCount = event.originalEvent && event.originalEvent.touches !== undefined ?
            event.originalEvent.touches.length : 1;

        _.touchObject.minSwipe = _.listWidth / _.options
            .touchThreshold;

        if (_.options.verticalSwiping === true) {
            _.touchObject.minSwipe = _.listHeight / _.options
                .touchThreshold;
        }

        switch (event.data.action) {

            case 'start':
                _.swipeStart(event);
                break;

            case 'move':
                _.swipeMove(event);
                break;

            case 'end':
                _.swipeEnd(event);
                break;

        }

    };

    Slick.prototype.swipeMove = function(event) {

        var _ = this,
            edgeWasHit = false,
            curLeft, swipeDirection, swipeLength, positionOffset, touches, verticalSwipeLength;

        touches = event.originalEvent !== undefined ? event.originalEvent.touches : null;

        if (!_.dragging || _.scrolling || touches && touches.length !== 1) {
            return false;
        }

        curLeft = _.getLeft(_.currentSlide);

        _.touchObject.curX = touches !== undefined ? touches[0].pageX : event.clientX;
        _.touchObject.curY = touches !== undefined ? touches[0].pageY : event.clientY;

        _.touchObject.swipeLength = Math.round(Math.sqrt(
            Math.pow(_.touchObject.curX - _.touchObject.startX, 2)));

        verticalSwipeLength = Math.round(Math.sqrt(
            Math.pow(_.touchObject.curY - _.touchObject.startY, 2)));

        if (!_.options.verticalSwiping && !_.swiping && verticalSwipeLength > 4) {
            _.scrolling = true;
            return false;
        }

        if (_.options.verticalSwiping === true) {
            _.touchObject.swipeLength = verticalSwipeLength;
        }

        swipeDirection = _.swipeDirection();

        if (event.originalEvent !== undefined && _.touchObject.swipeLength > 4) {
            _.swiping = true;
            event.preventDefault();
        }

        positionOffset = (_.options.rtl === false ? 1 : -1) * (_.touchObject.curX > _.touchObject.startX ? 1 : -1);
        if (_.options.verticalSwiping === true) {
            positionOffset = _.touchObject.curY > _.touchObject.startY ? 1 : -1;
        }


        swipeLength = _.touchObject.swipeLength;

        _.touchObject.edgeHit = false;

        if (_.options.infinite === false) {
            if ((_.currentSlide === 0 && swipeDirection === 'right') || (_.currentSlide >= _.getDotCount() && swipeDirection === 'left')) {
                swipeLength = _.touchObject.swipeLength * _.options.edgeFriction;
                _.touchObject.edgeHit = true;
            }
        }

        if (_.options.vertical === false) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        } else {
            _.swipeLeft = curLeft + (swipeLength * (_.$list.height() / _.listWidth)) * positionOffset;
        }
        if (_.options.verticalSwiping === true) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        }

        if (_.options.fade === true || _.options.touchMove === false) {
            return false;
        }

        if (_.animating === true) {
            _.swipeLeft = null;
            return false;
        }

        _.setCSS(_.swipeLeft);

    };

    Slick.prototype.swipeStart = function(event) {

        var _ = this,
            touches;

        _.interrupted = true;

        if (_.touchObject.fingerCount !== 1 || _.slideCount <= _.options.slidesToShow) {
            _.touchObject = {};
            return false;
        }

        if (event.originalEvent !== undefined && event.originalEvent.touches !== undefined) {
            touches = event.originalEvent.touches[0];
        }

        _.touchObject.startX = _.touchObject.curX = touches !== undefined ? touches.pageX : event.clientX;
        _.touchObject.startY = _.touchObject.curY = touches !== undefined ? touches.pageY : event.clientY;

        _.dragging = true;

    };

    Slick.prototype.unfilterSlides = Slick.prototype.slickUnfilter = function() {

        var _ = this;

        if (_.$slidesCache !== null) {

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.appendTo(_.$slideTrack);

            _.reinit();

        }

    };

    Slick.prototype.unload = function() {

        var _ = this;

        $('.slick-cloned', _.$slider).remove();

        if (_.$dots) {
            _.$dots.remove();
        }

        if (_.$prevArrow && _.htmlExpr.test(_.options.prevArrow)) {
            _.$prevArrow.remove();
        }

        if (_.$nextArrow && _.htmlExpr.test(_.options.nextArrow)) {
            _.$nextArrow.remove();
        }

        _.$slides
            .removeClass('slick-slide slick-active slick-visible slick-current')
            .attr('aria-hidden', 'true')
            .css('width', '');

    };

    Slick.prototype.unslick = function(fromBreakpoint) {

        var _ = this;
        _.$slider.trigger('unslick', [_, fromBreakpoint]);
        _.destroy();

    };

    Slick.prototype.updateArrows = function() {

        var _ = this,
            centerOffset;

        centerOffset = Math.floor(_.options.slidesToShow / 2);

        if ( _.options.arrows === true &&
            _.slideCount > _.options.slidesToShow &&
            !_.options.infinite ) {

            _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');
            _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            if (_.currentSlide === 0) {

                _.$prevArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow && _.options.centerMode === false) {

                _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            } else if (_.currentSlide >= _.slideCount - 1 && _.options.centerMode === true) {

                _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            }

        }

    };

    Slick.prototype.updateDots = function() {

        var _ = this;

        if (_.$dots !== null) {

            _.$dots
                .find('li')
                    .removeClass('slick-active')
                    .end();

            _.$dots
                .find('li')
                .eq(Math.floor(_.currentSlide / _.options.slidesToScroll))
                .addClass('slick-active');

        }

    };

    Slick.prototype.visibility = function() {

        var _ = this;

        if ( _.options.autoplay ) {

            if ( document[_.hidden] ) {

                _.interrupted = true;

            } else {

                _.interrupted = false;

            }

        }

    };

    $.fn.slick = function() {
        var _ = this,
            opt = arguments[0],
            args = Array.prototype.slice.call(arguments, 1),
            l = _.length,
            i,
            ret;
        for (i = 0; i < l; i++) {
            if (typeof opt == 'object' || typeof opt == 'undefined')
                _[i].slick = new Slick(_[i], opt);
            else
                ret = _[i].slick[opt].apply(_[i].slick, args);
            if (typeof ret != 'undefined') return ret;
        }
        return _;
    };

}));
/*!
Waypoints - 4.0.1
Copyright © 2011-2016 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blob/master/licenses.txt
*/
!function(){"use strict";function t(o){if(!o)throw new Error("No options passed to Waypoint constructor");if(!o.element)throw new Error("No element option passed to Waypoint constructor");if(!o.handler)throw new Error("No handler option passed to Waypoint constructor");this.key="waypoint-"+e,this.options=t.Adapter.extend({},t.defaults,o),this.element=this.options.element,this.adapter=new t.Adapter(this.element),this.callback=o.handler,this.axis=this.options.horizontal?"horizontal":"vertical",this.enabled=this.options.enabled,this.triggerPoint=null,this.group=t.Group.findOrCreate({name:this.options.group,axis:this.axis}),this.context=t.Context.findOrCreateByElement(this.options.context),t.offsetAliases[this.options.offset]&&(this.options.offset=t.offsetAliases[this.options.offset]),this.group.add(this),this.context.add(this),i[this.key]=this,e+=1}var e=0,i={};t.prototype.queueTrigger=function(t){this.group.queueTrigger(this,t)},t.prototype.trigger=function(t){this.enabled&&this.callback&&this.callback.apply(this,t)},t.prototype.destroy=function(){this.context.remove(this),this.group.remove(this),delete i[this.key]},t.prototype.disable=function(){return this.enabled=!1,this},t.prototype.enable=function(){return this.context.refresh(),this.enabled=!0,this},t.prototype.next=function(){return this.group.next(this)},t.prototype.previous=function(){return this.group.previous(this)},t.invokeAll=function(t){var e=[];for(var o in i)e.push(i[o]);for(var n=0,r=e.length;r>n;n++)e[n][t]()},t.destroyAll=function(){t.invokeAll("destroy")},t.disableAll=function(){t.invokeAll("disable")},t.enableAll=function(){t.Context.refreshAll();for(var e in i)i[e].enabled=!0;return this},t.refreshAll=function(){t.Context.refreshAll()},t.viewportHeight=function(){return window.innerHeight||document.documentElement.clientHeight},t.viewportWidth=function(){return document.documentElement.clientWidth},t.adapters=[],t.defaults={context:window,continuous:!0,enabled:!0,group:"default",horizontal:!1,offset:0},t.offsetAliases={"bottom-in-view":function(){return this.context.innerHeight()-this.adapter.outerHeight()},"right-in-view":function(){return this.context.innerWidth()-this.adapter.outerWidth()}},window.Waypoint=t}(),function(){"use strict";function t(t){window.setTimeout(t,1e3/60)}function e(t){this.element=t,this.Adapter=n.Adapter,this.adapter=new this.Adapter(t),this.key="waypoint-context-"+i,this.didScroll=!1,this.didResize=!1,this.oldScroll={x:this.adapter.scrollLeft(),y:this.adapter.scrollTop()},this.waypoints={vertical:{},horizontal:{}},t.waypointContextKey=this.key,o[t.waypointContextKey]=this,i+=1,n.windowContext||(n.windowContext=!0,n.windowContext=new e(window)),this.createThrottledScrollHandler(),this.createThrottledResizeHandler()}var i=0,o={},n=window.Waypoint,r=window.onload;e.prototype.add=function(t){var e=t.options.horizontal?"horizontal":"vertical";this.waypoints[e][t.key]=t,this.refresh()},e.prototype.checkEmpty=function(){var t=this.Adapter.isEmptyObject(this.waypoints.horizontal),e=this.Adapter.isEmptyObject(this.waypoints.vertical),i=this.element==this.element.window;t&&e&&!i&&(this.adapter.off(".waypoints"),delete o[this.key])},e.prototype.createThrottledResizeHandler=function(){function t(){e.handleResize(),e.didResize=!1}var e=this;this.adapter.on("resize.waypoints",function(){e.didResize||(e.didResize=!0,n.requestAnimationFrame(t))})},e.prototype.createThrottledScrollHandler=function(){function t(){e.handleScroll(),e.didScroll=!1}var e=this;this.adapter.on("scroll.waypoints",function(){(!e.didScroll||n.isTouch)&&(e.didScroll=!0,n.requestAnimationFrame(t))})},e.prototype.handleResize=function(){n.Context.refreshAll()},e.prototype.handleScroll=function(){var t={},e={horizontal:{newScroll:this.adapter.scrollLeft(),oldScroll:this.oldScroll.x,forward:"right",backward:"left"},vertical:{newScroll:this.adapter.scrollTop(),oldScroll:this.oldScroll.y,forward:"down",backward:"up"}};for(var i in e){var o=e[i],n=o.newScroll>o.oldScroll,r=n?o.forward:o.backward;for(var s in this.waypoints[i]){var a=this.waypoints[i][s];if(null!==a.triggerPoint){var l=o.oldScroll<a.triggerPoint,h=o.newScroll>=a.triggerPoint,p=l&&h,u=!l&&!h;(p||u)&&(a.queueTrigger(r),t[a.group.id]=a.group)}}}for(var c in t)t[c].flushTriggers();this.oldScroll={x:e.horizontal.newScroll,y:e.vertical.newScroll}},e.prototype.innerHeight=function(){return this.element==this.element.window?n.viewportHeight():this.adapter.innerHeight()},e.prototype.remove=function(t){delete this.waypoints[t.axis][t.key],this.checkEmpty()},e.prototype.innerWidth=function(){return this.element==this.element.window?n.viewportWidth():this.adapter.innerWidth()},e.prototype.destroy=function(){var t=[];for(var e in this.waypoints)for(var i in this.waypoints[e])t.push(this.waypoints[e][i]);for(var o=0,n=t.length;n>o;o++)t[o].destroy()},e.prototype.refresh=function(){var t,e=this.element==this.element.window,i=e?void 0:this.adapter.offset(),o={};this.handleScroll(),t={horizontal:{contextOffset:e?0:i.left,contextScroll:e?0:this.oldScroll.x,contextDimension:this.innerWidth(),oldScroll:this.oldScroll.x,forward:"right",backward:"left",offsetProp:"left"},vertical:{contextOffset:e?0:i.top,contextScroll:e?0:this.oldScroll.y,contextDimension:this.innerHeight(),oldScroll:this.oldScroll.y,forward:"down",backward:"up",offsetProp:"top"}};for(var r in t){var s=t[r];for(var a in this.waypoints[r]){var l,h,p,u,c,d=this.waypoints[r][a],f=d.options.offset,w=d.triggerPoint,y=0,g=null==w;d.element!==d.element.window&&(y=d.adapter.offset()[s.offsetProp]),"function"==typeof f?f=f.apply(d):"string"==typeof f&&(f=parseFloat(f),d.options.offset.indexOf("%")>-1&&(f=Math.ceil(s.contextDimension*f/100))),l=s.contextScroll-s.contextOffset,d.triggerPoint=Math.floor(y+l-f),h=w<s.oldScroll,p=d.triggerPoint>=s.oldScroll,u=h&&p,c=!h&&!p,!g&&u?(d.queueTrigger(s.backward),o[d.group.id]=d.group):!g&&c?(d.queueTrigger(s.forward),o[d.group.id]=d.group):g&&s.oldScroll>=d.triggerPoint&&(d.queueTrigger(s.forward),o[d.group.id]=d.group)}}return n.requestAnimationFrame(function(){for(var t in o)o[t].flushTriggers()}),this},e.findOrCreateByElement=function(t){return e.findByElement(t)||new e(t)},e.refreshAll=function(){for(var t in o)o[t].refresh()},e.findByElement=function(t){return o[t.waypointContextKey]},window.onload=function(){r&&r(),e.refreshAll()},n.requestAnimationFrame=function(e){var i=window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||t;i.call(window,e)},n.Context=e}(),function(){"use strict";function t(t,e){return t.triggerPoint-e.triggerPoint}function e(t,e){return e.triggerPoint-t.triggerPoint}function i(t){this.name=t.name,this.axis=t.axis,this.id=this.name+"-"+this.axis,this.waypoints=[],this.clearTriggerQueues(),o[this.axis][this.name]=this}var o={vertical:{},horizontal:{}},n=window.Waypoint;i.prototype.add=function(t){this.waypoints.push(t)},i.prototype.clearTriggerQueues=function(){this.triggerQueues={up:[],down:[],left:[],right:[]}},i.prototype.flushTriggers=function(){for(var i in this.triggerQueues){var o=this.triggerQueues[i],n="up"===i||"left"===i;o.sort(n?e:t);for(var r=0,s=o.length;s>r;r+=1){var a=o[r];(a.options.continuous||r===o.length-1)&&a.trigger([i])}}this.clearTriggerQueues()},i.prototype.next=function(e){this.waypoints.sort(t);var i=n.Adapter.inArray(e,this.waypoints),o=i===this.waypoints.length-1;return o?null:this.waypoints[i+1]},i.prototype.previous=function(e){this.waypoints.sort(t);var i=n.Adapter.inArray(e,this.waypoints);return i?this.waypoints[i-1]:null},i.prototype.queueTrigger=function(t,e){this.triggerQueues[e].push(t)},i.prototype.remove=function(t){var e=n.Adapter.inArray(t,this.waypoints);e>-1&&this.waypoints.splice(e,1)},i.prototype.first=function(){return this.waypoints[0]},i.prototype.last=function(){return this.waypoints[this.waypoints.length-1]},i.findOrCreate=function(t){return o[t.axis][t.name]||new i(t)},n.Group=i}(),function(){"use strict";function t(t){this.$element=e(t)}var e=window.jQuery,i=window.Waypoint;e.each(["innerHeight","innerWidth","off","offset","on","outerHeight","outerWidth","scrollLeft","scrollTop"],function(e,i){t.prototype[i]=function(){var t=Array.prototype.slice.call(arguments);return this.$element[i].apply(this.$element,t)}}),e.each(["extend","inArray","isEmptyObject"],function(i,o){t[o]=e[o]}),i.adapters.push({name:"jquery",Adapter:t}),i.Adapter=t}(),function(){"use strict";function t(t){return function(){var i=[],o=arguments[0];return t.isFunction(arguments[0])&&(o=t.extend({},arguments[1]),o.handler=arguments[0]),this.each(function(){var n=t.extend({},o,{element:this});"string"==typeof n.context&&(n.context=t(this).closest(n.context)[0]),i.push(new e(n))}),i}}var e=window.Waypoint;window.jQuery&&(window.jQuery.fn.waypoint=t(window.jQuery)),window.Zepto&&(window.Zepto.fn.waypoint=t(window.Zepto))}();
(function($)
{
	$.fn.textshuffle = function(arg)
	{
		var defaults =
		{
			str : "",
			waitChar : "-",
			charSpeed : 1,
			moveFix : 25,
			moveRange : 10,
			moveTrigger : 25,
			fps : 60
		};



		var options = $.extend(defaults, arg);

		return this.each(function(i)
		{
			var $target;
			// var id = -1;
			var htmlStore;

			var cMin = 33;
			var cMax = 126;

			var description;
			var randomList;
			var textCount;
			var fixLength;
			var fixStr;
			var currentStr;
			var end_charMotion;
			var end_textCount;
			var txtLabel;
			var listener;



			var randomMotion = function()
			{
				currentStr = fixStr;
				end_charMotion = true;

				for (var i = fixLength; i <= textCount; i++)
				{
					if (randomList[i] != 0 && randomList[i] != null)
					{
						end_charMotion = false;
						var temp_listnum = randomList[i];

						if (Math.abs(temp_listnum) <= options.moveTrigger)
						{
							var charcode = Math.min(Math.max(description.charCodeAt(i) + temp_listnum, cMin), cMax);
							currentStr += String.fromCharCode(charcode);
						}
						else
						{
							currentStr += options.waitChar;
						}

						if (temp_listnum > 0)
						{
							randomList[i] -= 1;
						}
						else
						{
							randomList[i] += 1;
						}
					}
					else
					{
						if (fixLength == i - 1)
						{
							fixLength = i;
							fixStr = description.substring(0, fixLength);
						}

						currentStr += description.charAt(i);
					}

					//text()が遅いので生のtextContentを使う
					// $target.text(currentStr);
					$target.get(0).textContent = currentStr;
				}

				if (textCount <= description.length)
				{
					textCount += options.charSpeed;
				}
				else
				{
					end_textCount = true;
				}

				if (end_charMotion && end_textCount)
				{
					// アニメーション終了
					clearInterval($target.data("id"));
					$target.html($target.data("html"));
					$target.data("run", false);
				}
			};



			//initialize

			$target = $(this);

			if (!$target.data("run"))
			{
				$target.data("html", $target.html());
				// 現在の内容を保存
			}
			else
			{
				// 完了していないので保存しない
			}
			$target.data("run", true);

			$target.html(options.str);
			options.str = $target.text();
			$target.html(options.waitChar);

			if(options.str)
			{
				description = options.str;
				randomList = [];

				for (var j = 0; j <= options.str.length - 1; j++)
				{
					var chr = description.charAt(i);

					if (chr != " ")
					{
						randomList[j] = (options.moveFix + Math.round(Math.random () * options.moveRange)) * (Math.round (Math.random ()) - 0.5) * 2;
					}
					else
					{
						randomList[j] = 0;
					}
				}

				textCount = 0;
				fixLength = 0;
				fixStr = "";

				// アニメーション開始
				clearInterval($target.data("id"));
				var id = setInterval(randomMotion, 1000 / options.fps);
				$target.data("id", id);
			}
		});
	};
})(jQuery);
/*
(function (w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js'
    });
    var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l != 'dataLayer' ? '&l=' + l : '';
    j.async = true;
    j.src =
        'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
    f.parentNode.insertBefore(j, f);
})(window, document, 'script', 'dataLayer', 'GTM-MC9X6BX');
*/
function goTo(id) {
    $('html,body').animate({
        scrollTop: $("#" + id).offset().top
    }, 'slow');
}

function incomesubtotal(field) {
    // Clean input
    stripformats(field);
    // Calculate income subtotal
    var incomesubtotal = 0;
    var incomevar = 0;
    var freqvar = 0;

    for (i = 1; i < 7; i++) {
        incomevar = document.getElementById("in" + i).value;
        freqvar = document.getElementById("yrin" + i).value;
        incomesubtotal = incomesubtotal + ((incomevar * freqvar) / 12);
    }

    document.getElementById("totalincome").value = parseInt(incomesubtotal * 100) / 100;
    recalcall(field);
    incomesubtotal = parseInt(incomesubtotal * 100) / 100;
    incomesubtotal = incomesubtotal.toFixed(2);
    summarycalc();
}

function householdsubtotal(field) {
    // Clean input
    stripformats(field);
    // Calculate household subtotal
    var householdsubtotal = 0;
    var householdvar = 0;
    var freqvar = 0;
    var totalincome = document.getElementById("totalincome").value;

    for (i = 1; i < 7; i++) {
        householdvar = document.getElementById("ex" + i).value;
        freqvar = document.getElementById("yrex" + i).value;
        householdsubtotal = householdsubtotal + ((householdvar * freqvar) / 12)
    }

    document.getElementById("totalhousehold").value = parseInt(householdsubtotal * 100) / 100;
    householdp = (parseInt(householdsubtotal / totalincome * 100) / 100) * 100;
    householdp = householdp.toFixed(0);
    
    if (document.getElementById("totalincome").value == 0) {
        document.getElementById("percenthousehold").innerHTML = 0 + "% of your Income";
    } else {
        document.getElementById("percenthousehold").innerHTML = householdp + "% of your Income";
    }
    summarycalc();

    householdsubtotal = parseInt(householdsubtotal * 100) / 100;
    householdsubtotal = householdsubtotal.toFixed(2);
}

function savingdebtsubtotal(field) {
    // Clean input
    stripformats(field);
    // Calculate saving debt subtotal
    var savingdebtsubtotal = 0;
    var savingdebtvar = 0;
    var freqvar = 0;
    var totalincome = document.getElementById("totalincome").value;

    for (i = 7; i < 12; i++) {
        savingdebtvar = document.getElementById("ex" + i).value;
        freqvar = document.getElementById("yrex" + i).value;
        savingdebtsubtotal = savingdebtsubtotal + ((savingdebtvar * freqvar) / 12)
    }
    
    document.getElementById("totalsavingdebt").value = parseInt(savingdebtsubtotal * 100) / 100;
    savingdebtp = (parseInt(savingdebtsubtotal / totalincome * 100) / 100) * 100;
    savingdebtp = savingdebtp.toFixed(0);
    if (document.getElementById("totalincome").value == 0) {
        document.getElementById("percentsavingdebt").innerHTML = 0 + "% of your Income";
    } else {
        document.getElementById("percentsavingdebt").innerHTML = savingdebtp + "% of your Income";
    }
    summarycalc();

    savingdebtsubtotal = parseInt(savingdebtsubtotal * 100) / 100;
    savingdebtsubtotal = savingdebtsubtotal.toFixed(2);
}

function leisuresubtotal(field) {
    // Clean input
    stripformats(field);
    // Calculate leisure subtotal
    var leisuresubtotal = 0;
    var leisurevar = 0;
    var freqvar = 0;
    var totalincome = document.getElementById("totalincome").value;

    for (i = 12; i < 17; i++) {
        leisurevar = document.getElementById("ex" + i).value;
        freqvar = document.getElementById("yrex" + i).value;
        leisuresubtotal = leisuresubtotal + ((leisurevar * freqvar) / 12)
    }

    document.getElementById("totalleisure").value = parseInt(leisuresubtotal * 100) / 100;
    leisurep = (parseInt(leisuresubtotal / totalincome * 100) / 100) * 100;
    leisurep = leisurep.toFixed(0);
    if (document.getElementById("totalincome").value == 0) {
        document.getElementById("percentleisure").innerHTML = 0 + "% of your Income";
    } else {
        document.getElementById("percentleisure").innerHTML = leisurep + "% of your Income";
    }
    summarycalc();

    leisuresubtotal = parseInt(leisuresubtotal * 100) / 100;
    leisuresubtotal = leisuresubtotal.toFixed(2);
}

function childrensubtotal(field) {
    // Clean input
    stripformats(field);
    // Calculate children subtotal
    var childrensubtotal = 0;
    var childrenvar = 0;
    var freqvar = 0;
    var totalincome = document.getElementById("totalincome").value;

    for (i = 17; i < 20; i++) {
        childrenvar = document.getElementById("ex" + i).value;
        freqvar = document.getElementById("yrex" + i).value;
        childrensubtotal = childrensubtotal + ((childrenvar * freqvar) / 12)
    }

    document.getElementById("totalchildren").value = parseInt(childrensubtotal * 100) / 100;
    childrenp = (parseInt(childrensubtotal / totalincome * 100) / 100) * 100;
    childrenp = childrenp.toFixed(0);

    if (document.getElementById("totalincome").value == 0) {
        document.getElementById("percentchildren").innerHTML = 0 + "% of your Income";
    } else {
        document.getElementById("percentchildren").innerHTML = childrenp + "% of your Income";
    }

    summarycalc();

    childrensubtotal = parseInt(childrensubtotal * 100) / 100;
    childrensubtotal = childrensubtotal.toFixed(2);
}

function travelsubtotal(field) {
    // Clean input
    stripformats(field);
    // Calculate children subtotal
    var travelsubtotal = 0;
    var travelvar = 0;
    var freqvar = 0;
    var totalincome = document.getElementById("totalincome").value;

    for (i = 20; i < 23; i++) {
        travelvar = document.getElementById("ex" + i).value;
        freqvar = document.getElementById("yrex" + i).value;
        travelsubtotal = travelsubtotal + ((travelvar * freqvar) / 12)
    }

    document.getElementById("totaltravel").value = parseInt(travelsubtotal * 100) / 100;
    travelp = (parseInt(travelsubtotal / totalincome * 100) / 100) * 100;
    travelp = travelp.toFixed(0);

    if (document.getElementById("totalincome").value == 0) {
        document.getElementById("percenttravel").innerHTML = 0 + "% of your Income";
    } else {
        document.getElementById("percenttravel").innerHTML = travelp + "% of your Income";
    }
    summarycalc();

    travelsubtotal = parseInt(travelsubtotal * 100) / 100;
    travelsubtotal = travelsubtotal.toFixed(2);
}

function stripformats(field) {
    // Remove formatting from input
    var fieldinput;
    fieldinput = document.getElementById(field).value;
    fieldinput = fieldinput.replace(/,/g, "");
    fieldinput = fieldinput.replace(/£/g, "");
    fieldinput = fieldinput.replace(/$/g, "");
    fieldinput = fieldinput.replace(/%/g, "");
    document.getElementById(field).value = fieldinput;
}

function summarycalc() {
    var totspend = 0;
    var netincome = 0;
    var incomesubtotal = document.getElementById("totalincome").value;
    incomesubtotal = parseInt(incomesubtotal * 100) / 100;
    incomesubtotal = incomesubtotal.toFixed(2);
    totspend = totspend + parseFloat(document.getElementById("totaltravel").value) + parseFloat(document.getElementById("totalchildren").value) + parseFloat(document.getElementById("totalleisure").value);
    totspend = totspend + parseFloat(document.getElementById("totalsavingdebt").value) + parseFloat(document.getElementById("totalhousehold").value);
    netincome = parseFloat(document.getElementById("totalincome").value) - totspend;
    netincome = parseInt(netincome * 100) / 100;
    netincome = netincome.toFixed(2);
    totspend = parseInt(totspend * 100) / 100;
    totspend = totspend.toFixed(2);

    document.getElementById("incometotal").innerHTML = "<span class=\"small-text\">Total Income</span>&pound;" + incomesubtotal;
    document.getElementById("sumtotalspend").innerHTML = "<span class=\"small-text\">Total Spend</span>&pound;" + totspend;
    document.getElementById("sumnet").innerHTML = "<span class=\"small-text\">Total Left Over</span>&pound;" + netincome;
    //document.getElementById("totspend2").innerHTML= "£"+ totspend;
    totalspendper = (parseInt(totspend / parseFloat(document.getElementById("totalincome").value) * 100) / 100) * 100;
    totalspendper = totalspendper.toFixed(0);
    //document.getElementById("totspend2p").innerHTML= totalspendper +"%";

    drawChart();
}


function recalcall(field) {
    householdsubtotal(field);
    savingdebtsubtotal(field);
    leisuresubtotal(field);
    childrensubtotal(field);
    travelsubtotal(field);
}

function addCommas(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

function drawChart() {

    var householdsubtotal = document.getElementById("totalhousehold").value;
    var savingdebtsubtotal = document.getElementById("totalsavingdebt").value;
    var leisuresubtotal = document.getElementById("totalleisure").value;
    var childrensubtotal = document.getElementById("totalchildren").value;
    var travelsubtotal = document.getElementById("totaltravel").value;

    // Draw Chart
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Amount');
    data.addColumn('number', '&pound;');
    data.addRows([
        ['Household', roundVal(householdsubtotal / 1000)],
        ['Saving Debt', roundVal(savingdebtsubtotal / 1000)],
        ['Leisure', roundVal(leisuresubtotal / 1000)],
        ['Children', roundVal(childrensubtotal / 1000)],
        ['Travel', roundVal(travelsubtotal / 1000)]
    ]);
    var options = {
        width: 150,
        height: 168,
        backgroundColor: 'none',
        colors: ['#C4122F', '#8DC63F', '#00AEEF', '#F7941E', '#662D91'],
        tooltip: {
            text: 'percentage'
        },
        legend: {
            position: 'bottom'
        },
        vAxis: {
            format: '&pound;##k'
        },
        title: 'Breakdown of Spend'
    };

    var chart = new google.visualization.PieChart(document.getElementById('chart'));
    chart.draw(data, options);
}

//Simple rounding function
function roundVal(val) {

    var dec = 2;
    var result = Math.round(val * Math.pow(10, dec)) / Math.pow(10, dec);
    return result;
}
function incometax_calculate() {

    // Allowances
    var pa65 = 11500.00; // 2017/18 tax year, updated 5 April 2017
    var pa6574 = 11500.00; // 2017/18 tax year, updated 5 April 2017
    var pa75over = 11500.00; // 2017/18 tax year, updated 5 April 2017
    var mca = 3260.00; // 2017/18 tax year, updated 5 April 2017
    var mca75 = 0.00; // 2017/18 tax year, updated 5 April 2017
    var mca75over = 8445.00; // 2017/18 tax year, updated 5 April 2017
    var ba = 2320.00; // 2017/18 tax year, updated 5 April 2017
    var trelief = 28000.00; // 2017/18 tax year, updated 5 April 2017

    // Rates & Bands
    var taxstart = 0.00; // 2017/18 tax year, updated 5 April 2017
    var taxsavings = 20; // Not used
    var taxbasic = 20.00; // 2017/18 tax year, updated 5 April 2017
    var taxhigher = 40.00; // 2017/18 tax year, updated 5 April 2017
    var bandstart = 0.00; // 2017/18 tax year, updated 5 April 2017
    var bandbasic = 33500.00; // 2017/18 tax year, updated 5 April 2017

    // 2010/11 Changes to income tax calculation
    var taxadditional = 45.00; // 2017/18 tax year, updated 5 April 2017
    var bandadditional = 150000.00; // 2017/18 tax year, updated 5 April 2017

    // Reducing personal allowance	
    var pareductionthreshold = 100000.00; // 2017/18 tax year, updated 5 April 2017
    var pareductionrate = 50.00; // 2017/18 tax year, updated 5 April 2017

    // Other	
    var taxable = 0;
    var tax = -1;
    var net = 0;

    // Get Input variables
    var earnings = document.getElementById("earnings").value;
    var personalallowance = document.getElementById("personalallowance").value;
    var marriedallowance = document.getElementById("marriedallowance").value;
    var blindallowance = document.getElementById("blindallowance").value;

    // Rate Conversion
    taxstart = taxstart / 100;
    taxsavings = taxsavings / 100;
    taxbasic = taxbasic / 100;
    taxhigher = taxhigher / 100;
    taxadditional = taxadditional / 100;
    pareductionrate = pareductionrate / 100;

    // Deal with personal allowance adjustments here for 2010/11 onwards
    if (earnings > pareductionthreshold) {
        pareduction = (earnings - pareductionthreshold) * pareductionrate;

        pa65 = pa65 - pareduction;
        pa6574 = pa6574 - pareduction;
        pa75over = pa75over - pareduction;

        // Reset to zero if gone negative
        if (pa65 < 0) {
            pa65 = 0;
        }
        if (pa6574 < 0) {
            pa6574 = 0;
        }
        if (pa75over < 0) {
            pa75over = 0;
        }
    }

    // Deal with blind allowance

    if (blindallowance == 'ba') {
        pa65 = pa65 + ba;
        pa6574 = pa6574 + ba;
        pa75over = ba;
    }

    // Start Calculation for single person under 65
    if (personalallowance == 'pa65' && marriedallowance == '0') {
        if (earnings < pa65) {
            // Earnings below allowances   
            tax = 0;
            net = earnings;
        } else { // starting rate
            if (earnings <= (pa65 + bandstart)) {
                taxable = earnings - pa65;
                tax = Math.round(taxable * taxstart);
                net = earnings - tax;
            } else { // earnings are in basic rate tax 
                if (earnings <= (pa65 + bandstart + bandbasic)) {
                    taxable = earnings - (pa65 + bandstart);
                    tax = Math.round((taxable * taxbasic) + (bandstart * taxstart));
                    net = earnings - tax;
                } else { // earnings are in higher rate tax

                    if ((earnings > (pa65 + bandstart + bandbasic)) && (earnings <= bandadditional)) {
                        taxable = earnings - (pa65 + bandstart + bandbasic);
                        hrtamount = taxable;
                        tax = Math.round((taxable * taxhigher) + ((bandstart * taxstart) + (bandbasic * taxbasic)));
                        net = earnings - tax;
                    } else { // Earnings in additional higher rate tax 

                        if (earnings > bandadditional) {

                            taxableadditional = earnings - bandadditional;
                            taxablehigher = bandadditional - bandbasic;
                            hrtamount = taxable;
                            tax = Math.round((taxableadditional * taxadditional) + (taxablehigher * taxhigher) + ((bandstart * taxstart) + (bandbasic * taxbasic)));
                            net = earnings - tax;

                        }

                    }

                }
            }

        }
        // Ends calculation single person under 65
    }

    // Start Calculation for single person age 65-74,
    if (personalallowance == 'pa6574' && marriedallowance == '0') {
        if (earnings < pa6574) {
            // earnings are below allowances
            tax = 0;
            net = earnings;
        } else { // earnings are in ten percent band
            if (earnings <= (pa6574 + bandstart)) {
                taxable = earnings - pa6574;
                tax = Math.round(taxable * taxstart);
                net = earnings - tax;
            } else { // earnings are in basic rate tax full age
                if (earnings <= trelief) {
                    taxable = earnings - (pa6574 + bandstart);
                    tax = Math.round((taxable * taxbasic) + (bandstart * taxstart));
                    net = earnings - tax;
                } else { // earnings are in basic rate tax with age ie trelief<income>(trelief+2*(pa6574-pa65))
                    // tax allowing full age is (trelief-(pa6574+bandstart))*taxbasic + (bandstart*taxstart)
                    if (earnings <= (trelief + 2 * (pa6574 - pa65))) {
                        taxable = earnings - trelief;
                        clawback = taxbasic * (earnings - trelief) / 2;
                        tax = Math.round((taxable * taxbasic) + clawback + ((trelief - (pa6574 + bandstart)) * taxbasic) + (bandstart * taxstart));
                        net = earnings - tax;
                    } else { // earnings are in basic rate tax no age 
                        if (earnings <= (pa65 + bandstart + bandbasic)) {
                            taxable = earnings - (pa65 + bandstart);
                            tax = Math.round((taxable * taxbasic) + (bandstart * taxstart));
                            net = earnings - tax;
                        } else { //earnings are in higher rate tax
                            if ((earnings > (pa65 + bandstart + bandbasic)) && (earnings <= bandadditional)) {
                                taxable = earnings - (pa65 + bandstart + bandbasic);
                                hrtamount = taxable;
                                tax = Math.round((taxable * taxhigher) + ((bandstart * taxstart) + (bandbasic * taxbasic)));
                                net = earnings - tax;
                            } else {
                                // Earnings in additional higher rate tax 

                                if (earnings > bandadditional) {

                                    taxableadditional = earnings - bandadditional;
                                    taxablehigher = bandadditional - bandbasic;
                                    hrtamount = taxable;
                                    tax = Math.round((taxableadditional * taxadditional) + (taxablehigher * taxhigher) + ((bandstart * taxstart) + (bandbasic * taxbasic)));
                                    net = earnings - tax;
                                }

                            }
                        }
                    }
                }
            }
        }
        // End Calculation for single person age 65-74
    }

    // Start Calculation for single person age 75 and over
    if (personalallowance == 'pa75over' && marriedallowance == 0) {
        if (earnings < pa75over) {
            //earnings are below allowances 
            tax = 0;
            net = earnings;
        } else { // earnings are in ten percent band
            if (earnings <= (pa75over + bandstart)) {
                taxable = earnings - pa75over;
                tax = Math.round(taxable * taxstart);
                net = earnings - tax;
            } else { // earnings are in basic rate tax full age
                if (earnings <= trelief) {
                    taxable = earnings - (pa75over + bandstart);
                    tax = Math.round((taxable * taxbasic) + (bandstart * taxstart));
                    net = earnings - tax;
                } else { // earnings are in basic rate tax with age ie trelief<income>(trelief+2*(pa75over-pa65))
                    // tax allowing full age is (trelief-(pa75over+bandstart))*taxbasic + (bandstart*taxstart)
                    if (earnings <= (trelief + 2 * (pa75over - pa65))) {
                        taxable = earnings - trelief;
                        clawback = taxbasic * (earnings - trelief) / 2;
                        tax = Math.round((taxable * taxbasic) + clawback + ((trelief - (pa75over + bandstart)) * taxbasic) + (bandstart * taxstart));
                        net = earnings - tax;
                    } else { // earnings are in basic rate tax no age 
                        if (earnings <= (pa65 + bandstart + bandbasic)) {
                            taxable = earnings - (pa65 + bandstart);
                            tax = Math.round((taxable * taxbasic) + (bandstart * taxstart));
                            net = earnings - tax;
                        } else { // earnings are in higher rate tax
                            if ((earnings > (pa65 + bandstart + bandbasic)) && (earnings <= bandadditional)) {
                                taxable = earnings - (pa65 + bandstart + bandbasic);
                                hrttamount = taxable;
                                tax = Math.round((taxable * taxhigher) + ((bandstart * taxstart) + (bandbasic * taxbasic)));
                                net = earnings - tax;
                            } else {

                                // Earnings in additional higher rate tax 

                                if (earnings > bandadditional) {

                                    taxableadditional = earnings - bandadditional;
                                    taxablehigher = bandadditional - bandbasic;
                                    hrtamount = taxable;
                                    tax = Math.round((taxableadditional * taxadditional) + (taxablehigher * taxhigher) + ((bandstart * taxstart) + (bandbasic * taxbasic)));
                                    net = earnings - tax;
                                }


                            }
                        }
                    }
                }
            }
        }

        // End Calculation for single person age 75 and over
    }

    // Start Calculation Married couple mca75, pa65 (taxpayer under 65, married to 65-75 year old).
    if (personalallowance == 'pa65' && marriedallowance == 'mca') {
        if (earnings < pa65) {
            // earnings are below allowances  
            tax = 0;
            net = earnings;
        } else { // earnings are in ten percent band,
            if (earnings <= (pa65 + bandstart)) {
                taxable = earnings - pa65;
                tax = taxable * taxstart;
                if (tax - (mca75 * taxstart) > 0) {
                    tax = tax - (mca75 * taxstart)
                } else {
                    tax = 0
                }
                net = earnings - tax;
            } else { // earnings are in basic rate tax with full age 
                if (earnings <= trelief) {
                    var taxable = earnings - (pa65 + bandstart);
                    var tax = (taxable * taxbasic) + (bandstart * taxstart);
                    if (tax - (mca75 * taxstart) > 0) {
                        tax = tax - (mca75 * taxstart)
                    } else {
                        tax = 0
                    }
                    tax = Math.round(tax);
                    net = earnings - tax;
                } else { // basic rate tax, full age but trelief in effect for mca
                    if (earnings <= (trelief + 2 * (mca75 - mca))) {
                        clawback = ((earnings - trelief) / 2) * taxstart;
                        a = earnings - trelief;
                        b = (trelief - pa65 - bandstart) * taxbasic + (bandstart * taxstart) - (mca75 * taxstart);
                        tax = (a * taxbasic) + b + clawback;
                        net = earnings - tax;
                    } else { // earnings are in basic rate tax no age 
                        if (earnings <= (pa65 + bandstart + bandbasic)) {
                            taxable = earnings - (pa65 + bandstart);
                            tax = (taxable * taxbasic) + (bandstart * taxstart) - (mca * taxstart);
                            net = earnings - tax;
                        } else { // earnings are in higher rate tax
                            if ((earnings > (pa65 + bandstart + bandbasic)) && (earnings <= bandadditional)) {
                                taxable = earnings - (pa65 + bandstart + bandbasic);
                                hrtamount = taxable;
                                tax = (taxable * taxhigher) + (bandstart * taxstart) + (bandbasic * taxbasic) - (mca * taxstart);
                                net = earnings - tax;
                            } else { // Earnings in additional higher rate tax 

                                if (earnings > bandadditional) {

                                    taxableadditional = earnings - bandadditional;
                                    taxablehigher = bandadditional - bandbasic;
                                    hrtamount = taxable;
                                    tax = Math.round((taxableadditional * taxadditional) + (taxablehigher * taxhigher) + ((bandstart * taxstart) + (bandbasic * taxbasic)));
                                    net = earnings - tax;
                                }

                            }
                        }
                    }
                }
            }
        }

        // End Calculation Married couple mca75, pa65
    }

    // Start Calculation married couple mca75over, pa65 (taxpayer under 65, married to 75+ year old).
    if (personalallowance == 'pa65' && marriedallowance == 'mca75') {
        if (earnings < pa65) {
            // earnings are below allowances
            tax = 0;
            net = earnings;
        } else { // earnings are in ten percent band,
            if (earnings <= (pa65 + bandstart)) {
                taxable = earnings - pa65;
                tax = taxable * taxstart;
                if (tax - (mca75over * taxstart) > 0) {
                    tax = tax - (mca75over * taxstart)
                } else {
                    tax = 0
                }
                net = earnings - tax;
            } else { // earnings are in basic rate tax with full age 
                if (earnings <= trelief) {
                    taxable = earnings - (pa65 + bandstart);
                    tax = (taxable * taxbasic) + (bandstart * taxstart);
                    if (tax - (mca75over * taxstart) > 0) {
                        tax = tax - (mca75over * taxstart)
                    } else {
                        tax = 0
                    }
                    tax = Math.round(tax);
                    net = earnings - tax;
                } else { // basic rate tax, full age but trelief in effect for mca
                    if (earnings <= (trelief + 2 * (mca75over - mca))) {
                        clawback = ((earnings - trelief) / 2) * taxstart;
                        a = earnings - trelief;
                        b = (trelief - pa65 - bandstart) * taxbasic + (bandstart * taxstart) - (mca75over * taxstart);
                        tax = (a * taxbasic) + b + clawback;
                        net = earnings - tax;
                    } else { // earnings are in basic rate tax no age 
                        if (earnings <= (pa65 + bandstart + bandbasic)) {
                            taxable = earnings - (pa65 + bandstart);
                            tax = (taxable * taxbasic) + (bandstart * taxstart) - (mca * taxstart);
                            net = earnings - tax;
                        } else { // earnings are in higher rate tax
                            if ((earnings > (pa65 + bandstart + bandbasic)) && (earnings <= bandadditional)) {
                                taxable = earnings - (pa65 + bandstart + bandbasic);
                                hrtamount = taxable;
                                tax = (taxable * taxhigher) + (bandstart * taxstart) + (bandbasic * taxbasic) - (mca * taxstart);
                                net = earnings - tax;
                            } else {

                                // Earnings in additional higher rate tax 
                                if (earnings > bandadditional) {

                                    taxableadditional = earnings - bandadditional;
                                    taxablehigher = bandadditional - bandbasic;
                                    hrtamount = taxable;
                                    tax = Math.round((taxableadditional * taxadditional) + (taxablehigher * taxhigher) + ((bandstart * taxstart) + (bandbasic * taxbasic)));
                                    net = earnings - tax;
                                }
                            }
                        }
                    }
                }
            }
        }
        // End calculation married couple mca75over, pa65
    }

    // Start calculation married couple mca75, pa6574
    if (personalallowance == 'pa6574' && marriedallowance == 'mca') {
        if (earnings < pa6574) {
            // earnings are below allowances  
            tax = 0;
            net = earnings;
        } else { // earnings are in ten percent band,
            if (earnings <= (pa6574 + bandstart)) {
                taxable = earnings - pa6574;
                tax = taxable * taxstart;
                if (tax - (mca75 * taxstart) > 0) {
                    tax = tax - (mca75 * taxstart)
                } else {
                    tax = 0
                }
                net = earnings - tax;
            } else { // earnings are in basic rate tax with full age 
                if (earnings <= trelief) {
                    taxable = earnings - (pa6574 + bandstart);
                    tax = (taxable * taxbasic) + (bandstart * taxstart);
                    if (tax - (mca75 * taxstart) > 0) {
                        tax = tax - (mca75 * taxstart)
                    } else {
                        tax = 0
                    }
                    tax = Math.round(tax);
                    net = earnings - tax;
                } else { // basic rate tax, full age but trelief in effect for mca
                    if (earnings <= (trelief + 2 * (mca75 - mca))) {
                        clawback = ((earnings - trelief) / 2) * taxstart;
                        a = earnings - trelief;
                        b = (trelief - pa6574 - bandstart) * taxbasic + (bandstart * taxstart) - (mca75 * taxstart);
                        tax = (a * taxbasic) + b + clawback;
                        net = earnings - tax;
                    } else { // basic rate tax age trelief in effect, mca down to basic
                        if (earnings <= (trelief + (mca75 - mca + pa6574 - pa65) * 2)) {
                            a = trelief + (mca75 - mca) * 2;
                            b = (earnings - a) / 2;
                            c = pa6574 - b;
                            tax = (earnings - c - bandstart) * taxbasic + (bandstart * taxstart) - (mca * taxstart);
                            net = earnings - tax;
                        } else { // earnings are in basic rate tax no age 
                            if (earnings <= (pa65 + bandstart + bandbasic)) {
                                taxable = earnings - (pa65 + bandstart);
                                tax = (taxable * taxbasic) + (bandstart * taxstart) - (mca * taxstart);
                                net = earnings - tax;
                            } else { // earnings are in higher rate tax
                                if ((earnings > (pa65 + bandstart + bandbasic)) && (earnings <= bandadditional)) {
                                    taxable = earnings - (pa65 + bandstart + bandbasic);
                                    hrtamount = taxable;
                                    tax = (taxable * taxhigher) + (bandstart * taxstart) + (bandbasic * taxbasic) - (mca * taxstart);
                                    net = earnings - tax;
                                } else {
                                    // Earnings in additional higher rate tax 
                                    if (earnings > bandadditional) {

                                        taxableadditional = earnings - bandadditional;
                                        taxablehigher = bandadditional - bandbasic;
                                        hrtamount = taxable;
                                        tax = Math.round((taxableadditional * taxadditional) + (taxablehigher * taxhigher) + ((bandstart * taxstart) + (bandbasic * taxbasic)));
                                        net = earnings - tax;
                                    }


                                }
                            }
                        }
                    }
                }
            }
        }
        // End calculation married couple mca75, pa6574
    }


    // Start calculation married couple mca75over, pa6574
    if (personalallowance == 'pa6574' && marriedallowance == 'mca75') {
        if (earnings < pa6574) {
            // earnings are below allowances  
            tax = 0;
            net = earnings;
        } else { // earnings are in ten percent band,
            if (earnings <= (pa6574 + bandstart)) {
                taxable = earnings - pa6574;
                tax = taxable * taxstart;
                if (tax - (mca75over * taxstart) > 0) {
                    tax = tax - (mca75over * taxstart)
                } else {
                    tax = 0
                }
                net = earnings - tax;
            } else { // earnings are in basic rate tax with full age 
                if (earnings <= trelief) {
                    taxable = earnings - (pa6574 + bandstart);
                    tax = (taxable * taxbasic) + (bandstart * taxstart);
                    if (tax - (mca75over * taxstart) > 0) {
                        tax = tax - (mca75over * taxstart)
                    } else {
                        tax = 0
                    }
                    tax = Math.round(tax);
                    net = earnings - tax;
                } else { // basic rate tax, full age but trelief in effect for mca
                    if (earnings <= (trelief + 2 * (mca75over - mca))) {
                        clawback = ((earnings - trelief) / 2) * taxstart;
                        a = earnings - trelief;
                        b = (trelief - pa6574 - bandstart) * taxbasic + (bandstart * taxstart) - (mca75over * taxstart);
                        tax = (a * taxbasic) + b + clawback;
                        net = earnings - tax;
                    } else { // basic rate tax age trelief in effect, mca down to basic
                        if (earnings <= (trelief + (mca75over - mca + pa6574 - pa65) * 2)) {
                            a = trelief + (mca75over - mca) * 2;
                            b = (earnings - a) / 2;
                            c = pa6574 - b;
                            tax = (earnings - c - bandstart) * taxbasic + (bandstart * taxstart) - (mca * taxstart);
                            net = earnings - tax;
                        } else { // earnings are in basic rate tax no age 
                            if (earnings <= (pa65 + bandstart + bandbasic)) {
                                taxable = earnings - (pa65 + bandstart);
                                tax = (taxable * taxbasic) + (bandstart * taxstart) - (mca * taxstart);
                                net = earnings - tax;
                            } else { // earnings are in higher rate tax
                                if ((earnings > (pa65 + bandstart + bandbasic)) && (earnings <= bandadditional)) {
                                    taxable = earnings - (pa65 + bandstart + bandbasic);
                                    hrtamount = taxable;
                                    tax = (taxable * taxhigher) + (bandstart * taxstart) + (bandbasic * taxbasic) - (mca * taxstart);
                                    net = earnings - tax;
                                } else {

                                    // Earnings in additional higher rate tax 
                                    if (earnings > bandadditional) {

                                        taxableadditional = earnings - bandadditional;
                                        taxablehigher = bandadditional - bandbasic;
                                        hrtamount = taxable;
                                        tax = Math.round((taxableadditional * taxadditional) + (taxablehigher * taxhigher) + ((bandstart * taxstart) + (bandbasic * taxbasic)));
                                        net = earnings - tax;
                                    }

                                }
                            }
                        }
                    }
                }
            }
        }
        // End calculation married couple mca75over, pa6574
    }

    // Start Calculation married couple mca75over, pa75over
    if (personalallowance == 'pa75over' && marriedallowance == 'mca75') {
        if (earnings < pa75over) {
            // earnings are below allowances 
            tax = 0;
            net = earnings;
        } else { // earnings are in ten percent band,
            if (earnings <= (pa75over + bandstart)) {
                taxable = earnings - pa75over;
                tax = taxable * taxstart;
                if (tax - (mca75over * taxstart) > 0) {
                    tax = tax - (mca75over * taxstart)
                } else {
                    tax = 0
                }
                net = earnings - tax;
            } else { // earnings are in basic rate tax with full age 
                if (earnings <= trelief) {
                    taxable = earnings - (pa75over + bandstart);
                    tax = (taxable * taxbasic) + (bandstart * taxstart);
                    if (tax - (mca75over * taxstart) > 0) {
                        tax = tax - (mca75over * taxstart)
                    } else {
                        tax = 0
                    }
                    tax = Math.round(tax);
                    net = earnings - tax;
                } else { // basic rate tax, full age but trelief in effect for mca
                    if (earnings <= (trelief + 2 * (mca75over - mca))) {
                        clawback = ((earnings - trelief) / 2) * taxstart;
                        a = earnings - trelief;
                        b = (trelief - pa75over - bandstart) * taxbasic + (bandstart * taxstart) - (mca75over * taxstart);
                        tax = (a * taxbasic) + b + clawback;
                        net = earnings - tax;
                    } else { // basic rate tax age trelief in effect, mca down to basic
                        if (earnings <= (trelief + (mca75over - mca + pa75over - pa65) * 2)) {
                            a = trelief + (mca75over - mca) * 2;
                            b = (earnings - a) / 2;
                            c = pa75over - b;
                            tax = (earnings - c - bandstart) * taxbasic + (bandstart * taxstart) - (mca * taxstart);
                            net = earnings - tax;
                        } else { // earnings are in basic rate tax no age 
                            if (earnings <= (pa65 + bandstart + bandbasic)) {
                                taxable = earnings - (pa65 + bandstart);
                                tax = (taxable * taxbasic) + (bandstart * taxstart) - (mca * taxstart);
                                net = earnings - tax;
                            } else { //earnings are in higher rate tax
                                if ((earnings > (pa65 + bandstart + bandbasic)) && (earnings <= bandadditional)) {
                                    taxable = earnings - (pa65 + bandstart + bandbasic);
                                    hrtamount = taxable;
                                    tax = (taxable * taxhigher) + (bandstart * taxstart) + (bandbasic * taxbasic) - (mca * taxstart);
                                    net = earnings - tax;
                                } else {

                                    if (earnings > bandadditional) {

                                        taxableadditional = earnings - bandadditional;
                                        taxablehigher = bandadditional - bandbasic;
                                        hrtamount = taxable;
                                        tax = Math.round((taxableadditional * taxadditional) + (taxablehigher * taxhigher) + ((bandstart * taxstart) + (bandbasic * taxbasic)));
                                        net = earnings - tax;
                                    }

                                }
                            }
                        }
                    }
                }
            }
        }
        // End Calculation married couple mca75over, pa75over
    }

    if (tax == -1) {
        alert("Please reselect Allowances");
    }

    // ba and  tidying results and vetting for errors
    net = parseFloat(net);
    tax = parseFloat(tax);

    // ba 
    //if(blindallowance=='ba'){ 
    //net=net+(ba*taxstart);
    //tax=tax-(ba*taxstart);

    //}
    //correct for negatives (ie from ba and child)
    if (tax <= 0) {
        net = earnings;
        document.getElementById("total").innerHTML = "£0";
        document.getElementById('summary').innerHTML = "No tax to pay"


    } else {
        document.getElementById("total").innerHTML = "&pound;" + addCommas(Math.round(tax));

        // Summary

        var total = document.getElementById("total").innerHTML

        var output = "Based on earnings of <span class=\"highlight-amount\">&pound;" + addCommas(earnings) + "</span> and tax rates and allowances for the tax year 2017/18, your income tax would be <span class=\"highlight-amount\">" + total + "</span>";

        document.getElementById('summary').innerHTML = output;

    }
}

function stripformats(field) {
    // Remove formatting from input
    var fieldinput;
    fieldinput = document.getElementById(field).value;
    fieldinput = fieldinput.replace(/,/g, "");
    fieldinput = fieldinput.replace(/£/g, "");
    fieldinput = fieldinput.replace(/$/g, "");
    fieldinput = fieldinput.replace(/%/g, "");
    document.getElementById(field).value = fieldinput;

}

function addCommas(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}
function IHT_calculate() {

    var ihtthreshold = 325000.00; // 2017/18 tax year, updated 5 April 2017
    var ihtmainhomethreshold = 100000.00; // 2017/18 tax year, updated 5 April 2017
    var ihttaxrate = 40.00; // 2017/18 tax year, updated 5 April 2017

    var totamount;
    totamount = parseFloat(document.getElementById("homes").value) + parseFloat(document.getElementById("investments").value);
    totamount = totamount + parseFloat(document.getElementById("artantiques").value) + parseFloat(document.getElementById("lifeinsurance").value);
    totamount = totamount + parseFloat(document.getElementById("loansdebtors").value) + parseFloat(document.getElementById("business").value)
    totamount = totamount - parseFloat(document.getElementById("loanscreditors").value);

    var combinedThreshold = 0;
    if (document.getElementById("mainresidenceleft").checked == true) {
        combinedThreshold = ihtthreshold + ihtmainhomethreshold;
    } else {
        combinedThreshold = ihtthreshold;
    }

    if (totamount <= combinedThreshold) {
        var taxamount = 0;
    } else {
        var taxamount = (totamount - combinedThreshold) * (ihttaxrate / 100);
    }

    document.getElementById("estatevalue").innerHTML = "<span class=\"small-text\">Total value of your estate:</span>&pound;" + addCommas(parseInt(totamount * 100) / 100) + "</span>"
    document.getElementById("ihtliability").innerHTML = "<span class=\"small-text\">Total Inheritance Tax due:</span>&pound;" + addCommas(parseInt(taxamount * 100) / 100) + ""

}

function stripformats(field) {
    // Remove formatting from input
    var fieldinput;
    fieldinput = document.getElementById(field).value;
    fieldinput = fieldinput.replace(/,/g, "");
    fieldinput = fieldinput.replace(/£/g, "");
    fieldinput = fieldinput.replace(/$/g, "");
    fieldinput = fieldinput.replace(/%/g, "");
    document.getElementById(field).value = fieldinput;
}

function addCommas(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}
(function($) {
  $(document).ready(function() {
    // Menu Proprties
    var menu = $('.main-nav-list');
    var topMenu = $('.main-nav-list__link');
    var parentLi = $('.main-nav-list__item--parent');
    var backBtn = $('.main-nav-list__sub-menu__link--back');

    /* Toggle Main Menu */
    $('.hamburger').on('click', function() {
        $(this).hasClass('is-active') ?
        ($(this).removeClass('is-active'), $('.main-nav').removeClass('main-nav--open')) :
        ($(this).addClass('is-active'), $('.main-nav').addClass('main-nav--open'));
    });

    // Prevent the parent item from loading the target page show sub menu instead
    $('.main-nav-list__item--parent').each(function() {
        var t = $(this);
        t.find('a').eq(0).attr('href', '#');
    });

    // Open Sub Menu
    topMenu.on("click", function(e) {
      var thisTopMenu = $(this).parent();
      if(thisTopMenu.hasClass('main-nav-list__item--parent')) {
        e.preventDefault();
        parentLi.removeClass('main-nav-list__item--open');
        thisTopMenu.addClass('main-nav-list__item--open');
      }
    });

    // Close Sub Menu
    backBtn.click(function(e){
      e.preventDefault();
      var thisBackBtn = $(this);
      parentLi.removeClass('main-nav-list__item--open');
    });
  });
})(jQuery);
(function($) {
    $(window).load(function() {
        
		var width = 100,
			perfData = window.performance.timing,
			estimatedTime = -(perfData.loadEventEnd - perfData.navigationStart),
			time = parseInt((estimatedTime / 1000) % 60) * 100,
            start = 0,
            progress = 0,
            interval = setInterval(function() {
                progress += 100;
                n = (progress / time) * 100;
                $('.load-percentage').text(Math.round(n) + "%");
                
                if(n >= 100) {
                    clearInterval(interval);
                }
            }, 100);
		
		$('#fd-load-bar').animate({
			width: width + "%"
		}, time, function() {
            $('#fd-page-loader').fadeOut(382, function(){
				$('#fd-page').fadeIn(618);
            });
        });
       
	});
})(jQuery);
/* Application Code */
function randomSpeed(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
var media_size = {
    _desktop: "(min-width: 1200px)",
    _laptop: "(min-width:992px) and (max-width: 1199px)",
    _tablet: "(min-width:768px) and (max-width: 991px)",
    _mobile: "(max-width:767px)"
}

function isMobile() {
    if (window.matchMedia(media_size._mobile).matches)
        return true;
    return false;
}

function isTablet() {
    if (window.matchMedia(media_size._tablet).matches)
        return true;
    return false;
}

function isLaptop() {
    if (window.matchMedia(media_size._laptop).matches)
        return true;
    return false;
}

function isDesktop() {
    if (window.matchMedia(media_size._desktop).matches)
        return true;
    return false;
}

function testMediaSize() {
    if (isMobile())
        console.log("Mobile View");
    else if (isTablet())
        console.log("Tablet View");
    else if (isLaptop())
        console.log("Laptop View");
    else if (isDesktop())
        console.log("Desktop View");
}

(function ($) {
	
    var _offset = 65;
    var _speedMin = 1670;
    var _speedMax = 4000;
    var _iOS = navigator.userAgent.match(/(iPad|iPhone|iPod)/g);
	
	$(document).ready(function () {        
        /* Scroller function to auto scroll from gallery to content */
        function scroller(parent, target, offset, speed) {
            $(parent).click(function () {
                $('html, body').animate({
                    scrollTop: $(target).offset().top - offset
                }, speed);
            });
        }
        
        //scroller('.gallery-scroll', '#section-scroll-to', _offset, 'slow');
        if(isMobile()) {
            $("#scroll-to").on("click", function() {
                var b = $("#fdc-hero-image").outerHeight();
                $("html,body").animate({scrollTop: b}, 400);
            });
        } else {
            $("#scroll-to").on("click", function() {
                var b = $("#fdc-hero-image").outerHeight();
                $("html,body").animate({scrollTop: b}, 400);
            });
        }
        
    });
	
    $(window).load(function () {
        if (_iOS) {
            function iOSVHFix() {
                $("#fd-carousel .item").height(($(window).height()));
                $("#section-page-map #map-canvas").height(($(window).height()));
            }
            iOSVHFix();
            $(window).bind('resize', iOSVHFix);
        }
        $("#fd-carousel #fd-gallery-load").fadeOut('fast', function () {
            $("#fd-carousel .item .container").delay(510).fadeIn(990);
        });
    });
})(jQuery);
(function($) {
    $(document).ready(function() {
        $('.team-photo').slick({
            autoplay: true,
            autoplaySpeed: 5500,
            slidesToShow: 1, 
            slidesToScroll: 1, 
            arrows: false, 
            asNavFor: '.team-data', 
            pauseOnHover: true,
            speed: 382
        });

        $('.team-data').slick({
            slidesToShow: 1, 
            slidesToScroll: 1, 
            asNavFor: '.team-photo',
            dots: false,
            arrows: false, 
            pauseOnHover: true,
            speed: 618
        });
    });        
})(jQuery);
(function($){
    $(document).ready(function() {
        // Waypoints Implementation
        var $reveals = $('.gl-introduction').find('.rev-me');
        var $offset = '95%';

        $reveals.each(function(index, el) {
            var $t = $(el);

            $t.waypoint(function() {
                switch(index) {
                    case 0: 
                        $class = 'rev--d25'; 
                        break;
                    case 1: 
                        $class = 'rev--d38'; 
                        break;
                    case 2: 
                        $class = 'rev--d50'; 
                        break;
                    default: 
                        $class = 'rev--d25';
                }

                $($t).addClass('rev').addClass('rev--btt').addClass($class);
                $($t).find('.prep-me').addClass('prep-rev').removeClass('prep-me');
            }, {offset: $offset});
        });
        
        $reveals = $('.f-grid').find('.rev-me');
        $reveals.each(function(index, el){
            var $t = $(el);

            $t.waypoint(function() {
                $class = (index % 2) ? 'rev--d50' : 'rev--d25';
                $($t).addClass('rev').addClass('rev--ltr').addClass($class);
                $($t).find('.prep-me').addClass('prep-rev').removeClass('prep-me');
            }, {offset: $offset });
        });

        $reveals = $('#fdc-hero-image.rev-me');
        $reveals.each(function(index, el) {
            var $t = $(el);
            $t.waypoint(function() {
                $($t).addClass('rev').addClass('rev--ttb');
                $($t).find('.prep-me').addClass('prep-rev--hero').removeClass('prep-me');
            }, { offset: $offset });
        });
    });
})(jQuery);
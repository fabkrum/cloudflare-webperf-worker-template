// set the site we are modifying
const site = 'www.example.com';

// do this on a fetch
addEventListener('fetch', event => {
  const request = event.request
  event.respondWith(handleRequest(request))
});

async function handleRequest(request) {
  // store the URL
  const url = new URL(request.url);

  // disallow crawlers (write a robots.txt file)
  if(url.pathname === "/robots.txt") {
    return new Response('User-agent: *\nDisallow: /', {status: 200});
  }

  // when overrideHost is used in a WPT script, WPT sets x-host to original host i.e. site we want to proxy
  // store the value of x-host
  const xhost = request.headers.get('x-host');

  // If the `x-host` header is missing, abort and tell us
  if(!xhost) {
    return new Response('x-host header missing', {status: 403});
  }

  // set our hostname to that listed in the x-host header
  url.hostname = xhost;

  // look for header that allows us to bypass the transform entirely
  const bypassTransform = request.headers.get('x-bypass-transform');

  // get the accept header to allow us to examine the type of request it is
  const acceptHeader = request.headers.get('accept');

  // check that the x-host header matches what is contained in the site
  // make sure we aren't wanting to bypass the transformations
  if(xhost === site && (!bypassTransform || (bypassTransform && bypassTransform.indexOf('true') === -1))){
    // check for an accept header and what it contains
    if(acceptHeader && acceptHeader.indexOf('text/html') >= 0){
      // store this particular HTML response for modification
      let oldResponse = await fetch(url.toString(), request)
      // create a new response
      let newResponse = new HTMLRewriter()
        /**
         * Our modifications to the HTML go in here using the HTMLRewriter API
         * https://developers.cloudflare.com/workers/runtime-apis/html-rewriter
         */
        .transform(oldResponse)
      
        // Search and replace
        // newResponse = newResponse.replace('/Source Phrase/g', 'Target Phrase');

        // return the modified page
        return newResponse
    }
  }

  // otherwise just proxy the request unmodified
  return fetch(url.toString(), request);
}




/*

// Replacing head

const $head = `
  <head>
  ...
  </head>
`;

.on('head', new replaceHead())

class replaceHead {
  element(element) {
    element.replace(head, {html: true});
  }
}

// Search & Replace
html = html.replace( /<\/body>/ , customScripts)

// Rewrite links
.on("a", new AttributeRewriter("href"))
.on("link", new AttributeRewriter("href"))
.on("img", new AttributeRewriter("src"))
.on("script", new AttributeRewriter("src"))
.on("image", new AttributeRewriter("src"))
.on("meta", new AttributeRewriter("content"))

const OLD_URL = "https://www.example.com/";
const NEW_URL = "/";
 
class AttributeRewriter {
    constructor(attributeName) {
        this.attributeName = attributeName
    }
    element(element) {
        const attribute = element.getAttribute(this.attributeName)
        if (attribute) {
            element.setAttribute(
                this.attributeName,
                attribute.replace(OLD_URL, NEW_URL),
            )
        }
    }
}

// Adding attributes

// add defer to this script
.on("script[src*='script-to-be-deferred.js']", new addDeferAttribute())
// add async to this script
.on("script[src*='script-to-be-asynced.js']", new addAsyncAttribute())
// add with and height attributes to img
.on("img[src*='image-name.jpeg']", new addDimensions())


class addDeferAttribute {
  element(element) {
    element.setAttribute('defer', 'defer');
  }
}
 
class addAsyncAttribute {
  element(element) {
    element.setAttribute('async', 'async');
  }
}
class addDimensions {
    element(element) {
        element.setAttribute('style', 'height:9px;width:16px');
    }
}

// Search and reaplace

// Quickly adding scripts to the <head> and closing <body> tags

// remove all external scripts from the page
.on("body > script[src]", new removeElement())
// insert scripts back before the closing body tag
.on("body", new reinsertBodyScripts())
// insert scripts back before the closing head tag
.on("head", new reinsertHeadScripts())


class removeElement {
  element(element) {
    element.remove();
  }
}
 
class reinsertBodyScripts {
  element(element) {
    var srcArray = [
      '/assets/js/body-script-1.js',
      '/assets/js/body-script-2.js'
    ]
 
    srcArray.forEach(function(val){
      element.append(`<script src="${val}"></script>`, {html: true});
    })
  }
}
 
class reinsertHeadScripts {
  element(element) {
    var srcArray = [
      '/assets/js/deferred-head-script-1.js',
      '/assets/js/deferred-head-script-2.js'
    ]
 
    srcArray.forEach(function(val){
      element.append(`<script src="${val}" defer></script>`, {html: true});
    })
  }
}


// Add Resource Hints

.on('head', new addResourceHints())

class addResourceHints {
    element(element) {       
        var resourceHints = `
            <link rel="preload" href="/assets/font/font1.woff2" as="font" type="font/woff2" crossorigin="anonymous">
            <link rel="dns-prefetch" href="https://fonts.gstatic.com/">
            <link href="https://cdn.domain.com" rel="preconnect" crossorigin>
        `
 
        // notice how we are prepending the hints, right after the opening head tag
        // can be changed to append if you want them right before the closing tag       
        element.prepend(resourceHints, {html: true});
    }
}

// Remove Resource Hints

// blanket example of removing all resource hints
.on("link[rel='preload']", new removeElement())
.on("link[rel='prefetch']", new removeElement())
.on("link[rel='dns-prefetch']", new removeElement())
.on("link[rel='prerender']", new removeElement())
.on("link[rel='preconnect']", new removeElement())
// example were we only remove a selected preload hint for a font
.on("link[rel='preload'][href*='our-woff2-font.woff2']", new removeElement())

class removeElement {
  element(element) {
    element.remove();
  }
}

// Remove Elements

// remove a specific script
.on("script[src*='name-of-our-script.js']", new removeElement())
// remove the third meta tag in the head
.on("head > meta:nth-of-type(3)", new removeElement())
// remove all div elements that start with 'prefix'
.on("div[class^='prefix']", new removeElement())
// remove all link elements that start with '/assets/' and end with '.css'
.on("link[href^='/assets/'][href$='.css']", new removeElement())

class removeElement {
  element(element) {
    element.remove();
  }
}

// Clearing and adding inline scripts

// remove inline scripts from the page
.on("body > script:not([src])", new removeElement())
// reinsert some inline JavaScript back into the page
.on("body", new reinsertInlineScript())
// transform the page

class removeElement {
  element(element) {
    element.remove();
  }
}
 
class reinsertInlineScript {
  element(element){
    let inlineScript = `document.body.className = ((document.body.className) ? document.body.className + ' js-enabled' : 'js-enabled');`;
    element.prepend(`<script>${inlineScript}</script>`, {html: true});
  }
}

// Adding CSS

// remove inline scripts from the page
.on("body > script:not([src])", new removeElement())
// reinsert some inline JavaScript back into the page
.on("body", new reinsertInlineScript())
// transform the page

class removeElement {
  element(element) {
    element.remove();
  }
}
 
class reinsertInlineScript {
  element(element){
    let inlineScript = `document.body.className = ((document.body.className) ? document.body.className + ' js-enabled' : 'js-enabled');`;
    element.prepend(`<script>${inlineScript}</script>`, {html: true});
  }
}

// Moving Third Party Tags

.on('script[src="//static.goqubit.com/smartserve-xxxx.js"]', new removeSmartServe())
.on('head', new reinsertSmartServe())

class removeSmartServe {
  element(element) {
    element.remove();
  }
}
 
class reinsertSmartServe {
  element(element) {
    var text = '<script src="//static.goqubit.com/smartserve-xxxx.js" async defer></script>';
 
    element.append(text, {html: true});
  }
}


// Deferring Inline Scripts

class deferInlineScript {
  element(element) {
 
    const wrapperStart = "window.addEventListener('load', function() {";
    const wrapperEnd ="});";
 
    element.prepend(wrapperStart, {html: true});
    element.append(wrapperEnd,  {html: true});
  }
}




*/



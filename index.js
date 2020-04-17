/**
 * Cloudflare internship submission
 * This is my submission for cloudflare's full stack workers assignment
 * Jonathan Xu
 * April 17, 2020
 */

// Note: I've done all the extra credit steps except the last one.
// I'm having issues setting up my DNS for my workers; if I could reach out to someone for help that would be awesome!

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

// Element handler to change values on the return html
class ElementHandler {
  /**
   * Replacing some elements based on tag name
   * @param {string} element website element
   */
  element(element) {
    if (element.tagName === "a") {
      element.setAttribute("href", "https://jonathanxu.tk");
      element.setInnerContent("Check out my website");
    }
    if (element.tagName === "div" && element.getAttribute("class") === "absolute inset-0 bg-gray-500 opacity-75") {
      element.setAttribute("class", "absolute inset-0 bg-red-500 opacity-75");
    }
  }

  /**
   * Replacing some text to make things more exciting
   * @param {string} text website text
   */
  text(text) {
    // An incoming piece of text
    if (text.text.includes("Variant 1")) {
      text.replace("Thing 1");
    }
    if (text.text.includes("Variant 2")) {
      text.replace("Thing 2");
    }
    if (text.text.includes("This is variant one of the take home project!")) {
      text.replace("thing one and thing two! they ran down! they ran up! on the string of one kite we saw father's old cup!");
    }
    if (text.text.includes("This is variant two of the take home project!")) {
      text.replace("thing two and thing one! they ran up! they ran down! on the string of one kite we saw mother's new gown!");
    }
  }
}

/**
 * Grabs the cookie with name from the request headers
 * @param {Request} request incoming Request
 * @param {string} name of the cookie to grab
 */
function getCookie(request, name) {
  let result = null
  let cookieString = request.headers.get('Cookie')
  if (cookieString) {
    let cookies = cookieString.split(';')
    cookies.forEach(cookie => {
      let cookieName = cookie.split('=')[0].trim()
      if (cookieName === name) {
        let cookieVal = cookie.split('=')[1]
        result = cookieVal
      }
    })
  }
  return result
}

/**
 * Respond with hello worker text
 * @param {Request} request
 */

async function handleRequest(request) {
  // Fetch the variants api to get an array of two URLs
  let response = await fetch("https://cfw-takehome.developers.workers.dev/api/variants");
  let site = await response.json();

  // Check cookies
  let requestUrl;
  let createCookie = false;
  let v;
  const cookie = getCookie(request, 'variant');
  if (cookie && cookie === '0') {
    requestUrl = site.variants[0];
  } else if (cookie && cookie === '1') {
    requestUrl = site.variants[1];
  } else {
    // if no cookie then this is a new client, decide a group and set the cookie
    v = (Math.random() >= 0.5) ? 0 : 1;
    requestUrl = site.variants[v];
    createCookie = true;
  }

  // Fetch the randomly selected URL and return
  let variantResponse = await fetch(requestUrl);

  let document = new HTMLRewriter().on('*', new ElementHandler()).transform(variantResponse)
  let output = await document.text();

  let outputResponse = new Response(output, variantResponse);

  if (createCookie) {
    outputResponse.headers.append('Set-Cookie', `variant=${v}`);
  }

  return outputResponse;
}
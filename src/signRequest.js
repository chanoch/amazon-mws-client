import crypto from 'crypto'

/**
 * Creates a sha256 signature of the combined function parameters separated by new lines
 * 
 * A worker function for signQueryAndAppend
 * 
 * @param {String} HttpVerb - GET, POST, PUT
 * @param {*} HostHeader 
 * @param {*} HTTPRequestURI 
 * @param {*} QueryString 
 */
const signRequest = (HttpVerb, HostHeader, HTTPRequestURI, QueryString) => {
  const dataToSign = `${HttpVerb}\n${HostHeader}\n${HTTPRequestURI}\n${QueryString}`
  return crypto.createHmac('sha256', process.env.SECRET_ACCESS_KEY).update(dataToSign, 'utf8').digest('base64')
}

/**
 * Sign the request and append the signature to the query string
 * 
 * @param {String} HttpVerb - GET, POST, PUT
 * @param {String} HostHeader - the API endpoint stripped of the protocol and port and trailing slash 
 * @param {String} HTTPRequestURI - the action's endpoint path e.g. /feeds/2009-01-01/
 * @param {String} QueryString - contains the standard params plus the action specific query string params 
 */
const signQueryAndAppend = (HttpVerb, HostHeader, HTTPRequestURI, QueryString) => {
  const signature = signRequest(HttpVerb, HostHeader, HTTPRequestURI, QueryString)
  return `${QueryString}&Signature=${encodeURIComponent(signature)}`
}

export {
  signRequest, // exported for testing
  signQueryAndAppend
}

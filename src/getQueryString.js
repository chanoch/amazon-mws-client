const signatureMethod = `HmacSHA256`
const signatureVersion = '2'

/**
 * Populate query string with standard required params (not exported, used by getQueryString())
 * 
 * @param {String} action - amazon requests are identified by action type - e.g. RequestReport, ListOrderItems 
 * @param {String} version - API version number (from doc - something like '2009-01-01')
 * @param {*} requestTimeStamp - part of request authentication is the request timestamp.
 */
const getVanillaRequestParams = (action, version, requestTimeStamp) => {
  return   [
    ['AWSAccessKeyId', process.env.AWS_ACCESS_KEY_ID],
    ['Action', action],
    ['MWSAuthToken', process.env.MWS_AUTH_TOKEN],
    ["MarketplaceId.Id.1", process.env.MWS_MARKETPLACEID], // optional as otherwise home mid?
    ['SellerId', process.env.SELLER_ID],
    ['SignatureMethod', signatureMethod],
    ['SignatureVersion', signatureVersion],
    ['Timestamp', requestTimeStamp.toISOString()],
    ['Version', version],
  ]
}

const encodeValue = value => {
  return encodeURIComponent(value).replace('*', '%2A')
}

/**
 * Create a query string for an MWS API request
 * 
 * Get the generic Amazon request parameters
 * Add in the specific request params
 * Sort names by natural byte order
 * URI encode names and values
 */
const getQueryString = (action, version, params, requestTimeStamp) => {
  let prefix = ''
  const returns = 
    getVanillaRequestParams(action, version, requestTimeStamp) // get the generic request params
    .concat(params) // add the specific endpoint params
    .sort((a, b) => a[0] > b[0] ? 1 : -1)
    .reduce((prev, param) => {
      prefix = prev === '' ? '' : '&'
      
      if(!param) return prev

      return `${prev}${prefix}${encodeValue(param[0])}=${encodeValue(param[1])}`
    }, '')
    return returns
}

export default getQueryString

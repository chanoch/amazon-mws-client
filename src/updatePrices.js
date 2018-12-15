import { getQueryString, signQueryAndAppend } from './index'
import superagent from 'superagent'
import calculateMD5Hash from './calculateMD5Hash';

/********************************************************************************
 * 
 * Update prices for a list of sller's products identified by the seller assigned
 * product SKUs 
 * 
 * This implementation supports setting the simple price only (no sale or volume
 * pricing)
 * 
 * Price updates in amazon are carried out via the Feeds API. The recommendation
 * is that you carry out price changes with a maximmum frequency of every 20 mins
 * 
 * You should provide an MWS_ENDPOINT and an MWS_SUBMIT_FEED_URI process vars.
 * 
 * This has been testing in the eu marketplace. The feed version used was 
 * 2009-01-01 (These are the defaults) 
 ********************************************************************************/

const endpoint_uri = `${process.env.MWS_ENDPOINT || 'https://mws-eu.amazonservices.com'}${process.env.MWS_SUBMIT_FEED_URI || '/Feeds/2009-01-01'}`

/**
 * Create a single Message stanza setting the price for a SKU
 * 
 * @param {Integer} messageId - a number identifying this message stanza
 * @param {String} sku - the stocking keeping unit
 * @param {Number} price - a GBP price for the SKU
 * @param {String} currency - the ISO currency code for the price
 */
const message = (messageId, sku, price, currency) => `<Message><MessageID>${messageId}</MessageID><Price><SKU>${sku}</SKU><StandardPrice currency="${currency}">${price}</StandardPrice></Price></Message>`

/**
 * Create a list of <Message> stanzas of the price for each SKU 
 * 
 * @param {Array} prices - array of objects containing a SKU (sku) and a price (price) containing the Number GBP value) 
 */
export const messages = prices => {
  return prices.reduce((prev, {sku, price}, idx) => {
    return prev+message(idx+1, sku, price)
  }, '')
}

/**
 * Create an Amazon request to update prices for a list of SKUs
 * 
 * @param {String} merchantId - Amazon merchant id
 * @param {String} messages - a list of <Message> elements created by the messages() function  
 */
const templateRequest = (merchantId, messages) => `<?xml version="1.0" encoding="utf-8"?><AmazonEnvelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="amzn-envelope.xsd"><Header><DocumentVersion>1.01</DocumentVersion><MerchantIdentifier>${merchantId}</MerchantIdentifier></Header><MessageType>Price</MessageType>${messages}</AmazonEnvelope>`

const requestListingsQueryString = (contentMD5Value) => {
  const params = [
    ["FeedType", "_POST_PRODUCT_PRICING_DATA_"],
    ["ContentMD5Value", contentMD5Value]
  ]

  return getQueryString('SubmitFeed', '2009-01-01', params, new Date())
}

/**
 * Make a request to Amazon MWS to update the prices for an array of products identified by sku
 * 
 * @param {Array} prices - of price updates of the format {sku: '1234', price: '123.0', currency: 'GBP'} 
 */
const updateAmazonPrices = async (prices) => {
  
  const content = templateRequest(process.env.SELLER_ID, messages(prices))
  const contentMD5Value = calculateMD5Hash(content)

  const signedQueryString = signQueryAndAppend(
                              'POST',
                              process.env.MWS_HOSTHEADER, 
                              process.env.MWS_SUBMIT_FEED_URI,
                              requestListingsQueryString(contentMD5Value)
                            )

  try {
    const result = await superagent
    .post(`${endpoint_uri}?${signedQueryString}`)
    .type('xml')
    .set('User-Agent', process.env.USER_AGENT_HEADER)
    .send(content)
    console.log(result)

  } catch(reason) {
    console.log(reason)
  }
}

export default updateAmazonPrices
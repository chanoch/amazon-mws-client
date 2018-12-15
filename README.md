# A client for the amazon MWS api
Marketplace Web Service (MWS) is an XML api for interacting with Amazon marketplaces. 

This client currently assumes that the seller is querying orders for a single marketplace at a time (probably their home marketplace).

Example settings are given for a seller in the UK (therefore using the EU marketplace)

#Features
## Update Standard Price for a product (updatePrices())
Update prices for a list of seller's products identified by the seller assigned product SKUs 

This implementation supports setting the simple price only (no sale or volume pricing)

Price updates in amazon are carried out via the Feeds API. The recommendation is that you carry out price changes with a maximmum frequency of every 20 mins

You should provide an MWS_ENDPOINT and an MWS_SUBMIT_FEED_URI process vars.

This has been testing in the eu marketplace. The feed version used was 2009-01-01 (These are the defaults) 

## Get mws query string (getQueryString())
Every MWS request contains a list of standard parameters which include authentication tokens, the seller id, a list of applicable marketplaces and a timestamp. 

It combines these with the Action - an identifier for the type of request being processed - and the action specific parameters. An example of action specific parameters for the feeds API are the FeedType and an base64 encoded MD5 hash of the price set message included in the body of the POST request.

The getQueryString() function compiles the standard query params from the environment, URI encodes and sorts them by natural byte ordering and then creates a query string from the resultant array. (Natural byte ordering is a process by which values are sorted by increasing byte value according to the char map for the encoding)

** Note that currently this client only supports a single marketplace per instance. This marketplace is set at env level using process.env.MWS_MARKETPLACEID ** 

The getQueryString() function takes the action, a version, and the timestamp of the request. MWS requires the timestamp to be within 15 minutes of current server time, probably to invalidate expired requests and replays of test and example requests

* Action - api specific value, e.g. SubmitFeed (update listing), RequestReport (get listing data)
* Version - api specific value, e.g. 2009-01-01
* Timestamp - a timestamp in ISO format

Higher level functions (such as updatePrices()) hard code these values as defaults or ask you to provide them in the environment.

## Sign request (signQueryAndAppend())

MWS requests have to be signed, ideally with SHA256, and the signature added as a request parameter. Call signQueryAndAppend() with the required args:

* HttpVerb - as specified by the API specs e.g. GET, POST, etc 
* HostHead - the API endpoint stripped of protocol, port, and trailing slash - e.g. https://mws-eu.amazonservices.com becomes mws-eu.amazonservices.com
* HTTPRequestURI - the action's endpoint path e.g. /feeds/2009-01-01/ (the version is also supplied in the query string)
* QueryString - contains the standard params plus the action specific query string params 

## Sign an mws request
An MWS request is signed using SHA256 by 

## General principles
1. Create a query string
1. Sort it using byte-order natural ordering
1. URL Encode param names and values
1. Create the string to sign 
1. Sign it

# Required configuration parameters

| Name              | Example value                  | Description
|:------------------|:-------------------------------|:-----------
| SELLER_ID         | FSD678FDS678FD                 | The Amazon MWS seller's id
| MWS_AUTH_TOKEN    | FDSDSFDS-FDS-FDS-FDSFDS-FDS    | The developer auth token is created by the seller in their account to authorise an application
| AWS_ACCESS_KEY_ID | DFASFDS678FDS678FDS678         | The developer's MWS account access key
| MWS_MARKETPLACEID | A1F83G8C2ARO7P                 | This value is optional, if not specified, the seller's home marketplace will be used

# Creating the query string 
The values above are combined with request specific values to create a valid request. These include:

| Name                     | Example value                  | Description
|:-------------------------|:-------------------------------|:-----------
| Action                   | GetFeedSubmissionResult        | specific to the API request 
| Marketplace              | ?                              | Not in docs but in example code 
| MarketplaceIdList.Id.{x} | List of marketplace ids        | optional - uses seller's home marketplace if not provided
| SignatureMethod          | HmacSHA256                     | There is a deprecated alternative - SHA1? Effectively hardcoded at the moment
| SignatureVersion         | 2                              | Effectively hardcoded
| %Parameters%             |                                | specific to each API request |
| Timestamp                | '2009-02-04T17%3A44%3A33.500Z' | Either request ts or expiration ts. Depends on API. Needs to be within 15 minutes either way of Amazon servers
| Version                  | '2009-01-01'                   | Version of the specific API action - varies by Action type|
| HTTP Verb         | GET/POST/PUT                   | HTTP Verb in uppercase |
| Host Header       | mws-eu.amazonservices.com      | lowercase host head without transport or trailing slash e.g. https://mws-eu.amazonservices.com/ results in  the example value
| HTTPRequestURI    | /Feeds/2009-01-01              | The API endpoint version is repeated in the parameters

# Creating the string to sign
```bash
StringToSign = `
  ${HTTPVerb}\n
  ${HostHeader}\n
  ${HTTPRequestURI}\n
  ${QueryString}
`
```
# Notes
1. Content type for POST is application/x-www-form-urlencoded
1. Percent encode in HEX all characters except [A-Za-z0-0], hyphen ( - ), underscore ( _ ), period ( . ), and tilde ( ~ ).
1. Space should be encoded as `%20` not `+`
1. Provide the equals separator even if a parameters value is empty


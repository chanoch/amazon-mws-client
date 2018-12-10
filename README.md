# A client for the amazon MWS api
Marketplace Web Service (MWS) is an XML api for interacting with Amazon marketplaces. 

This client currently assumes that the seller is querying orders for a single marketplace at a time (probably their home marketplace).

Example settings are given for a seller in the UK (therefore using the EU marketplace)

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


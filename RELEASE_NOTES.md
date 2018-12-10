# V0.1.0 Create standard code for creating and signing an Amazon WMS request
- Migrate code from amazon-seller-integrator
- getQueryString() adds the standard required query string params for aws to the query specific params
- signRequestAndAppend() signs the request using SHA256 and appends the resultant signature to the query string  
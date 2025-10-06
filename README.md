# Gemeente Nijmegen Middy Middleware
This repository contains some custom middlewares used by Gemeente Nijmegen.

Usefull links:
- [Middy](https://middy.js.org/)
- [An example can be found here](./examples/)

## Middlewares

### Authenticate using API Key
Validates an incomming HTTP request for a valid API key.
Retreives the API key from AWS secrets manager.

Relies on: httpErrorHandler

### environmentVariables
Checks if the required environment variables are set.

TODO make it cache the validation result and set defaults.

### Validator
Takes a ZOD schema and validates the event (or http request body) using the schema.

Relies on: jsonBodyParser, httpErrorHandler


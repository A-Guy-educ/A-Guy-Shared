# @a-guy/api-client

Typed fetch behavior for A-Guy applications. The client forwards an incoming
cookie only when the server caller supplies one, and browser requests use
`credentials: 'include'`. It never reads or verifies the shared session token.

# React Backend using express-generator

## npm start

This starts the server at 3001

### routes

`new-password`: 
1. Generate 8 digit unique password and hint (shuffled password).
2. Save both in `node-cache`
3. return JSON : { hint: <> }

`verify-password`:
1. Get request of { hint: <>, answer: <> }
2. Get entry from `node-cache`
    2a. If entry is missing, send 404 as response.
3. verify the password for hint passed.
    3a. if hint in entry and passed hint is diff, resposne is 404
    3b. If hint in entry matches, but password is missing, response is 404
4. Find highlights between answer and actual password
5. when answer does not match password, response is { hint: <>, answer: <>, correct: false, highlight: <> }
6. when answer matches password, response is { hint: <>, answer: <>, correct: true }


## npm test

This will test the API calls.
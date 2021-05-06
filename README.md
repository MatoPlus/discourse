# discourse

![License: MIT](https://img.shields.io/github/license/codeprentice-org/fanotify.svg)
![active development](https://img.shields.io/badge/active%20dev-yes-brightgreen.svg)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/codeprentice-org/fanotify.svg)

under development

## About
Code, collaborate, and chat together with discouse. The discourse platform
offers real-time, cooperative code rooms. Choose from over 100 languages. Go beyond generic code sharing
platforms, utilize powerful functionalities along with our simple and
intuitive interface.

## Setup
```bash
git clone https://github.com/MatoPlus/discourse
cd discourse
cd server && cd npm i
cd ../client && npm i
```

## Environmental variables
Corresponding .env files are required in both the client and server directory.

`client/.env.local`
```
NEXT_PUBLIC_API_URL=<url of API hosted by server>
NEXT_PUBLIC_SOCKET_URL=<url of websocket for p2p CRDT handling>
```

`server/.env`
```
DATABASE_URI=<MongoDB connection url>
PORT=<port for server to listen on>
ACCESS_JWT_SECRET=<JWT secret, generated securely>
REFRESH_JWT_SECRET=<JWT secret, generated securely>
RECOVER_JWT_SECRET=<JWT secret, generated securely>
CORS_ORIGIN=<url of client, allow API calls from client>
```

## Running the app for development
Both client, server, and socket url will need to be started up separately

client
```bash
cd client && npm run dev
```

socket
```bash
cd client && npx y-websocket-server
```

server
```bash
cd server && npm run watch # actively compiles to javascript, hangs
cd server && npm run dev # runs the compiled javascript
```

## Technologies
- MongoDB Atlas
- Yjs
- Express.js
- Socket.io
- Next.js
- Node.js
- Typescript
- React
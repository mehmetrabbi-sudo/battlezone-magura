# Battlezone Magura — Production Server & Android Deployment Guide

This document describes how to build, run, configure, and deploy the Battlezone Magura authoritative multiplayer server and web/Android clients.

---

## 1. Running the Server Locally

In development, the server runs with tsx and Vite in middleware mode on port 3000:

```bash
# Install dependencies
npm install

# Start development full-stack server
npm run dev
# or
npm start
```

The server listens on `0.0.0.0:3000`. You can test locally by opening `http://localhost:3000`.

---

## 2. Building the Web Client

For production deployment:

```bash
# Build production client assets to /dist
npm run build

# Start production server serving the built /dist assets
NODE_ENV=production node server.ts
```

The Express server serves the static bundle from `/dist` and serves `index.html` for client-side routing.

---

## 3. Configuring SERVER_URL

Clients determine the backend WebSocket URL using the environment variable `VITE_SERVER_URL`:

- **Development / Local**: If unset, clients automatically connect to `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`.
- **Production Override**: Set in `.env`:
  ```env
  VITE_SERVER_URL=wss://your-game-server.example.com
  ```

---

## 4. Required Production Environment Variables

| Variable | Description | Default | Example |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Environment mode (`production` / `development`) | `development` | `production` |
| `PORT` | HTTP & WebSocket port | `3000` | `3000` or `8080` |
| `VITE_SERVER_URL` | Public WebSocket endpoint for clients | Auto (`window.location.host`) | `wss://api.battlezone-magura.com` |

---

## 5. Required WebSocket Port

- The server uses a unified HTTP and WebSocket architecture on a single port (`PORT=3000` or `PORT=8080` in Cloud Run / container platforms).
- `ws.WebSocketServer` is attached directly to the Node `http.Server`, sharing the same port.
- No secondary port is required.

---

## 6. HTTPS and WSS Requirement

- **WSS Protocol**: Modern browsers require secure WebSockets (`wss://`) when the web application is served over `https://`.
- **TLS Termination**: In cloud production environments (e.g. Google Cloud Run, AWS ECS, NGINX, Cloudflare), SSL/TLS termination is typically handled at the reverse proxy or ingress gateway.
- Ensure that the reverse proxy forwards the `Upgrade` and `Connection` HTTP headers:
  ```nginx
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_set_header Host $host;
  ```

---

## 7. Android WebView Deployment

Battlezone Magura runs natively inside an Android WebView wrapper:

1. **Manifest Permissions**:
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
   ```
2. **WebView Configuration**:
   - `webSettings.javaScriptEnabled = true`
   - `webSettings.domStorageEnabled = true`
   - `webSettings.mediaPlaybackRequiresUserGesture = false`
3. **Production URL**:
   Point the Android WebView to your deployed production URL:
   ```java
   webView.loadUrl("https://your-production-app.run.app");
   ```
   The WebView inherits the same `wss://` endpoint automatically.

---

## 8. Health-Check Endpoint

The server includes a dedicated lightweight JSON health check for container orchestration and uptime monitoring:

```http
GET /health
```

Example response:
```json
{
  "ok": true,
  "service": "battlezone-magura-server",
  "version": "1.0.0",
  "uptime": 1420,
  "activeRooms": 3,
  "connectedPlayers": 6
}
```

---

## 9. Graceful Shutdown

The server listens for `SIGINT` and `SIGTERM` signals:
1. Notifies all connected WebSockets with `SERVER_SHUTDOWN` event.
2. Closes all client WebSockets with code `1001` (Going Away).
3. Stops accepting incoming connections and closes the HTTP listener.
4. Terminates cleanly within 3 seconds.

---

## 10. Room & Match Cleanup

The authoritative server handles automated cleanup:
- **Disconnect Grace Window**: When a player drops connection (network switch, phone screen sleep), the room is kept alive for a 60-second grace window to allow reconnection without losing match state.
- **Abandoned Room Purge**: A housekeeping routine runs every 10 seconds to delete rooms that have had no active players for more than 60 seconds.
- **Matchmaking Queue Timeout**: Matchmaking search entries expire after 25 seconds if no match is formed, safely returning the player to the lobby.

---

## 11. Two-Phone Shared Server Architecture

Room state and combat sessions are stored in authoritative server memory:
```
PHONE A (Player 1)                          PHONE B (Player 2)
      │                                            │
      │ HTTPS / WSS                                │ HTTPS / WSS
      └────────────────► ONE SHARED BACKEND ◄──────┘
                     (battlezone-magura server)
                     ┌────────────────────────┐
                     │ • Rooms & Room IDs     │
                     │ • Authoritative Health │
                     │ • Combat Damage & Kills│
                     │ • Real-time Sync       │
                     └────────────────────────┘
```
**CRITICAL**: Both Phone A and Phone B must connect to the **same backend URL**. If one phone connects to a development preview and another to a separate instance, they cannot join each other's room. Always use the same production URL or configure `VITE_SERVER_URL` pointing to the shared deployed server.

---

## 12. Real Two-Phone Test Plan

Use this checklist when testing with two physical Android phones or mobile devices:

### Preparation
1. Ensure both Phone A and Phone B have internet access.
2. Open the exact same URL on both devices (e.g. `https://your-production-app.run.app`).

### Execution Checklist
- [ ] **1. Handshake**: Open the Multiplayer menu on both phones. Verify both display `ONLINE • SERVER CONNECTED`.
- [ ] **2. Create Room**: Phone A selects **CREATE ROOM**. Verify a canonical room code appears (e.g., `MGR4821`).
- [ ] **3. Join Room**: Phone B selects **JOIN ROOM**, enters `MGR4821` (case-insensitive test: `mgr4821`), and taps **JOIN SQUAD**.
- [ ] **4. Squad Lobby Verification**:
  - Phone A sees Phone B in the squad list (`2 / 4`).
  - Phone A is identified as `SQUAD LEADER` with a crown icon; Phone B is `TACTICAL OPERATOR`.
- [ ] **5. Ready State**: Phone B taps **CLICK TO READY**. Phone A immediately sees Phone B status change to green `READY`.
- [ ] **6. Match Launch**: Phone A (Squad Leader) taps **LAUNCH MATCH**. Both phones simultaneously launch into the chosen 3D map.
- [ ] **7. 3D Spawn & Transform Sync**:
  - Phone A sees Phone B's 3D operator character in tactical camouflage.
  - Phone B sees Phone A moving and rotating in real time without teleportation.
- [ ] **8. Authoritative Combat**:
  - Phone A shoots Phone B.
  - Phone B takes hit marker, camera shake, and server-authoritative health reduction (25 HP for body, 50 HP for headshot).
- [ ] **9. Elimination & Kill Tracker**:
  - Phone B health reaches 0. Elimination toast appears: `☠ COMMANDO_A ELIMINATED COMMANDO_B`.
  - Phone A kill counter increments by exactly 1.
- [ ] **10. Authoritative Respawn**:
  - Exactly 3.0 seconds later, Phone B automatically respawns at a designated outdoor spawn point with 100 HP and a temporary cyan spawn protection shield.
- [ ] **11. Social / Friend Invite**:
  - In Multiplayer > Friends tab, send a friend request using the network ID. Accept and verify live online status (`ONLINE`, `IN_ROOM`, `IN_MATCH`).
- [ ] **12. Quick Match**:
  - Both players tap **QUICK MATCH** to auto-queue and matchmake into the same room within seconds.

---

## 13. What Causes "Room Not Found" When Two Phones Try to Play Together

When testing multiplayer across two separate physical devices (e.g., two Android phones), the "Room not found" error typically stems from one of four architectural pitfalls:

### Cause 1: Two Phones Connecting to Different Server Instances (Split-Server Issue)
- **The Issue**: Phone A opens a preview URL (e.g. `ais-dev-...run.app`), while Phone B opens another URL (e.g. `ais-pre-...run.app` or local network IP). Because room state is kept in server memory, each server has its own isolated room list.
- **The Solution**: Both devices must either:
  1. Open the exact same deployed URL (e.g. `https://battlezone-magura.onrender.com` or your Cloud Run URL), OR
  2. Configure `VITE_SERVER_URL` in `.env` to point to a single authoritative backend server (e.g. `VITE_SERVER_URL=https://shared-server.yourdomain.com`). The client UI displays `SERVER: <host>` so both players can visually verify they are connected to the exact same host.

### Cause 2: Room ID Formatting & Case Sensitivity Discrepancies
- **The Issue**: Phone A creates room `MGR4821`. Phone B types `mgr4821` with leading/trailing spaces or lowercase characters on a mobile keyboard.
- **The Solution**: Both the client and server normalize room IDs upon creation and lookup using `rawId.trim().toUpperCase()`.

### Cause 3: WebSocket Premature Disconnect / Race Conditions
- **The Issue**: Phone A creates a room, but closing the modal or changing screens drops the WebSocket, causing the server to instantly delete the room before Phone B can join.
- **The Solution**: The server implements a 60-second grace window (`DISCONNECT_GRACE_MS = 60000`). If a player's connection blips or screen turns off, the room and match state persist, allowing immediate reconnection without dropping the session.

### Cause 4: Protocol Mismatch (HTTP vs HTTPS / WS vs WSS)
- **The Issue**: In production over HTTPS, mobile browsers block unencrypted `ws://` connections (Mixed Content security error).
- **The Solution**: The client dynamically checks `window.location.protocol === 'https:' ? 'wss:' : 'ws:'` and handles protocol translation automatically.

---

## 14. Step-by-Step Deployment by Provider

### Option A: Render (Web Service)
1. Push your repository to GitHub or GitLab.
2. In Render Dashboard, click **New > Web Service**.
3. Connect your repository:
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start` (or `npm run server`)
4. Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render sets `PORT` automatically)
5. Render automatically provides an `https://<service-name>.onrender.com` domain with full WebSocket (`wss://`) support.

### Option B: Railway
1. In Railway, click **New Project > Deploy from GitHub repo**.
2. Railway detects Node.js and runs `npm run build` and `npm start`.
3. In Service Settings > Variables:
   - `NODE_ENV`: `production`
   - `PORT`: (configured automatically by Railway)
4. Generate a public domain under **Settings > Networking > Generate Domain**.

### Option C: Google Cloud Run (Container / Dockerfile)
1. Build and push the container image:
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT_ID/battlezone-magura
   ```
2. Deploy to Cloud Run:
   ```bash
   gcloud run deploy battlezone-magura \
     --image gcr.io/PROJECT_ID/battlezone-magura \
     --platform managed \
     --region asia-southeast1 \
     --allow-unauthenticated \
     --port 3000
   ```
3. Cloud Run automatically supports WebSockets over HTTPS (`wss://`) and passes the assigned port via `PORT`.

### Option D: Fly.io
1. Initialize the app:
   ```bash
   fly launch
   ```
2. In `fly.toml`, ensure internal port matches:
   ```toml
   [http_service]
     internal_port = 3000
     force_https = true
     auto_stop_machines = 'stop'
     auto_start_machines = true
     min_machines_running = 1
   ```
   *(Note: Set `min_machines_running = 1` so WebSocket game rooms are not terminated during idle periods).*
3. Deploy:
   ```bash
   fly deploy
   ```

### Option E: Self-Hosted VPS (Ubuntu / Debian + NGINX)
1. Install Node.js 20+ and PM2:
   ```bash
   npm install -g pm2
   ```
2. Clone repo, build client, and start server:
   ```bash
   npm install
   npm run build
   pm2 start "npm start" --name "battlezone"
   ```
3. NGINX Reverse Proxy configuration with WebSocket support:
   ```nginx
   server {
       listen 80;
       server_name game.yourdomain.com;
       return 301 https://$host$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name game.yourdomain.com;

       ssl_certificate /etc/letsencrypt/live/game.yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/game.yourdomain.com/privkey.pem;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_read_timeout 86400s;
           proxy_send_timeout 86400s;
       }
   }
   ```

---

## 15. How to Test and Verify the Fix

### Step 1: Verify Server Health
Run `curl` against the deployed server:
```bash
curl -i https://YOUR_SERVER_DOMAIN/health
```
Expected output:
```json
HTTP/2 200
content-type: application/json; charset=utf-8

{
  "ok": true,
  "service": "battlezone-magura-server",
  "version": "1.0.0",
  "uptime": 120,
  "activeRooms": 0,
  "connectedPlayers": 0
}
```

### Step 2: Automated Verification Script
Run the automated two-client integration test:
```bash
TEST_SERVER_URL=wss://YOUR_SERVER_DOMAIN node test_two_phones_multiplayer.cjs
```
This tests:
1. Phone A connects and receives server hello.
2. Phone B connects and receives server hello.
3. Phone A creates room `MGRxxxx`.
4. Phone B joins with lowercase `mgrxxxx`.
5. Phone A receives room state with 2 players.
6. Phone B sets ready.
7. Phone A starts match, both receive `MATCH_STARTING`.

### Step 3: Physical Device Verification
1. Open the game on Phone A and Phone B in Chrome / Mobile Safari.
2. Verify the server indicator says `ONLINE • SERVER CONNECTED`.
3. Check the host name shown matches on both devices.
4. Create room on Phone A -> Enter code on Phone B -> Tap Join.
5. Both phones will transition to the room lobby and can play together seamlessly!



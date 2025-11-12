# Family Chat App - PWA Setup Guide

## What You Need

- Node.js installed
- All 3 files in the same folder:
  - `server.js`
  - `manifest.json`
  - `service-worker.js`

## Installation

1. **Install dependencies:**
   ```
   npm install express ws
   ```

2. **Run the server:**
   ```
   node server.js
   ```

3. **Open in browser:**
   - Desktop: `http://localhost:3000`
   - Mobile: `http://YOUR_IP:3000` (find your IP with `ipconfig` on Windows or `ifconfig` on Mac/Linux)

## Install as App

### iPhone/iPad:
1. Open Safari
2. Tap the Share button (arrow up)
3. Scroll down and tap "Add to Home Screen"
4. Name it "Family Chat"
5. Tap "Add"

### Android:
1. Open Chrome
2. Tap the 3 dots (menu)
3. Tap "Install app"
4. Tap "Install"

## Notifications

The app will ask for notification permission when you first open it. **Allow it** so the kids get notified of new messages!

## Features

✅ **Persistent Chat** - Messages save forever in `messages.json`
✅ **Real-time Notifications** - Get alerted when someone messages
✅ **Offline Support** - Works offline (limited features)
✅ **Scroll History** - Read back all old messages
✅ **Color-Coded** - Easy to see who's talking:
   - Esther: Light Aqua
   - Amaaya: Light Green
   - Valley: Light Purple
   - Lola: Light Pink
   - Everyone else: Unique colors

## Chat Rooms

**Group Chat (Everyone):**
- group
- family-group (Mama, Esther, Mummy, Lola)

**Esther's Private Chats:**
- esther-mama
- esther-mummy
- esther-hilary
- esther-nan
- esther-rishy
- esther-poppy
- esther-sienna
- esther-penelope

**Lola's Private Chats:**
- lola-nan
- lola-mummy
- lola-mama
- lola-poppy

## Troubleshooting

**App won't install?**
- Make sure you're using HTTPS or localhost
- Clear browser cache and try again

**Notifications not working?**
- Check browser notification settings
- On iOS Safari, notifications only work when app is open
- On Android, make sure you allowed notifications

**Messages disappeared?**
- Check that `messages.json` exists in the server folder
- Restart the server - it loads messages from the file

**Can't connect?**
- Make sure server is running (`node server.js`)
- Check firewall settings
- Use the correct IP address for mobile devices

## File Descriptions

- **server.js** - Main app (Express + WebSocket + HTML/CSS/JavaScript all in one file)
- **manifest.json** - PWA configuration (icons, app name, shortcuts)
- **service-worker.js** - Handles notifications and offline support
- **messages.json** - Created automatically, stores all chat history

Enjoy! 💬

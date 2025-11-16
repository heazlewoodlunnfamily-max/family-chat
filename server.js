 const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());

const messagesFile = path.join(__dirname, 'messages.json');

const defaultMessages = {
  'group': [],
  'family-group': [],
  'guptas-chat': [],
  'esther-mama': [],
  'esther-mummy': [],
  'esther-hilary': [],
  'esther-nan': [],
  'esther-rishy': [],
  'esther-poppy': [],
  'esther-sienna': [],
  'esther-twins': [],
  'esther-lola': [],
  'lola-nan': [],
  'lola-poppy': []
};

function loadMessages() {
  try {
    if (fs.existsSync(messagesFile)) {
      const data = fs.readFileSync(messagesFile, 'utf8');
      console.log('✅ Messages loaded from server storage - PERSISTENT!');
      return JSON.parse(data);
    } else {
      console.log('Creating new messages file');
      saveMessages(defaultMessages);
      return defaultMessages;
    }
  } catch (error) {
    console.error('Error loading messages:', error);
    return defaultMessages;
  }
}

function saveMessages(msgs) {
  try {
    fs.writeFileSync(messagesFile, JSON.stringify(msgs, null, 2));
    console.log('✅ Messages saved to server storage');
  } catch (error) {
    console.error('Error saving messages:', error);
  }
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#667eea">
    <link rel="manifest" href="/manifest.json">
    <title>Family Chat</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { height: 100%; margin: 0; padding: 0; }
        body { height: 100vh; overflow: hidden; margin: 0; padding: 0; font-family: Arial, sans-serif; background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 20%, #ffecd2 40%, #fcb69f 60%, #ff9a9e 80%, #fad0c4 100%); }
        .login-screen { position: fixed; width: 100vw; height: 100vh; background: linear-gradient(135deg, #ffd89b 0%, #19547b 25%, #ffd89b 50%, #ff9a9e 75%, #fad0c4 100%); display: flex; flex-direction: column; justify-content: flex-start; align-items: center; padding: 10px 20px; text-align: center; z-index: 100; overflow: hidden; }
        .login-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%; max-width: 320px; max-height: 35vh; overflow-y: auto; margin-top: 10px; }
        .login-btn { padding: 14px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 16px; font-size: 14px; font-weight: bold; cursor: pointer; text-transform: uppercase; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all 0.3s; }
        .container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #ffd89b 0%, #19547b 25%, #ffecd2 50%, #ff9a9e 75%, #fad0c4 100%); display: none; flex-direction: column; z-index: 50; overflow: hidden; justify-content: space-between; }
        .container.show { display: flex; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); color: white; padding: 6px 10px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: bold; flex-shrink: 0; min-height: 38px; }
        .logout-btn { background: #764ba2; color: white; border: none; padding: 4px 8px; border-radius: 6px; cursor: pointer; font-size: 10px; font-weight: bold; }
        .tabs { display: flex; gap: 4px; padding: 3px 6px; background: rgba(255,154,158,0.3); border-bottom: 1px solid rgba(102,126,234,0.4); overflow-x: auto; flex-shrink: 0; min-height: 26px; align-items: center; }
        .tab { padding: 6px 10px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 13px; color: white; flex-shrink: 0; transition: all 0.3s; }
        .chat-display { flex: 1; overflow-y: auto; padding: 8px 6px; background-size: cover; background-attachment: fixed; background-position: center; -webkit-overflow-scrolling: touch; display: flex; flex-direction: column; gap: 2px; }
        .chat-display.group-chat { background-image: url('/besties-bg.png?v=5'); background-size: cover; background-attachment: fixed; background-position: center; }
        .chat-display.esther-sienna-chat { background-image: url('/esther-sienna-bg.png?v=1'); background-size: cover; background-attachment: fixed; background-position: center; }
        .chat-display { background-image: url('/chat-bg.png?v=1'); background-size: cover; background-attachment: fixed; background-position: center; }
        .message { display: flex; flex-direction: column; margin-bottom: 4px; }
        .message.own { align-items: flex-end; }
        .message-sender { display: none; }
        .message-bubble { padding: 12px 16px; border-radius: 18px; word-wrap: break-word; font-size: 17px; width: fit-content; max-width: 85%; line-height: 1.4; box-shadow: 0 1px 2px rgba(0,0,0,0.08); font-weight: 500; }
        .message.own .message-bubble { background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 18px 4px 18px 18px; }
        .message.esther .message-bubble { background: #ffffff; color: #333; border-radius: 18px 18px 4px 18px; }
        .message.mama .message-bubble { background: #ffffff; color: #333; border-radius: 18px 18px 4px 18px; }
        .message.mummy .message-bubble { background: #ffffff; color: #333; border-radius: 18px 18px 4px 18px; }
        .message.lola .message-bubble { background: #ffffff; color: #333; border-radius: 18px 18px 4px 18px; }
        .message.nan .message-bubble { background: #ffffff; color: #333; border-radius: 18px 18px 4px 18px; }
        .message.poppy .message-bubble { background: #ffffff; color: #333; border-radius: 18px 18px 4px 18px; }
        .message.rishy .message-bubble { background: #ffffff; color: #333; border-radius: 18px 18px 4px 18px; }
        .message.sienna .message-bubble { background: #ffffff; color: #333; border-radius: 18px 18px 4px 18px; }
        .message.twins .message-bubble { background: #ffffff; color: #333; border-radius: 18px 18px 4px 18px; }
        .message.hilary .message-bubble { background: #ffffff; color: #333; border-radius: 18px 18px 4px 18px; }
        .input-area { position: relative; background: rgba(255,154,158,0.95); border-top: 1px solid rgba(102,126,234,0.3); display: flex; gap: 6px; flex-shrink: 0; padding: 8px 10px; align-items: center; z-index: 100; backdrop-filter: blur(5px); box-shadow: 0 -2px 8px rgba(0,0,0,0.1); width: 100%; min-height: 48px; }
        .input-field { flex: 1; padding: 10px 12px; border: 1px solid #ddd; border-radius: 20px; font-size: 16px; margin: 0; background: #ffffff; }
        .btn { background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 10px 12px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 13px; transition: all 0.3s; flex-shrink: 0; }
        .send-btn { background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 12px 16px; border-radius: 20px; cursor: pointer; font-weight: bold; font-size: 15px; flex-shrink: 0; margin: 0; white-space: nowrap; }
        .emoji-picker { display: none; flex-wrap: wrap; max-height: 0; overflow-y: hidden; gap: 4px; padding: 0; position: relative; background: rgba(255,255,255,0.95); border-top: 1px solid rgba(102,126,234,0.2); z-index: 99; transition: all 0.3s ease; }
        .emoji-picker button { background: none; border: none; font-size: 28px; cursor: pointer; padding: 6px; }
        #myname { font-size: 16px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="login-screen" id="pinScreen">
        <div class="cat-image"><img src="/axolotl.png?v=4" style="max-width: 280px; max-height: 280px; border-radius: 15px; display: block;"></div>
        <h2 style="color: white; margin: 10px 0 20px 0; font-size: 18px;">Enter PIN</h2>
        <input type="password" id="pinInput" placeholder="••••" style="padding: 12px; font-size: 24px; border: 2px solid white; border-radius: 10px; width: 180px; text-align: center; letter-spacing: 10px; margin-bottom: 20px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; width: 200px; margin-bottom: 15px;">
            <button class="login-btn" style="margin: 0; padding: 12px; font-size: 16px;" onclick="window.addPin('1')">1</button>
            <button class="login-btn" style="margin: 0; padding: 12px; font-size: 16px;" onclick="window.addPin('2')">2</button>
            <button class="login-btn" style="margin: 0; padding: 12px; font-size: 16px;" onclick="window.addPin('3')">3</button>
            <button class="login-btn" style="margin: 0; padding: 12px; font-size: 16px;" onclick="window.addPin('4')">4</button>
            <button class="login-btn" style="margin: 0; padding: 12px; font-size: 16px;" onclick="window.addPin('5')">5</button>
            <button class="login-btn" style="margin: 0; padding: 12px; font-size: 16px;" onclick="window.addPin('6')">6</button>
            <button class="login-btn" style="margin: 0; padding: 12px; font-size: 16px;" onclick="window.addPin('7')">7</button>
            <button class="login-btn" style="margin: 0; padding: 12px; font-size: 16px;" onclick="window.addPin('8')">8</button>
            <button class="login-btn" style="margin: 0; padding: 12px; font-size: 16px;" onclick="window.addPin('9')">9</button>
            <button class="login-btn" style="margin: 0; padding: 12px; font-size: 16px; background: #999;" onclick="window.clearPin()">Clear</button>
            <button class="login-btn" style="margin: 0; padding: 12px; font-size: 16px;" onclick="window.addPin('0')">0</button>
            <button class="login-btn" style="margin: 0; padding: 12px; font-size: 16px; background: #ff6b6b;" onclick="window.delPin()">DEL</button>
        </div>
        <button class="login-btn" style="width: 200px; padding: 14px; font-size: 16px;" onclick="window.checkPin()">Login</button>
    </div>

    <div class="login-screen" id="login" style="display: none;">
        <div class="cat-image"><img src="/axolotl.png?v=4" style="max-width: 280px; max-height: 280px; border-radius: 15px; display: block;"></div>
        <p style="font-size: 20px; color: white; margin: 10px 0 30px 0; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">Welcome!</p>
        <div class="login-buttons">
            <button class="login-btn" id="userButton" style="grid-column: 1 / 3; padding: 25px; font-size: 18px;"></button>
            <button class="login-btn" style="grid-column: 1 / 3; padding: 14px; font-size: 14px; background: #999;" onclick="window.logout()">Logout (Different User)</button>
        </div>
    </div>

    <div class="container" id="app">
        <div class="header">
            <div id="myname"></div>
            <button class="logout-btn" id="notifBtn" onclick="window.enableNotifications()">🔔 Allow</button>
            <button class="logout-btn" onclick="window.logout()">Logout</button>
        </div>
        <div class="tabs" id="tabs"></div>
        <div class="chat-display" id="chat"><div class="empty">Loading...</div></div>
        <div class="input-area">
            <button class="btn" id="voiceBtn" onclick="window.toggleVoiceRecording()" style="background: linear-gradient(135deg, #667eea, #764ba2);">🎤</button>
            <input type="text" class="input-field" id="msg" placeholder="Say something..." disabled>
            <button class="send-btn" id="sendBtn" onclick="window.send()" disabled>Send</button>
        </div>
        <div id="emojiPicker" class="emoji-picker"></div>
    </div>

    <script>
        let currentUser = null, currentChat = 'group', allChats = [], messages = {}, ws = null, connected = false, unreadCount = 0, connectionAttempted = false, receivedMessageIds = new Set(), sentMessageIds = new Set(), mediaRecorder = null, audioChunks = [];

        const userNames = {
            '2107': 'esther',
            '1234': 'lola',
            '9876': 'mama',
            '8765': 'mummy',
            '1818': 'twins',
            '1818': 'twins',
            '1983': 'hilary',
            '6666': 'nan',
            '7777': 'rishy',
            '8888': 'poppy',
            '9999': 'sienna'
        };

        window.addPin = function(digit) {
            const pinInput = document.getElementById('pinInput');
            if (pinInput.value.length < 4) {
                pinInput.value += digit;
            }
        };

        window.delPin = function() {
            const pinInput = document.getElementById('pinInput');
            pinInput.value = pinInput.value.slice(0, -1);
        };

        window.clearPin = function() {
            document.getElementById('pinInput').value = '';
        };

        window.checkPin = function() {
            const pin = document.getElementById('pinInput').value;
            if (pin.length !== 4) {
                alert('PIN must be 4 digits');
                return;
            }
            const user = userNames[pin];
            console.log('PIN entered:', pin, 'User:', user);
            if (user) {
                sessionStorage.setItem('user', user);
                currentUser = user;
                document.getElementById('userButton').textContent = user.toUpperCase();
                document.getElementById('pinScreen').style.display = 'none';
                document.getElementById('login').style.display = 'flex';
                try {
                    window.enterChat();
                } catch (error) {
                    console.error('Error entering chat:', error);
                    alert('Error loading chat. Try again.');
                }
            } else {
                alert('Wrong PIN! Try again.');
                document.getElementById('pinInput').value = '';
            }
        };

        window.logout = function() {
            sessionStorage.removeItem('user');
            document.getElementById('pinInput').value = '';
            document.getElementById('pinScreen').style.display = 'flex';
            document.getElementById('login').style.display = 'none';
        };

        window.enterChat = function() {
            try {
                // Request notification permission on chat entry
                if ('Notification' in window && Notification.permission === 'default') {
                    Notification.requestPermission().then(permission => {
                        console.log('Notification permission requested:', permission);
                    });
                }
                
                document.getElementById('login').style.display = 'none';
                document.getElementById('app').classList.add('show');
                document.getElementById('myname').textContent = currentUser.toUpperCase();
                
                allChats = ['group'];
                
                // Check notification permission and show button if needed
                if ('Notification' in window && Notification.permission !== 'granted') {
                    document.getElementById('notifBtn').style.display = 'block';
                    console.log('Notifications not granted. Show request button.');
                }
                
                if (currentUser === 'esther') {
                    allChats = ['group', 'family-group', 'esther-mama', 'esther-mummy', 'esther-hilary', 'esther-nan', 'esther-rishy', 'esther-poppy', 'esther-sienna', 'esther-twins', 'esther-lola'];
                } else if (currentUser === 'mama') {
                    allChats = ['group', 'family-group', 'esther-mama'];
                } else if (currentUser === 'mummy') {
                    allChats = ['group', 'family-group', 'esther-mummy'];
                } else if (currentUser === 'twins') {
                    allChats = ['group', 'guptas-chat', 'esther-twins'];
                } else if (currentUser === 'hilary') {
                    allChats = ['group', 'guptas-chat'];
                } else if (currentUser === 'lola') {
                    allChats = ['family-group', 'esther-lola', 'lola-nan', 'lola-poppy'];
                } else if (currentUser === 'poppy') {
                    allChats = ['esther-poppy', 'lola-poppy'];
                } else if (currentUser === 'nan') {
                    allChats = ['esther-nan', 'lola-nan'];
                } else if (currentUser === 'rishy') {
                    allChats = ['group', 'esther-rishy'];
                } else if (currentUser === 'sienna') {
                    allChats = ['esther-sienna'];
                }
                
                currentChat = allChats[0];
                console.log('Current user:', currentUser);
                console.log('Available chats:', allChats);
                
                allChats.forEach(chat => {
                    if (!messages[chat]) {
                        messages[chat] = [];
                    }
                });
                
                console.log('Messages loaded:', messages);
                
                if ('Notification' in window) {
                    if (Notification.permission === 'granted') {
                        console.log('Notifications already granted');
                    } else if (Notification.permission !== 'denied') {
                        Notification.requestPermission().then(permission => {
                            console.log('Notification permission:', permission);
                        });
                    }
                }
                
                const emojis = '😀😃😄😁😆😅🤣😂😈😉😊😇🙂🙃😌😍🥰😘😗😚😙🥺😋😛😜🤪😝🤑😎🤓🧐😕😟🙁☹️😲😞😖😢😤😠😆😡🤬😈👿💀☠️💩🤡👹👺😺😸😹😻😼😽🙀😿😾❤️🧡💛💚💙💜🖤🤍🤎💔💕💞💓💗💖💘💝💟💌💋💯💢💥💫💦💨🕳️💬👋🤚🖐️✋🖖👌🤌🤏✌️🤞🫰🤟🤘🤙👍👎✊👊🤛🫲🫱💪🦾🦿🦵🦶🫶👂🦻👃🧠🦷🦴👀👁️👅👄🐶🐱🐭🐹🐰🦊🐻🐼🐨🐯🦁🐮🐷🐽🐸🐵🐒🐶🐱🦁🐯🐻‍❄️🐨🐼🦁🐭🐹🐰🦊🦝🐗🐷🐽🦓🦄🐴🐝🪱🐛🦋🐌🐞🐜🦟🪰🪳‍🕷️🦂🐢🐍🦎🦖🦕🐙🦑🦐🦞🦀🐡🐠🐟🐬🐳🐋🦈🐊🐅🐆🦒🦓🦍🦧🐘🦛🦏🐪🐫🦒🦘🐃🐂🐄🐎🐖🐏🐑🦙🐐🦌🐕🐩🦮🐈🐓🦃🦚🦜🦢🦗🕷️🦂🐢🐍🦎🦖🦕🐙🦑🦐🦞🦀🐡🐠🐟🐬🐳🐋🦈🐊🐅🐆🦒';
                const emojiPicker = document.getElementById('emojiPicker');
                if (emojiPicker) {
                    emojiPicker.innerHTML = '';
                    for (let emoji of emojis) {
                        const btn = document.createElement('button');
                        btn.textContent = emoji;
                        btn.onclick = () => { document.getElementById('msg').value += emoji; };
                        emojiPicker.appendChild(btn);
                    }
                }
                
                window.renderTabs();
                window.connect();
                window.render();
            } catch (error) {
                console.error('Fatal error in enterChat:', error);
                alert('Error: ' + error.message);
            }
        };

        window.login = function(user) {
            if (!user) return;
            currentUser = user;
            sessionStorage.setItem('user', user);
            allChats = ['group'];
            
            if (user === 'esther') {
                allChats = ['group', 'family-group', 'esther-mama', 'esther-mummy', 'esther-hilary', 'esther-nan', 'esther-rishy', 'esther-poppy', 'esther-sienna', 'esther-valley', 'esther-amaaya'];
            } else if (user === 'mama') {
                allChats = ['group', 'family-group', 'esther-mama'];
            } else if (user === 'mummy') {
                allChats = ['group', 'family-group', 'esther-mummy'];
            } else if (user === 'twins') {
                allChats = ['group', 'guptas-chat', 'esther-twins'];
            } else if (user === 'hilary') {
                allChats = ['group', 'guptas-chat'];
            } else if (user === 'lola') {
                allChats = ['family-group', 'esther-lola', 'lola-nan', 'lola-poppy'];
            } else if (user === 'poppy') {
                allChats = ['esther-poppy', 'lola-poppy'];
            } else if (user === 'nan') {
                allChats = ['esther-nan', 'lola-nan'];
            } else if (user === 'rishy') {
                allChats = ['group', 'esther-rishy'];
            } else if (user === 'sienna') {
                allChats = ['esther-sienna'];
            }
            
            currentChat = allChats[0];
            allChats.forEach(chat => {
                if (!messages[chat]) {
                    messages[chat] = [];
                }
            });
            
            document.getElementById('login').style.display = 'none';
            document.getElementById('pinScreen').style.display = 'none';
            document.getElementById('app').classList.add('show');
            document.getElementById('myname').textContent = user.toUpperCase();
            
            // Request notification permission
            if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission();
            }
            
            window.renderTabs();
            window.connect();
            window.render();
        };

        window.logout = function() {
            sessionStorage.removeItem('user');
            connectionAttempted = false;
            location.reload();
        };

        window.connect = function() {
            if (connectionAttempted) {
                console.log('Already connecting/connected, skipping duplicate connection');
                return;
            }
            connectionAttempted = true;
            
            // Close any existing connection first
            if (ws) {
                console.log('Closing old WebSocket connection');
                ws.close();
            }
            
            const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
            ws = new WebSocket(proto + '//' + location.host);
            ws.onopen = () => {
                connected = true;
                console.log('✅ WebSocket connected');
                document.getElementById('msg').disabled = false;
                document.getElementById('sendBtn').disabled = false;
            };
            ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
            };
            ws.onclose = () => {
                connected = false;
                console.log('⚠️ WebSocket closed, reconnecting...');
                setTimeout(window.connect, 3000);
            };
            ws.onmessage = (e) => {
                const data = JSON.parse(e.data);
                console.log('Client received:', data.type, data);
                if (data.type === 'load_messages') {
                    messages = data.messages;
                    window.render();
                } else if (data.type === 'message') {
                    // Prevent duplicate messages - check by ID and content
                    const msgKey = data.data.id + '-' + data.data.user + '-' + data.data.text;
                    console.log('Checking for duplicate:', msgKey, 'Already seen:', receivedMessageIds.has(msgKey));
                    if (receivedMessageIds.has(msgKey)) {
                        console.log('🚫 DUPLICATE message ignored:', msgKey);
                        return;
                    }
                    console.log('✅ NEW message accepted:', msgKey);
                    receivedMessageIds.add(msgKey);
                    
                    // Clear old IDs after many messages to avoid memory leak
                    if (receivedMessageIds.size > 1000) {
                        receivedMessageIds.clear();
                    }
                    
                    if (!messages[data.data.chatId]) messages[data.data.chatId] = [];
                    messages[data.data.chatId].push(data.data);
                    console.log('Total messages in', data.data.chatId + ':', messages[data.data.chatId].length);
                    if (data.data.chatId === currentChat) {
                        console.log('Re-rendering chat. Total messages:', messages[currentChat].length);
                        window.render();
                    }
                    
                    // Send notification if from someone else
                    if (data.data.user !== currentUser && 'Notification' in window) {
                        console.log('Notification check - Permission:', Notification.permission);
                        // Only increment unread if message is NOT in current chat
                        if (data.data.chatId !== currentChat) {
                            unreadCount++;
                            window.updateBadge();
                        }
                        if (Notification.permission === 'granted') {
                            try {
                                console.log('Sending notification for:', data.data.user);
                                new Notification(data.data.user.toUpperCase() + ' sent a message', {
                                    body: data.data.text.substring(0, 100),
                                    icon: '/axolotl.png',
                                    badge: '/axolotl.png',
                                    tag: 'family-chat',
                                    requireInteraction: false
                                });
                            } catch (e) {
                                console.error('Notification error:', e);
                            }
                        } else {
                            console.log('Notifications not granted. Permission:', Notification.permission);
                        }
                    }
                }
            };
        };

        window.renderTabs = function() {
            const div = document.getElementById('tabs');
            div.innerHTML = '';
            console.log('Rendering tabs for chats:', allChats);
            
            allChats.forEach(chatId => {
                const btn = document.createElement('button');
                btn.className = 'tab' + (chatId === currentChat ? ' active' : '');
                
                if (chatId === 'group') {
                    btn.textContent = 'Group';
                } else if (chatId === 'family-group') {
                    btn.textContent = 'Family';
                } else if (chatId === 'guptas-chat') {
                    btn.textContent = 'Guptas';
                } else {
                    // For all other chats (esther-X, lola-X, X-Y), find the person who is NOT currentUser
                    const parts = chatId.split('-');
                    let otherName;
                    
                    if (parts[0] === currentUser) {
                        otherName = parts[1];
                    } else {
                        otherName = parts[0];
                    }
                    
                    btn.textContent = otherName.charAt(0).toUpperCase() + otherName.slice(1);
                }
                
                btn.onclick = () => { 
                    currentChat = chatId; 
                    unreadCount = 0;
                    window.updateBadge();
                    window.renderTabs(); 
                    window.render(); 
                };
                div.appendChild(btn);
            });
        };

        window.enableNotifications = function() {
            if ('Notification' in window) {
                Notification.requestPermission().then(permission => {
                    console.log('Notification permission:', permission);
                    if (permission === 'granted') {
                        document.getElementById('notifBtn').style.display = 'none';
                        new Notification('Notifications Enabled! 🔔', {
                            body: 'You will now get messages alerts',
                            icon: '/axolotl.png'
                        });
                    }
                });
            }
        };

        window.updateBadge = function() {
            if (navigator.setAppBadge && unreadCount > 0) {
                navigator.setAppBadge(unreadCount);
            } else if (navigator.clearAppBadge && unreadCount === 0) {
                navigator.clearAppBadge();
            }
        };

        window.send = function() {
            const inp = document.getElementById('msg');
            const text = inp.value.trim();
            
            console.log('Send clicked. Text:', text, 'Connected:', connected);
            
            if (!text) {
                console.log('No text to send');
                return;
            }
            
            if (!connected) {
                console.log('Not connected to server');
                alert('Not connected. Please refresh the page.');
                return;
            }
            
            try {
                const sendKey = currentUser + '-' + currentChat + '-' + text + '-' + Date.now();
                console.log('🔵 SEND ATTEMPT:', sendKey);
                
                // Check if we already sent this exact message recently
                if (sentMessageIds.has(text + currentChat)) {
                    console.log('⚠️ DUPLICATE SEND ATTEMPT BLOCKED - Already sent recently!');
                    return;
                }
                
                sentMessageIds.add(text + currentChat);
                
                const msg = JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: text });
                console.log('📤 Sending message:', msg);
                ws.send(msg);
                inp.value = '';
                
                // Clear this from recent sends after 2 seconds
                setTimeout(() => {
                    sentMessageIds.delete(text + currentChat);
                }, 2000);
            } catch (e) {
                console.error('Error sending message:', e);
                alert('Error sending message. Please try again.');
            }
        };

        window.toggleVoiceRecording = function() {
            const btn = document.getElementById('voiceBtn');
            
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                // Stop recording
                mediaRecorder.stop();
                btn.textContent = '🎤';
                btn.style.opacity = '1';
            } else {
                // Start recording
                navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(stream => {
                        audioChunks = [];
                        mediaRecorder = new MediaRecorder(stream);
                        
                        mediaRecorder.ondataavailable = (event) => {
                            audioChunks.push(event.data);
                        };
                        
                        mediaRecorder.onstop = () => {
                            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                            const reader = new FileReader();
                            
                            reader.onload = (e) => {
                                const base64 = e.target.result;
                                
                                if (!connected) {
                                    alert('Not connected. Please refresh the page.');
                                    return;
                                }
                                
                                try {
                                    const msg = JSON.stringify({ 
                                        type: 'new_message', 
                                        user: currentUser, 
                                        chatId: currentChat, 
                                        text: '🎙️ Voice Message',
                                        voice: base64
                                    });
                                    console.log('📤 Sending voice message');
                                    ws.send(msg);
                                } catch (e) {
                                    console.error('Error sending voice:', e);
                                    alert('Error sending voice message. Please try again.');
                                }
                            };
                            reader.readAsDataURL(audioBlob);
                            
                            // Stop all tracks
                            stream.getTracks().forEach(track => track.stop());
                        };
                        
                        mediaRecorder.start();
                        btn.textContent = '⏹️ Stop';
                        btn.style.opacity = '0.7';
                        console.log('🎤 Recording started...');
                    })
                    .catch(error => {
                        console.error('Error accessing microphone:', error);
                        alert('Please allow microphone access to send voice messages.');
                    });
            }
        };

        window.sendImage = function() {
            const fileInput = document.getElementById('imageInput');
            const file = fileInput.files[0];
            
            if (!file) return;
            
            console.log('📷 Image selected:', file.name);
            
            // Convert image to base64
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = e.target.result;
                
                if (!connected) {
                    alert('Not connected. Please refresh the page.');
                    return;
                }
                
                try {
                    const msg = JSON.stringify({ 
                        type: 'new_message', 
                        user: currentUser, 
                        chatId: currentChat, 
                        text: '[Image]',
                        image: base64,
                        fileName: file.name
                    });
                    console.log('📤 Sending image message');
                    ws.send(msg);
                    fileInput.value = '';
                } catch (e) {
                    console.error('Error sending image:', e);
                    alert('Error sending image. Please try again.');
                }
            };
            reader.readAsDataURL(file);
        };

        window.render = function() {
            const div = document.getElementById('chat');
            let className = 'chat-display';
            if (currentChat === 'group') {
                className += ' group-chat';
            } else if (currentChat === 'esther-sienna') {
                className += ' esther-sienna-chat';
            }
            div.className = className;
            div.innerHTML = '';
            const msgs = messages[currentChat] || [];
            console.log('Rendering', msgs.length, 'messages');
            if (msgs.length === 0) { div.innerHTML = '<div class="empty">No messages yet</div>'; return; }
            msgs.forEach((m, index) => {
                console.log('  Message ' + index + ':', m.id, m.user, m.text.substring(0, 20));
                const d = document.createElement('div');
                d.className = 'message ' + (m.user === currentUser ? 'own' : m.user);
                const sender = '<div class="message-sender">' + m.user.toUpperCase() + '</div>';
                
                let content = '';
                if (m.voice) {
                    // Display voice message player
                    content = '<div class="message-bubble" style="padding: 8px 12px;"><audio controls style="width: 160px; height: 28px;"><source src="' + m.voice + '" type="audio/wav"></audio></div>';
                } else if (m.image) {
                    // Display image
                    content = '<div class="message-bubble" style="padding: 0; background: transparent;"><img src="' + m.image + '" style="max-width: 200px; max-height: 200px; border-radius: 12px; display: block;"></div>';
                } else {
                    // Display text
                    content = '<div class="message-bubble">' + m.text + '</div>';
                }
                
                d.innerHTML = sender + content;
                div.appendChild(d);
            });
            div.scrollTop = div.scrollHeight;
        };

        document.addEventListener('DOMContentLoaded', () => {
            document.getElementById('msg').addEventListener('keypress', (e) => { if (e.key === 'Enter') window.send(); });
            
            // Check if we have a saved user session
            const savedUser = sessionStorage.getItem('user');
            if (savedUser) {
                // User is already logged in - go straight to chat
                currentUser = savedUser;
                document.getElementById('pinScreen').style.display = 'none';
                document.getElementById('login').style.display = 'none';
                window.enterChat();
            } else {
                // No active session - show login screen
                document.getElementById('pinScreen').style.display = 'flex';
                document.getElementById('login').style.display = 'none';
            }
            
            // Keep session alive while app is running
            window.addEventListener('beforeunload', () => {
                console.log('App closing - session will be cleared on reload');
            });
        });

        window.toggleEmoji = function() {
            const ep = document.getElementById('emojiPicker');
            ep.style.display = ep.style.display === 'none' ? 'flex' : 'none';
        };

    </script>
</body>
</html>`;

app.get('/', (req, res) => { res.type('text/html').send(html); });

app.get('/axolotl.png', (req, res) => {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'axolotl.png'));
    res.type('image/png').send(data);
  } catch (error) {
    res.status(404).send('Image not found');
  }
});

app.get('/besties-bg.png', (req, res) => {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'besties-bg.png'));
    res.type('image/webp').send(data);
  } catch (error) {
    res.status(404).send('Image not found');
  }
});

app.get('/esther-sienna-bg.png', (req, res) => {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'esther-sienna-bg.png'));
    res.type('image/webp').send(data);
  } catch (error) {
    res.status(404).send('Image not found');
  }
});

app.get('/chat-bg.png', (req, res) => {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'chat-bg.png'));
    res.type('image/webp').send(data);
  } catch (error) {
    res.status(404).send('Image not found');
  }
});

app.get('/group-chat-bg.png', (req, res) => {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'group-chat-bg.png'));
    res.type('image/webp').send(data);
  } catch (error) {
    res.status(404).send('Image not found');
  }
});

app.get('/bestie-chat-bg.png', (req, res) => {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'bestie-chat-bg.png'));
    res.type('image/webp').send(data);
  } catch (error) {
    res.status(404).send('Image not found');
  }
});

app.get('/axolotl.png', (req, res) => {
  res.type('image/png').send(fs.readFileSync(path.join(__dirname, 'axolotl.png')));
});

app.get('/cat-image.webp', (req, res) => {
  res.type('image/webp').send(fs.readFileSync(path.join(__dirname, 'cat-image.webp')));
});

app.get('/manifest.json', (req, res) => {
  res.type('application/json').send(fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf8'));
});

app.get('/service-worker.js', (req, res) => {
  res.type('application/javascript').send(fs.readFileSync(path.join(__dirname, 'service-worker.js'), 'utf8'));
});

let messages = loadMessages();

wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  ws.send(JSON.stringify({ type: 'load_messages', messages }));
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      console.log('Server received:', msg.type, msg);
      if (msg.type === 'new_message') {
        const newMsg = { 
          id: Date.now(), 
          user: msg.user, 
          text: msg.text, 
          chatId: msg.chatId,
          image: msg.image,  // Include image data
          voice: msg.voice,  // Include voice data
          fileName: msg.fileName
        };
        const chatId = msg.chatId || 'group';
        if (!messages[chatId]) messages[chatId] = [];
        messages[chatId].push(newMsg);
        saveMessages(messages);
        console.log('Broadcasting to', wss.clients.size, 'clients');
        // Broadcast to ALL OTHER clients (NOT the sender)
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN && client !== ws) {
            console.log('Sending message to other client');
            client.send(JSON.stringify({ type: 'message', data: newMsg }));
          }
        });
        // Send confirmation back to sender only
        console.log('Sending confirmation to sender');
        ws.send(JSON.stringify({ type: 'message', data: newMsg }));
      }
    } catch (error) {
      console.error('Server message error:', error);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => { console.log('Chat Server Running on port ' + PORT); });

process.on('SIGTERM', () => {
  console.log('Saving messages...');
  saveMessages(messages);
  process.exit(0);
});

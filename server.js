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
  'amaaya-valley': [],
  'esther-mama': [],
  'esther-mummy': [],
  'esther-hilary': [],
  'esther-nan': [],
  'esther-rishy': [],
  'esther-poppy': [],
  'esther-sienna': [],
  'esther-valley': [],
  'esther-amaaya': [],
  'esther-lola': [],
  'lola-nan': [],
  'lola-poppy': []
};

function loadMessages() {
  try {
    if (fs.existsSync(messagesFile)) {
      const data = fs.readFileSync(messagesFile, 'utf8');
      console.log('Messages loaded');
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
        .container { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: linear-gradient(135deg, #ffd89b 0%, #19547b 25%, #ffecd2 50%, #ff9a9e 75%, #fad0c4 100%); display: none; flex-direction: column; z-index: 50; overflow: hidden; }
        .container.show { display: flex; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); color: white; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 14px; font-weight: bold; flex-shrink: 0; min-height: 40px; }
        .logout-btn { background: #764ba2; color: white; border: none; padding: 4px 8px; border-radius: 6px; cursor: pointer; font-size: 10px; font-weight: bold; }
        .tabs { display: flex; gap: 4px; padding: 4px; background: rgba(255,154,158,0.3); border-bottom: 1px solid rgba(102,126,234,0.4); overflow-x: auto; flex-shrink: 0; min-height: 28px; }
        .tab { padding: 6px 10px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 11px; color: white; flex-shrink: 0; transition: all 0.3s; }
        .chat-display { flex: 1; overflow-y: auto; padding: 10px; padding-bottom: 70px; background: rgba(255,240,245,0.7); }
        .chat-display.group-chat { background-image: url('/besties-bg.png?v=5'); background-size: cover; background-attachment: fixed; background-position: center; }
        .message { margin-bottom: 8px; display: flex; flex-direction: column; }
        .message-sender { font-size: 11px; color: white; margin-bottom: 2px; font-weight: bold; text-transform: uppercase; text-shadow: 0 1px 2px rgba(0,0,0,0.3); }
        .message-bubble { max-width: 75%; padding: 8px 10px; border-radius: 12px; word-wrap: break-word; font-size: 13px; width: fit-content; line-height: 1.3; box-shadow: 0 2px 4px rgba(0,0,0,0.15); font-weight: 500; }
        .message.own .message-bubble { background: linear-gradient(135deg, #667eea, #764ba2); color: white; }
        .message.esther .message-bubble { background: #ffffff; color: #333; border: 2px solid #764ba2; }
        .message.mama .message-bubble { background: #ffffff; color: #333; border: 2px solid #764ba2; }
        .message.mummy .message-bubble { background: #ffffff; color: #333; border: 2px solid #764ba2; }
        .message.lola .message-bubble { background: #ffffff; color: #333; border: 2px solid #764ba2; }
        .message.nan .message-bubble { background: #ffffff; color: #333; border: 2px solid #764ba2; }
        .message.poppy .message-bubble { background: #ffffff; color: #333; border: 2px solid #764ba2; }
        .message.rishy .message-bubble { background: #ffffff; color: #333; border: 2px solid #764ba2; }
        .message.sienna .message-bubble { background: #ffffff; color: #333; border: 2px solid #764ba2; }
        .message.valley .message-bubble { background: #ffffff; color: #333; border: 2px solid #764ba2; }
        .message.amaaya .message-bubble { background: #ffffff; color: #333; border: 2px solid #764ba2; }
        .message.hilary .message-bubble { background: #ffffff; color: #333; border: 2px solid #764ba2; }
        .input-area { position: fixed; bottom: 0; left: 0; right: 0; background: rgba(255,154,158,0.95); border-top: 2px solid rgba(102,126,234,0.5); display: flex; gap: 4px; flex-shrink: 0; padding: 10px; min-height: 54px; align-items: center; z-index: 100; box-shadow: 0 -4px 12px rgba(0,0,0,0.15); }
        .input-field { flex: 1; padding: 10px; border: 1px solid #667eea; border-radius: 8px; font-size: 14px; margin: 0; }
        .btn { background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 11px; transition: all 0.3s; flex-shrink: 0; }
        .send-btn { background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 10px 12px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 12px; flex-shrink: 0; margin: 0; white-space: nowrap; }
        .emoji-picker { display: flex; flex-wrap: wrap; max-height: 120px; overflow-y: auto; gap: 4px; padding: 4px; position: fixed; bottom: 56px; left: 0; right: 0; background: rgba(255,255,255,0.98); border-top: 2px solid rgba(102,126,234,0.3); z-index: 99; }
        .emoji-picker button { background: none; border: none; font-size: 28px; cursor: pointer; padding: 6px; }
        #gifResults { display: none; }
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
            <button class="logout-btn" onclick="window.logout()">Logout</button>
        </div>
        <div class="tabs" id="tabs"></div>
        <div class="chat-display" id="chat"><div class="empty">Loading...</div></div>
        <div class="input-area">
            <button class="btn" onclick="window.toggleEmoji()">😊</button>
            <button class="btn" onclick="window.toggleGif()">GIF</button>
            <input type="text" class="input-field" id="msg" placeholder="Say something..." disabled>
            <button class="send-btn" id="sendBtn" onclick="window.send()" disabled>Send</button>
        </div>
        <div id="emojiPicker" class="emoji-picker" style="display: none; background: white; padding: 10px; overflow-y: auto; max-height: 150px; flex-wrap: wrap; gap: 5px; border-top: 2px solid #667eea;"></div>
    </div>

    <script>
        let currentUser = null, currentChat = 'group', allChats = [], messages = {}, ws = null, connected = false, unreadCount = 0;

        const userNames = {
            '1234': 'esther',
            '2345': 'lola',
            '9876': 'mama',
            '8765': 'mummy',
            '3333': 'valley',
            '4444': 'amaaya',
            '5555': 'hilary',
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
                localStorage.setItem('user', user);
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
            localStorage.removeItem('user');
            document.getElementById('pinInput').value = '';
            document.getElementById('pinScreen').style.display = 'flex';
            document.getElementById('login').style.display = 'none';
        };

        window.enterChat = function() {
            try {
                document.getElementById('login').style.display = 'none';
                document.getElementById('app').classList.add('show');
                document.getElementById('myname').textContent = currentUser.toUpperCase();
                
                allChats = ['group'];
                
                if (currentUser === 'esther') {
                    allChats = ['group', 'family-group', 'esther-mama', 'esther-mummy', 'esther-hilary', 'esther-nan', 'esther-rishy', 'esther-poppy', 'esther-sienna', 'esther-valley', 'esther-amaaya'];
                } else if (currentUser === 'mama') {
                    allChats = ['group', 'family-group', 'esther-mama'];
                } else if (currentUser === 'mummy') {
                    allChats = ['group', 'family-group', 'esther-mummy'];
                } else if (currentUser === 'amaaya') {
                    allChats = ['group', 'guptas-chat', 'esther-amaaya', 'amaaya-valley'];
                } else if (currentUser === 'valley') {
                    allChats = ['group', 'guptas-chat', 'esther-valley', 'amaaya-valley'];
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
                        const saved = localStorage.getItem('chat_' + chat);
                        messages[chat] = saved ? JSON.parse(saved) : [];
                    }
                });
                
                console.log('Messages loaded:', messages);
                
                if ('Notification' in window && Notification.permission === 'default') {
                    Notification.requestPermission();
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
            localStorage.setItem('user', user);
            allChats = ['group'];
            
            if (user === 'esther') {
                allChats = ['group', 'family-group', 'esther-mama', 'esther-mummy', 'esther-hilary', 'esther-nan', 'esther-rishy', 'esther-poppy', 'esther-sienna', 'esther-valley', 'esther-amaaya'];
            } else if (user === 'mama') {
                allChats = ['group', 'family-group', 'esther-mama'];
            } else if (user === 'mummy') {
                allChats = ['group', 'family-group', 'esther-mummy'];
            } else if (user === 'amaaya') {
                allChats = ['group', 'guptas-chat', 'esther-amaaya', 'amaaya-valley'];
            } else if (user === 'valley') {
                allChats = ['group', 'guptas-chat', 'esther-valley', 'amaaya-valley'];
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
                    const saved = localStorage.getItem('chat_' + chat);
                    messages[chat] = saved ? JSON.parse(saved) : [];
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
            localStorage.removeItem('user');
            location.reload();
        };

        window.connect = function() {
            const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
            ws = new WebSocket(proto + '//' + location.host);
            ws.onopen = () => {
                connected = true;
                document.getElementById('msg').disabled = false;
                document.getElementById('sendBtn').disabled = false;
            };
            ws.onmessage = (e) => {
                const data = JSON.parse(e.data);
                if (data.type === 'load_messages') {
                    messages = data.messages;
                    window.render();
                } else if (data.type === 'message') {
                    if (!messages[data.data.chatId]) messages[data.data.chatId] = [];
                    messages[data.data.chatId].push(data.data);
                    localStorage.setItem('chat_' + data.data.chatId, JSON.stringify(messages[data.data.chatId]));
                    if (data.data.chatId === currentChat) window.render();
                    
                    // Send notification if from someone else
                    if (data.data.user !== currentUser && 'Notification' in window) {
                        // Only increment unread if message is NOT in current chat
                        if (data.data.chatId !== currentChat) {
                            unreadCount++;
                            window.updateBadge();
                        }
                        if (Notification.permission === 'granted') {
                            try {
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
                        }
                    }
                }
            };
            ws.onclose = () => { connected = false; setTimeout(window.connect, 3000); };
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
                } else if (chatId === 'amaaya-valley') {
                    btn.textContent = currentUser === 'amaaya' ? 'Valley' : 'Amaaya';
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
            if (!text || !connected) return;
            ws.send(JSON.stringify({ type: 'new_message', user: currentUser, chatId: currentChat, text: text }));
            inp.value = '';
        };

        window.render = function() {
            const div = document.getElementById('chat');
            let className = 'chat-display';
            if (currentChat === 'group') {
                className += ' group-chat';
            }
            div.className = className;
            div.innerHTML = '';
            const msgs = messages[currentChat] || [];
            if (msgs.length === 0) { div.innerHTML = '<div class="empty">No messages yet</div>'; return; }
            msgs.forEach(m => {
                const d = document.createElement('div');
                d.className = 'message ' + (m.user === currentUser ? 'own' : m.user);
                const sender = '<div class="message-sender">' + m.user.toUpperCase() + '</div>';
                const content = '<div class="message-bubble">' + m.text + '</div>';
                d.innerHTML = sender + content;
                div.appendChild(d);
            });
            div.scrollTop = div.scrollHeight;
        };

        document.addEventListener('DOMContentLoaded', () => {
            document.getElementById('msg').addEventListener('keypress', (e) => { if (e.key === 'Enter') window.send(); });
            
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                currentUser = savedUser;
                document.getElementById('pinScreen').style.display = 'none';
                document.getElementById('login').style.display = 'none';
                window.enterChat();
            } else {
                document.getElementById('pinScreen').style.display = 'flex';
                document.getElementById('login').style.display = 'none';
            }
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
  ws.send(JSON.stringify({ type: 'load_messages', messages }));
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      if (msg.type === 'new_message') {
        const newMsg = { id: Date.now(), user: msg.user, text: msg.text, chatId: msg.chatId };
        const chatId = msg.chatId || 'group';
        if (!messages[chatId]) messages[chatId] = [];
        messages[chatId].push(newMsg);
        saveMessages(messages);
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'message', data: newMsg }));
          }
        });
      }
    } catch (error) {}
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => { console.log('Chat Server Running on port ' + PORT); });

process.on('SIGTERM', () => {
  console.log('Saving messages...');
  saveMessages(messages);
  process.exit(0);
});

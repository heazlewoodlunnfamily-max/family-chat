const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Messages stored in memory
let messagesStorage = {};

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
  if (Object.keys(messagesStorage).length === 0) {
    messagesStorage = JSON.parse(JSON.stringify(defaultMessages));
    console.log('📝 Using default messages');
  } else {
    console.log('✅ Messages loaded from memory');
  }
  return messagesStorage;
}

function saveMessages(msgs) {
  messagesStorage = JSON.parse(JSON.stringify(msgs));
  console.log('✅ Messages saved to memory');
}

let messages = loadMessages();

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Family Chat - Our Vibes</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { height: 100%; margin: 0; padding: 0; }
        body { height: 100vh; overflow: hidden; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif; background: #f5f5f7; }
        .login-screen { position: fixed; width: 100vw; height: 100vh; background: linear-gradient(135deg, #ffffff 0%, #f5f5f7 100%); display: flex; flex-direction: column; justify-content: flex-start; align-items: center; padding: 10px; text-align: center; z-index: 100; overflow-y: auto; gap: 8px; }
        .login-btn { padding: 14px; background: #007AFF; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; text-transform: uppercase; box-shadow: 0 2px 8px rgba(0,122,255,0.3); transition: all 0.2s; }
        .login-btn:active { transform: scale(0.95); }
        .container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #ffffff; display: none; flex-direction: column; z-index: 50; overflow: hidden; justify-content: space-between; }
        .container.show { display: flex; }
        .header { background: #ffffff; color: #000; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; font-size: 14px; font-weight: 600; flex-shrink: 0; min-height: 56px; border-bottom: 1px solid #e5e5ea; box-shadow: 0 1px 3px rgba(0,0,0,0.05); gap: 10px; }
        .logout-btn { background: #007AFF; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; }
        .tabs { display: flex; gap: 8px; padding: 8px 16px; background: #ffffff; border-bottom: 1px solid #e5e5ea; overflow-x: auto; flex-shrink: 0; min-height: 44px; align-items: center; }
        .tab { padding: 6px 14px; background: #e5e5ea; border: none; border-radius: 20px; cursor: pointer; font-weight: 500; font-size: 13px; color: #000; flex-shrink: 0; transition: all 0.2s; white-space: nowrap; }
        .chat-display { flex: 1; overflow-y: auto; padding: 12px 8px; background: #ffffff; display: flex; flex-direction: column; gap: 2px; }
        .message { display: flex; flex-direction: column; margin-bottom: 4px; }
        .message.own { align-items: flex-end; }
        .message-bubble { padding: 10px 14px; border-radius: 18px; word-wrap: break-word; font-size: 16px; width: fit-content; max-width: 85%; line-height: 1.4; font-weight: 500; }
        .message.own .message-bubble { background: #007AFF; color: white; border-radius: 18px 4px 18px 18px; }
        .message.esther .message-bubble { background: #e5e5ea; color: #000; border-radius: 18px 18px 4px 18px; }
        .message.mama .message-bubble { background: #e5e5ea; color: #000; border-radius: 18px 18px 4px 18px; }
        .message.mummy .message-bubble { background: #e5e5ea; color: #000; border-radius: 18px 18px 4px 18px; }
        .message.lola .message-bubble { background: #e5e5ea; color: #000; border-radius: 18px 18px 4px 18px; }
        .input-area { position: relative; background: #ffffff; border-top: 1px solid #e5e5ea; display: flex; gap: 8px; flex-shrink: 0; padding: 10px 12px; align-items: flex-end; z-index: 100; width: 100%; min-height: 52px; }
        .input-field { flex: 1; padding: 10px 14px; border: 1px solid #e5e5ea; border-radius: 20px; font-size: 16px; margin: 0; background: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .input-field:focus { outline: none; border-color: #007AFF; background: #ffffff; }
        .btn { background: #e5e5ea; color: #000; border: none; padding: 8px 10px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; transition: all 0.2s; flex-shrink: 0; }
        .send-btn { background: #007AFF; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; flex-shrink: 0; margin: 0; white-space: nowrap; }
        #myname { font-size: 14px; font-weight: 600; color: #999; }
        #chatName { font-size: 18px; font-weight: 700; color: #000; }
        .empty { text-align: center; color: #999; padding: 20px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="login-screen" id="pinScreen">
        <div><img src="/axolotl.png?v=4" style="max-width: 100px; max-height: 100px; border-radius: 15px; display: block; margin-top: 5px;"></div>
        <h2 style="color: #000; margin: 5px 0 8px 0; font-size: 14px;">Enter PIN</h2>
        <input type="text" id="pinInput" placeholder="••••" inputmode="numeric" maxlength="4" style="padding: 8px; font-size: 24px; border: 3px solid #007AFF; border-radius: 10px; width: 140px; text-align: center; letter-spacing: 12px; margin: 5px 0; background: #ffffff; font-weight: bold; color: #000; -webkit-text-security: disc;" autocomplete="off">
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; width: 160px; margin: 5px 0;">
            <button class="login-btn" style="margin: 0; padding: 8px; font-size: 12px;" type="button" onclick="document.getElementById('pinInput').value += '1'; if(document.getElementById('pinInput').value.length === 4) window.checkPin();">1</button>
            <button class="login-btn" style="margin: 0; padding: 8px; font-size: 12px;" type="button" onclick="document.getElementById('pinInput').value += '2'; if(document.getElementById('pinInput').value.length === 4) window.checkPin();">2</button>
            <button class="login-btn" style="margin: 0; padding: 8px; font-size: 12px;" type="button" onclick="document.getElementById('pinInput').value += '3'; if(document.getElementById('pinInput').value.length === 4) window.checkPin();">3</button>
            <button class="login-btn" style="margin: 0; padding: 8px; font-size: 12px;" type="button" onclick="document.getElementById('pinInput').value += '4'; if(document.getElementById('pinInput').value.length === 4) window.checkPin();">4</button>
            <button class="login-btn" style="margin: 0; padding: 8px; font-size: 12px;" type="button" onclick="document.getElementById('pinInput').value += '5'; if(document.getElementById('pinInput').value.length === 4) window.checkPin();">5</button>
            <button class="login-btn" style="margin: 0; padding: 8px; font-size: 12px;" type="button" onclick="document.getElementById('pinInput').value += '6'; if(document.getElementById('pinInput').value.length === 4) window.checkPin();">6</button>
            <button class="login-btn" style="margin: 0; padding: 8px; font-size: 12px;" type="button" onclick="document.getElementById('pinInput').value += '7'; if(document.getElementById('pinInput').value.length === 4) window.checkPin();">7</button>
            <button class="login-btn" style="margin: 0; padding: 8px; font-size: 12px;" type="button" onclick="document.getElementById('pinInput').value += '8'; if(document.getElementById('pinInput').value.length === 4) window.checkPin();">8</button>
            <button class="login-btn" style="margin: 0; padding: 8px; font-size: 12px;" type="button" onclick="document.getElementById('pinInput').value += '9'; if(document.getElementById('pinInput').value.length === 4) window.checkPin();">9</button>
            <button class="login-btn" style="margin: 0; padding: 8px; font-size: 12px; background: #999;" type="button" onclick="document.getElementById('pinInput').value = '';">CLR</button>
            <button class="login-btn" style="margin: 0; padding: 8px; font-size: 12px;" type="button" onclick="document.getElementById('pinInput').value += '0'; if(document.getElementById('pinInput').value.length === 4) window.checkPin();">0</button>
            <button class="login-btn" style="margin: 0; padding: 8px; font-size: 12px; background: #ff6b6b;" type="button" onclick="document.getElementById('pinInput').value = document.getElementById('pinInput').value.slice(0, -1);">DEL</button>
        </div>
        <button class="login-btn" style="width: 160px; padding: 10px; font-size: 14px; cursor: pointer; margin-top: 3px;" type="button" onclick="window.checkPin();">LOGIN</button>
    </div>

    <div class="container" id="app">
        <div class="header">
            <div style="display: flex; flex-direction: column; flex: 1;">
                <div id="myname">You: </div>
                <div id="chatName">Select a chat</div>
            </div>
            <button class="logout-btn" onclick="window.logout()">Logout</button>
        </div>
        <div class="tabs" id="tabs"></div>
        <div class="chat-display" id="chat"><div class="empty">Loading...</div></div>
        <div class="input-area">
            <input type="text" class="input-field" id="msg" placeholder="Type a message..." disabled>
            <button class="send-btn" id="sendBtn" onclick="window.send()" disabled>Send</button>
        </div>
    </div>

    <script>
        let currentUser = null, currentChat = 'group', allChats = [], messages = {}, ws = null, connected = false;

        window.checkPin = function() {
            const pin = document.getElementById('pinInput').value;
            console.log('PIN entered:', pin);
            
            if (pin === '9876') {
                currentUser = 'nikki';
                sessionStorage.setItem('user', 'nikki');
                document.getElementById('pinScreen').style.display = 'none';
                document.getElementById('app').classList.add('show');
                window.enterChat();
            } else if (pin === '2107') {
                currentUser = 'esther';
                sessionStorage.setItem('user', 'esther');
                document.getElementById('pinScreen').style.display = 'none';
                document.getElementById('app').classList.add('show');
                window.enterChat();
            } else if (pin === '8765') {
                currentUser = 'mummy';
                sessionStorage.setItem('user', 'mummy');
                document.getElementById('pinScreen').style.display = 'none';
                document.getElementById('app').classList.add('show');
                window.enterChat();
            } else if (pin === '1234') {
                currentUser = 'lola';
                sessionStorage.setItem('user', 'lola');
                document.getElementById('pinScreen').style.display = 'none';
                document.getElementById('app').classList.add('show');
                window.enterChat();
            } else {
                alert('Wrong PIN! Valid: 9876=You, 2107=Esther, 8765=Mummy, 1234=Lola');
                document.getElementById('pinInput').value = '';
            }
        };

        window.logout = function() {
            sessionStorage.removeItem('user');
            location.reload();
        };

        window.enterChat = function() {
            try {
                document.getElementById('myname').textContent = 'You: ' + (currentUser ? currentUser.toUpperCase() : 'USER');
                
                if (currentUser === 'nikki') {
                    allChats = ['group', 'family-group', 'esther-nikki', 'esther-mama'];
                } else if (currentUser === 'esther') {
                    allChats = ['group', 'family-group', 'esther-mama', 'esther-mummy', 'esther-nikki'];
                } else if (currentUser === 'mummy') {
                    allChats = ['group', 'family-group', 'esther-mummy'];
                } else if (currentUser === 'lola') {
                    allChats = ['family-group'];
                } else {
                    allChats = ['group'];
                }
                
                currentChat = allChats[0];
                
                allChats.forEach(chat => {
                    if (!messages[chat]) messages[chat] = [];
                });
                
                window.renderTabs();
                window.connect();
                window.render();
                
            } catch (error) {
                console.error('enterChat error:', error);
                alert('Error: ' + error.message);
            }
        };

        window.renderTabs = function() {
            const div = document.getElementById('tabs');
            div.innerHTML = '';
            allChats.forEach(chatId => {
                const btn = document.createElement('button');
                btn.className = 'tab' + (chatId === currentChat ? ' active' : '');
                btn.textContent = chatId.replace('-', ' ').toUpperCase();
                btn.onclick = () => { 
                    currentChat = chatId; 
                    window.renderTabs(); 
                    window.render(); 
                };
                div.appendChild(btn);
            });
        };

        window.connect = function() {
            if (connected) return;
            const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
            ws = new WebSocket(proto + '//' + location.host);
            ws.onopen = () => {
                connected = true;
                document.getElementById('msg').disabled = false;
                document.getElementById('sendBtn').disabled = false;
            };
            ws.onclose = () => {
                connected = false;
                setTimeout(window.connect, 2000);
            };
            ws.onmessage = (e) => {
                const data = JSON.parse(e.data);
                if (data.type === 'load_messages') {
                    messages = data.messages;
                    window.render();
                } else if (data.type === 'message') {
                    if (!messages[data.data.chatId]) messages[data.data.chatId] = [];
                    messages[data.data.chatId].push(data.data);
                    if (data.data.chatId === currentChat) window.render();
                }
            };
        };

        window.send = function() {
            const msg = document.getElementById('msg').value.trim();
            if (!msg || !connected) return;
            
            ws.send(JSON.stringify({
                type: 'new_message',
                user: currentUser,
                chatId: currentChat,
                text: msg
            }));
            
            document.getElementById('msg').value = '';
        };

        window.render = function() {
            const div = document.getElementById('chat');
            div.innerHTML = '';
            const msgs = messages[currentChat] || [];
            if (msgs.length === 0) { div.innerHTML = '<div class="empty">No messages yet</div>'; return; }
            msgs.forEach((m) => {
                const d = document.createElement('div');
                d.className = 'message ' + (m.user === currentUser ? 'own' : m.user);
                d.innerHTML = '<div class="message-bubble">' + m.text + '</div>';
                div.appendChild(d);
            });
            div.scrollTop = div.scrollHeight;
        };

        document.addEventListener('DOMContentLoaded', () => {
            document.getElementById('msg').addEventListener('keypress', (e) => { if (e.key === 'Enter') window.send(); });
            
            const savedUser = sessionStorage.getItem('user');
            if (savedUser) {
                currentUser = savedUser;
                document.getElementById('pinScreen').style.display = 'none';
                window.enterChat();
            } else {
                document.getElementById('pinScreen').style.display = 'flex';
                document.getElementById('pinInput').focus();
            }
        });
    </script>
</body>
</html>`;

app.get('/', (req, res) => {
    res.send(html);
});

wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'load_messages', messages }));
    ws.on('message', (data) => {
        try {
            const msg = JSON.parse(data);
            if (msg.type === 'new_message') {
                const newMsg = {
                    id: Date.now(),
                    user: msg.user,
                    text: msg.text,
                    chatId: msg.chatId
                };
                if (!messages[msg.chatId]) messages[msg.chatId] = [];
                messages[msg.chatId].push(newMsg);
                saveMessages(messages);
                
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: 'message', data: newMsg }));
                    }
                });
            }
        } catch (e) {
            console.error('Error:', e);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

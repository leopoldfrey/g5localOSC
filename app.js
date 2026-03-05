import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import osc from "osc";
import path from "path";
import { fileURLToPath } from "url";

/* ---------- Setup ---------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// use alternate localhost and the port Heroku assigns to $PORT
const PORT = process.env.PORT || 4000;

/* ---------- Static Files ---------- */
app.use('/vendor', express.static(path.join(__dirname, 'public/vendor')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/img', express.static(path.join(__dirname, 'public/img')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

server.listen(PORT, () => {
    console.log(`| Web Server listening on port ${PORT}`);
});

/* ---------- OSC Setup ---------- */
let LOCAL = "127.0.0.1";
let REMOTE = "127.0.0.1";
let PORTIN = 48001;
let PORTOUT = 48000;

process.argv.forEach((val, index) => {
    switch(index) {
        case 2: REMOTE = val; break;
        case 3: PORTOUT = Number(val); break;
        case 4: LOCAL = val; break;
        case 5: PORTIN = Number(val); break;
    }
});

console.log(`Connecting to: ${REMOTE}:${PORTOUT} from ${LOCAL}:${PORTIN}`);

const udpPort = new osc.UDPPort({
    localAddress: LOCAL,
    localPort: PORTIN,
    remoteAddress: REMOTE,
    remotePort: PORTOUT,
    metadata: true
});

udpPort.on("ready", () => console.log("OSC UDP port is ready"));
udpPort.on("error", (err) => console.error("OSC Error:", err));
udpPort.open();

/* ---------- WebSocket Server ---------- */
const wss = new WebSocketServer({ server, clientTracking: true });

wss.on('connection', (ws, req) => {
    console.log(`| WS Connected: ${req.socket.remoteAddress}`);

    ws.on('message', (message) => {
        console.log('| WebSocket received:', message.toString());

        try {
            const input = JSON.parse(message);

            if (input.type === 'sendOSC') {
                const msg = {
                    address: input.address,
                    args: JSON.parse(input.args)
                };
                
                console.log(`- Sending OSC message to ${udpPort.options.remoteAddress}:${udpPort.options.remotePort}`, msg);

                udpPort.send(msg);
                console.log('| OSC Sent ✅');
            } else {
                console.log('* Ignored message type:', input.type);
            }
        } catch (err) {
            console.error('Error processing message:', err);
        }
    });

    ws.on('close', () => console.log('| WS Disconnected'));
});

wss.closeTimeout = 180 * 1000;
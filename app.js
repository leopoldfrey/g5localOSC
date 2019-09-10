var express     	= require("express");
var http        	= require("http");
var WebSocket   	= require("ws");
var WebSocketServer	= WebSocket.Server;
var bodyParser  	= require("body-parser");
var app         	=  express();
var server 			= http.createServer(app);
var osc 			= require("osc");

/* PARAMETERS */

// use alternate localhost and the port Heroku assigns to $PORT
const port = process.env.PORT || 4000;

app.get('/',function(req,res){
      res.sendFile(__dirname + "/public/index.html");
});

/*----------- Static Files -----------*/
app.use('/vendor', express.static('public/vendor'));
app.use('/css', express.static('public/css'));
app.use('/js', express.static('public/js'));
app.use('/img', express.static('public/img'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

server.listen(port,function() {
    console.log("| Web Server listening port " + port);
});

/*----------- OSC Sender -----------*/

var LOCAL = "127.0.0.1";
var REMOTE = "127.0.0.1";
var PORTIN = 48001;
var PORTOUT = 48000;

process.argv.forEach(function (val, index, array) {
  //console.log(index + ': ' + val);
  switch(index)
  {
  	case 2:
  		REMOTE = val;
  		break;
  	case 3:
  		PORTOUT = val;
  		break;
  	case 4:
  		LOCAL = val;
  		break;
  	case 5:
  		PORTIN = val;
  		break;
  	default:
  		break;
  }
});

console.log("Connecting to : "+REMOTE+":"+PORTOUT+" from "+LOCAL+":"+PORTIN);

var udpPort = new osc.UDPPort({
	localAddress: LOCAL,
    localPort: PORTIN,
    remoteAddress: REMOTE,
    remotePort: PORTOUT,
    metadata: true
});

udpPort.open();


/*----------- WS Server -----------*/

const wss = new WebSocketServer({
    server: server,
    autoAcceptConnections: true
});

wss.closeTimeout = 180 * 1000;

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('| WebSocket received : %s', message);

    var input = JSON.parse(message);
    
    switch(input.type) {
  		case 'sendOSC':
			var msg = {
				address: input.address,
				args: JSON.parse(input.args)
			};

			console.log("- Sending message", msg.address, msg.args, "to", udpPort.options.remoteAddress + ":" + udpPort.options.remotePort);
   
			try{
				udpPort.send(msg);
				console.error('| Success');
			}
			catch(error) {
				console.error(error);
			}
			break;
  		default:
  			console.log('* ignored : '+msg.type);
  			break;
    }
  });
});
var express = require('express');
var hbs = require('hbs');
var fs = require('fs');
var bodyParser = require('body-parser')
var WebSocketServer = require('ws').Server;
var request = require('request');
const path = require('path');
const uuid = require('uuid');
const session = require('express-session');


var app = express();
const PORT = process.env.PORT || 80;

app.set('view engine', 'hbs')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'))
hbs.registerPartials(__dirname + '/views/partials');

const sessionParser = session({
    saveUninitialized: false,
    secret: '$eCuRiTy',
    resave: false
});
app.use(sessionParser);
//wss = new WebSocketServer({port: 40510});
app.enable('trust proxy')

app.get("/", (req,res) => {
    res.render('home.hbs');
    const id = uuid.v4();
    console.log(`Updating session for user ${id}`);
    req.session.userId = id;
    //res.send({ result: 'OK', message: 'Session updated' });
})

const wss = new WebSocketServer({
    port: 40510,
    verifyClient: (info, done) => {
      console.log('Parsing session from request...');
      sessionParser(info.req, {}, () => {
        console.log('Session is parsed!');
        done(info.req.session.userId);
      });
    },
    app
});

wss.on('connection', (ws, req) => {
    //ws.send(req.session.userId)
    ws.on('message', (message) => {
        ws.userId = req.session.userId;
    });
});

app.post('/nampro', (req,res) => {
    var token = req.body.token2;
    var idg = req.body.idg; 

    var ahihia = req.session.userId;
    console.log(ahihia);
        var options = {
        uri: `https://graph.facebook.com/${idg}/members?fields=id&limit=5000&access_token=${token}`,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8',
        }
    }
    function callback(error, response, body) {
        if (!error) {
            var info = JSON.parse(body).data;
            if (info != "undefined" || info !="null") {var ahihi = Object.keys(info).length;}
            else{console.log("error")}
            
            for ( var i=0; i<info.length;i++) {
                var d = info[i];
                var t = d.id + '\r\n';
                try {
                    fs.appendFileSync(__dirname + "/public/"+ahihia+".txt", t);
                } catch (err) {
                    if (err) throw err;
                }
            }
            if (ahihi == i) {
                var n = JSON.parse(body).paging;
                var a = n.next;
                if(typeof a != 'undefined'){
                    const options = {  
                        uri: a,
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Accept-Charset': 'utf-8',
                        }
                    };
                    request(options, callback);
                } else {
                    fs.readFile(__dirname + "/public/"+ahihia+".txt", "utf8", function read(err, data) {
                        if (err) {
                            console.log(err);
                        } else {
                            req.wss.    
                        }
                    });
                } 
            }else{
                console.log("ahihi")
            }
        }
        return error;
    }
    request(options, callback);

    res.render('result.hbs');
})






// function noop() {}

// function heartbeat() {
//   this.isAlive = true;
// }
// wss.on('connection', function (ws) {

//     ws.send(JSON.stringify({
//         type: 'initialization',
//         id: token
//     }))


//     ws.isAlive = true
//     ws.on('pong', heartbeat)

//     ws.on('message', (message) => {
//         console.log("ahih", message)
//     })
    
//     ws.on('error', () => {
//         console.log('error webcoket')
//     })
// });

app.get("/download/:file(*)", (req,res) => {
    var file = req.params.file;
    var fileLocation = path.join(__dirname + '/public/',file);
    res.download(fileLocation, file);
})

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
  });




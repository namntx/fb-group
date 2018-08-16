var express = require('express');
var hbs = require('hbs');
var fs = require('fs');
var bodyParser = require('body-parser')
var WebSocketServer = require('ws').Server;
var request = require('request');
const path = require('path');
var randomstring = require("randomstring");
var app = express();

const PORT = process.env.PORT || 80;

app.set('view engine', 'hbs')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'))
hbs.registerPartials(__dirname + '/views/partials');

const randne = randomstring.generate();

wss = new WebSocketServer({port: 40510});

function noop() {}

function heartbeat() {
  this.isAlive = true;
}

wss.on('connection', function connection(ws) {
  ws.isAlive = true;
  ws.on('pong', heartbeat);
});

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping(noop);
  });
}, 30000);

app.use((req, res, next) => {
    req.wss = wss
    next()
})


app.get("/", (req,res) => {
    res.render('home.hbs');
})

app.post('/nampro', (req,res) => {
    var token = req.body.token2;
    var idg = req.body.idg;

    // request({
    //     uri: `https://graph.facebook.com/${idg}/members?access_token=${token}&format=json&method=get&summary=true&limit=false`,
    //     method: 'GET',
    //     headers: {
    //         'Accept': 'application/json',
    //         'Accept-Charset': 'utf-8',
    //     }

    // }, (error, response, body) => {
    //    if(error) {
    //        console.log("loi roi");
    //    }
    //    var total = JSON.parse(body).summary;
    //    console.log
    // });

    wss.on('connection', function (ws) {

        ws.on('message', function (message) {
            console.log('received: %s', message)
        })
       
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
                        fs.appendFileSync(__dirname + "/public/"+randne+".txt", t);
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
                        fs.readFile(__dirname + "/public/"+randne+".txt", "utf8", function read(err, data) {
                            if (err) {
                                console.log(err);
                            } else {
                                 
                                ws.send(randne);
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
    }); 

    res.render('result.hbs');
})


app.get("/download/:file(*)", (req,res) => {
    var file = req.params.file;
    var fileLocation = path.join(__dirname + '/public/',file);
    res.download(fileLocation, file);
})

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
  });




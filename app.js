var express = require("express")
var path = require("path")
var request = require("request")
var web3 = require("./config/web3setup.js")
var keys = require("./config/keys.js")
const spawn = require("child_process").spawn;

var app = express()
var port = 8080

const APP_ID = "YudqE2OHEYIAT4ymizQt"
const APP_CODE = "mkT0jqvIGcJ3fFeI3AhWvA"
const account = web3.eth.accounts.privateKeyToAccount('0xEDB6DFAD05CE816A124918D536A989355E9958BBBEC427870D5D5E896C96AF5A');
const account2 = web3.eth.accounts.privateKeyToAccount('0xC89ADA337DCDD9D9D092D582104064554DDC3A835B0D164B82E304F0DFC5F0FC');
web3.eth.accounts.wallet.add(account);
web3.eth.accounts.wallet.add(account2);

var balanceA;
var balanceB;

web3.eth.defaultAccount = account.address;

bal(account.address).then(function(result){
    //console.log(web3.utils.fromWei(result , 'ether'));
    balanceA = web3.utils.fromWei(result , 'ether');
});

bal(account2.address).then(function(result){
    //console.log(web3.utils.fromWei(result , 'ether'));
    balanceB = web3.utils.fromWei(result , 'ether');
});

function bal(address) {
    let balance = web3.eth.getBalance(address);
    return balance;
}

var blockchain_counter = 0;
loop();

function loop(){
    setTimeout(function(){
        if (blockchain_counter !== 0) {
            web3.eth.sendTransaction({
                from: account2.address ,
                to: account.address,
                value: '5000000000000000',
                gas: 2000000
            }).then(function(res){
                blockchain_counter--;   
                loop();
                console.log(res);
            });
        }
        else {
            loop();
        }
    }, 5000);
};


app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'))
})

app.get('/select', function(req, res) {
    res.sendFile(path.join(__dirname + "/index1.html"))
})

app.get('/route1', function(req, res) {
    res.sendFile(path.join(__dirname + "/index2.html"))
})

app.get('/route3', function(req, res) {
    res.sendFile(path.join(__dirname + "/index3.html"))
})

app.get('/spend', function(req, res) {
    res.sendFile(path.join(__dirname + "/index4.html"))
})

app.get('/balance', function(req, res) {
    bal(account.address).then(function(result){
        //console.log(web3.utils.fromWei(result , 'ether'));
        balanceA = web3.utils.fromWei(result , 'ether');
    });

    var ret = Math.floor(balanceA*100);
    res.send(ret.toString())
})

app.get('/route1tokens', function(req, res) {
    const pythonProcess = spawn('python',["routing.py"])
    var random_points
    
    pythonProcess.stdout.on('data', (data) => {
        random_points = JSON.parse(data.toString())
        res.send(random_points)
    });
})

app.get('/route1reward', function(req, res) {
    blockchain_counter++;
    res.status(200).send("")
})

app.get('/stations', function(req, res) {
    res.sendFile(path.join(__dirname + "/index5.html"))
})

app.get('/nearby', function(req, res) {
    res.sendFile(path.join(__dirname + "/index6.html"))
})

app.get('/pay', function(req, res) {
    web3.eth.sendTransaction({
        from: account.address ,
        to: account2.address,
        value: '50000000000000000',
        gas: 2000000
    }).then(function(res){
        console.log(res);
    });
    res.redirect('/paid');
})

app.get('/paid', function(req, res) {
    res.sendFile(path.join(__dirname + "/index7.html"))
})

app.get('/charging', function(req, res) {
    var data = '[{"station_id":"1","station_name":"UCLA-Parking1","cost":"1","cost_description":"$12/Day","level":"3","latitude":"34.0647715","longitude":"-118.4495823","available":"1"},{"station_id":"2","station_name":"UCLA-Parking2","cost":"0","cost_description":"","level":"2","latitude":"34.0678953","longitude":"-118.4425521","available":"1"},    {"station_id":"3","station_name":"Hilgard Ave/ Strathmore Ave","cost":"1","cost_description":"$2/hr","level":"3","latitude":"34.067895","longitude":"-118.4491182","available":"1"},    {"station_id":"4","station_name":"UCLA-Parking7","cost":"1","cost_description":"$12/Day","level":"2","latitude":"34.0730424","longitude":"-118.4490899","available":"1"},    {"station_id":"5","station_name":"UCLA-Parking8","cost":"1","cost_description":"$12/Day","level":"2","latitude":"34.0682512","longitude":"-118.4488368","available":"0"},    {"station_id":"6","station_name":"UCLA-Parking9","cost":"1","cost_description":"$2/hr","level":"2","latitude":"34.068077","longitude":"-118.4460016","available":"1"}]'
    res.send(JSON.parse(data))
})

app.post('/charging', function(req, res) {
    console.log(req.query)
    res.status("200").send("")
})

app.get('/route', function(req, res) {
    var xhr_url = "https://route.api.here.com/routing/7.2/calculateroute.json?" +
    "app_id=" + APP_ID +
    "&app_code=" + APP_CODE +
    "&waypoint0=geo!" + req.query.point1 + //34.07034,-118.45483" +
    "&waypoint1=geo!" + req.query.point2 + //34.04105,-118.26908" + 
    "&routeattributes=wp,sm,sh,sc" + 
    "&mode=fastest;car"
    
    request(xhr_url, function(e, r, b) {
        if (JSON.parse(r.body).hasOwnProperty("response")) {
            res.send(JSON.parse(r.body).response.route[0].shape);
        }
        else {
            res.status("404").send("Missing parameters")
        }
    })
})

app.listen(port, function () {
    console.log("Listening: " + port);
});
const express = require("express");
const SerialPort = require("serialport");

const PORT = 80;
const DEFAULT_COM_PORT = "COM4";
const HEX_0F = Buffer.from([15]);
const HEX_01 = Buffer.from([1]);
const HEX_00 = Buffer.from([0]);
const IP = "192.168.0.3";
const app = express();

app.use(express.static("public"));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(function (req, res, next) {
    next();
});

app.get("/test", function (req, res) {
    res.send("Hello World");
    console.log(req.query);
});

app.get("/tap", function(req, res){
    console.log(`X: ${req.query.x}, Y: ${req.query.y}, Success: ${req.query.hit}, Time: ${req.query.t}, Stimulus: ${req.query.stim}`);
    res.send("OK");
    if(req.query.hit === "true"){
        tx(HEX_0F);
    }
    else{
        tx(HEX_01);
    }
    
    setTimeout(() => tx(HEX_00), 250);
});

const serialPort = new SerialPort(DEFAULT_COM_PORT, {
    baudRate: 115200,
    autoOpen: false
});

serialPort.open(err => {
    if (err) {
        console.log("Error opening port: ", err.message);
    }
    else {
        console.log("Port open");
    }
});

function tx(data) {
    serialPort.write(data, function (err) {
        if (err) {
            return console.log("Error on write: ", err.message);
        }
    });
}

const server = app.listen(PORT, function () {
    //const host = server.address().address;
    const host = IP;
    const port = server.address().port;

    console.log("Example app listening at http://%s:%s", host, port);
});
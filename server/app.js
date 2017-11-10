const express = require('express');
const fs = require('fs');
const app = express();
const dateFormat = require("dateformat");
let totalLogs = [];

const thatIsAll = function(req, res, next){
    res.write("That's all");
    res.end();
};


app.use((req, res, next) => {
// write your logging code here

    let agent = req.headers["user-agent"];
    let time = new Date().toISOString();
    let method = req.method;
    let resource = req.originalUrl;
    let version = "HTTP/" + req.httpVersion;
    let status = res.statusCode;
    let comma = ",";
    agent = agent.replace(/,/g, "");
    let log = agent;
    log += comma + time;
    log += comma + method;
    log += comma + resource;
    log += comma + version;
    log += comma + status;
    //console.log(log);
    
    fs.appendFile("./logs/logs_current.csv", "\n" + log, function(err, fd){
        if (err){
            throw (err);
        };
    }); // end of fs.appendFile

    fs.readFile("./logs/logs_current.csv", "utf8", function(err, data){
        if(err){
            throw err;
        }
        let lines = data.split("\n");

        if(lines.length > 20){
            let now = dateFormat(new Date(), "yyyy_mm_dd_HH_MM_ss");
            totalLogs.push(now);
            fs.copyFileSync("./logs/logs_current.csv", "./logs/logs_" + totalLogs[totalLogs.length-1] + ".csv");
            fs.writeFileSync("./logs/logs_current.csv", "Agent,Time,Method,Resource,Version,Status", "utf8");
            if (totalLogs.length >= 5) {
                let logToDelete = totalLogs.shift();
                console.log(logToDelete);
                fs.unlink("./logs/logs_" + logToDelete + ".csv", function(err){
                    if(err){
                        throw err;
                    }
                });
            }
        }
    }) // end of fs.readFile
    
    next();
});

app.get('/', (req, res) => {
// write your code to respond "ok" here
    res.sendStatus(200);
});

app.get('/logs', function handleLogsRequest (req, res) {
// write your code to return a json object containing the log data here
    fs.readFile("./logs/logs_current.csv", 'utf8', function handleFile(err, data){
        if(err){
            throw err
        }
        let users = data.split("\n");
        let result = [];
        let header = users[0].split(",");
    
        for(let i = 1; i < users.length; i++){
            let user = {};
            let userAttr = users[i].split(",");
            for(let j = 0; j < userAttr.length; j++){
                user[header[j]] = userAttr[j];
            }
            result.push(user);
        }
        res.json(result);
    });
    
});

app.get("/*", function(req, res){
    res.sendStatus(404);
});

module.exports = app;

// fs.appendFile
// fs.writeFile
// fs.open
// fs.readFile

var fs = require('fs');
var http = require('http');
var sql = require('sqlite3').verbose();

function getFormValuesFromURL(url) {
    var kvs = {};
    var parts = url.split("?");
    var key_value_pairs = parts[1].split("&");
    for (var i = 0; i < key_value_pairs.length; i++) {
        var key_value = key_value_pairs[i].split("=");
        kvs[key_value[0]] = key_value[1];
    }
    return kvs
}

function server_fun(req, res) {

    var filename = "./" + req.url;
    try {
        var contents = fs.readFileSync(filename).toString();
        res.writeHead(200);
        res.end(contents);
    } catch (exp) {

        if (req.url.indexOf("/getTimes") >= 0) {
            var kvs = getFormValuesFromURL(req.url);
            var db = new sql.Database('weatherData.sqlite');

            var time1 = kvs["Time1"];
            var time2 = kvs["Time2"];

            db.all("SELECT * FROM weatherData WHERE TimeMDT BETWEEN " + time1 + " AND " + time2,
                function(err, rows) {
                    if (err !== null) {
                        console.log(err);
                        return;
                    }
                    respText = "";
                    for (var i = 0; i < rows.length; i++) {
                        if (rows[i].TimeMDT >= time1 && rows[i].TimeMDT <= time2) {
                            respText += rows[i].TimeMDT + "";
                        }
                    }
                    res.writeHead(200);
                    res.end("Times " + respText);
                });

        } else if (req.url.indexOf("/addData") >= 0) {
            var kvs = getFormValuesFromURL(req.url);
            var db = new sql.Database('weatherData.sqlite');
            var values = "('";
            values += kvs['TimeMDT'] + "','";
            values += kvs['TempF'] + "','";
            values += kvs['DPF'] + "','";
            values += kvs['Humidity'] + "','";
            values += kvs['SLPI'] + "','";
            values += kvs['VisibilityMPH'] + "','";
            values += kvs['WinDIR'] + "','";
            values += kvs['WindSpeed'] + "','";
            values += kvs['GustSpeed'] + "','";
            values += kvs['Precip'] + "','";
            values += kvs['Events'] + "','";
            values += kvs['Conditions'] + "','";
            values += kvs['WindDIRDEG'] + "','";
            values += kvs['DateUTC'] + "')";
            console.log(values);
            db.run("INSERT INTO weatherData(TimeMDT,TemperatureF,DewPointF,Humidity,SLPI,VisibilityMPH,WindDir," +
                "WindSpeed,GustSpeed,PrecipitationIn,Events," +
                "Conditions,WindDirDegrees,DateUTC) VALUES" + values,
                function(err) {
                    res.writeHead(200);
                    res.end("You added a value " + values)
                });
        } else {
            res.writeHead(404);
            res.end("cannot find file " + filename);
        }
    }
}


var server = http.createServer(server_fun);

server.listen(8080);
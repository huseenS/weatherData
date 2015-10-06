var sql = require('sqlite3').verbose();
var fs = require('fs');

//did user type filename
if (process.argv.length < 3) {
    console.log("Usage: Need filename");
    process.exit(1);
}

var filename = process.argv[2];

function readFile(name) {
    try {
        var f = fs.readFileSync(name);
        var contents = f.toString();
    } catch (exp) {
        console.log(exp);
    }
    return contents.split('\n');
}

var lineDataArray = [];


function getValues() {
    var lines = readFile(filename);

    var headings = lines[0];
    var headingValues = headings.split(',');

    for (var i = 1; i < lines.length; i++) {
        var eachLine = lines[i];
        var dataValues = eachLine.split(',');

        var lineData = {};
        for (var x = 0; x < dataValues.length; x++) {
            lineData[headingValues[x]] = dataValues[x];
        }
        lineDataArray.push(lineData);
    }

}

var db = new sql.Database('weatherData.sqlite');

function fillTable(db) {

    db.run("CREATE TABLE IF NOT EXISTS weatherData (TimeMDT VARCHAR(100), TemperatureF VARCHAR(100), DewPointF VARCHAR(100) NOT NULL, Humidity VARCHAR(100), " +
        "SLPI VARCHAR(100), VisibilityMPH VARCHAR(100), WindDir VARCHAR(5) NOT NULL, WindSpeed VARCHAR(4) NOT NULL, GustSpeed VARCHAR(4) NOT NULL, " +
        "PrecipitationIn VARCHAR(3) NOT NULL, Events VARCHAR(1), Conditions VARCHAR(16) NOT NULL, WindDirDegrees VARCHAR(100) NOT NULL, DateUTC VARCHAR(19) NOT NULL)");

    for (var i = 0; i < lineDataArray.length; i++) {

        var s = "('" + lineDataArray[i].TimeMDT + "','" + lineDataArray[i].TemperatureF + "','" + lineDataArray[i].DewPointF + "','" + lineDataArray[i].Humidity + "','" +
            lineDataArray[i].SLPI + "','" + lineDataArray[i].VisibilityMPH + "','" + lineDataArray[i].WindDir + "','" + lineDataArray[i].WindSpeed + "','" + lineDataArray[i].GustSpeed + "','" +
            lineDataArray[i].PrecipitationIn + "','" + lineDataArray[i].Events + "','" + lineDataArray[i].Conditions + "','" + lineDataArray[i].WindDirDegrees + "','" + lineDataArray[i].DateUTC + "')";

        db.run("INSERT INTO weatherData VALUES " + s,
            function(err) {
                console.log("ERR " + err);
            });
    }
}

getValues();

//needs to be run in console twice for some reason
//error logs in console but the table fills correctly
fillTable(db);

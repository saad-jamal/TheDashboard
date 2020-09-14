/**
 * Back-end server that handles POST, and GET requests. Listens on
 * http://localhost:4201. The primary purpose of the server is to handle
 * file uploads from the initialize page, download and convert the data to
 * JSON, and allow clients to GET it on the simulation page.
 * 
 * @author Saad Jamal
 */
const express = require('express');
const app = express();
const fs = require('fs-extra');
const JSONStream = require('JSONStream');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const cors = require('cors');


/* Sets the port to be 4201. */
app.set('port', process.env.PORT || 4201);

/* Express App Settings. */
app.use(fileUpload());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* Send stock string on home page. */
app.get('/', function(req, res) {
    res.send('TheDashboard back-end server. Developed by Saad Jamal.');
});

/* When client uploads sim data to server, it should be downloaded and
 * read into JSON. */
app.post('/sim-upload', function(req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    fs.emptyDirSync('src/assets/data/');
    let sampleFile = req.files.sampleFile;
    expirementName = req.files.sampleFile.name.slice(0, -4);
    simDataInfo.expirementName = expirementName;
    if (sampleFile.name.slice(-4) !== '.csv') {
        return res.status(500).send("Must upload CSV files.");
    }
    sampleFile.mv("src/assets/data/" + sampleFile.name, function(err) {
        if (err) {
            return res.status(500).send(err);
        }
        console.log("Parsing file: " + sampleFile.name);
        csvHandler(sampleFile.name);
        res.redirect('http://localhost:4200/initialize');
    })
});

/** When client uploads event data to server, it should be downloaded and
 *  read into JSON. Quite similar to the sim data.
 */
app.post('/event-upload', function(req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    fs.emptyDirSync('src/assets/events/');
    let sampleFile = req.files.sampleFile;
    if (sampleFile.name.slice(-4) !== '.csv') {
        return res.status(500).send("Must upload CSV files.");
    }
    console.log("Uploading file: " + sampleFile.name);
    sampleFile.mv("src/assets/events/" + sampleFile.name, function(err) {
        if (err) {
            return res.status(500).send(err);
        }
        res.redirect('http://localhost:4200/initialize');
        console.log("Event markers successfully uploaded.");
    });
});

/** When client selects 'Download Events', a POST request is made to
 *  download a CSV file of the indicators.
 */
app.post('/event-download', function(req, res) {
    if (req.body != null) {
        let eventFlags = req.body;
        let headers = '';
        for (key in eventFlags[0]) {
            headers = headers + key + ',';
        }
        headers = headers.substring(0, headers.length - 1);
    
        let output = headers + '\n';
        for (let i = 0; i < eventFlags.length; i++) {
            let line = '';
            for (key in eventFlags[i]) {
                let value = eventFlags[i][key];
                line = line + value + ',';
            }
            line = line.substring(0, line.length - 1);
            output = output + line + '\n';
        }
    
        console.log('Writing event indicators to file.');
    
        fs.writeFile('src/assets/events/event_markers_' + simDataInfo.expirementName.slice(9) + '.csv', output, function(err) {
            if (err) throw err;
            console.log('Event data sucessfully downloaded.');
        });
    
        res.sendStatus(200);
    } else {
        console.log('Nothing to download.');
    }
});

/** When client uploads video files to server it should be stored 
 *  in the assets/video folder. */
app.post('/vid-upload', function(req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
         return res.status(400).send('No files were uploaded.');
    }
    fs.emptyDirSync('src/assets/video');
    let sampleFile = req.files.sampleFile;
    videoName = req.files.sampleFile.name.slice(0, -4);
    simDataInfo.videoName = videoName;
    if (sampleFile.name.slice(-4) !== '.mp4') {
        return res.status(500).send("Must upload MP4 files.");
    }

    console.log("Uploading file: " + sampleFile.name);
    sampleFile.mv("src/assets/video/vid.mp4", function(err) {
        if (err) {
            return res.status(500).send(err);
        }
        res.redirect('http://localhost:4200/initialize');
        console.log("Video file successfully uploaded.");
    });
    fs.writeFile('src/assets/video/' + simDataInfo.videoName + '.txt', '\n');
});

 /** When client loads simulate page, they should be informed of
  *  what data is pre-loaded in the app. */
 app.get('/sim-info', function(req, res) {
    res.send(simDataInfo);
 });

 /** When client loads simulate page, they should receive
  *  JSON of all event indicators loaded on disk.
  */
 app.get('/events', function(req, res) {
    if (!fs.existsSync('src/assets/events/event_markers_' + simDataInfo.expirementName.slice(9) + '.csv')) {
        console.log('No previously recorded events.');
        res.send([]);
    } else {
        let bufferString = fs.readFileSync('src/assets/events/event_markers_' + simDataInfo.expirementName.slice(9) + '.csv', 'utf8');
        let arr = bufferString.split('\n');
        let jsonObj = [];
        let headers = arr[0].split(',');
        for (let i = 1; i < arr.length; i++) {
            if (arr[i] === "" || arr[i] === ",") {
                continue;
            }
            let data = arr[i].split(',');
            let obj = {};
            for (let j = 0; j < data.length; j++) {
                if (headers[j].trim() === "color" && data[j].trim() === "") {
                    obj[headers[j].trim()] = 'yellow';
                } else {
                    obj[headers[j].trim()] = data[j].trim();
                }
            }
            jsonObj.push(obj);
        }
        res.send(jsonObj);
    }
 })

app.listen(app.get('port'), function() {
    console.log("Application listening at http://localhost:4201");
});

/* This object stores information about the current expirements
 * loaded on memory. */
simDataInfo = {
    expirementName: "",
    videoName: ""
}

if (!fs.existsSync('src/assets/data')) {
    fs.mkdirSync('src/assets/data');
}

/* We need to initially read all the files of data we have in order to
 * initialize the simDataInfo object. */
fs.readdir('src/assets/data', function(err, files) {
    for (i = 0; i < files.length; i++) {
		if (files[i].slice(-4) == ".csv") {
			simDataInfo.expirementName = files[i].slice(0,-4);
		}
	}
});

if (!fs.existsSync('src/assets/video')) {
    fs.mkdirSync('src/assets/video');
}

fs.readdir('src/assets/video', function(err, files) {
	for (i = 0; i < files.length; i++) {
		if (files[i].slice(-4) == ".txt") {
			simDataInfo.videoName = files[i].slice(0,-4);
		}
	}
});

if (!fs.existsSync('src/assets/events')) {
    fs.mkdirSync('src/assets/events');
}


/* This function converts a CSV file into a JSON. */
function csvHandler(fileName) {
    fs.readFile("src/assets/data/" + fileName, function(err, data) {
        if (err) {
            return console.log(err);
        }
        var bufferString = data.toString();
        var arr = bufferString.split('\n');
        var jsonObj = [];
        var headers = arr[1].split(',');
        for (let i = 3; i< arr.length; i += 1) {
            var data = arr[i].split(',');
            var obj = {};
            for (var j = 0; j < data.length; j++) {
                if (j == 0 && (data[j].trim()) == "") {
                    i = arr.length;
                    break;
                }
                obj[headers[j].trim()] = data[j].trim();
            }
            jsonObj.push(obj);
        }
        var transformStream = JSONStream.stringify();
        var outputStream = fs.createWriteStream("src/assets/data/sim.json");
        transformStream.pipe(outputStream);
        jsonObj.forEach(transformStream.write);
        transformStream.end();

        outputStream.on(
            "finish",
            function handleFinish() {
                console.log("Input data successfully parsed.");
            }
        );
    })
}
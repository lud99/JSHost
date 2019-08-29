const express = require("express");
const app = express();
const server = require("http").createServer(app);

const formidable = require("formidable");

const fs = require("fs");

const FileManager = require("./server/FileManager.js");

app.use(express.static("client"));

const port = process.env.PORT || 3000;
server.listen(port, function() {
	process.stdout.write("\033c"); //Clear console
  	console.log("Server started on port " + port);
});

const fileManager = new FileManager(fs);
let ids = new Map;

//Load all file ids
fileManager.readDirectory("./files", true, items => {
    items.forEach(item => {
        ids.set(item.replaceAll(".js"), __dirname + "/files/" + item);
    });

    console.log("Ids:", ids);
});

app.get("/:id", (req, res) => {
    const id = req.params.id.replaceAll(".js");
    const filePath = ids.get(id);

    if (!filePath) {
        res.redirect("/");
    } else {
        fileManager.fileExists(filePath, exists => {
            if (exists)
                res.sendFile(filePath);
            else 
                res.redirect("/");
        });
    }
});

app.post("/upload", (req, res) => {
	new formidable.IncomingForm().parse(req, (err, fields, files) => {
        if (err) {
            console.error("Error", err)
            throw err
        }

        //Convert object to array and grab the first element
        const file = Object.values(files)[0];

        let id = createId();
        while (ids.has(id)) {
            console.log("Id already exists, generating a new one");
            id = createId();
        }

        const fileDir = __dirname + "/files/" + id + ".js";
        ids.set(id, fileDir);

        console.log("Received file '%s'. Setting its id to '%s'", file.name, id);

        fileManager.saveFile(file, "./files", id + ".js");

        res.send({
            response: "The file was uploaded successfully. <a href=__IDHERE>Click here to view it</a> or <a href=\"javascript:copy(window.location.origin + '/' + '__IDHERE')\">here to copy the link</a>".replaceAll("__IDHERE", id),
            id: id
        });
    });
});

function encode(string) {
	return encodeURIComponent(decodeURIComponent(string));
}

function createId(len = 6, chars = "abcdefghijklmnopqrstuvwxy") {
	let id = "";
	while (len--) {
		id += chars[Math.random() * chars.length | 0];
	}
	return id;
}

String.prototype.replaceAll = function(str1, str2 = "") {
    return this.split(str1).join(str2);
}

class FileManager 
{
	constructor(fs) 
	{
		this.fs = fs;
	}	

	createDirectory(path, recursive = true) 
	{
		this.fs.mkdirSync(path, { recursive: recursive }); //Create folder and (if specified) all its subfolders
	}

	directoryExists(path, createDirectory)
	{
		//If the directory exists
		if (this.fs.existsSync(path)) {
			return true;
		} else {
			if (createDirectory) this.createDirectory(path); //Create the directory
			return false;
		}
	}

	saveFile(file, dir, name)
	{
     	this.fs.copyFile(file.path, dir + "/" + name, err => {
		    if (err) return console.log(err);

	    	console.log("The file '%s' was successfully saved!", name);
    	});
	}

	readDirectory(path, createDirectory, callback) 
	{
		if (createDirectory) this.directoryExists(path, true);
		this.fs.readdir(path, (err, items) => { callback(items); });
	}

	readFile(path, callback)
	{
		//If the file exists
		this.fs.access(path, this.fs.F_OK, err => {
			if (err) return console.log(err);

			//Read it
			this.fs.readFile(path, 'utf8', (err, data) => {
			    if (err) return console.log(err);

			    callback(data);
			});
		});
	}

	fileExists(path, callback) 
	{
		this.fs.access(path, this.fs.F_OK, err => { callback(err ? false : true); });
	}
}

module.exports = FileManager;
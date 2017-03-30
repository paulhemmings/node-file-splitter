#! /usr/bin/env node

// to enter source file in command line
// https://nodejs.org/api/readline.html

// basis for this example
// http://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js

const fs = require('fs');
const path = require('path');

// get arguments (source file and number of files to be generated)

const args = process.argv.slice(2);
if (args.length < 2) {
    return console.log('usage :: file-splitter [source file] [number of files to generate]');
}

const sourceFile = args[0];
const fileCount = args[1];

const replaceOn = args.length > 2 ? args[2] : null;
const debugOn = args.length > 3 ? args[3] : false;
const sourcePathParts = path.parse(sourceFile);

// tell the user what is happening

console.log('splitting ' + sourcePathParts.name + ' into ' + fileCount + ' ' + sourcePathParts.ext + ' files');
if (debugOn) console.log('with debug on');
if (replaceOn != null) console.log('replacing on: ' + replaceOn);

// function to process the input fileCount

const processSourceFile = function(soucePath, streamArray) {
    var firstLine = null;
    var counter = 0;
    require('readline').createInterface({
        input: fs.createReadStream(soucePath)
    })
    .on('line', function (line) {

        if (firstLine == null) {
            firstLine = line;
            return;
        }

        if (debugOn) {
            console.log('Line from file: ', line);
            console.log('write to file: ', counter);
        }

        if (!streamArray[counter].wroteHeader) {
            streamArray[counter].wroteHeader = true;
            streamArray[counter].stream.write(firstLine + "\r\n");
        }
        streamArray[counter].stream.write(line + "\r\n");

        counter++;
        if (counter > streamArray.length-1) {
            counter = 0;
        }

    })
    .on('close', function() {
        for (var count = 0; count < fileCount; count++) {
            streamArray[count].stream.end();
        }
        console.log('finished');
    });
}

// build the handler for the new open write stream
// if all streams now open, process source file.

const buildOpenHandler = function(allOpen, sp, sa) {
    return function(fd) {
        if (allOpen) {
            processSourceFile(sp, sa);
        }
    }
}

// create that many streams.

var fileStreams = [];
for (var count = 0; count < fileCount; count++) {
    var destinationFilePath = path.join(sourcePathParts.dir, sourcePathParts.name + "-" + count + sourcePathParts.ext);
    fileStreams.push({
      stream : fs.createWriteStream(destinationFilePath).once('open', buildOpenHandler(count == fileCount-1, sourceFile, fileStreams) ),
      wroteHeader : false
    });
}

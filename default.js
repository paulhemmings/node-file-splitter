// to enter source file in command line
// https://nodejs.org/api/readline.html

// basis for this example
// http://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js

var Promise = require('node-promise').Promise;
var fs = require('fs');

// get arguments (source file and number of files to be generated)

var args = process.argv.slice(2);
if (args.length < 2) {
    return console.log('usage :: node default.js [source file] [number of files to generate]');
}

var fileCount = args[1];
var sourceFile = args[0];
var debugOn = args.length > 2 ? args[2] : false;
var waitingCount = fileCount;
var firstLine = null;
var fileStreams = [];
var counter = 0;
var fileParts = sourceFile.split(/[. ]+/);
var fileExtension = sourceFile.split(/[. ]+/).pop();

// tell the user what is happening
console.log('splitting ' + sourceFile + ' into ' + fileCount + ' ' + fileExtension + ' files');

// create that many promises and streams

for (var count = 0; count < fileCount; count++) {

    fileStreams.push({
      index : count,
      promise : new Promise(),
      stream : null,
      wroteHeader : false
    });

    fileStreams[count].stream = fs.createWriteStream("./" + fileParts[0] + "-" + count + '.' + fileExtension);
    fileStreams[count].stream.once('open', curry(openHandler, count));

}

function curry(fun, a) {
    return function (b) {
        fun(a,b);
    }
}

function openHandler(count , fd) {
    fileStreams[count].promise.resolve (fileStreams[count].stream);
    fileStreams[count].promise.then(handleStream);
}

// when the source file is open

function handleStream(stream) {

  waitingCount--;
  if (waitingCount > 0) {
      return;
  }

  // read a line

  var lineReader = require('readline').createInterface({
      input: require('fs').createReadStream(sourceFile)
  });

  lineReader.on('line', function (line) {

      if (firstLine == null) {
          firstLine = line;
          return;
      }

      if (debugOn) {
          console.log('Line from file: ', line);
          console.log('write to file: ', counter);
      }

      if (!fileStreams[counter].wroteHeader) {
          fileStreams[counter].wroteHeader = true;
          fileStreams[counter].stream.write(firstLine + "\r\n");
      }

      fileStreams[counter].stream.write(line + "\r\n");

      counter++;
      if (counter > fileCount-1) {
         counter = 0;
      }

  });

  lineReader.on('close', function() {
      for (var count = 0; count < fileCount; count++) {
          fileStreams[count].stream.end();
      }
      console.log('finished');
  })

};

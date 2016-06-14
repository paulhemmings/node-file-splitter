// to enter source file in command line
// https://nodejs.org/api/readline.html

// basis for this example
// http://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js

var fs = require('fs');

// get arguments (source file and number of files to be generated)

var args = process.argv.slice(2);
if (args.length < 2) {
    return console.log('usage :: node default.js [source file] [number of files to generate]');
}

var fileCount = args[1];
var sourceFile = args[0];
var replaceOn = args.length > 2 ? args[2] : null;
var debugOn = args.length > 3 ? args[3] : false;
var waitingCount = fileCount;
var firstLine = null;
var fileStreams = [];
var counter = 0;
var fileParts = sourceFile.split(/[. ]+/);
var fileExtension = sourceFile.split(/[. ]+/).pop();

// tell the user what is happening

console.log('splitting ' + sourceFile + ' into ' + fileCount + ' ' + fileExtension + ' files');
if (debugOn) console.log('with debug on');
if (replaceOn != null) console.log('replacing on: ' + replaceOn);

// create that many promises and streams

for (var count = 0; count < fileCount; count++) {

    fileStreams.push({
      stream : fs.createWriteStream("./" + fileParts[0] + "-" + count + '.' + fileExtension).once('open', openHandler),
      wroteHeader : false
    });

}

function openHandler(fd) {

  waitingCount--;
  if (waitingCount > 0) {
      return;
  }

  // read a line

  var lineReader = require('readline').createInterface({
      input: fs.createReadStream(sourceFile)
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

      // manage a pipe delimited list of text to replace
      // replace-this:with-this|and-this:with-this-as-well
      // example:: "\\\\:'|\":'"

      if (replaceOn) {
          replaceOn.split('|').forEach(function(replaceField) {
              var replaceValues = replaceField.split(':');
              line = line.replace(new RegExp(replaceValues[0], 'g'), replaceValues[1]);
          });
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

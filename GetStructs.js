fs = require('fs')
fs.readFile('DataStruct.json', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  var DataStruct = JSON.parse(data);
  console.log(DataStruct.FileData); //return this for all DataStruct info
});


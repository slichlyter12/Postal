var DataStruct;
returnDataStruct();
function returnDataStruct(){
  fs = require('fs')
  DataStruct = fs.readFileSync('DataStruct.json', 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    var DataStructParse = JSON.parse(data);
    //console.log(DataStruct.FileData); //return this for all DataStruct info
  });
}
console.log(DataStruct);


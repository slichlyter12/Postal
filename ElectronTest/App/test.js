  nodesArray = [];
  edgesArray = [];
  edgesIDArray = [];
  errorsArray = [];
  errorsSizeRefArray = [];
  //globalJSON;

  var struct;
  var DataStruct;
  function ReadStructs(){
    alert("reading struct");
    fs = require('fs');
    struct = JSON.parse(fs.readFileSync('DataStruct.json', 'utf8', function (err,data) {
        if (err) {
            console.log(err);
            return;
        }

         DataStruct = JSON.parse(data);
    
    }));
  }

  
  function GetByID(id){
    alert("getting for id: " + id);
    var FileStructByID = Datastruct.FileData.FileStructs;

    for (var i = 0; i < FileStructByID.length; i++) {
        if (FileStructByID[i].id == id) {
            struct = FileStructByID[i];
            return struct;
        }
    }
  }

  alert("test");
  ReadStructs();
  GetByID(7);
  alert("done");


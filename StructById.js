var id = 7;
var struct;
readStructs();

function readStructs(){
    fs = require('fs');
    struct = JSON.parse(fs.readFileSync('DataStruct.json', 'utf8', function (err,data) {
        if (err) {
            console.log(err);
            return;
        }

         var DataStruct = JSON.parse(data);
    
    }));
}

function getByID(id){
    var FileStructByID = struct.FileData.FileStructs;

    for (var i = 0; i < FileStructByID.length; i++) {
        if (FileStructByID[i].id == id) {
            struct = FileStructByID[i];
            return struct;
        }
    }
}
getByID(id);
console.log(struct);
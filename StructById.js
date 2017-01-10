var id = 0;
readStructs(id);

function readStructs(id){
    fs = require('fs');
    fs.readFile('DataStruct.json', 'utf8', function (err,data) {
        if (err) {
            console.log(err);
            return;
        }
        var DataStruct = JSON.parse(data);
        var FileStructByID = DataStruct.FileData.FileStructs;
        for (var i = 0; i < FileStructByID.length; i++) {
            if (FileStructByID[i].id == id) {
                returnStruct(FileStructByID[i]);
            }
        }
    });
};

function returnStruct(FileStructByID){
    console.log(FileStructByID);
    return FileStructByID;
}
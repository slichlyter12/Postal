'use strict';

var vis = require('vis');
var fs = require('fs');

//Globals
// create network arrays
var DFS = [];

function Init() {
    //alert("init");
    fs.readFile('./../../postal.json', 'utf8', function (err,data) {
        if (err) {
            //alert(err);
            console.log(err);
            return;
        }
        var DataStruct = JSON.parse(data);
        DFS = DataStruct.FileData.FileStructs;
        //alert("about to run main");
        Main();
    });
};




















//NEED TO GO ThROugH AN BUILD ALL LINKS FIRST

nodesArray = [];
edgesArray = [];
edgesIDArray = [];
errorsArray = [];
errorsSizeRefArray = [];
//globalJSON;

function PickColor(type){
switch (type){
    case "html":
    return('rgb(0,122,204)');
    break;
    case "php":
    return('rgb(86,156,214)');
    break;
    case "js":
    return('rgb(137, 209, 133)');
    break;
    case "png":
    return('rgb(255, 200, 150)');
    break;
    case "jpeg":
    return('rgb(255, 175, 150)');
    break;
    default:
    return('rgb(150, 150, 150)');
}
};

function GetEdgeID(to, from){
for(var i = 0; i < edgesIDArray.length; i++){
    if(edgesIDArray[i].to == to && edgesIDArray[i].from == from){
        return i;
    }
}
};

function GetStruct(id){
for(var i = 0; i < DFS.length; i++){
    if(DFS[i].id == id){
    var struct = DFS[i];
    return struct;
    }
}
}

function AddNode(id){
var struct = GetStruct(id);
var varColor = PickColor(struct.type);
var varSize = 12 + (6 * (struct.links.length));
nodesArray.push({id: struct.id, label: struct.name, size: varSize, font:{size: 10, color: ('rgb(232, 232, 232)')}, color: varColor, shape: 'dot'});
////alert("added node: " + nodesArray[(nodesArray.length-1)].id);
return;
};


function DrawError(id){

}

function IsNodeDrawn(id){
for(var i = 0; i < nodesArray.length; i++){
    if(nodesArray[i].id == id){
    return 1;
    }
}
return 0;
}




function Main(){
////alert("in main");
////alert("Structure length: " + DFS.length);

var edgeIDCounter = 0;
var lastZoomedNode = -1;
var edgeIterator = 0;

//create edge ID tacking array
for(var i = 0; i < DFS.length; i++){
    for(var j = 0; j < DFS[i].links.length; j++){
    edgesIDArray.push({id: edgeIDCounter, to: DFS[i].links[j], from: DFS[i].id});
    edgeIDCounter++;
    }
}

//create node arrays

for(var i = 0; i < DFS.length; i++){
    //alert(140);
    AddNode(DFS[i].id);
    
    if(DFS[i].errors.length != 0){
        
    errorsArray.push(DFS[i].id)
    errorsSizeRefArray.push((DFS[i].links.length * 6) + 12);
    }

    for(var j = 0; j < DFS[i].links.length; j++){
    edgeIterator = GetEdgeID(DFS[i].links[j], DFS[i].id);
    ////alert("creating edge id: " + edgeIterator + "\nto: " + DFS[i].links[j].FileStructid);
    var nodeColor = PickColor(DFS[i].type);
    edgesArray.push({id: edgeIterator, to: DFS[i].links[j], from: DFS[i].id, arrows:{to:{scaleFactor:0.3}}, color:{color: 'rgb(52, 52, 52)', highlight: nodeColor}});
    }
    
}
////alert("Creating Netork");
// create network
try{
    nodes = new vis.DataSet(nodesArray);
}
catch(err){
    ////alert("Error:"+ err);
}
////alert("created DataSet");
edges = new vis.DataSet(edgesArray);
var container = document.getElementById('mynetwork');
var data = {
    nodes: nodes,
    edges: edges
};
var options = {
    layout: {
    hierarchical: {
        direction: "UD",
        sortMethod: "directed"
    }
    },
    physics: {
    enabled: false
    },
};
network = new vis.Network(container, data, options);
////alert("Created Netork");

//Error bubbles
network.on("afterDrawing", function (ctx) {
    for(i = 0; i < errorsArray.length; i++){
    var nodeId = errorsArray[i];
    var nodePosition = network.getPositions([nodeId]);
    ctx.fillStyle = '#FF0000';
    ctx.strokeStyle = '#1e1e1e';
    ctx.lineWidth = 1 + (errorsSizeRefArray[i]/40);
    ctx.circle(nodePosition[nodeId].x + (errorsSizeRefArray[i] * 11 / 16), nodePosition[nodeId].y - (errorsSizeRefArray[i] * 11 / 16), 4 + (errorsSizeRefArray[i]/20));
    ctx.fill();
    ctx.stroke();
    }
});

var div = document.getElementById("")


}


Init();

/*network.on("doubleClick", function (params) {
    params.event = "[original event]";
    if(lastZoomedNode == -1){
        lastZoomedNode = params.nodes;
        var i;
        var tempIterator;
        for(i = 0; i < fs.length; i++){
        if(fs[i].id == params.nodes){
            tempIterator = i;
        }
        else if(fs[i].level == 0 && fs[i].id != params.nodes){
            try {
                nodes.update({
                    id: fs[i].id,
                    color: 'rgb(220,220,220)'
                });
            }
            catch (err) {
                ////alert(err);
            }
        }
        }
        
        i = tempIterator;
        
        for(var j = 0; j < fs[i].subFileStructs.length; j++){
        for(var k = 0; k < fs.length; k++){
            if(fs[k].id == fs[i].subFileStructs[j]){
            
            //add new node
            try {
                nodes.add({id: fs[k].id, label: fs[k].name, size: varSize, font:{size: 10}, color: '#FF0000', shape: 'dot'});
            }
            catch (err) {
                //////alert(err)
                continue;
            }

            //update edges
            for(var l = 0; l < fs[k].links.length; l++){
                for(var m = 0; m < edgesIDArray.length; m++){
                if(edgesIDArray[m].to == fs[k].links[l] && edgesIDArray[m].from == fs[k].id){
                    break;
                }
                }
                try {
                edges.add({
                    id: edgesIDArray[m].id,
                    from: fs[k].id,
                    to: fs[k].links[l],
                    arrows:{to:{scaleFactor:0.3}}, 
                    color: 'rgb(200, 200, 200)'
                });
                //edgesIDArray.push({id: edgeIDCounter, to: fs[k].links[l], from: fs[k].id});
                //edgeIDCounter++;
                }
                catch (err) {
                ////alert(err);
                }
                
                //remove edges from higher up level
                for(var m = 0; m < edgesIDArray.length; m++){
                if(edgesIDArray[m].to == fs[k].links[l] && edgesIDArray[m].from == fs[i].id){
                    break;
                }
                }
                try {
                edges.remove({
                    id: m
                });
                }
                catch (err) {
                ////alert(err);
                }
            }

            }
        }
        }
    }
    else{
        //zoom out
        ////alert("smoll");
        lastZoomedNode = -1;
        
        for(var i = 0; i < fs.length; i++){
        if(fs[i].level != 0){
            for(var j = 0; j < fs[i].links.length; j++){
                for(var k = 0; k < edgesIDArray.length; k++){
                if(edgesIDArray[k].to == fs[i].links[j] && edgesIDArray[k].from == fs[i].id){
                    try {
                    edges.remove({
                        id: edgesIDArray[k].id
                    });
                    }
                    catch (err) {
                    ////alert(err);
                    }
                    break;
                }
                }
                
            }
            
            try {
                nodes.remove({
                    id: fs[i].id
                });
            }
            catch (err) {
                ////alert(err);
            }

        }
        else{
            varColor = PickColor(fs[i].type)
            try {
                nodes.update({
                    id: fs[i].id,
                    color: varColor
                });
            }
            catch (err) {
                ////alert(err);
            }
        }
        }
    
    
    }

    
    
});*/
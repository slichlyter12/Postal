'use strict';

var electron = require('electron');
var vis = require('vis');
var fs = require('fs');
var LinkManager = require('./LinkManager.js');

//Globals
var isPhysics = false;
var structure = "hierarchy";

// create manager arrays
var DFS; // Data File Structure
var DLM; // Directory Link Manager
var SLM; // SubContainer Link Manager
var FLM; // File Link Manager

// create network arrays
var nodesArray = [];
var edgesArray = [];
var nodes;
var edges;
var data = {};



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
        Main();
    });
};

function Main() {
    // fill Directory Link Manager
    fillDLM();

    // fill File Link Manager
    fillFLM();

    // fill SubContainer Link Manager
    fillSLM();

    // append enabled (is node visible in UI) to Data File Structure
    appendEnabledToDFS();

    // add nodes
    fillInitialNodes();

    // fill edges
    fillInitialEdges();


    


    try{
        nodes = new vis.DataSet(nodesArray);
    } catch(err){
        alert("Error:"+ err);
    }
    //alert("created DataSet");
    edges = new vis.DataSet(edgesArray);
    var container = document.getElementById('mynetwork');
    data = {
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

    var network = new vis.Network(container, data, options);
    
    //cluster();

    // MARK: - Event Listeners
    //network.on("doubleClick", nodeDoubleClick);
    //network.on("selectNode", nodeSelect);
    //network.on("deselectNode", nodeDeselect);

    //Close Window Event Listener
    toolbarButtons();

    physicsButton(network, options);
    structureButton(network, options);
    
}


function fillDLM() {
    var links = [];
    for (var i = 0; i < DFS.length; i++) {
        if (DFS[i].type == "dir") {
            for (var j = 0; j < DFS[i].links.length; j++) {
                var link = DFS[i].links[j];
                link.from = DFS[i].id;
                link.isEnabled = true;
                links.push(link);
            }
        } else {
            break;
        }
    }

    DLM = new LinkManager(links);
}

function appendEnabledToDFS() {
    for (var i = 0; i < DFS.length; i++) {
        if (DFS[i].isSubContainer == true) {
            DFS[i].isEnabled = false;
        } else {
            DFS[i].isEnabled = true;
        }
    }
}

function fillFLM() {
    var links = [];
    var allLinks = [];
    for (var i = 0; i < DFS.length; i++) {
        if (DFS[i].type != "dir" && DFS[i].isSubContainer == false) {
            links = getAllLinksFromFileStructRecursive(DFS[i].id);
            for (var j = 0; j < links.length; j++) {
                links[j].isEnabled = false;
                links[j].from = DFS[i].id;

                allLinks.push(links[j]);
            }
        } else if (DFS[i].isSubContainer == true) {
            break;
        }
    }

    FLM = new LinkManager(allLinks);
}

// Recursive function to get all links from this and children
function getAllLinksFromFileStructRecursive(FileStructID) {
    var links = [];

    // check parent
    if (DFS[FileStructID].links.length > 0) {
        for (var i = 0; i < DFS[FileStructID].links.length; i++) {
            var link = DFS[FileStructID].links[i];
            links.push(link);
        }
    }

    // check children
    if (DFS[FileStructID].subContainers.length > 0) {
        var childLinks = [];
        for (var i = 0; i < DFS[FileStructID].subContainers.length; i++) {
            var childFileStructID = DFS[DFS[FileStructID].subContainers[i].toFileStructid].id;
            childLinks = getAllLinksFromFileStructRecursive(childFileStructID);

            // push what we found to parents link list
            for (var j = 0; j < childLinks.length; j++) {
                links.push(childLinks[j]);
            }

        }
    } 

    return links;
}

function closeAllSubcontainersRecursive(FileStructID) {

    if (DFS[FileStructID].subContainers.length > 0) {
        if (DFS[FileStructID].isEnabled == false) {
            return;
        }
        for (var i = 0; i < DFS[FileStructID].subContainers.length; i++) {
            var childNodeID = DFS[FileStructID].subContainers[i].toFileStructid;
            
            closeAllSubcontainersRecursive(childNodeID);

            // at a node that has active children
            // remove links between children and parent
            var subContainerLinkID = DFS[FileStructID].subContainers[i].id;
            try {
                edges.remove({
                    id: subContainerLinkID
                });
            } catch (err) {
                alert("closing subcontainers error: " + err);
                return;
            }
            SLM.setEnabledByID(subContainerLinkID, false);

            // update FLM 
            updateFromFileLinks(FileStructID);

            // remove children nodes
            //alert("about to remove: " + childNodeID);
            try {
                nodes.remove({
                    id: childNodeID
                });
            } catch (err) {
                alert("closing subcontainers error 2: " + err);
                return;
            }
            DFS[childNodeID].isEnabled = false;
        }
    } else {
        return;
    }
}

function fillSLM() {
    // loop backwards to avoid directories, will never have SubContainers
    var links = [];
    for (var i = DFS.length - 1; i >= 0; i--) {
        if (DFS[i].type != "dir") {
            for (var j = 0; j < DFS[i].subContainers.length; j++) {
                var subContainerLink = DFS[i].subContainers[j];
                subContainerLink.from = DFS[i].id;
                subContainerLink.isEnabled = false;
                links.push(subContainerLink);
            }
        } else {
            break;
        }
    }

    SLM = new LinkManager(links);
}

function fillInitialNodes() {
    for (var i = 0; i < DFS.length; i++) {
        //if (DFS[i].isSubContainer == false || DFS[i].type == "external") {
            var nodeID = DFS[i].id;
            addNodeToNodeArray(nodeID);
       //}
    }
}

function fillInitialEdges() {
    var condensedLinks = DLM.getCondensedLinks();
    for (var i = 0; i < condensedLinks.length; i++) {
        var link = condensedLinks[i];
        edgesArray.push({id: link.id, to: link.toFileStructid, from: link.from, arrows:{to:{scaleFactor:0.3}}, color:{color: 'rgb(52, 52, 52)'}});
    }
    condensedLinks = SLM.getCondensedLinks();
    for (var i = 0; i < condensedLinks.length; i++) {
        var link = condensedLinks[i];
        edgesArray.push({id: link.id, to: link.toFileStructid, from: link.from, arrows:{to:{scaleFactor:0.3}}, color:{color: 'rgb(52, 52, 52)'}});
    }
}

function cluster() {
    network.setData(data);
      var clusterOptionsByData = {
          joinCondition:function(childOptions) {
              return childOptions.cid == 1;
          },
          clusterNodeProperties: {id:'cidCluster', borderWidth:3, shape:'database'}
      };
      network.cluster(clusterOptionsByData);


}

// TODO: remove magic numbers 
// TODO: define colors
// TODO: determin size
function addNodeToNodeArray(id) {
    var struct = DFS[id];
    //alert("type: " + struct.type);
    var varColor = PickColor(struct.type);
    var varSize = 12 + (6 * (struct.links.length));
    nodesArray.push({id: struct.id, label: struct.name, size: varSize, font:{size: 10, color: ('rgb(232, 232, 232)')}, color: varColor, shape: 'dot'});
    return;
}

function turnOffAllFileLinks() {
    var fileLinks = FLM.getCondensedLinks();
    for (var i = 0; i < fileLinks.length; i++) {
        if (fileLinks[i].isEnabled == true) {
            try {
                edges.remove(fileLinks[i].id);
            } catch (err) {
                alert("turn off file link error: " + err);
                return;
            }

            FLM.setEnabledByID(fileLinks[i].id, false);
        }
    }
}

function updateFromFileLinks(newFromID) {
    var links = getAllLinksFromFileStructRecursive(newFromID);
    if (links.length > 0) {
        for (var i = 0; i < links.length; i++) {
            var linkID = links[i].id;
            FLM.setFromByID(linkID, newFromID);
        }
    }
}

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
        case "jpg":
        case "jpeg":
            return('rgb(255, 175, 150)');
            break;
        case "dir":
            return('rgb(223, 223, 223)');
            break;
        default:
            return('rgb(150, 150, 150)');
            break;
    }
}

// MARK: - Event Listeners
function nodeDoubleClick(params) {
    params.event = "[original event]";
    var clickedNodeID = params.nodes;

    if (DFS[clickedNodeID].subContainers.length > 0) {
        turnOffAllFileLinks();
        for (var i = 0; i < DFS[clickedNodeID].subContainers.length; i++) {
            var childNodeID = DFS[clickedNodeID].subContainers[i].toFileStructid;
            if (DFS[childNodeID].isEnabled == true) {
                // recursively close each child
                
                closeAllSubcontainersRecursive(clickedNodeID);
            } else {
                // expand child nodes underneath parent, render links
                
                // NODES
                try {
                    var varSize = 12 + (6 * (DFS[childNodeID].links.length));
                    nodes.update({
                        id: DFS[childNodeID].id,
                        color: PickColor(DFS[childNodeID].type),
                        label: DFS[childNodeID].name,
                        size: varSize,
                        font:{
                            size: 10, 
                            color: ('rgb(232, 232, 232)')
                        }, 
                        shape: 'dot'
                    });
                } catch (err) {
                    alert("child node update error: " + err);
                    return;
                }

                DFS[childNodeID].isEnabled = true;

                // LINKS
                updateFromFileLinks(childNodeID);
                
                var newSubContainerLink = SLM.getLinkByID(DFS[clickedNodeID].subContainers[i].id);
                try {
                    edges.add({
                        id: newSubContainerLink.id,
                        to: newSubContainerLink.toFileStructid,
                        from: newSubContainerLink.from,
                        arrows: {
                            to: { scaleFactor:0.3 }
                        }, 
                        color: { color: 'rgb(52, 52, 52)' }
                    });
                } catch (err) {
                    alert("update links error: " + err);
                    return;
                }             
            }
        }
    } else {
        return;
    }
}

function nodeSelect(params) {
    params.event = "[original event]";
    var clickedNodeID = params.nodes;
    //check to see if file links are first disabled
    turnOffAllFileLinks();
    //enable links for only this node
    for(var i = 0; i < DFS[clickedNodeID].links.length; i ++){
        var fileLink = FLM.getLinkByID(DFS[clickedNodeID].links[i].id);
        if(fileLink.isEnabled == false){
            try {
                edges.add({
                    id: fileLink.id,
                    to: fileLink.toFileStructid,
                    from: fileLink.from,
                    arrows: {
                        to: { scaleFactor:0.3 }
                    }, 
                    color: { color: 'rgb(225, 52, 52)' }
                });
            } catch (err) {
                alert("update links error: " + err);
                return;
            }
            FLM.setEnabledByID(fileLink.id, true);
        }
    }

}

function nodeDeselect(params) {
    params.event = "[original event]";
    var clickedNodeID = params.nodes;
    //Turn off ONLY the file links for the selected node
    for(var i = 0; i < DFS[clickedNodeID].links.length; i ++){
        var fileLink = FLM.getLinkByID(DFS[clickedNodeID].links[i].id);
        if(fileLink.isEnabled == true){
            try {
                edges.remove({
                    id: fileLink.id
                });
            } catch (err) {
                alert("update links error: " + err);
                return;
            }
            FLM.setEnabledByID(fileLink.id, false);
        }
    }
    

}



  function clusterByCid() {
      network.setData(data);
      var clusterOptionsByData = {
          joinCondition:function(childOptions) {
              return childOptions.cid == 1;
          },
          clusterNodeProperties: {id:'cidCluster', borderWidth:3, shape:'database'}
      };
      network.cluster(clusterOptionsByData);
  }




  function toolbarButtons(){
    document.getElementById("close-window").addEventListener("click", function (e) {
       var window = electron.remote.getCurrentWindow();
       window.close();
       
  }); 
  document.getElementById("min-window").addEventListener("click", function (e) {
       var window = electron.remote.getCurrentWindow();
       window.minimize();
       
  }); 
}

function physicsButton(network, options) {
    document.getElementById("physics-btn").addEventListener("click", function (e) {
       if(isPhysics){
           isPhysics = false;
           this.innerHTML = "Physics: Off";
           options.physics.enabled = false;
           //options.physics.stabalization.enabled = true;
           network.setOptions(options);
           network.redraw();
       }
       else {
           isPhysics = true;
           this.innerHTML = "Physics: On";
           options.physics.enabled = true;
           //options.physics.stabalization.enabled = true;
           network.setOptions(options);
           network.redraw();
       }
       
    }); 
}

function structureButton(network, options) {
    document.getElementById("structure-btn").addEventListener("click", function (e) {
       if(structure === "hierarchy"){
           structure = "web";
           this.innerHTML = "Structure: Web";
           options.layout.hierarchical.enabled = false;
           network.setOptions(options);
       }
       else if(structure == "web") {
           structure = "hierarchy";
           this.innerHTML = "Structure: Hierarchy";
           options.layout.hierarchical.enabled = true;
           options.layout.hierarchical.direction = "UD";
           options.layout.hierarchical.sortMethod = "directed";
            network.setOptions(options);
       }
       
    }); 
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
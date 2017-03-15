'use strict';

var electron = require('electron');
var vis = require('vis');
var fs = require('fs');
var LinkManager = require('./LinkManager.js');

//Globals
var isPhysics = false;
var structure = "hierarchy";
var iClusterCounter;

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
var network;



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

    network = new vis.Network(container, data, options);
    iClusterCounter = DFS.length;

    for(var i = 0; i < DFS.length; i++){
        if(DFS[i].type != "dir" && DFS[i].isSubContainer == false){
            buildClusters(i);
        }
    }


    
    // MARK: - Event Listeners
    network.on("doubleClick", nodeDoubleClick);
    //network.on("selectNode", nodeSelect);
    //network.on("deselectNode", nodeDeselect);
    
    //Error Info Scroll
    var nt = $('.newsticker').newsTicker({
        row_height: 22,
        max_rows: 4,
        speed: 400,
        direction: 'up',
        duration: 3000,
        autostart: 1,
        pauseOnHover: 1
    });
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
            var nodeID = DFS[i].id;
            addNodeToNodeArray(nodeID);
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
function buildClusters(nodeID){
    //If it doesn't have children, return
    if(DFS[nodeID].subContainers.length == null || DFS[nodeID].subContainers.length == 0){
        return;
    }
    else{
        for(var i = 0; i < DFS[nodeID].subContainers.length; i++){
            buildClusters(DFS[nodeID].subContainers[i].toFileStructid);
        }
        clusterNodes(nodeID);
    }
}


function clusterNodes(clusterHeadID) {
    var NodesForCluster = [];

    var struct = DFS[clusterHeadID];
    var varColor = PickColor(struct.type);
    var varSize = 12 + (6 * (struct.links.length));


    NodesForCluster.push(clusterHeadID);
    if(DFS[clusterHeadID].subContainers.length != null && DFS[clusterHeadID].subContainers.length > 0){
        for(var i = 0; i < DFS[clusterHeadID].subContainers.length; i++){
            NodesForCluster.push(DFS[clusterHeadID].subContainers[i].toFileStructid)
        }
    }
    var clusterOptionsByData = {
        joinCondition:function(childOptions) {
            for(var i = 0; i < NodesForCluster.length; i++){
                var ContainerID = network.findNode(NodesForCluster[i]);
                if(childOptions.id == ContainerID[0]){
                    return true;
                }
            }
            return false;
        },
        clusterNodeProperties: {id:iClusterCounter, label: struct.name, size: varSize, borderWidth:4, font:{size: 10, color: ('rgb(232, 232, 232)')}, color: varColor, shape: 'dot'}
        
    };
    network.cluster(clusterOptionsByData);
    iClusterCounter++;
}





function getNodeTreeRecursive(nodeID){
    var NodeIDs = [];
    NodeIDs.push(nodeID);
    if(DFS[nodeID].subContainers.length == null && DFS[nodeID].subContainers.length == 0){
        return NodeIDs;
    }
    else{
        for(var i = 0; i < DFS[nodeID].subContainers.length; i++){
            NodeIDs.push(getNodeTreeRecursive(DFS[nodeID].subContainers[i].toFileStructid));
        }
        return NodeIDs;
    }
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
    var focusID;
    var options = {
        // position: {x:positionx,y:positiony}, // this is not relevant when focusing on nodes
        scale: 1.0,
        animation: {
            duration: 1000,
            easingFunction: "easeInOutQuad"
        }
    };
    

     if (params.nodes.length == 1) {
       if (network.isCluster(params.nodes[0]) == true) {
           focusID = (network.getNodesInCluster(clickedNodeID)[0]);           
           network.openCluster(params.nodes[0]);
           network.focus(focusID, options);
           return;
        }
    }
    if (DFS[clickedNodeID].subContainers.length != null && DFS[clickedNodeID].subContainers.length > 0){
            buildClusters(clickedNodeID);
            focusID = (network.findNode(clickedNodeID)[0]);
            network.focus(focusID, options);
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
           network.redraw();
       }
       else if(structure == "web") {
           structure = "hierarchy";
           this.innerHTML = "Structure: Hierarchy";
           options.layout.hierarchical.enabled = true;
           options.layout.hierarchical.direction = "UD";
           options.layout.hierarchical.sortMethod = "directed";
           network.setOptions(options);
           network.redraw();
       }
       
    }); 
}


Init();
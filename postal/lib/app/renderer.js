'use strict';

var electron = require('electron');
var vis = require('vis');
var fs = require('fs');
var LinkManager = require('./LinkManager.js');
// Making a 'process bridge' 
var ipc = require('node-ipc');

ipc.config.id = 'hello';
ipc.config.retry = 1500;

//Globals
var isPhysics = false;
var isFileLinksVisible = false;
var structure = "hierarchy";
var iClusterCounter;
var arrowDir = "left";

// create manager arrays
var DFS; // Data File Structure
var DLM; // Directory Link Manager
var SLM; // SubContainer Link Manager
var FLM; // File Link Manager
var VLL = []; // Visible Link Lines
var NXC; //Node X coordinate
var NYC; //Node Y coordinate

// create network arrays
var nodesArray = [];
var edgesArray = [];
var nodes;
var edges;
var data = {};
var network;

function Init() {
    //alert("init");
    fs.readFile('./../../postal.json', 'utf8', function(err, data) {
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

    try {
        nodes = new vis.DataSet(nodesArray);
    } catch (err) {
        alert("Error:" + err);
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
                sortMethod: "directed",
                parentCentralization: true,
                edgeMinimization: false,
                blockShifting: true,
                levelSeparation: 200
            }
        },
        physics: {
            enabled: false
        },
        interaction: {
            navigationButtons: true
        }
    };

    network = new vis.Network(container, data, options);
    iClusterCounter = DFS.length;

    for (var i = 0; i < DFS.length; i++) {
        if (DFS[i].type != "dir" && DFS[i].isSubContainer == false) {
            buildClusters(i);
        }
    }

    var notificationsArray = buildNotificationsArray();

    network.on("afterDrawing", function(ctx) {
        for (i = 0; i < notificationsArray.length; i++) {
            var nodeid = notificationsArray[i].nodeid;
            var varSize = 12 + (6 * (DFS[nodeid].links.length));

            nodeid = network.clustering.findNode(nodeid)[0];
            var nodePosition = network.getPositions([nodeid]);


            ctx.fillStyle = '#FF0000';
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1 + (varSize / 40);
            ctx.circle(nodePosition[nodeid].x + (varSize * 11 / 16), nodePosition[nodeid].y - (varSize * 11 / 16), 4 + (varSize / 20));
            ctx.fill();
            ctx.stroke();
        }
    });

    // MARK: - Event Listeners
    //network.on("zoom", Zoom);
    network.on("oncontext", RightClick);
    network.on("click", Click);
    network.on("doubleClick", DoubleClick);

    document.getElementById("error-window-btn").addEventListener("click", function(e) {
        $('#slideout').toggleClass('on');
        $('#error-window-btn').toggleClass('on');

        if (arrowDir == "left") {
            arrowDir = "right"
            this.innerHTML = "&#10095;";
            var zoombtn = document.getElementsByClassName("vis-button vis-zoomExtends");
            zoombtn[0].style.setProperty("right", "33%", "important");
            zoombtn[0].style.setProperty("-webkit-transition-duration", "0.5s");
        } else if (arrowDir == "right") {
            arrowDir = "left";
            this.innerHTML = "&#10094;";
            var zoombtn = document.getElementsByClassName("vis-button vis-zoomExtends");
            zoombtn[0].style.setProperty("right", "5%", "important");
            zoombtn[0].style.setProperty("-webkit-transition-duration", "0.5s");
        }
    });
    document.getElementById("error-window-btn").addEventListener("mousemove", function(e) {
        document.getElementById("error-window-btn").title = "Show Error List";
    });
    //Notification Info Scroll
    var nt = $('.newsticker').newsTicker({
        row_height: 18,
        max_rows: 3,
        speed: 300,
        direction: 'down',
        duration: 3000,
        autostart: 0,

        prevButton: $('#next-error-btn'),
        nextButton: $('#prev-error-btn')
    });

    // population notifications list
    populateNotificationsList();

    //Close Window Event Listener
    toolbarButtons();

    physicsButton(network, options);
    structureButton(network, options);


    zoomFont(network, options);

    fileLinksButton(network, options);

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
        if (DFS[i].type != "dir") {
            links = DFS[i].links;
            //alert(links);
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
        edgesArray.push({ id: link.id, to: link.toFileStructid, from: link.from, arrows: { to: { scaleFactor: 0.3 } }, color: { color: 'rgb(52, 52, 52)' } });
    }
    condensedLinks = SLM.getCondensedLinks();
    for (var i = 0; i < condensedLinks.length; i++) {
        var link = condensedLinks[i];
        edgesArray.push({ id: link.id, to: link.toFileStructid, from: link.from, arrows: { to: { scaleFactor: 0.3 } }, color: { color: 'rgb(52, 52, 52)' } });
    }
    /*condensedLinks = FLM.getCondensedLinks();
    for (var i = 0; i < condensedLinks.length; i++) {
        var link = condensedLinks[i];
        edgesArray.push({ id: link.id, to: link.toFileStructid, from: link.from, arrows: { to: { scaleFactor: 0.3 } }, color: { color: 'rgb(255, 52, 52)' } });
    }*/
}

function buildClusters(nodeID) {
    //If it doesn't have children, return
    if (DFS[nodeID].subContainers.length == null || DFS[nodeID].subContainers.length == 0) {
        return;
    } else {
        for (var i = 0; i < DFS[nodeID].subContainers.length; i++) {
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
    if (DFS[clusterHeadID].subContainers.length != null && DFS[clusterHeadID].subContainers.length > 0) {
        for (var i = 0; i < DFS[clusterHeadID].subContainers.length; i++) {
            NodesForCluster.push(DFS[clusterHeadID].subContainers[i].toFileStructid)
        }
    }
    var clusterOptionsByData = {
        joinCondition: function(childOptions) {
            for (var i = 0; i < NodesForCluster.length; i++) {
                var ContainerID = network.findNode(NodesForCluster[i]);
                if (childOptions.id == ContainerID[0]) {
                    return true;
                }
            }
            return false;
        },
        clusterNodeProperties: { id: iClusterCounter, label: struct.name, size: varSize, borderWidth: 4, font: { size: 10, color: ('rgb(232, 232, 232)') }, color: varColor, shape: 'dot', level: struct.level }

    };
    network.cluster(clusterOptionsByData);
    iClusterCounter++;
}


function buildNotificationsArray() {
    var notificationsArray = [];
    for (var i = 0; i < DFS.length; i++) {
        if (DFS[i].notifications != undefined) {
            for (var j = 0; j < DFS[i].notifications.length; j++) {
                notificationsArray.push(DFS[i].notifications[j]);
                notificationsArray[notificationsArray.length - 1].nodeid = i;
            }
        }
    }
    return notificationsArray;
}

function getNodeTreeRecursive(nodeID) {
    var NodeIDs = [];
    NodeIDs.push(nodeID);
    if (DFS[nodeID].subContainers.length == null && DFS[nodeID].subContainers.length == 0) {
        return NodeIDs;
    } else {
        for (var i = 0; i < DFS[nodeID].subContainers.length; i++) {
            NodeIDs.push(getNodeTreeRecursive(DFS[nodeID].subContainers[i].toFileStructid));
        }
        return NodeIDs;
    }
}

// TODO: remove magic numbers 
// TODO: define colors
// TODO: determine size
function addNodeToNodeArray(id) {
    var struct = DFS[id];
    //alert("type: " + struct.type);
    var varColor = PickColor(struct.type);
    var varSize = 12 + (6 * (struct.links.length));
    var nodeLevel = struct.level
    nodesArray.push({ id: struct.id, label: struct.name, size: varSize, font: { size: 10, color: ('rgb(232, 232, 232)') }, color: varColor, shape: 'dot', level: nodeLevel });
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

function PickColor(type) {
    switch (type) {
        case "html":
            return ('rgb(0,122,204)');
            break;
        case "php":
            return ('rgb(86,156,214)');
            break;
        case "js":
            return ('rgb(137, 209, 133)');
            break;
        case "png":
            return ('rgb(255, 200, 150)');
            break;
        case "jpg":
        case "jpeg":
            return ('rgb(255, 175, 150)');
            break;
        case "dir":
            return ('rgb(223, 223, 223)');
            break;
        default:
            return ('rgb(150, 150, 150)');
            break;
    }
}

// MARK: - Event Listeners
function RightClick(params) {
    params.event = "[original event]";

    var clickedNodeID = network.getNodeAt(params.pointer.DOM);
    var focusID;
    var options = {
        // position: {x:positionx,y:positiony}, // this is not relevant when focusing on nodes
        scale: 1.0,
        animation: {
            duration: 1000,
            easingFunction: "easeInOutQuad"
        }
    };


    if (network.isCluster(clickedNodeID) == true) {
        focusID = (network.getNodesInCluster(clickedNodeID)[0]);
        network.openCluster(clickedNodeID);
        network.focus(focusID, options);
        return;
    } else if (DFS[clickedNodeID].subContainers.length != null && DFS[clickedNodeID].subContainers.length > 0) {
        buildClusters(clickedNodeID);
        focusID = (network.findNode(clickedNodeID)[0]);
        network.focus(focusID, options);

    }
}



// LEFT CLICK
function Click(params) {
    //Handle Edges
    if (params.edges.length > 0) {
        for (var i = 0; i < VLL.length; i++) {
            try {
                network.clustering.updateEdge(VLL[i], {
                    label: ""
                });
            } catch (err) {
                alert("Edge update error: " + err);
            }
        }
        VLL = [];
        for (var i = 0; i < params.edges.length; i++) {
            var clickedEdgeID = network.clustering.getBaseEdge(params.edges[i]);
            var link = SLM.getLinkByID(clickedEdgeID);
            var newLabel = '';
            if (link != null) {
                var newLabel = "Line Number: " + link.lineNumber;
            }
            try {
                network.clustering.updateEdge(clickedEdgeID, {
                    label: newLabel
                });
                VLL.push(clickedEdgeID);
            } catch (err) {
                alert("Edge update error: " + err);
            }
        }
    }
    if (params.nodes.length > 0) {

    }
}


function DoubleClick(params) {
    var ID;
    var lineNumber;
    console.log("doubleclick ");
    if (network.isCluster(params.nodes)) {
        var clusterNodes = network.getNodesInCluster(params.nodes);
        ID = clusterNodes[0];

        if (DFS[ID].isSubContainer != undefined && DFS[ID].isSubContainer == true) {
            var clickedEdgeID = network.clustering.getBaseEdge(params.edges[0]);
            var link = SLM.getLinkByID(clickedEdgeID);
            lineNumber = link.lineNumber;
        } else {
            lineNumber = 1;
        }

    } else {
        ID = params.nodes;
        console.log("Isn't in cluster" + ID);
        if (DFS[ID].isSubContainer != undefined && DFS[ID].isSubContainer == true) {
            var clickedEdgeID = network.clustering.getBaseEdge(params.edges[0]);
            var link = SLM.getLinkByID(clickedEdgeID);
            lineNumber = link.lineNumber;
        } else {
            lineNumber = 1;
        }

    }

    if (DFS[ID].type != "dir") {
        var window = electron.remote.getCurrentWindow();
        window.blur();
        var path = (DFS[ID].path);
        var lineNumberString = String(lineNumber);
        sendMessageToVSCode('double_click', { 'path': path, 'lineNumber': lineNumberString });
    } else {
        //do nothing if dir
    }
}

// MARK: END EVENT LISTENERS
function zoomFont(network, options){
    network.on("zoom", function (params){
        for(var i = 0; i < nodesArray.length; i++){
            if(DFS[i].links.length > 0 && DFS[i].level != 0){
                nodesArray[i].font.size = 10 * DFS[i].links.length * (1/params.scale);
            }
            else if(DFS[i].subContainers.length > 0){
                nodesArray[i].font.size = 10 * DFS[i].subContainers.length * (1/params.scale);
            }
        }

        //options.nodes = {nodesArray}
        network.setOptions(options);
        network.redraw();
        console.log(JSON.stringify(nodesArray));
        console.log(JSON.stringify(params.scale));
    });

}

function toolbarButtons() {
    document.getElementById("close-window").addEventListener("click", function(e) {
        var window = electron.remote.getCurrentWindow();
        window.close();

    });
    document.getElementById("min-window").addEventListener("click", function(e) {
        var window = electron.remote.getCurrentWindow();
        window.minimize();
    });
}

function physicsButton(network, options) {
    document.getElementById("physics-btn").addEventListener("click", function(e) {
        if (isPhysics) {
            isPhysics = false;
            this.innerHTML = "Physics: Off";
            options.physics.enabled = false;
            //options.physics.stabalization.enabled = true;
            network.setOptions(options);
            network.redraw();
        } else {
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
    document.getElementById("structure-btn").addEventListener("click", function(e) {
        if (structure === "hierarchy") {
            structure = "web";
            this.innerHTML = "Structure: Web";
            options.layout.hierarchical.enabled = false;
            network.setOptions(options);
            network.redraw();
        } else if (structure == "web") {
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

function fileLinksButton(network, options) {
    document.getElementById("fileLinks-btn").addEventListener("click", function(e) {
        if (isFileLinksVisible) {
            isFileLinksVisible = false;
            this.innerHTML = "File Links: Off";
            enableFileLinks(network);
        } else {
            isFileLinksVisible = true;
            this.innerHTML = "File Links: On";
        }

    });
}

function enableFileLinks(network) {

}


/*
    type: [double_click, kill_server]
    
*/
function sendMessageToVSCode(type, message) {
    ipc.connectTo(
        'world',
        function() {
            ipc.of.world.emit(
                type,
                message
            );
        }
    );
}


function populateNotificationsList() {
    for (var i = 0; i < DFS.length; i++) {
        if (DFS[i].notifications != undefined) {
            for (var j = 0; j < DFS[i].notifications.length; j++) {
                var message = DFS[i].notifications[j].message;
                var lineNumber = DFS[i].notifications[j].lineNumber;
                var filename = DFS[i].name;

                var htmlNode = document.createElement("LI");
                htmlNode.innerHTML = "<span class='filename'>" + filename + "</span><span class='lineNumber'>:" + lineNumber + "</span><span class='message'> " + message + "</span>";
                document.getElementById('newsTickerList').appendChild(htmlNode);
            }
        }
    }
}


Init();
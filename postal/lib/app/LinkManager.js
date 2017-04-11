'use strict';

module.exports = class LinkManager {
    

    constructor(links) {
        this.length = 0;
        this.randomAccessLinks = [];

        var length = 0;

        for (var i = 0; i < links.length; i++) {
            length++;
            this.randomAccessLinks[links[i].id] = links[i];
        }

        this.length = length;
    }
    
    getCondensedLinks() {
        var condensedLinks = [];
        for(var i = 0; i < this.randomAccessLinks.length; i++) {
            if (this.randomAccessLinks[i] != undefined) {
                condensedLinks.push(this.randomAccessLinks[i]);
            }
        }

        return condensedLinks;
    }

    getLinkByID(linkID) {
        if(linkID >= this.randomAccessLinks.length){
            return null;
        }
        return this.randomAccessLinks[linkID];
    }

    setClusterFromByID(linkID, newFrom) {
        this.randomAccessLinks[linkID].clusterFrom = newFrom;
    }
    setClusterToByID(linkID, newTo) {
        this.randomAccessLinks[linkID].clusterTo = newTo;
    }

    setEnabledByID(linkID, isEnabled) {
        this.randomAccessLinks[linkID].isEnabled = isEnabled;
    }

    getLength() {
        return this.length;
    }

}
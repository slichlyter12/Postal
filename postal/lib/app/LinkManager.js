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
        return this.randomAccessLinks[linkID];
    }

    setFromByID(linkID, newFrom) {
        this.randomAccessLinks[linkID].from = newFrom;
    }

    setEnabledByID(linkID, isEnabled) {
        this.randomAccessLinks[linkID].isEnabled = isEnabled;
    }

    getLength() {
        return this.length;
    }

}
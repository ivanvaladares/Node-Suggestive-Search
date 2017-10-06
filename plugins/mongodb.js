const mongo = require('mongodb').MongoClient;
const util = require("util");
const EventEmitter = require('events');

let DbDriver = class {
        
    constructor (options) {

        mongo.connect(options.mongoDatabase).then((database) => {            

            let itemsCollectionName = (options.itemsCollectionName !== undefined) ? options.itemsCollectionName : 'node-suggestive-search-items'; 
            let wordsCollectionName = (options.wordsCollectionName !== undefined) ? options.wordsCollectionName : 'node-suggestive-search-words';         

            this.dbItems = database.collection(itemsCollectionName);
            this.dbWords = database.collection(wordsCollectionName);
                        
            this.emit('initialized');

        });

        return this;
        
    }

    _insert (collection, entry) {
        return new Promise((resolve, reject) => {
            collection.insert(entry, { w: 0 }, (err, newDoc) => {
                if (err) { return reject(err); }
                resolve(newDoc.ops);
            });
        });
    }
    
    _find (collection, criteria) {
        return new Promise((resolve, reject) => {
            collection.find(criteria).toArray((err, items) => {
                if (err) { return reject(err); }
                
                resolve(items);
            });
        });    
    }
    
    _remove (collection, criteria1, criteria2) {
        return new Promise((resolve, reject) => {
            collection.remove(criteria1, criteria2, (err, numRemoved) => {
                if (err) { return reject(err); }
    
                resolve(numRemoved);
            });
        });    
    }
    
    _update (collection, criteria, data, multi) {
        return new Promise((resolve, reject) => {
            collection.update(criteria, data, multi, (err, numUpdated) => {
                if (err) { return reject(err); }
    
                resolve(numUpdated);
            });
        });    
    }

    createWordObject (word, cleanWord, soundexWord) {
        
        let objWord = { word, cleanWord, soundex: soundexWord, items: {} };
        
        for (let i = 2; i <= cleanWord.length && i <= 4; i++) {
            objWord[`p${i}i`] = cleanWord.substr(0, i).toLowerCase();
            objWord[`p${i}e`] = cleanWord.substr(cleanWord.length - i, cleanWord.length).toLowerCase();
        }
    
        return objWord;
    }
    
    createItemObject (itemId, itemName, keywords) {
    
        let objItem = { itemId, itemName };
    
        if (keywords !== undefined){
            objItem.keywords = keywords;
        }
    
        return objItem;
    }
        
    cleanDatabase () {
        return new Promise((resolve, reject) => {
            let p1 = this._remove(this.dbItems, {}, { multi: true });
            let p2 = this._remove(this.dbWords, {}, { multi: true });
    
            Promise.all([p1, p2]).then(() => {
                resolve();
            }).catch(err => {
                reject(err);
            });
        });
    }
    
    createIndexes () {   
        return new Promise((resolve) => {
    
            this.dbItems.createIndex({ 'itemId': 2 }, { unique: true });
            this.dbWords.createIndex({ 'word': 1 }, {  unique: true });
            this.dbWords.createIndex({ 'cleanWord': 2 }, { unique: false });
            this.dbWords.createIndex({ 'soundex': 1 }, { unique: false });
    
            for (let i = 2; i <= 4; i++) {
                let ixi = {};
                let ixe = {};
                ixi[`p${i}i`] = 1;
                ixe[`p${i}e`] = 1;
                this.dbWords.createIndex(ixi, { sparse: true });
                this.dbWords.createIndex(ixe, { sparse: true });
            }
    
            resolve();
        });
    }

    insertItem (entry) {
        return this._insert(this.dbItems, entry);
    }
    
    insertWord (entry) {
        return this._insert(this.dbWords, entry);
    }
    
    findItems (criteria) {
        return this._find(this.dbItems, criteria);
    }
    
    findWords (criteria) {
        return this._find(this.dbWords, criteria);
    }
    
    updateWord (criteria1, data, multi) {
        return this._update(this.dbWords, criteria1, data, multi);
    }
    
    removeItem (criteria1) {
        return this._remove(this.dbItems, criteria1, { multi: false });
    }
    
    removeWords (criteria1) {
        return this._remove(this.dbWords, criteria1, { multi: false });
    }

}

util.inherits(DbDriver, EventEmitter);

exports.init = (options) => {
    return new DbDriver(options);
}
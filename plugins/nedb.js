const Datastore = require('nedb');
const path = require('path');
const util = require("util");
const EventEmitter = require('events');

let DbDriver = class {
        
    constructor (options) {

        let itemsCollectionName = (options.itemsCollectionName !== undefined) ? options.itemsCollectionName : 'node-suggestive-search-items.db'; 
        let wordsCollectionName = (options.wordsCollectionName !== undefined) ? options.wordsCollectionName : 'node-suggestive-search-words.db';         

        this.dbItems = new Datastore({
            inMemoryOnly: options.neDbInMemoryOnly,
            filename: path.join(options.neDbDataPath, itemsCollectionName),
            autoload: true
        });

        this.dbWords = new Datastore({
            inMemoryOnly: options.neDbInMemoryOnly,
            filename: path.join(options.neDbDataPath, wordsCollectionName),
            autoload: true
        });

        this.dbWords.loadDatabase(err => {
            if (err) { throw err; }

            this.emit('initialized');
        });
        
        return this;
    };
    
    createWordObject (word, cleanWord, soundexWord) {
        
        let objWord = { word, cleanWord, soundex: soundexWord, items: {} };
        
        for (let i = 2; i <= cleanWord.length && i <= 4; i++) {
            objWord[`p${i}i`] = cleanWord.substr(0, i).toLowerCase();
            objWord[`p${i}e`] = cleanWord.substr(cleanWord.length - i, cleanWord.length).toLowerCase();
        }

        return objWord;
    };

    createItemObject (itemId, itemName, keywords) {

        let objItem = { itemId, itemName };

        if (keywords !== undefined){
            objItem.keywords = keywords;
        }

        return objItem;
    };

    insert (collection, entry) {
        return new Promise((resolve, reject) => {
            collection.insert(entry, (err, newDoc) => {
                if (err) { return reject(err); }

                resolve(newDoc);
            });
        });
    };

    find (collection, criteria) {
        return new Promise((resolve, reject) => {
            collection.find(criteria, (err, items) => {
                if (err) { return reject(err); }

                resolve(items);
            });
        });    
    };

    remove (collection, criteria1, criteria2) {
        return new Promise((resolve, reject) => {
            collection.remove(criteria1, criteria2, (err, numRemoved) => {
                if (err) { return reject(err); }

                resolve(numRemoved);
            });
        });    
    };

    update (collection, criteria, data, multi) {
        return new Promise((resolve, reject) => {
            collection.update(criteria, data, multi, (err, numUpdated) => {
                if (err) { return reject(err); }

                resolve(numUpdated);
            });
        });    
    };

    cleanDatabase () {                
        return new Promise((resolve, reject) => {
            let p1 = this.remove(this.dbItems, {}, { multi: true });
            let p2 = this.remove(this.dbWords, {}, { multi: true });

            Promise.all([p1, p2]).then(() => {
                resolve();
            }).catch(err => {
                reject(err);
            });
        });
    };

    createIndexes () {   
        return new Promise((resolve) => {

            this.dbItems.ensureIndex({ fieldName: 'itemId', unique: true });
            this.dbWords.ensureIndex({ fieldName: 'word', unique: true });
            this.dbWords.ensureIndex({ fieldName: 'cleanWord', unique: false });
            this.dbWords.ensureIndex({ fieldName: 'soundex', unique: false });

            for (let i = 2; i <= 4; i++) {
                this.dbWords.ensureIndex({ fieldName: (`p${i}i`), sparse: true });
                this.dbWords.ensureIndex({ fieldName: (`p${i}e`), sparse: true });
            }

            resolve();
        });
    };

    insertItem (entry) {
        return this.insert(this.dbItems, entry);
    };
    
    insertWord (entry) {
        return this.insert(this.dbWords, entry);
    };
    
    findItems (criteria) {
        return this.find(this.dbItems, criteria);
    };
    
    findWords (criteria) {
        return this.find(this.dbWords, criteria);
    };
    
    updateWord (criteria1, data, multi) {
        return this.update(this.dbWords, criteria1, data, multi);
    }
    
    removeItem (criteria1) {
        return this.remove(this.dbItems, criteria1, { multi: false });
    };
    
    removeWords (criteria1) {
        return this.remove(this.dbWords, criteria1, { multi: false });
    };

}

util.inherits(DbDriver, EventEmitter);

exports.init = (options) => {
    return new DbDriver(options);
};
const Datastore = require('nedb');
const path = require('path');
const util = require("util");
const EventEmitter = require('events');

let DbDriver = class {
        
    constructor (options) {
        this._cacheOn = false;
        this._cache = {};

        if (options.cache === true){
            this._cacheOn = true;
            this._cache = require('./memory.js').init();
        }

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

            //if is cached and the database is not empty, lets fill the cache
            if (this._cacheOn){

                let pCountItems = new Promise(resolve => { 
                    this.dbItems.count({}, (err, count) => {
                        resolve(count);
                    });
                });

                let pCountWords = new Promise(resolve => { 
                    this.dbWords.count({}, (err, count) => {
                        resolve(count);
                    });
                });

                Promise.all([pCountItems, pCountWords]).then(results => {
                    
                    if (results[0] > 0 || results[1] > 0) {

                        this.dbItems.find({}, (err, items) => {

                            this._cache.insertItem(items).then(() => {
                                
                                this.dbWords.find({}, (err, words) => {
        
                                    this._cache.insertWord(words).then(() => {

                                        this.emit('initialized');

                                    });
                                });
                            });
                        });
                        
                    }else{
                        this.emit('initialized');
                    }
                });

            }else{
                this.emit('initialized');
            }

        });
        
        return this;
    }
    
    _insert (collection, entry) {
        return new Promise((resolve, reject) => {
            collection.insert(entry, (err, newDoc) => {
                if (err) { return reject(err); }

                resolve(newDoc);
            });
        });
    }

    _find (collection, criteria) {
        return new Promise((resolve, reject) => {
            collection.find(criteria, (err, items) => {
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

    _updateWord (cleanWord, items, words) {
        return new Promise((resolve, reject) => {
            this.dbWords.update({cleanWord: cleanWord}, { $set: { "items": items, "words": words }}, { multi: true }, (err, numUpdated) => {
                if (err) { return reject(err); }
    
                resolve(numUpdated);
            });
        });    
    }

    cleanDatabase () {                
        return new Promise((resolve, reject) => {
            if (this._cacheOn){
                this._cache.cleanDatabase();
            }

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

            this.dbItems.ensureIndex({ fieldName: 'itemId', unique: true });
            this.dbWords.ensureIndex({ fieldName: 'cleanWord', unique: true });
            this.dbWords.ensureIndex({ fieldName: 'soundex', unique: false });

            for (let i = 2; i <= 4; i++) {
                this.dbWords.ensureIndex({ fieldName: (`p${i}i`), sparse: true });
                this.dbWords.ensureIndex({ fieldName: (`p${i}e`), sparse: true });
            }

            resolve();
        });
    }

    insertItem (entry) {
        if (this._cacheOn){
            return this._insert(this.dbItems, entry).then(() => {
                return this._cache.insertItem(entry);
            });
        }else{
            return this._insert(this.dbItems, entry);
        }
    }
    
    insertWord (entry) {
        if (this._cacheOn){
            return this._insert(this.dbWords, entry).then(() => {
                return this._cache.insertWord(entry);
            });
        }else{
            return this._insert(this.dbWords, entry);
        }
    }
    
    findItems (criteria) {
        if (this._cacheOn){
            return this._cache.findItems(criteria);
        }
        return this._find(this.dbItems, criteria);
    }
    
    findWords (criteria) {
        if (this._cacheOn){
            return this._cache.findWords(criteria);
        }
        return this._find(this.dbWords, criteria);
    }

    removeItem (criteria) {
        if (this._cacheOn){
            return this._remove(this.dbItems, criteria, { multi: false }).then(() => {
                return this._cache.removeItem(criteria);
            });
        }else{
            return this._remove(this.dbItems, criteria, { multi: false });
        }        
    }
    
    removeWord (criteria) {
        if (this._cacheOn){
            return this._remove(this.dbWords, criteria, { multi: false }).then(() => {
                return this._cache.removeWord(criteria);
            });
        }else{
            return this._remove(this.dbWords, criteria, { multi: false });
        }
    }

    updateWord (cleanWord, items, words) {
        if (this._cacheOn){
            return this._updateWord(cleanWord, items, words).then(() => {
                return this._cache.updateWord(cleanWord, items, words);
            });
        }else{
            return this._updateWord(cleanWord, items, words);
        }
    }

};

util.inherits(DbDriver, EventEmitter);

exports.init = (options) => {
    return new DbDriver(options);
};
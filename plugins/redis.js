const redis = require('redis');
const util = require("util");
const EventEmitter = require('events');
const _ = require('lodash');

let DbDriver = class {
        
    constructor (options) {

        this._cacheOn = false;
        this._cache = {};

        if (options.cache === true){
            this._cacheOn = true;
            this._cache = require('./memory.js').init();
        }

        this.keysPrefixName = (options.keysPrefixName !== undefined) ? options.keysPrefixName : 'node-suggestive-search-'; 

        this.client = redis.createClient(options.redisDatabase);
        
        this.client.on('connect', () => {

            //todo: read all items and words from redis and fill the cache

            this.emit('initialized');
        });

        return this;
    }

    
    _getWordsFromCleanWord (cleanWords){

        return new Promise((resolve, reject) => {
            let arr = [];

            this.client.get(`${this.keysPrefixName}cleanWord:${cleanWords}`, (err, found) => {
                if (err) {
                    return reject(err);
                }
                if (found !== null){
                    let wordObj = JSON.parse(found);
                    wordObj.words.map(word => {
                        if (word !== undefined){
                            arr.push({ word, cleanWord: wordObj.cleanWord, items: wordObj.items });
                        }
                    });       
                }
                
                resolve(arr);
            }); 

        }); 
    }

    _getWordsFromSoundexAndParts (parts, soundex){

        return new Promise((resolve, reject) => {
            let multi = [];
            let arr = [];
            
            soundex.map(sound => {
                multi.push(["smembers", `${this.keysPrefixName}soundex:${sound}`]);
            });

            parts.map(part => {
                multi.push(["smembers", `${this.keysPrefixName}parts:${part}`]);            
            });

            this.client.multi(multi).exec((err, replies) => {
                let arrMulti = [];
        
                _.uniq(_.flatten(replies)).map(cleanWord => {
                    arrMulti.push(['get', `nss-cleanWord:${cleanWord}`]);
                });
        
                this.client.multi(arrMulti).exec((err, replies) => {
                    if (err) {
                        return reject(err);
                    }
                    replies.map(item => {
                        if (item !== null){
                            let wordObj = JSON.parse(item);
                            wordObj.words.map(word => {
                                if (word !== undefined){
                                    arr.push({ word, cleanWord: wordObj.cleanWord, items: wordObj.items });
                                }
                            });
                        }
                    });

                    resolve(arr);
                });
            });

        });
    }    

    _insertItem (entry) {
        return new Promise((resolve, reject) => {
            let items = [];
            if (Array.isArray(entry)) {
                entry.map(e => {
                    items.push(['set', `${this.keysPrefixName}item:${e.itemId}`, JSON.stringify(e)]);
                });
            } else {
                items.push(['set', `${this.keysPrefixName}item:${entry.itemId}`, JSON.stringify(entry)]);
            }
            
            this.client.multi(items).exec(err => {
                if (err) {
                    return reject(err);
                }
                resolve(entry);
            }); 

        });
    }
    
    _insertWord (entry) {
        return new Promise((resolve, reject) => {
            let words = [];
            if (Array.isArray(entry)) {
                words = entry;
            } else {
                words = [entry];
            }

            let cleanWords = {};
            let soundex = {};
            let parts = {};

            words.map(word => {

                if (cleanWords[word.cleanWord] !== undefined){
                    cleanWords[word.cleanWord].words.push(word.word);
                }else{

                    //create the cleanWord key
                    cleanWords[word.cleanWord] = {cleanWord: word.cleanWord, soundex: word.soundex, words: [word.word], items: word.items, parts: []};
                
                    //create the soundex key
                    if (word.soundex != "0000"){
                        if (soundex[word.soundex] !== undefined){
                            soundex[word.soundex].push(word.cleanWord);
                        }else{
                            soundex[word.soundex] = [word.cleanWord];
                        }    
                    }

                    //create parts keys
                    for (let i = 2; i <= 4; i++) {
                        if (word[`p${i}i`] !== undefined) {
                            let pi = word[`p${i}i`];

                            if (parts[`p${i}i_${pi}`] !== undefined) {
                                parts[`p${i}i_${pi}`].push(word.cleanWord);
                            } else {
                                parts[`p${i}i_${pi}`] = [word.cleanWord];
                            }
                            
                            cleanWords[word.cleanWord].parts.push(`p${i}i_${pi}`);
                        }

                        if (word[`p${i}e`] !== undefined) {
                            let pe = word[`p${i}e`];

                            if (parts[`p${i}e_${pe}`] !== undefined) {
                                parts[`p${i}e_${pe}`].push(word.cleanWord);
                            } else {
                                parts[`p${i}e_${pe}`] = [word.cleanWord];
                            }

                            cleanWords[word.cleanWord].parts.push(`p${i}e_${pe}`);
                        }

                    }                    
                }
                
            });

            let arrMulti = [];

            let arrWords = Object.keys(cleanWords);
            arrWords.map(k => {
                let v = cleanWords[k];
                arrMulti.push(['set', `${this.keysPrefixName}cleanWord:${v.cleanWord}`, JSON.stringify(v)]);
            });

            let arrSoundex = Object.keys(soundex);
            arrSoundex.map(k => {
                arrMulti.push(['sadd', `${this.keysPrefixName}soundex:${k}`, soundex[k]]);
            });

            let arrParts = Object.keys(parts);
            arrParts.map(k => {
                arrMulti.push(['sadd', `${this.keysPrefixName}parts:${k}`, parts[k]]);
            });

            this.client.multi(arrMulti).exec(err => {
                if (err) {
                    return reject(err);
                }
                resolve(entry);
            });             

        });
    }    

    _findItems (criteria) {
        return new Promise((resolve, reject) => {

            let idsArray = [];

            if (criteria.itemId.$in && criteria.itemId.$in.length > 0){
                idsArray = criteria.itemId.$in;
            }else{
                idsArray = [criteria.itemId];
            }

            let arrMulti = [];
            idsArray.map(k => {
                arrMulti.push(['get', `${this.keysPrefixName}item:${k}`]);
            });

            this.client.multi(arrMulti).exec((err, replies) => {
                if (err) {
                    return reject(err);
                }
                resolve(_.flatten(replies).map(item => {
                    return JSON.parse(item);
                }));
            }); 
        });    
    }
    
    _findWords (criteria) {
        return new Promise((resolve, reject) => {

            if (criteria.cleanWord !== undefined){
                this._getWordsFromCleanWord([criteria.cleanWord]).then(words => {
                    resolve(words);
                }).catch(err => {
                    reject(err);
                });
            }else{
                let criterias = [];

                if (criteria.$or !== undefined){
                    criterias = criteria.$or;
                }else{
                    criterias = [criteria];
                }

                let parts = [];
                let soundex = [];

                criterias.map(criteria => {
                    for (let i = 2; i <= 4; i++) {
                        if (criteria[`p${i}i`] !== undefined) {
                            let pi = criteria[`p${i}i`];
                            parts.push(`p${i}i_${pi}`);
                        }
    
                        if (criteria[`p${i}e`] !== undefined) {
                            let pe = criteria[`p${i}e`];
                            parts.push(`p${i}e_${pe}`);
                        }
                    }
                    if (criteria["soundex"] !== undefined){
                        soundex.push(criteria["soundex"]);
                    }
                });

                this._getWordsFromSoundexAndParts(parts, soundex).then(words => {
                    resolve(words);
                }).catch(err => {
                    reject(err);
                });
            }
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
    
    _updateWordItems (cleanWord, items) {
        return new Promise((resolve, reject) => {
            this.dbWords.update({cleanWord: cleanWord}, { $set: { "items": items }}, { multi: true }, (err, numUpdated) => {
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

            this.client.keys((this.keysPrefixName + '*'), (err, keys) => {
                let arrDel = keys.map(k => {
                    return ["del", k];
                });
                this.client.multi(arrDel).exec(err => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            });            
        });
    }
    
    createIndexes () {   
        return new Promise((resolve) => {
            //nothing to do
            resolve();
        });
    }

    insertItem (entry) {
        if (this._cacheOn){
            return this._insertItem(entry).then(() => {
                return this._cache.insertItem(entry);
            });
        }else{
            return this._insertItem(entry);
        }
    }
    
    insertWord (entry) {
        if (this._cacheOn){
            return this._insertWord(entry).then(() => {
                return this._cache.insertWord(entry);
            });
        }else{
            return this._insertWord(entry);
        }
    }
    
    findItems (criteria) {
        if (this._cacheOn){
            return this._cache.findItems(criteria);
        }
        return this._findItems(criteria);
    }
    
    findWords (criteria) {
        if (this._cacheOn){
            return this._cache.findWords(criteria);
        }
        return this._findWords(criteria);
    }
    
    removeItem (criteria) {
        // if (this._cacheOn){
        //     return this._remove(this.dbItems, criteria, { multi: false }).then(() => {
        //         return this._cache.removeItem(criteria);
        //     });
        // }else{
        //     return this._remove(this.dbItems, criteria, { multi: false });
        // }
    }
    
    removeWord (criteria) {
        // if (this._cacheOn){
        //     return this._remove(this.dbWords, criteria, { multi: false }).then(() => {
        //         return this._cache.removeWord(criteria);
        //     });
        // }else{
        //     return this._remove(this.dbWords, criteria, { multi: false });
        // }
    }

    updateWordItems (cleanWord, items) {
        // if (this._cacheOn){
        //     return this._updateWordItems(cleanWord, items).then(() => {
        //         return this._cache.updateWordItems(cleanWord, items);
        //     });
        // }else{
        //     return this._updateWordItems(cleanWord, items);
        // }
    }
};

util.inherits(DbDriver, EventEmitter);

exports.init = (options) => {
    return new DbDriver(options);
};
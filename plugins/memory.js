const util = require("util");
const EventEmitter = require('events');
const _ = require('lodash');

let DbDriver = class {
        
    constructor () {

		this.items = {};
        this.words = {};
        this.soundex = {};
		this.cleanWords = {};
		this.parts = {};

        setTimeout(() => { 
            this.emit('initialized');
        }, 100);
        
        return this;
    }
    
    _getWordsFromCleanWords (cleanWords){
        let arr = [];

        cleanWords.map(cleanWord => {
            let found = this.cleanWords[cleanWord];
            
            if (found !== undefined){
                found.map(word => {
                    if (this.words[word] !== undefined) {
                        arr.push({ word, cleanWord, items: this.words[word] });
                    }
                });
            }
        });

        return arr;
    }

    _getCleanWordsFromSoundex (soundex){
        let objs = {};

        let found = this.soundex[soundex];
        
        if (found !== undefined){
            found.map(cleanWord => {
                objs[cleanWord] = cleanWord;
            });
        }

        //transform the key/value into an array
        let cleanWords = [];
        for (let cleanWord in objs) {
            cleanWords.push(cleanWord);
        }

        return cleanWords;
    } 

    _getCleanWordsFromParts (parts){
        let objs = {};

        parts.map(part => {
            let found = this.parts[part];
            
            if (found !== undefined){
                found.map(cleanWord => {
                    objs[cleanWord] = cleanWord;
                });
            }
        });

        //transform the key/value into an array
        let cleanWords = [];
        for (let cleanWord in objs) {
            cleanWords.push(cleanWord);
        }

        return cleanWords;
    }

    _insert (collection, entry) {

        return new Promise(resolve => {
            if (collection === "items"){
                if (Array.isArray(entry)){
                    entry.map(item => {
                        this.items[item.itemId] = item;
                    });
                }else{
                    this.items[entry.itemId] = entry;
                }
                resolve(entry);
            }else{
                let words = [];
                if (Array.isArray(entry)) {
                    words = entry;
                } else {
                    words = [entry];
                }

                words.map(word => {
                    this.words[word.word] = word.items;

                    if (this.cleanWords[word.cleanWord] !== undefined){
                        this.cleanWords[word.cleanWord].push(word.word);
                    }else{
                        this.cleanWords[word.cleanWord] = [word.word];
                    }

                    if (this.soundex[word.soundex] !== undefined){
                        this.soundex[word.soundex].push(word.cleanWord);
                    }else{
                        this.soundex[word.soundex] = [word.cleanWord];
                    }                    

                    for (let i = 2; i <= 4; i++) {
                        if (word[`p${i}i`] !== undefined) {
                            let pi = word[`p${i}i`];

                            if (this.parts[`p${i}i_${pi}`] !== undefined) {
                                this.parts[`p${i}i_${pi}`].push(word.cleanWord);
                            } else {
                                this.parts[`p${i}i_${pi}`] = [word.cleanWord];
                            }
                        }

                        if (word[`p${i}e`] !== undefined) {
                            let pe = word[`p${i}e`];

                            if (this.parts[`p${i}e_${pe}`] !== undefined) {
                                this.parts[`p${i}e_${pe}`].push(word.cleanWord);
                            } else {
                                this.parts[`p${i}e_${pe}`] = [word.cleanWord];
                            }
                        }

                    }
                });
                resolve(entry);
            }
        });
    }

    _find (collection, criteria) {
        return new Promise(resolve => {

            if (collection === "items"){

                let idsArray = []
                let arr = [];

                if (criteria.itemId.$in && criteria.itemId.$in.length > 0){
                    idsArray = criteria.itemId.$in;
                }else{
                    idsArray = [criteria.itemId];
                }

                idsArray.map(id => {
                    if (this.items[id] !== undefined) {
                        arr.push(this.items[id]);
                    }
                });

                resolve(arr);


            }else{

                if (criteria.cleanWord !== undefined){
                    resolve(this._getWordsFromCleanWords([criteria.cleanWord]));
                }else{
                    let criterias = [];

                    if (criteria.$or !== undefined){
                        criterias = criteria.$or;
                    }else{
                        criterias = [criteria];
                    }

                    let parts = [];
                    let cleanWords = [];

                    criterias.map(part => {
                        for (let i = 2; i <= 4; i++) {
                            if (part[`p${i}i`] !== undefined) {
                                let pi = part[`p${i}i`];
                                parts.push(`p${i}i_${pi}`);
                            }
        
                            if (part[`p${i}e`] !== undefined) {
                                let pe = part[`p${i}e`];
                                parts.push(`p${i}e_${pe}`);
                            }
                        }
                        if (part["soundex"] !== undefined){
                            cleanWords = this._getCleanWordsFromSoundex(part["soundex"]);
                        }
                    });

                    cleanWords = cleanWords.concat(this._getCleanWordsFromParts(parts));

                    resolve(this._getWordsFromCleanWords(cleanWords));
                }
            }
        });    
    }

    _remove (collection, criteria1) {
        return new Promise(resolve => {

            if (collection === "items"){
                delete this.items[criteria1.itemId];
            }else{
                delete this.words[criteria1.word];
            }

            //todo: cleanup orphans cleanwords and parts

            resolve(1);
        });    
    }

    _update (collection, criteria, data, multi) {
        return new Promise(resolve => {
            resolve(1);
        });    
    }

    cleanDatabase () {                
        return new Promise(resolve => {

            delete this.items;
            delete this.words;
            delete this.soundex;
            delete this.cleanWords;
            delete this.parts;               

            this.items = {};
            this.words = {};
            this.soundex = {};
            this.cleanWords = {};
            this.parts = {};
                
            resolve();
        });
    }

    createIndexes () {   
        return new Promise(resolve => {
            resolve();
        });
    }

    insertItem (entry) {
        return this._insert("items", entry);
    }
    
    insertWord (entry) {
        return this._insert("words", entry);
    }
    
    findItems (criteria) {
        return this._find("items", criteria);
    }
    
    findWords (criteria) {
        return this._find("words", criteria);
    }
    
    updateWord (criteria1, data, multi) {
        return this._update("words", criteria1, data, multi);
    }
    
    removeItem (criteria1) {
        return this._remove("items", criteria1);
    }
    
    removeWords (criteria1) {
        return this._remove(this.dbWords, criteria1);
    }

};

util.inherits(DbDriver, EventEmitter);

exports.init = (options) => {
    return new DbDriver(options);
};
const util = require("util");
const EventEmitter = require('events');
const _ = require('lodash');

let DbDriver = class {
        
    constructor () {

		this.items = {};
        this.soundex = {};
		this.cleanWords = {};
		this.parts = {};

        setTimeout(() => { 
            this.emit('initialized');
        }, 100);
        
        return this;
    }
    
    _getWordsFromCleanWord (cleanWords){
        let arr = [];

        cleanWords.map(cleanWord => {
            let found = this.cleanWords[cleanWord];
            
            if (found !== undefined){
                arr.push({ words: found.words, cleanWord, items: found.items });
            }
        });

        return arr;
    }

    _getWordsFromSoundexAndParts (parts, soundex){
        let objs = {};
        let arr = [];
        
        soundex.map(sound => {
            let found = this.soundex[sound];
            
            if (found !== undefined){
                found.map(strClean => {
                    let objClean = this.cleanWords[strClean];
                    if (objClean !== undefined){
                        objs[objClean.cleanWord] = objClean;
                    }
                });
            }    
        });

        parts.map(part => {
            let found = this.parts[part];
            
            if (found !== undefined){
                found.map(strClean => {
                    let objClean = this.cleanWords[strClean];
                    if (objClean !== undefined){
                        objs[objClean.cleanWord] = objClean;
                    }
                });
            }
        });

        for (let k in objs) {
            arr.push({ words: objs[k].words, cleanWord: k, items: objs[k].items });
        }

        return arr;
    }

    updateWord (cleanWord, items, words) {
        return new Promise(resolve => {

            let found = this.cleanWords[cleanWord];
            
            if (found !== undefined){
                found.items = items;
                found.words = words;
            }
            
            resolve(1);
        });    
    }

    cleanDatabase () {
        return new Promise(resolve => {

            delete this.items;
            delete this.soundex;
            delete this.cleanWords;
            delete this.parts;               

            this.items = {};
            this.soundex = {};
            this.cleanWords = {};
            this.parts = {};
                
            resolve();
        });
    }

    insertItem (entry) {
        return new Promise(resolve => {
            if (Array.isArray(entry)){
                entry.map(item => {
                    this.items[item.itemId] = item;
                });
            }else{
                this.items[entry.itemId] = entry;
            }
            resolve(entry);
        });
    }
    
    insertWord (entry) {
        return new Promise(resolve => {
            let words = [];
            if (Array.isArray(entry)) {
                words = entry;
            } else {
                words = [entry];
            }

            words.map(word => {

                //create the cleanWord key
                this.cleanWords[word.cleanWord] = {cleanWord: word.cleanWord, soundex: word.soundex, words: word.words, items: word.items, parts: []};
            
                //create the soundex key
                if (word.soundex != "0000"){
                    if (this.soundex[word.soundex] !== undefined){
                        this.soundex[word.soundex].push(word.cleanWord);
                    }else{
                        this.soundex[word.soundex] = [word.cleanWord];
                    }    
                }

                //create parts keys
                for (let i = 2; i <= 4; i++) {
                    if (word[`p${i}i`] !== undefined) {
                        let pi = word[`p${i}i`];

                        if (this.parts[`p${i}i_${pi}`] !== undefined) {
                            this.parts[`p${i}i_${pi}`].push(word.cleanWord);
                        } else {
                            this.parts[`p${i}i_${pi}`] = [word.cleanWord];
                        }
                        
                        this.cleanWords[word.cleanWord].parts.push(`p${i}i_${pi}`);
                    }

                    if (word[`p${i}e`] !== undefined) {
                        let pe = word[`p${i}e`];

                        if (this.parts[`p${i}e_${pe}`] !== undefined) {
                            this.parts[`p${i}e_${pe}`].push(word.cleanWord);
                        } else {
                            this.parts[`p${i}e_${pe}`] = [word.cleanWord];
                        }

                        this.cleanWords[word.cleanWord].parts.push(`p${i}e_${pe}`);
                    }

                }
                
            });

            resolve(entry);

        });
    }
    
    findItems (criteria) {
        return new Promise(resolve => {

            let idsArray = [];
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
        });    
    }
    
    findWords (criteria) {
        return new Promise(resolve => {

            if (criteria.cleanWord !== undefined){
                resolve(this._getWordsFromCleanWord([criteria.cleanWord]));
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

                resolve(this._getWordsFromSoundexAndParts(parts, soundex));
            }
        });    
    }

    removeItem (criteria) {
        return new Promise(resolve => {
            let item = this.items[criteria.itemId];
            
            if (item !== undefined){
                delete this.items[criteria.itemId];
                return resolve(1);
            }

            resolve(0);
        });   
    }
    
    removeWord (criteria) {
        return new Promise(resolve => {

            let cleanWord = this.cleanWords[criteria.cleanWord];

            if (cleanWord !== undefined){

                if (this.soundex[cleanWord.soundex] !== undefined){
                    if (this.soundex[cleanWord.soundex].length == 1){
                        delete this.soundex[cleanWord.soundex];
                    }else{
                        this.soundex[cleanWord.soundex] = _.without(this.soundex[cleanWord.soundex], cleanWord.cleanWord);  
                    }
                }

                if (cleanWord.parts !== undefined && cleanWord.parts.length > 0){
                    cleanWord.parts.map(part => {
                        if (this.parts[part] !== undefined){
                            if (this.parts[part].length > 1){
                                this.parts[part] = _.without(this.parts[part], cleanWord.cleanWord);  
                            }else{
                                delete this.parts[part];
                            }
                        }
                    });
                }
            
                delete this.cleanWords[cleanWord.cleanWord];

                resolve(1);

            }else{
                resolve(0);
            }
        });       
    }

    createIndexes () {   
        return new Promise(resolve => {
            //nothing to do here
            resolve();
        });
    }
};

util.inherits(DbDriver, EventEmitter);

exports.init = (options) => {
    return new DbDriver(options);
};
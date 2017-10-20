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
                found.words.map(word => {
                    if (word !== undefined){
                        arr.push({ word, cleanWord, items: found.items });
                    }
                });
            }
        });

        return arr;
    }

    _getWordsFromPartsAndSoundex (parts, soundex){
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

        for (let cleanWord in objs) {
            objs[cleanWord].words.map(word => {
                arr.push({ word, cleanWord, items: objs[cleanWord].items });
            });
        }

        return arr;
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

                    if (this.cleanWords[word.cleanWord] !== undefined){
                        this.cleanWords[word.cleanWord].words.push(word.word);
                    }else{

                        //create the cleanWord key
                        this.cleanWords[word.cleanWord] = {cleanWord: word.cleanWord, soundex: word.soundex, words: [word.word], items: word.items, parts: []};
                    
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
                                
                                //this.cleanWords[word.cleanWord].parts.push(`p${i}i_${pi}`);
                            }
    
                            if (word[`p${i}e`] !== undefined) {
                                let pe = word[`p${i}e`];
    
                                if (this.parts[`p${i}e_${pe}`] !== undefined) {
                                    this.parts[`p${i}e_${pe}`].push(word.cleanWord);
                                } else {
                                    this.parts[`p${i}e_${pe}`] = [word.cleanWord];
                                }
    
                                //this.cleanWords[word.cleanWord].parts.push(`p${i}e_${pe}`);
                            }
    
                        }                    
                    }

                    this.words[word.word] = this.cleanWords[word.cleanWord];
                   
                });
                resolve(entry);
            }
        });
    }

    _find (collection, criteria) {
        return new Promise(resolve => {

            if (collection === "items"){

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

                    resolve(this._getWordsFromPartsAndSoundex(parts, soundex));
                }
            }
        });    
    }

    _remove (collection, criteria) {
        return new Promise(resolve => {

            if (collection === "items"){
                delete this.items[criteria.itemId];
            }else{
                let word = this.words[criteria.word];

                if (word !== undefined){

                    if (this.soundex[word.soundex] !== undefined){
                        if (this.soundex[word.soundex].length == 1){
                            delete this.soundex[word.soundex];
                        }else{
                            this.soundex[word.soundex] = _.without(this.soundex[word.soundex], word.cleanWord);  
                        }
                    }

                    if (word.words.length == 1){
                        delete this.cleanWords[word.cleanWord];
                        delete this.words[word.words[0]];
                    }
                }
            }

            //todo: cleanup orphans parts

            resolve(1);
        });    
    }

    updateWordItems (cleanWord, items) {
        return new Promise(resolve => {

            let found = this.cleanWords[cleanWord];
            
            if (found !== undefined){
                found.items = items;
            }
            
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
            //nothing to do here
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

    removeItem (criteria) {
        return this._remove("items", criteria);
    }
    
    removeWords (criteria) {
        return this._remove("words", criteria);
    }

};

util.inherits(DbDriver, EventEmitter);

exports.init = (options) => {
    return new DbDriver(options);
};
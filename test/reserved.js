
const mocha = require('mocha');
const assert = require("assert");
const describe = mocha.describe;
const before = mocha.before;
const it = mocha.it;

let nss;

describe('Test reserved.json -', () => {

    before(done => {
            
        //tests using memory
        nss = require('../index.js').init();       
        
        //tests using redis
        // nss = require("../index.js").init(
        // {
        //     dataBase: "redis",  
        //     keysPrefixName: "nss-",
        //     redisDatabase: "redis://<user>:<password>@<domain>:<port>",
        //     cache: false
        // });        

        //tests using nedb
        // nss = require('../index.js').init(
        // {
        //     dataBase: "nedb",
        //     neDbDataPath: "",
        //     neDbInMemoryOnly: true,
        //     cache: false
        // });

        //tests using mongogdb
        // nss = require('../index.js').init(
        // {
        //     dataBase: "mongodb", 
        //     itemsCollectionName: "nss-test-items",
        //     wordsCollectionName: "nss-test-words",
        //     mongoDatabase: "mongodb://<user>:<password>@<domain>:<port>/<dbname>",
        //     cache: false
        // });

        //wait for the initialization process
        nss.on("initialized", () => {
            done();
        });
    });

    after(() => {
        nss.destroy();
    });

    it('load json file reserved.json with 233 items and 233 words', () => {
        return nss.loadJson("test/reserved.json")
            .then(data => {
                assert(
                    data != null &&
                    data.words == 233 &&
                    data.items == 233,
                    "Could not load json file."
                );
            });
    });


    it('query for: undefined', () => {
        return nss.query("undefined")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 1 &&
                    data.words[0] == "undefined" &&
                    data.itemsId.length == 1 &&
                    data.itemsId[0] == "223",
                    "Error on query for: undefined"
                );
            });
    }); 

    it('query for: undefined', () => {
        return nss.query("undefinned")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 1 &&
                    data.words[0] == "undefined" &&
                    data.itemsId.length == 1 &&
                    data.missingWords[0] == "undefinned" &&
                    data.itemsId[0] == "223",
                    "Error on query for: undefinned"
                );
            });
    }); 

    it('query for: toString()', () => {
        return nss.query("toString()")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 1 &&
                    data.words[0] == "toString" &&
                    data.itemsId.length == 1 &&
                    data.itemsId[0] == "213",
                    "Error on query for: toString()"
                );
            });
    });
    
    it('query for: valueOf', () => {
        return nss.query("valueOf")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 1 &&
                    data.words[0] == "valueOf" &&
                    data.itemsId.length == 1 &&
                    data.itemsId[0] == "227",
                    "Error on query for: valueOf"
                );
            });
    });
    
    it('query for: export', () => {
        return nss.query("export")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 1 &&
                    data.words[0] == "export" &&
                    data.itemsId.length == 1 &&
                    data.itemsId[0] == "50",
                    "Error on query for: export"
                );
            });
    });
    
    it('query for: length', () => {
        return nss.query("length")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 1 &&
                    data.words[0] == "length" &&
                    data.itemsId.length == 1 &&
                    data.itemsId[0] == "108",
                    "Error on query for: length"
                );
            });
    });   
    
    it('getSuggestedWords for: leng', () => {
        return nss.getSuggestedWords("leng")
            .then(data => {
                assert(
                    data != null &&
                    data.suggestions.length == 1 &&
                    data.suggestions[0] == "length",
                    "Error on getSuggestedWords for: leng"
                );
            });
    }); 
    
    it('getSuggestedItems for: length', () => {
        return nss.getSuggestedItems("length")
            .then(data => {
                assert(
                    data != null &&
                    data.items.length == 1 &&
                    data.items[0].itemName == "length",
                    "Error on getSuggestedItems for: length"
                );
            });
    });
    
});
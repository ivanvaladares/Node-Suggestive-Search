const mocha = require('mocha');
const assert = require("assert");
const describe = mocha.describe;
const before = mocha.before;
const it = mocha.it;

let nss;

describe('Test produtos.json -', () => {

    before(done => {

        //tests using nedb
        nss = require('../index.js').init(
            {
                dataBase: "nedb",
                neDbDataPath: "",
                neDbInMemoryOnly: true
            });

        //tests using mongogdb
        // let nss = require('../index.js').init(
        //         {
        //             dataBase: "mongodb", 
        //             mongoDatabase: "mongodb://localhost:27017/nodeSugestiveSearchTest"
        //         });

        //tests using ms-sql
        // nss = require('../index.js').init(
        //     {
        //         dataBase: "mssql",
        //         force: false,
        //         dbConnection: {
        //             host: '127.0.0.1',
        //             username: "sa",
        //             password: 'mssqlpass',
        //             database: "test",        
        //             dialect: 'mssql',     
        //             logging: false,       
        //             dialectOptions: {
        //                 requestTimeout: 60000,
        //                 encrypt: true // Use this if you're on Windows Azure                
        //             }
        //         }   
        //     });

        //wait for the initialization process
        nss.on("initialized", () => {
            done();
        });
    });

    it('load json file produtos.json with 6279 items and 4178 words', () => {
        return nss.loadJson("test/produtos.json")
            .then(data => {
                assert(
                    data != null &&
                    data.words == 4178 &&
                    data.items == 6279,
                    "Could not load json file."
                );
            });
    });

    it('query', () => {
        return nss.query("x-14")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 2 &&
                    data.itemsId.length == 5,
                    "Error"
                );
            });
    });

    it('query: REFRIGERANTE coca-cora \'EMBALAGEM COM 6 UNIDADES\'', () => {
        return nss.query("REFRIGERANTE coca-cora 'EMBALAGEM COM 6 UNIDADES'")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 7 &&
                    data.itemsId.length == 2 &&
                    ["25", "26"].indexOf(data.itemsId[0]) >= 0 &&
                    ["25", "26"].indexOf(data.itemsId[1]) >= 0,
                    "Error on: REFRIGERANTE coca-cora 'EMBALAGEM COM 6 UNIDADES'"
                );
            });
    });

    it('query: coca abjabajbajba', () => {
        return nss.query("coca abjabajbajba")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 2 &&
                    data.words[1] == null &&
                    data.itemsId.length == 27,
                    "Error on: coca abjabajbajba"
                );
            });
    });

    it('query: coca abjabajbajba cola', () => {
        return nss.query("coca abjabajbajba cola")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 3 &&
                    data.words[1] == null &&
                    data.itemsId.length == 27,
                    "Error on: coca abjabajbajba cola"
                );
            });
    });

    it('query: coca cola abjabajbajba', () => {
        return nss.query("coca cola abjabajbajba")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 3 &&
                    data.words[3] == null &&
                    data.itemsId.length == 27,
                    "Error on: coca cola abjabajbajba"
                );
            });
    });    

    it('query: coca cola abjabajbajba refri', () => {
        return nss.query("coca cola abjabajbajba refri")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 4 &&
                    data.words[2] == null &&
                    data.itemsId.length == 27,
                    "Error on: coca cola abjabajbajba refri"
                );
            });
    });      

    it('query for: coffee on nss', () => {
        return nss.query("coffee")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 1 &&
                    data.words[0] == "TOFFEE" &&
                    data.itemsId.length == 1 &&
                    data.itemsId[0] == "21360",
                    "Error on query for: coffee"
                );
            });
    });

    it('query for: whisky red label', () => {
        return nss.query("whisky red label")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 3 &&
                    data.words[0] == "WHISKY" &&
                    data.words[1] == "RED" &&
                    data.words[2] == "LABEL" &&
                    data.itemsId.length == 1 &&
                    data.itemsId[0] == "11896",
                    "Error on query for: whisky red label"
                );
            });
    });

    it('query for: "whisky label"', () => {
        return nss.query("\"whisky label\"")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 2 &&
                    data.itemsId.length == 0 &&
                    "Error on query for: \"whisky label\""
                );
            });
    });
    
    it('query for: "red label"', () => {
        return nss.query("\"red label\"")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 2 &&
                    data.words[0] == "RED" &&
                    data.words[1] == "LABEL" &&
                    data.itemsId.length == 1 &&
                    data.itemsId[0] == "11896",
                    "Error on query for: \"red label\""
                );
            });
    });

    it('query for: "label red"', () => {
        return nss.query("'label red'")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 2 &&
                    data.words[0] == "LABEL" &&
                    data.words[1] == "RED" &&
                    data.itemsId.length == 0,
                    "Error on query for: \"label red\""
                );
            });
    });    

    it('query for: DANIELS', () => {
        return nss.query("DANIELS")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 1 &&
                    data.words[0] == "DANIEL" &&
                    data.itemsId.length == 1 &&
                    data.itemsId[0] == "101740",
                    "Error on query for: DANIELS"
                );
            });
    });      
    
    it('query for: DANIEL`S', () => {
        return nss.query("DANIEL`S")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 2 &&
                    data.words[0] == "DANIEL" &&
                    data.words[1] == "S" &&
                    data.itemsId.length == 1 &&
                    data.itemsId[0] == "101740",
                    "Error on query for: DANIEL`S"
                );
            });
    });    

    it('query for: wisky read labl', () => {
        return nss.query("wisky read labl")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 3 &&
                    data.words[0] == "WHISKY" &&
                    data.words[1] == "RED" &&
                    data.words[2] == "LABEL" &&
                    data.itemsId.length == 1 &&
                    data.itemsId[0] == "11896",
                    "Error on query for: wisky read labl"
                );
            });
    });

    it('remove item 29852', () => {
        return nss.removeItem("29852")
            .then(data => {
                assert(
                    data != null &&
                    data.timeElapsed >= 0,
                    "Error on removing item 29852"
                );
            });
    });

    it('query for: absolut', () => {
        return nss.query("absolut")
            .then(data => { 
                assert(
                    data != null &&
                    data.words.length == 1 &&
                    data.words[0] == "ABSOLUTO" &&
                    data.itemsId.length == 2,
                    "Error on query for: absolut"
                );
            });
    });


    it('get words suggestions for: lab', () => {
        return nss.getSuggestedWords("lab")
            .then(data => {       
                assert(
                    data != null &&
                    data.suggestions.length == 1 &&
                    data.suggestions[0] == "LABEL",
                    "Error on get words suggestions for: lab"
                );
            });
    });

});
const mocha = require('mocha');
const assert = require("assert");
const describe = mocha.describe;
const before = mocha.before;
const it = mocha.it;

let nss;

describe('Test names.json -', () => {

    before(done => {

        //tests using nedb
        nss = require('../index.js').init(
            {
                dataBase: "nedb",
                neDbDataPath: "",
                neDbInMemoryOnly: true
            });

        //tests using mongogdb
        // nss = require('../index.js').init(
        // {
        //     dataBase: "mongodb", 
        //     mongoDatabase: "mongodb://localhost:27017/nodeSugestiveSearchTest"
        // });

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

    it('load json file names.json with 50003 items and 3452 words', () => {
        return nss.loadJson("test/names.json")
            .then(data => {
                assert(
                    data != null &&
                    data.words == 3452 &&
                    data.items == 50003,
                    "Could not load json file."
                );
            });
    });

    it('query for: ivan valadares', () => {
        return nss.query("ivan valadares")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 2 &&
                    data.words[0] == "Ivan" &&
                    data.words[1] == "Valadares" &&
                    data.itemsId.length == 1 &&
                    data.itemsId[0] == "49999" &&
                    data.expressions.length == 0 &&
                    data.missingExpressions.length == 0,
                    "Error on query for: ivan valadares"
                );
            });
    });

    it('query for: VICHI', () => {
        return nss.query("VICHI")
            .then(data => {
                assert(
                    data != null &&
                    data.words[0] == "Vickie" &&
                    data.words.length == 1 &&
                    data.itemsId.length == 20 &&
                    data.expressions.length == 0 &&
                    data.missingExpressions.length == 0,
                    "Error on query for: VICHI"
                );
            });
    });

    it('insert item: 50004 - EDUARDO VICHI', () => {
        return nss.insertItem({ "itemName": "EDUARDO VICHI", "itemId": "50004" })
            .then(data => {
                assert(
                    data != null &&
                    data.timeElapsed >= 0,
                    "Error on inserting item: 50004 - EDUARDO VICHI"
                );
            });
    });

    it('query for: VICHI', () => {
        return nss.query("VICHI")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 1 &&
                    data.itemsId.length == 1 &&
                    data.itemsId[0] == "50004" &&
                    data.expressions.length == 0 &&
                    data.missingExpressions.length == 0,
                    "Error on query for: VICHI"
                );
            });
    });

    it('query for: "EDUARDO VICHI"', () => {
        return nss.query("\"EDUARDO VICHI\"")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 2 &&
                    data.itemsId.length == 1 &&
                    data.itemsId[0] == "50004" &&
                    data.expressions.length == 1 &&
                    data.expressions[0] == "EDUARDO VICHI" &&
                    data.missingExpressions.length == 0,
                    "Error on query for: \"EDUARDO VICHI\""
                );
            });
    });    

    it('remove item 50004', () => {
        return nss.removeItem("50004")
            .then(data => {
                assert(
                    data != null &&
                    data.timeElapsed >= 0,
                    "Error on removing item 50004"
                );
            });
    });

    it('query for: VICHI', () => {
        return nss.query("VICHI")
            .then(data => {
                assert(
                    data != null &&
                    data.words[0] == "Vickie" &&
                    data.words.length == 1 &&
                    data.itemsId.length == 20 &&
                    data.missingWords.length == 0 &&
                    data.expressions.length == 0 &&
                    data.missingExpressions.length == 0,
                    "Error on query for: VICHI"
                );
            });
    });

    it('query for: absolut', () => {
        return nss.query("absolut")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 1 &&
                    data.words[0] == "Abbott" &&
                    data.missingWords.length == 0 &&
                    data.expressions.length == 0 &&
                    data.missingExpressions.length == 0,
                    "Error on query for: absolut"
                );
            });
    });

    it('query for: ivam vala', () => {
        return nss.query("ivam vala")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 2 &&
                    data.words[0] == "Ivan" &&
                    data.words[1] == "Valadares" &&
                    data.itemsId.length == 1 &&
                    data.itemsId[0] == "49999" &&
                    data.missingWords.length == 0 &&
                    data.expressions.length == 0 &&
                    data.missingExpressions.length == 0,
                    "Error on query for: ivam vala"
                );
            });
    });

    it('query for: ivan consentino valadares', () => {
        return nss.query("ivan consentino valadares")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 2 &&
                    data.words[0] == "Ivan" &&
                    data.words[1] == "Valadares" &&
                    data.itemsId.length == 1 &&
                    data.itemsId[0] == "49999" &&
                    data.missingWords.length == 1 &&
                    data.missingWords[0] == "consentino" &&
                    data.expressions.length == 0 &&
                    data.missingExpressions.length == 0,
                    "Error on query for: ivan consentino valadares"
                );
            });
    });

    it('get words suggestions for: ivan v', () => {
        return nss.getSuggestedWords("ivan v")
            .then(data => {
                assert(
                    data != null &&
                    data.suggestions.length == 2 &&
                    (
                        (data.suggestions[0] == "Ivan Valadares" &&
                        data.suggestions[1] == "Ivan Valentino") ||
                        (data.suggestions[1] == "Ivan Valadares" &&
                        data.suggestions[0] == "Ivan Valentino")
                    ),
                    "Error on get words suggestions for: ivan v"
                );
            });
    });

    it('get items suggestions for: ivan v', () => {
        return nss.getSuggestedItems("ivan v")
            .then(data => {                
                assert(
                    data != null &&
                    data.items.length == 3 &&
                    data.items[0].itemName == "Ivan Valadares" &&
                    data.items[1].itemName == "Ivan Campos" &&
                    data.items[2].itemName == "Ivan Valentino",
                    "Error on get items suggestions for: ivan v"
                );
            });
    });

});
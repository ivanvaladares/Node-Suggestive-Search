const mocha = require('mocha')
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
        // let nss = require('../index.js').init(
        //     {
        //         dataBase: "mssql",
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

    it('load json file names.json', () => {
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
                    data.itemsId[0] == "49999",
                    "Error on query for: ivan valadares"
                );
            });
    });

    it('insert item: 13 - VODKA ABSOLUTE', () => {
        return nss.insertItem({ "itemName": "VODKA ABSOLUTE", "itemId": "13" })
            .then(data => {              
                assert(
                    data != null &&
                    data.timeElapsed >= 0,
                    "Error on inserting item: 13 - VODKA ABSOLUTE"
                );
            });
    });

    it('query for: absolut', () => {
        return nss.query("absolut")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 1 &&
                    data.itemsId.length == 1 &&
                    data.itemsId[0] == "13",
                    "Error on query for: absolut"
                );
            });
    });

    it('query for: "VODKA ABSOLUTE"', () => {
        return nss.query("\"VODKA ABSOLUTE\"")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 2 &&
                    data.words[0] == "VODKA" &&
                    data.words[1] == "ABSOLUTE" &&
                    data.itemsId.length == 1 &&
                    data.itemsId[0] == "13",
                    "Error on query for: \"VODKA ABSOLUTE\""
                );
            });
    });    

    it('remove item 13', () => {
        return nss.removeItem("13")
            .then(data => {
                assert(
                    data != null &&
                    data.timeElapsed >= 0,
                    "Error on removing item 13"
                );
            });
    });

    it('query for: "VODKA ABSOLUTE"', () => {
        return nss.query("\"VODKA ABSOLUTE\"")
            .then(data => {               
                assert(
                    data != null &&
                    data.words.length == 2 &&
                    data.words[0] == null &&
                    data.words[1] == null &&
                    data.itemsId.length == 0,
                    "Error on query for: \"VODKA ABSOLUTE\""
                );
            });
    });

    it('query for: absolut', () => {
        return nss.query("absolut")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 1 &&
                    data.words[0] == "Abshire" &&
                    data.itemsId[0] == "611",
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
                    data.itemsId[0] == "49999",
                    "Error on query for: ivam vala"
                );
            });
    });

    it('get words suggestions for: ivan v', () => {
        return nss.getSuggestedWords("ivan v")
            .then(data => {
                assert(
                    data != null &&
                    data.suggestions.length == 2 &&
                    data.suggestions[0] == "Ivan Valadares" &&
                    data.suggestions[1] == "Ivan Valentino",
                    "Error on get words suggestions for: ivan v"
                );
            });
    });

    it('get items suggestions for: ivan v', () => {
        return nss.getSuggestedItems("ivan v")
            .then(data => {
                assert(
                    data != null &&
                    data.items.length == 4 &&
                    data.items[0].itemName == "Ivan Valadares" &&
                    data.items[1].itemName == "Ivan SandoVal" &&
                    data.items[2].itemName == "Ivan Campos" &&
                    data.items[3].itemName == "Ivan Valentino",
                    "Error on get items suggestions for: ivan v"
                );
            });
    });

});
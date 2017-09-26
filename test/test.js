var mocha = require('mocha')
var describe = mocha.describe;
var it = mocha.it;
var assert = require("assert");

var nss = require('../index.js').init(
        {
            dataBase: "nedb",
            neDbDataPath: "",
            neDbInMemoryOnly: true
        });

// var nss = require('../index.js').init(
//         {
//             dataBase: "mongodb", 
//             mongoDatabase: "mongodb://127.0.0.1:27017/nodeSugestiveSearchTest"
//         });

describe('Test -', () => {
    it('load json file test.json', () => {
        return nss.loadJson("test/test.json")
            .then(data => {
                assert(
                    data != null &&
                    data.words == 16 &&
                    data.items == 6,
                    "Could not load json file."
                );
            });
    });

    it('load json string', () => {
        return nss.loadJsonString(`[{"nm":"WHISKY RED LABEL","id":"1","kw": "fancy"},
                                    {"nm":"WHISKY BLACK LABEL","id":"2"},
                                    {"nm":"BLACK FOREST BEECHWOOD HAM L/S","id":"3"},
                                    {"nm":"PESTO PARMESAN HAM","id":"4"},
                                    {"nm":"DELI SWEET SLICE SMOKED HAM","id":"5"},
                                    {"nm":"LABELY BUTTER","id":"7"},
                                    {"nm":"WINE D'VINE","id":"8"},
                                    {"nm":"WINE RED OLD LABEL","id":"9"},
                                    {"nm":"BLOOD-RED WINE","id":"10"}]`, 
                                    "id", "nm", "kw")
            .then(data => {
                assert(
                    data != null &&
                    data.words == 20 &&
                    data.items == 9,
                    "Could not load json string."
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
                    data.itemsId[0] == "1",
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
                    data.itemsId[0] == "1",
                    "Error on query for: \"red label\""
                );
            });
    });

    it('query for: "label red"', () => {
        return nss.query("\"label red\"")
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

    it('query for: D\'VINE', () => {
        return nss.query("D'VINE")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 1 &&
                    data.words[0] == "D'VINE" &&
                    data.itemsId.length == 1 &&
                    data.itemsId[0] == "8",
                    "Error on query for: D'VINE"
                );
            });
    });        

    it('query for: RED-BLOOD', () => {
        return nss.query("RED-BLOOD")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 2 &&
                    data.words[0] == "RED" &&
                    data.words[1] == "BLOOD" &&
                    data.itemsId.length == 0,
                    "Error on query for: RED-BLOOD"
                );
            });
    });         

    it('query for: BLOOD-RED', () => {
        return nss.query("BLOOD-RED")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 2 &&
                    data.words[0] == "BLOOD" &&
                    data.words[1] == "RED" &&
                    data.itemsId.length == 1 &&
                    data.itemsId[0] == "10",
                    "Error on query for: BLOOD RED"
                );
            });
    });   


    it('query for: wisk read labl', () => {
        return nss.query("wisk read labl")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 3 &&
                    data.words[0] == "WHISKY" &&
                    data.words[1] == "RED" &&
                    data.words[2] == "LABEL" &&
                    data.itemsId.length == 1 &&
                    data.itemsId[0] == "1",
                    "Error on query for: wisk read labl"
                );
            });
    });

    it('insert item: 9 - VODKA ABSOLUTE', () => {
        return nss.insertItem({ "itemName": "VODKA ABSOLUTE", "itemId": "9" })
            .then(data => {
                assert(
                    data != null &&
                    data.timeElapsed >= 0,
                    "Error on inserting item: 9 - VODKA ABSOLUTE"
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
                    data.itemsId[0] == "9",
                    "Error on query for: absolut"
                );
            });
    });

    it('get suggestions for: lab', () => {
        return nss.getSuggestedWords("lab")
            .then(data => {
                assert(
                    data != null &&
                    data.suggestions.length == 2 &&
                    data.suggestions[0] == "LABEL" &&
                    data.suggestions[1] == "LABELY",
                    "Error on get suggestions for: lab"
                );
            });
    });

    it('get items suggestions for: whisky', () => {
        return nss.getSuggestedItems("whisky")
            .then(data => {
                assert(
                    data != null &&
                    data.items.length == 2 &&
                    data.items[0].itemName == "WHISKY RED LABEL" &&
                    data.items[1].itemName == "WHISKY BLACK LABEL",
                    "Error on get items suggestions for: whisky"
                );
            });
    });

    it('remove item 9', () => {
        return nss.removeItem("9")
            .then(data => {
                assert(
                    data != null &&
                    data.timeElapsed >= 0,
                    "Error on removing item 9"
                );
            });
    });

    it('query for: absolut', () => {
        return nss.query("absolut")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 1 &&
                    data.words[0] == null &&
                    data.itemsId.length == 0,
                    "Error on query for: absolut"
                );
            });
    });
});
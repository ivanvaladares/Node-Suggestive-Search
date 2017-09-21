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
//             mongoDatabase: "mongodb://127.0.0.1:27017/nodeSugestiveSearchTST"
//         });

describe('Test -', () => {
    it('load json string', () => {
        return nss.loadJsonString(`[{"itemName":"WHISKY RED LABEL","itemId":"1","keywords": "fancy"},{  
                                    "itemName":"WHISKY BLACK LABEL","itemId":"2"},{  
                                    "itemName":"BLACK FOREST BEECHWOOD HAM L/S","itemId":"3"},{  
                                    "itemName":"PESTO PARMESAN HAM","itemId":"4"},{  
                                    "itemName":"DELI SWEET SLICE SMOKED HAM","itemId":"5"},{  
                                    "itemName":"LABELY BUTTER","itemId":"7"}]`)
            .then(data => {
                assert(
                    data != null &&
                    data.words == 16 &&
                    data.items == 6,
                    "Could not load json string."
                );
            });
    });

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
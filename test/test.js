
const mocha = require('mocha');
const assert = require("assert");
const describe = mocha.describe;
const before = mocha.before;
const it = mocha.it;

let nss;

describe('Test test.json -', () => {

    before(done => {
            
        //tests using memory
        nss = require('../index.js').init();       
        
        //tests using redis
        // nss = require("../index.js").init(
        // {
        //     dataBase: "redis",  
        //     keysPrefixName: "nss-",
        //     redisDatabase: "redis://localhost:6379",
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
        //     mongoDatabase: "mongodb://localhost:27017/nodeSugestiveSearchTest",
        //     cache: false
        // });

        //wait for the initialization process
        nss.on("initialized", () => {
            done();
        });
    });

    it('load json file test.json with 6 items and 18 words', () => {
        return nss.loadJson("test/test.json")
            .then(data => {
                assert(
                    data != null &&
                    data.words == 18 &&
                    data.items == 6,
                    "Could not load json file."
                );
            });
    });

    it('load json string with 11 items and 30 words and personalized fields (price, popularity and thumbImg)', () => {
        return nss.loadJsonString(`[{"nm":"WHISKY RED LABEL","id":"1","kw": "fancy", "price": 25.57, "popularity": 1, "thumbImg": "whisky-red-label.png"},
                                    {"nm":"WHISKY BLACK LABEL","id":"2", "price": 19.99, "popularity": 0.9, "thumbImg": "whisky-black-label.png"},
                                    {"nm":"BLACK FOREST BEECHWOOD HAM L/S","id":"3", "price": 19.99, "popularity": 1, "thumbImg": "black-forest-beechwood-ham-l-s.png"},
                                    {"nm":"PESTO PARMESAN HAM","id":"4", "price": 19.99, "popularity": 1, "thumbImg": "pesto-parmesan-ham.png"},
                                    {"nm":"DELI SWEET SLICE SMOKED HAM","id":"5", "price": 19.99, "popularity": 1, "thumbImg": "deli-sweet-slice-smoked-ham.png"},
                                    {"nm":"LABELY BUTTER","id":"7", "price": 19.99, "popularity": 1, "thumbImg": "labely-butter.png"},
                                    {"nm":"WINE D'VINE","id":"8", "price": 19.99, "popularity": 1, "thumbImg": "wine-dvine.png"},
                                    {"nm":"WINE RÉD OLD LABEL","id":"9", "price": 19.99, "popularity": 1, "thumbImg": "wine-red-old-label.png"},
                                    {"nm":"BLOOD-RED WINE","id":"10", "price": 19.99, "popularity": 1, "thumbImg": "blood-red-wine.png"},
                                    {"nm":"COFFE MEU CAFÉ BRASILEIRO","id":"11", "price": 19.99, "popularity": 1, "thumbImg": "coffe-meu-cafe-brasileiro.png"},
                                    {"nm":"X-14 ULTRA CLEANER","id":"12", "price": 19.99, "popularity": 1, "thumbImg": "x-14-ultra-cleaner.png"}]`, 
                                    "id", "nm", "kw")
            .then(data => {
                assert(
                    data != null &&
                    data.words == 30 &&
                    data.items == 11,
                    "Could not load json string."
                );
            });
    });

    it('query for: whisky red label', () => {
        return nss.query("whisky red label", null, true)
            .then(data => { 
                assert(
                    data != null &&
                    data.words.length == 3 &&
                    data.words[0] == "whisky" &&
                    data.words[1] == "red" &&
                    data.words[2] == "label" &&
                    data.itemsId.length == 1 &&
                    data.itemsId[0] == "1" &&
                    data.expressions.length == 0 &&
                    data.missingExpressions.length == 0,
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
                    data.missingWords.length == 3 &&
                    data.missingWords[0] == "wisk" && 
                    data.missingWords[1] == "read" && 
                    data.missingWords[2] == "labl" && 
                    data.itemsId.length == 1,
                    "Error on query for: wisk read labl"
                );
            });
    });

    it('query for: whisky ordering by popularity (desc) using a function and getting item\'s json', () => {

        let orderFunc = ((x, y) => { return x.popularity < y.popularity; });

        return nss.query("whisky", true, orderFunc)
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 1 &&
                    data.words[0] == "whisky" &&
                    data.items.length == 2 &&
                    data.items[0].itemId == "1" &&
                    data.items[1].itemId == "2" &&
                    data.expressions.length == 0 &&
                    data.missingExpressions.length == 0,
                    "Error on query for: whisky"
                );
            });
    });    

    it('query for: whisky ordering by price (asc) using an object and getting item\'s json', () => {
        
        let orderObject = {field: "price", direction: "asc"};

        return nss.query("whisky", true, orderObject)
            .then(data => { 
                assert(
                    data != null &&
                    data.words.length == 1 &&
                    data.words[0] == "whisky" &&
                    data.items.length == 2 &&
                    data.items[0].itemId == "2" &&
                    data.items[1].itemId == "1" &&
                    data.expressions.length == 0 &&
                    data.missingExpressions.length == 0,
                    "Error on query for: whisky"
                );
            });
    });   

    it('query for: whisky ordering by price (asc) using a function and getting item\'s json', () => {

        let orderFunc = ((x, y) => { return x.price > y.price; });

        return nss.query("whisky", true, orderFunc)
            .then(data => { 
                assert(
                    data != null &&
                    data.words.length == 1 &&
                    data.words[0] == "whisky" &&
                    data.items.length == 2 &&
                    data.items[0].itemId == "2" &&
                    data.items[1].itemId == "1" &&
                    data.expressions.length == 0 &&
                    data.missingExpressions.length == 0,
                    "Error on query for: whisky"
                );
            });
    });        

    it('query for: \'whisky red label\'', () => {
        return nss.query("'whisky red label'")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 3 &&
                    data.words[0] == "whisky" &&
                    data.words[1] == "red" &&
                    data.words[2] == "label" &&
                    data.itemsId.length == 1 &&
                    data.itemsId[0] == "1" &&
                    data.expressions.length == 1 &&
                    data.expressions[0] == "whisky red label",
                    "Error on query for: 'whisky red label'"
                );
            });
    });

    it('query for: "whisky label"', () => {
        return nss.query("\"whisky label\"")
            .then(data => { 
                assert(
                    data != null &&
                    data.words.length == 2 &&
                    data.itemsId.length == 2 &&
                    data.expressions.length == 0 &&
                    data.missingExpressions.length == 1 &&
                    data.missingExpressions[0] == "whisky label",
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
                    data.words[0] == "red" &&
                    data.words[1] == "label" &&
                    data.itemsId.length == 1 &&
                    data.itemsId[0] == "1" &&
                    data.expressions.length == 1  &&
                    data.expressions[0] == "red label" &&
                    data.missingExpressions.length == 0,
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
                    data.words[0] == "label" &&
                    data.words[1] == "red" &&
                    data.itemsId.length == 2  &&
                    data.expressions.length == 0 &&
                    data.missingExpressions.length == 1 &&
                    data.missingExpressions[0] == "label red",
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

    it('query for: Red-Blood', () => {
        return nss.query("Red-Blood")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 2 &&
                    data.words[0] == "Red" &&
                    data.words[1] == "Blood" &&
                    data.itemsId.length == 1 &&
                    data.itemsId[0] == "10" &&
                    data.expressions.length == 0 &&
                    data.missingExpressions.length == 1 &&
                    data.missingExpressions[0] == "Red-Blood",
                    "Error on query for: Red-Blood"
                );
            });
    });         

    it('query for: Blood-Red', () => {
        return nss.query("Blood-Red")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 2 &&
                    data.words[0] == "Blood" &&
                    data.words[1] == "Red" &&
                    data.itemsId.length == 1 &&
                    data.itemsId[0] == "10" &&
                    data.expressions.length == 1  &&
                    data.expressions[0] == "Blood-Red" &&
                    data.missingExpressions.length == 0,
                    "Error on query for: Blood-Red"
                );
            });
    });   


    it('query for: Meu Cafe', () => {
        return nss.query("Meu Cafe")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 2 &&
                    data.words[0] == "Meu" &&
                    data.words[1] == "Cafe" &&
                    data.itemsId.length == 1 &&
                    data.itemsId[0] == "11",
                    "Error on query for: Meu Cafe"
                );
            });
    });   

    it('query for: Mêú Cãfé', () => {
        return nss.query("Mêú Cãfé")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 2 &&
                    data.words[0] == "Mêú" &&
                    data.words[1] == "Cãfé" &&
                    data.itemsId.length == 1 &&
                    data.itemsId[0] == "11",
                    "Error on query for: Mêú Cãfé"
                );
            });
    });       

    it('query for: X-14', () => {
        return nss.query("X-14")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 2 &&
                    data.words[0] == "X" &&
                    data.words[1] == "14" &&
                    data.itemsId.length == 1 &&
                    data.itemsId[0] == "12" &&
                    data.expressions.length == 1 &&
                    data.expressions[0] == "X-14" &&
                    data.missingExpressions.length == 0,
                    "Error on query for: X-14"
                );
            });
    });  

    it('query for: L/S', () => {
        return nss.query("L/S")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 2 &&
                    data.words[0] == "L" &&
                    data.words[1] == "S" &&
                    data.itemsId.length == 1 &&
                    data.itemsId[0] == "3" &&
                    data.expressions.length == 1 &&
                    data.expressions[0] == "L/S" &&
                    data.missingExpressions.length == 0,
                    "Error on query for: HAM L/S"
                );
            });
    });  
    
    it('query for: HAM L/S', () => {
        return nss.query("HAM L/S")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 3 &&
                    data.words[0] == "HAM" &&
                    data.words[1] == "L" &&
                    data.words[2] == "S" &&
                    data.itemsId.length == 1 &&
                    data.itemsId[0] == "3" &&
                    data.expressions.length == 1 &&
                    data.expressions[0] == "L/S" &&
                    data.missingExpressions.length == 0,
                    "Error on query for: HAM L/S"
                );
            });
    });  

    it('query for: "HAM L/S"', () => {
        return nss.query("\"HAM L/S\"")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 3 &&
                    data.words[0] == "HAM" &&
                    data.words[1] == "L" &&
                    data.words[2] == "S" &&
                    data.itemsId.length == 1 &&
                    data.itemsId[0] == "3" &&
                    data.expressions.length == 1 &&
                    data.expressions[0] == "HAM L/S" &&
                    data.missingExpressions.length == 0,
                    "Error on query for: \"HAM L/S\""
                );
            });
    });  

    it('insert item: 13 - VODKA ABSOLUTE', () => {
        return nss.insertItem({ "itemName": "VODKA ABSOLUTE", "itemId": "13", "price": 23.10, "popularity": 1, "thumbImg": "vodka-absolute.png" })
            .then(data => {
                assert(
                    data != null &&
                    data.timeElapsed !== undefined,
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

    it('remove item 13', () => {
        return nss.removeItem("13")
            .then(data => {
                assert(
                    data != null &&
                    data.timeElapsed !== undefined,
                    "Error on removing item 13"
                );
            });
    });

    it('query for: absolut', () => {
        return nss.query("absolut")
            .then(data => {
                assert(
                    data != null &&
                    data.words.length == 0 &&
                    data.itemsId.length == 0 &&
                    data.missingWords.length == 1 &&
                    data.missingWords[0] == "absolut",
                    "Error on query for: absolut"
                );
            });
    });

    it('get words suggestions for: lab', () => {
        return nss.getSuggestedWords("lab")
            .then(data => {                            
                assert(
                    data != null &&
                    data.suggestions.length == 2 &&
                    data.suggestions.indexOf("LABEL") >= 0  &&
                    data.suggestions.indexOf("LABELY") >= 0,
                    "Error on get words suggestions for: lab"
                );
            });
    });
    
    it('get words suggestions for: wh', () => {
        return nss.getSuggestedWords("wh")
            .then(data => {    
                assert(
                    data != null &&
                    data.suggestions.length == 4 &&
                    data.suggestions.indexOf("WHISKY fancy") >= 0 &&
                    data.suggestions.indexOf("WHISKY LABEL")  >= 0 &&
                    data.suggestions.indexOf("WHISKY RED")  >= 0 &&
                    data.suggestions.indexOf("WHISKY BLACK") >= 0,
                    "Error on get words suggestions for: lab"
                );
            });
    });    

    it('get words suggestions for: fanc', () => {
        return nss.getSuggestedWords("fanc")
            .then(data => {
                assert(
                    data != null &&
                    data.suggestions.length == 3,
                    "Error on get words suggestions for: fanc"
                );
            });
    });

    it('get items suggestions for: l/s', () => {
        return nss.getSuggestedItems("l/s")
            .then(data => {
                assert(
                    data != null &&
                    data.items.length == 1 &&
                    data.items[0].itemName == "BLACK FOREST BEECHWOOD HAM L/S",
                    "Error on get items suggestions for: l/s"
                );
            });
    });

    it('get items suggestions for: FANC', () => {
        return nss.getSuggestedItems("FANC")
            .then(data => {
                assert(
                    data != null &&
                    data.items.length == 1 &&
                    data.items[0].itemName == "WHISKY RED LABEL",
                    "Error on get items suggestions for: FANC"
                );
            });
    });

    it('get items suggestions for: whisky', () => {
        return nss.getSuggestedItems("whisky")
            .then(data => {
                assert(
                    data != null &&
                    data.items.length == 2 &&
                    (
                        (data.items[0].itemName == "WHISKY RED LABEL" &&
                        data.items[1].itemName == "WHISKY BLACK LABEL") || 
                        (data.items[1].itemName == "WHISKY RED LABEL" &&
                        data.items[0].itemName == "WHISKY BLACK LABEL")  
                    ),
                    "Error on get items suggestions for: whisky"
                );
            });
    });

    it('get up to 10 item suggestions for whisky ordering by price (asc) using an object and omitting the direction ', () => {

        let orderObject = {field: "price"};

        return nss.getSuggestedItems("whisky", 10, orderObject)
            .then(data => {
                assert(
                    data != null &&
                    data.items.length ==  2 &&
                    data.items[0].itemName == "WHISKY BLACK LABEL" &&
                    data.items[1].itemName == "WHISKY RED LABEL",
                    "get all item suggestions for whisky ordering by popularity (desc)"
                );
            });
    });   

    it('get one item suggestions for whisky ordering by popularity (desc)', () => {

        let orderFunc = ((x, y) => { return x.popularity < y.popularity; });

        return nss.getSuggestedItems("whisky", 1, orderFunc)
            .then(data => {
                assert(
                    data != null &&
                    data.items.length == 1 &&
                    data.items[0].itemName == "WHISKY RED LABEL",
                    "get one item suggestions for whisky ordering by popularity (desc)"
                );
            });
    });    

});
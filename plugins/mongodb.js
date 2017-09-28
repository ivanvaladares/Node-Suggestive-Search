const mongo = require('mongodb').MongoClient;

let dbItems, dbWords;

const init = (options) => {

    return new Promise((resolve, reject) => {

        mongo.connect(options.mongoDatabase).then((database) => {

            let itemsCollectionName = (options.itemsCollectionName !== undefined) ? options.itemsCollectionName : 'node-suggestive-search-items'; 
            let wordsCollectionName = (options.wordsCollectionName !== undefined) ? options.wordsCollectionName : 'node-suggestive-search-words';         

            dbItems = database.collection(itemsCollectionName);
            dbWords = database.collection(wordsCollectionName);
                        
            resolve();

        }).catch(err => {

            reject(err);
            
        });
        
    });
};

const insert = (collection, entry) => {
    return new Promise((resolve, reject) => {
        collection.insert(entry, { w: 0 }, (err, newDoc) => {
            if (err) { return reject(err); }

            resolve(newDoc);
        });
    });
}


const find = (collection, criteria) => {
    return new Promise((resolve, reject) => {
        collection.find(criteria).toArray((err, items) => {
            if (err) { return reject(err); }
            
            resolve(items);
        });
    });    
}

const remove = (collection, criteria1, criteria2) => {
    return new Promise((resolve, reject) => {
        collection.remove(criteria1, criteria2, (err, numRemoved) => {
            if (err) { return reject(err); }

            resolve(numRemoved);
        });
    });    
}

const update = (collection, criteria, data, multi) => {
    return new Promise((resolve, reject) => {
        collection.update(criteria, data, multi, (err, numUpdated) => {
            if (err) { return reject(err); }

            resolve(numUpdated);
        });
    });    
}

const cleanDatabase = () => {
    return new Promise((resolve, reject) => {
        let p1 = remove(dbItems, {}, { multi: true });
        let p2 = remove(dbWords, {}, { multi: true });

        Promise.all([p1, p2]).then(() => {
            resolve();
        }).catch(err => {
            reject(err);
        });
    });
}

const createIndexes = () => {   
    return new Promise((resolve) => {

        dbItems.createIndex({ 'itemId': 2 }, { unique: true });
        dbWords.createIndex({ 'word': 1 }, {  unique: true });
        dbWords.createIndex({ 'cleanWord': 2 }, {  unique: true });
        dbWords.createIndex({ 'soundex': 1 });

        for (let i = 2; i <= 4; i++) {
            let ixi = {};
            let ixe = {};
            ixi[`p${i}i`] = 1;
            ixe[`p${i}e`] = 1;
            dbWords.createIndex(ixi, { sparse: true });
            dbWords.createIndex(ixe, { sparse: true });
        }

        resolve();
    });
}

exports.init = init;

exports.insertItem = (entry) => {
    return insert(dbItems, entry);
};

exports.insertWord = (entry) => {
    return insert(dbWords, entry);
};

exports.findItems = (criteria) => {
    return find(dbItems, criteria);
};

exports.findWords = (criteria) => {
    return find(dbWords, criteria);
};

exports.updateWord = (criteria1, data, multi) => {
    return update(dbWords, criteria1, data, multi);
}

exports.removeItem = (criteria1) => {
    return remove(dbItems, criteria1, { multi: false });
};

exports.removeWords = (criteria1) => {
    return remove(dbWords, criteria1, { multi: false });
};

exports.cleanDatabase = () => {
    return cleanDatabase();
};

exports.createIndexes = () => {
    return createIndexes();
}
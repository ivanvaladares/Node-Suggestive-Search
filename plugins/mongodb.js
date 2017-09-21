let mongo = require('mongodb').MongoClient;
let db = {};

exports.name = 'mongodb';

exports.init = (options, callback) => {

    mongo.connect(options.mongoDatabase, (err, database) => {
        if (err) { return callback(err); }

        db = database;

        exports.dbItems = db.collection('items');
        exports.dbWords = db.collection('words');

        callback();
    });

};

exports.insert = (collection, entry, callback) => {
    collection.insert(entry, { w: 0 }, callback);
};

exports.find = (collection, criteria, callback) => {
    collection.find(criteria).toArray((err, docs) => {
        callback(err, docs);
    });
};

exports.update = (collection, criteria1, criteria2, criteria3, callback) => {
    collection.update(criteria1, criteria2, criteria3, callback);
}

exports.remove = (collection, criteria1, criteria2, callback) => {
    collection.remove(criteria1, criteria2, callback);
};

exports.createIndex = (collection, fieldName, order) => {
    var ix = {}
    ix[fieldName] = order;
    collection.createIndex(ix, err => {
        if (err) console.log(err);
    });
}
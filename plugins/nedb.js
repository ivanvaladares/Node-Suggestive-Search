let Datastore = require('nedb');
let path = require('path');
let db = {};

exports.name = 'nedb';

exports.init = (options, callback) => {

  exports.dbItems = new Datastore({
    inMemoryOnly: options.neDbInMemoryOnly,
    filename: path.join(options.neDbDataPath, "node-suggestive-search-items.db"),
    autoload: true
  });
  exports.dbWords = new Datastore({
    inMemoryOnly: options.neDbInMemoryOnly,
    filename: path.join(options.neDbDataPath, "node-suggestive-search-words.db"),
    autoload: true
  });

  callback();

};

exports.insert = (collection, entry, callback) => {
  collection.insert(entry, callback);
};

exports.find = (collection, criteria, callback) => {
  collection.find(criteria, callback);
};

exports.update = (collection, criteria1, criteria2, criteria3, callback) => {
  collection.update(criteria1, criteria2, criteria3, callback);
}

exports.remove = (collection, criteria1, criteria2, callback) => {
  collection.remove(criteria1, criteria2, callback);
};

exports.createIndex = (collection, fieldName, order) => {
  collection.ensureIndex({ fieldName }, err => {
    if (err) console.log(err);
  });
}
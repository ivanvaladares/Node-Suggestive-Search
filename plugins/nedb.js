var Datastore = require('nedb');
var path = require('path');
var db = {};

exports.name = 'nedb';

exports.init = function (options, callback) {

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

exports.insert = function (collection, entry, callback) {
  collection.insert(entry, callback);
};

exports.find = function (collection, criteria, callback) {
  collection.find(criteria, callback);
};

exports.update = function (collection, criteria1, criteria2, criteria3, callback) {
  collection.update(criteria1, criteria2, criteria3, callback);
}

exports.remove = function (collection, criteria1, criteria2, callback) {
  collection.remove(criteria1, criteria2, callback);
};

exports.createIndex = function (collection, fieldName, order) {
  collection.ensureIndex({ fieldName: fieldName }, function (err) {
    if (err) console.log(err);
  });
}
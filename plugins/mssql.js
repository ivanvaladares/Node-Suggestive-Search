var Sequelize = require("Sequelize");

exports.init = (options) => {

    return new Promise((resolve, reject) => {

        var model = new Sequelize(options.dbConnection);

        let itemsTableName = (options.itemsTableName !== undefined) ? options.itemsTableName : 'node-suggestive-search-items'; 
        let wordsTableName = (options.wordsTableName !== undefined) ? options.wordsTableName : 'node-suggestive-search-words'; 
        let itemsWordsTableName = (options.itemsWordsTableName !== undefined) ? options.itemsWordsTableName : 'node-suggestive-search-items-words'; 

        model.Items = model.define(itemsTableName, {
            itemId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: false
            },
            itemName: {
                type: Sequelize.STRING,
                allowNull: false
            }
        }, {
            tableName: itemsTableName,
            timestamps: false
        });

        model.Words = model.define(wordsTableName, {
            wordId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            word: {
                type: Sequelize.STRING,
                allowNull: false
            },
            cleanWord: {
                type: Sequelize.STRING,
                allowNull: false
            },
            soundex: {
                type: Sequelize.STRING,
                allowNull: false
            },
            p2i: {
                type: Sequelize.STRING,
                allowNull: false
            },
            p2e: {
                type: Sequelize.STRING,
                allowNull: false
            },
            p3i: {
                type: Sequelize.STRING,
                allowNull: false
            },
            p3e: {
                type: Sequelize.STRING,
                allowNull: false
            },
            p4i: {
                type: Sequelize.STRING,
                allowNull: false
            },
            p4e: {
                type: Sequelize.STRING,
                allowNull: false
            }
        }, {
            tableName: wordsTableName,
            timestamps: false
        });

        model.ItemsWords = model.define(itemsWordsTableName, {
            itemId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            wordId: {
                type: Sequelize.INTEGER,
                allowNull: false
            }
        }, {
            tableName: itemsWordsTableName,
            timestamps: false
        });

        model.ItemsWords.removeAttribute('id');

        model.Words.associate = function (models) {

            models.Words.belongsToMany(models.Items, {
                as: "Items",
                through: models.ItemsWords,
                foreignKey: 'itemId'
            });

        };

        model.Items.associate = function (models) {

            models.Items.belongsToMany(models.Words, {
                as: "Words",
                through: models.ItemsWords,
                foreignKey: 'wordId'
            });

        };

        model.authenticate().then(() => {
            model.sync().then(() => {

                exports.dbItems = model.Items;
                exports.dbWords = model.Words;
            
                resolve();
            });        
        })
        .catch(err => {

            reject(err);
            
        });
        
    });
};


exports.insert = (collection, entry, callback) => {
    callback();
    //collection.insert(entry, callback);
};

exports.find = (collection, criteria, callback) => {
    callback();
    //collection.find(criteria, callback);
};

exports.update = (collection, criteria1, criteria2, criteria3, callback) => {
    callback();
    //collection.update(criteria1, criteria2, criteria3, callback);
}

exports.remove = (collection, criteria1, criteria2, callback) => {
    callback();
    //collection.remove(criteria1, criteria2, callback);
};

exports.createIndex = (collection, fieldName) => {
    //collection.ensureIndex({ fieldName }, err => {
    //    if (err) console.log(err);
    //});
}
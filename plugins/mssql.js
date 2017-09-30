const Sequelize = require("Sequelize");
const util = require("util");
const EventEmitter = require('events');

let DbDriver = class {

    constructor (options) {

        let model = new Sequelize(options.dbConnection);

        let itemsTableName = (options.itemsTableName !== undefined) ? options.itemsTableName : 'node-suggestive-search-items'; 
        let wordsTableName = (options.wordsTableName !== undefined) ? options.wordsTableName : 'node-suggestive-search-words'; 
        let itemsWordsTableName = (options.itemsWordsTableName !== undefined) ? options.itemsWordsTableName : 'node-suggestive-search-items-words'; 

        model.Items = model.define(itemsTableName, {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            itemId: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            itemName: {
                type: Sequelize.STRING,
                allowNull: false
            },
            keywords: {
                type: Sequelize.STRING,
                allowNull: true
            }
        }, {
            tableName: itemsTableName,
            timestamps: false
        });

        model.Words = model.define(wordsTableName, {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            word: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
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
                allowNull: true
            },
            p2e: {
                type: Sequelize.STRING,
                allowNull: true
            },
            p3i: {
                type: Sequelize.STRING,
                allowNull: true
            },
            p3e: {
                type: Sequelize.STRING,
                allowNull: true
            },
            p4i: {
                type: Sequelize.STRING,
                allowNull: true
            },
            p4e: {
                type: Sequelize.STRING,
                allowNull: true
            }
        }, {
            tableName: wordsTableName,
            timestamps: false
        });

        model.ItemsWords = model.define(itemsWordsTableName, {
            itemId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                unique: false
            },
            wordId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                unique: false
            }
        }, {
            tableName: itemsWordsTableName,
            timestamps: false
        });

        model.ItemsWords.removeAttribute('id');

        model.Words.belongsToMany(model.Items, {
            as: "items",
            through: model.ItemsWords,
            foreignKey: 'wordId',
            onDelete: 'CASCADE',
            constraints: false
        });

        model.Items.belongsToMany(model.Words, {
            as: "words",
            through: model.ItemsWords,
            foreignKey: 'itemId',
            onDelete: 'CASCADE',
            constraints: false
        });

        model.authenticate().then(() => {
            model.sync({force: options.force}).then(() => {

                this.dbItems = model.Items;
                this.dbWords = model.Words;

                this.emit('initialized');
            });        
        })
        .catch(err => {
            throw err; 
        });

        return this;
    }

    _insert (collection, entry) {
        return new Promise((resolve, reject) => {

            collection.bulkCreate(entry).then(() => {
                resolve(entry);
            }).catch(err => {
                reject(err);
            });

        });
    }

    _findItems (collection, criteria) {
        return new Promise((resolve, reject) => {
            collection.findAll({where: criteria, raw: true}).then(items => {
                resolve(items);
            }).catch(err => {
                reject(err); 
            });
        });    
    }

    _findWords (collection, criteria) {
        return new Promise((resolve, reject) => {
            collection.findAll({where: criteria, include: [{ model: this.dbItems, as: 'items', attributes: ['itemId']}] }).then(items => {

                let res = JSON.parse(JSON.stringify(items));

                res.map(e => {
                    let x = e.items.map(ie => {
                        return e.items[ie.itemId];
                    });

                    e.items = x;
                })

                resolve(res);
            }).catch(err => {
                reject(err); 
            });
        });    
    }
    
    _remove (collection, criteria1) {
        return new Promise((resolve, reject) => {

            collection.destroy({where: criteria1}).then(numRemoved => {
                resolve(numRemoved);
            }).catch(err => {
                reject(err); 
            });
        });    
    }

    _update (collection, criteria, data) {
        return new Promise((resolve, reject) => {
            collection.update(data, {where: criteria}).then(numUpdated => {
                resolve(numUpdated);
            }).catch(err => {
                reject(err); 
            });
        });    
    }

    createWordObject (word, cleanWord, soundexWord) {
        
        let objWord = { word, cleanWord, soundex: soundexWord, items: {} };
        
        for (let i = 2; i <= cleanWord.length && i <= 4; i++) {
            objWord[`p${i}i`] = cleanWord.substr(0, i).toLowerCase();
            objWord[`p${i}e`] = cleanWord.substr(cleanWord.length - i, cleanWord.length).toLowerCase();
        }

        return objWord;
    }

    createItemObject (itemId, itemName, keywords) {

        let objItem = { itemId, itemName };

        if (keywords !== undefined){
            objItem.keywords = keywords;
        }

        return objItem;
    }   

    cleanDatabase () {
        return new Promise((resolve, reject) => {
            let p1 = this.dbItems.destroy({ where: {}, truncate: true});
            let p2 = this.dbWords.destroy({ where: {}, truncate: true});

            Promise.all([p1, p2]).then(() => {
                resolve();
            }).catch(err => {
                reject(err);
            });
        });
    }

    createIndexes () {   
        return new Promise((resolve) => {
            resolve();
        });
    }    
    
    insertItem (entry) {
        return this._insert(this.dbItems, entry);
    }
    
    insertWord (entry) {
        return this._insert(this.dbWords, entry);
    }
    
    findItems (criteria) {
        return this._findItems(this.dbItems, criteria);
    }
    
    findWords (criteria) {
        return this._findWords(this.dbWords, criteria);
    }
    
    updateWord (criteria1, data, multi) {
        return this._update(this.dbWords, criteria1, data, multi);
    }
    
    removeItem (criteria1) {
        return this._remove(this.dbItems, criteria1, { multi: false });
    }
    
    removeWords (criteria1) {
        return this._remove(this.dbWords, criteria1, { multi: false });
    }

}

util.inherits(DbDriver, EventEmitter);

exports.init = (options) => {
    return new DbDriver(options);
}
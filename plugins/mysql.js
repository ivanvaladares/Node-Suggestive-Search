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
            indexes: [{unique: true, fields: ['itemId']}] 
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
                unique: false
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
            indexes: [
                {unique: true, fields: ['id']},
                {unique: false, fields: ['word']},
                {unique: false, fields: ['cleanWord']},
                {unique: false, fields: ['soundex']},
                {unique: false, fields: ['p2i']},
                {unique: false, fields: ['p2e']},
                {unique: false, fields: ['p3i']},
                {unique: false, fields: ['p3e']},
                {unique: false, fields: ['p4i']},
                {unique: false, fields: ['p4e']}
            ] 
        }, {
            tableName: wordsTableName,
            timestamps: false
        });

        model.ItemsWords = model.define(itemsWordsTableName, {
            itemId: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: false
            },
            wordId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                unique: false
            }
        }, {
            indexes: [
                {unique: true, fields: ['itemId', 'wordId']}
            ] 
        }, {
            tableName: itemsWordsTableName,
            timestamps: false
        });

        model.Words.hasMany(model.ItemsWords, {
            as: "itemsId",
            primaryKey: 'id',
            foreignKey: 'wordId',
            constraints: false
        });

        model.ItemsWords.belongsTo(model.Words, {
            as: "words",
            primaryKey: 'wordId',
            foreignKey: 'id',
            constraints: false
        });

        model.authenticate().then(() => {
            model.sync({force: options.force}).then(() => {

                this.dbItems = model.Items;
                this.dbWords = model.Words;
                this.dbItemsWords = model.ItemsWords;

                this.emit('initialized');
            });        
        }).catch(err => {
            throw err; 
        });

        return this;
    }

    _insert (collection, entry) {
        return new Promise((resolve, reject) => {

            collection.bulkCreate(entry, { returning: true }).then(instances => {

                //if it's a word, we need to insert the related items
                if (collection === this.dbWords){
                    
                    let wordItems = [];

                    //get the itemsId from inserted and join them with the words.id
                    entry.map((word, index) => {
                        word.items.map(itemId => {
                            wordItems.push({itemId, wordId: instances[index].id});
                        });
                    });

                    //insert the association in bulk
                    this.dbItemsWords.bulkCreate(wordItems).then(() => {
                        resolve(instances);
                    }).catch(err => {
                        reject(err);
                    });

                }else{
                    resolve(instances);
                }

            }).catch(err => {
                reject(err);
            });

        });
    }

    _findItems (collection, criteria) {
        return new Promise((resolve, reject) => {
            collection.findAll({where: criteria, raw: true}).then(items => {

                if (items === null){
                    resolve([]);
                }else{
                    resolve(items);
                }

            }).catch(err => {
                reject(err); 
            });
        });    
    }

    _findWords (collection, criteria) {
        return new Promise((resolve, reject) => {
            collection.findAll({where: criteria, include: [{ model: this.dbItemsWords, as: 'itemsId', attributes: ['itemId']}] }).then(items => {

                if (items === null){
                    resolve([]);
                }else{

                    let res = JSON.parse(JSON.stringify(items));

                    res.map(item => {
                        let itemsIdArray = item.itemsId.map(wordItem => {
                            return wordItem["itemId"];
                        });

                        delete item.itemsId;
                        item["items"] = itemsIdArray;
                    });
    
                    resolve(res);
                }
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
        // console.log(criteria)
        // console.log(data)
        return new Promise((resolve, reject) => {

            this._findWords(collection, criteria).then(words => {

                let wordsIds = words.map(word => {
                    return word.id;
                });

                let wordItems = [];

                data.$set.items.map(itemId => {
                    wordsIds.map(wordId => {
                        wordItems.push({itemId, wordId});
                    });
                });

                this.dbItemsWords.destroy({where: {wordId: { $in: wordsIds }}}).then(() => {

                    //insert the association in bulk
                    this.dbItemsWords.bulkCreate(wordItems).then(() => {
                        resolve(wordsIds.length);
                    }).catch(err => {
                        reject(err);
                    });

                }).catch(err => {
                    reject(err); 
                });

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
            let p3 = this.dbItemsWords.destroy({ where: {}, truncate: true});

            Promise.all([p1, p2, p3]).then(() => {
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
        //console.log(entry[entry.length-1])

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

};

util.inherits(DbDriver, EventEmitter);

exports.init = (options) => {
    return new DbDriver(options);
};
var fs = require('fs'),
	Datastore = require('nedb'),
	path = require('path');

var db = {};
db.words = new Datastore({ inMemoryOnly: true });
db.items = new Datastore({ inMemoryOnly: true });


//http://alistapart.com/article/accent-folding-for-auto-complete
var accentMap = {'á':'a', 'é':'e', 'í':'i','ó':'o','ú':'u'};
function accent_fold (s) {
	if (!s) { return ''; }
	var ret = '';
	for (var i = 0; i < s.length; i++) {
		ret += accentMap[s.charAt(i)] || s.charAt(i);
	}
	return ret;
};

//https://en.wikipedia.org/wiki/Levenshtein_distance
function similarity(s1, s2) {
	var longer = s1;
	var shorter = s2;
	if (s1.length < s2.length) {
		longer = s2;
		shorter = s1;
	}
	var longerLength = longer.length;
	if (longerLength == 0) {
		return 1.0;
	}
	return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}
function editDistance(s1, s2) {
	s1 = s1.toLowerCase();
	s2 = s2.toLowerCase();

	var costs = new Array();
	for (var i = 0; i <= s1.length; i++) {
		var lastValue = i;
		for (var j = 0; j <= s2.length; j++) {
			if (i == 0)
				costs[j] = j;
			else {
				if (j > 0) {
					var newValue = costs[j - 1];
					if (s1.charAt(i - 1) != s2.charAt(j - 1))
						newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
					costs[j - 1] = lastValue;
					lastValue = newValue;
				}
			}
		}
		if (i > 0)
			costs[s2.length] = lastValue;
	}
	return costs[s2.length];
}



//https://en.wikipedia.org/wiki/Soundex
function soundex(str) {
	var string = str.toUpperCase().replace(/[^A-Z]/g,"");
	string = [
		string.substr(0,1),
		string.substr(1)
			  .replace(/A|E|H|I|O|U|W|Y/g,0)
			  .replace(/B|F|P|V/g,1)
			  .replace(/C|G|J|K|Q|S|X|Z/g,2)
			  .replace(/D|T/g,3)
			  .replace(/L/g,4)
			  .replace(/M|N/g,5)
			  .replace(/R/g,6)
			  .replace(/1{2}|2{2}|3{2}|4{2}|5{2}|6{2}/g,"")
			  .replace(/0/g,"")
	].join("").substr(0,4);

	return string+
		  (string.length==4?"":(new Array(5-string.length)).join("0"));
};

function deduplicateArray(arr) {
    return arr.sort().
			filter(function(item, pos, arr) {
        		return !pos || item != arr[pos - 1];
    })
}

function arrToJson(arr){
	var json = { };

	for(var i = 0, l = arr.length; i < l; i++) {
		json[arr[i]] = 1;
	}

	return json;
}


/**
 * Split words from a string
 * @param {string} text to be broken into words
 * returns {Array}
 */
function splitWords(text){

	//separate words using this regexp pattern
	text = text.replace(/[.,\/#!$%\^&\*;:{}=+\-_`~()\?<>"”“]/gi, ' '); 
		
	//split words from the text variable
	var arr = text.split(" ");
	
	var words = [];
	
	for (var i=0; i<arr.length; i++){
		var word = arr[i].trim(); // .replace(/[^0-9a-z#]/gi, ''); 

		if (word.length > 0){
			words.push(word);
		}
	}
	
	return words;
}

/**
 * Create an object dictionary with related words 
 * @param {JSON} word from the dictionary
 * @param {array} array of related words
 * returns nothing
 */
function setRelatedWords(objWord, arrWords){

	for (var w in arrWords){

		var strWord = arrWords[w].toLowerCase()
	
		if (strWord in objWord.relatedWords){
			
			objWord.relatedWords[strWord] = (objWord.relatedWords[strWord] || 0) + 1; 	

		}else{

			objWord.relatedWords[strWord] = 1;

		}

	}
}


/**
 * Find words using soundex function
 * @param {JSON} json with items to be broken into words to construct our dictionary
 * returns {Promise(JSON)}
 */
function populateWordsJson(itemsJson){

	return new Promise(function(resolve, reject) {	
	
		//create a dictionary like object
		var objWords = {};
		
		for (var x in itemsJson) {
			
			//get words from each item
			var arrWords = splitWords(itemsJson[x].itemName);
		
			//associate each word with items. ex: {word, [item1, item2, item3...]} 
			for (var w in arrWords){
			
				var strWord = arrWords[w].toLowerCase()

				//if there is already this word in our dictionary, associate it with this item
				if (strWord in objWords){
					
					objWords[strWord].items.push(itemsJson[x].itemId);	

					setRelatedWords(objWords[strWord], arrWords);

				}else{
					//keep the word without accent and lowercase
					var wordLcase = accent_fold(strWord);
					objWords[strWord] = { word: arrWords[w], wordLcase: wordLcase, soundex: soundex(arrWords[w]), relatedWords: {} };

					for (var i=2; i <= wordLcase.length && i <= 4; i++){
						objWords[strWord]["p" + i + "i"] = wordLcase.substr(0, i).toLowerCase();
						objWords[strWord]["p" + i + "e"] = wordLcase.substr(wordLcase.length-i, wordLcase.length).toLowerCase();
					}

					objWords[strWord].items = [itemsJson[x].itemId];

					setRelatedWords(objWords[strWord], arrWords);

				}

			}

		}
		
		//create a nedb compatible JSON from the above dictionary
		var wordsJson = [];
		for (var item in objWords){
			wordsJson.push(objWords[item]);
		}
		
		//clean the words database
		db.words.remove({}, { multi: true }, function (err, numRemoved) {
			if (err) return reject(err);
				
			//insert all words at once in database
			db.words.insert(wordsJson, function (err, wordsJsonInserted) {
				if (err) return reject(err);

				//try to create an index for [wordLcase] 
				db.words.ensureIndex({ fieldName: 'wordLcase' }, function (err) {
					//lets not propagate for now
					if (err) console.log(err);
				});				

				//try to create an index for [soundex] 
				db.words.ensureIndex({ fieldName: 'soundex'}, function (err) {
					//lets not propagate for now
					if (err) console.log(err);
				});

				//try to create an index for [pXi]
				for (var i=2; i<=4; i++){
					db.words.ensureIndex( JSON.parse('{ "fieldName" : "p' + i + 'i" }') , function (err) {
						//lets not propagate for now
						if (err) console.log(err);
					});
					db.words.ensureIndex( JSON.parse('{ "fieldName" : "p' + i + 'e" }') , function (err) {
						//lets not propagate for now
						if (err) console.log(err);
					});					
				}

				//return some information about this process
				resolve({words: wordsJsonInserted.length});

			}); 

		});

	});

}


/**
 * Find words using soundex function
 * @param {String} word used in the search
 * returns {Promise(JSON)} 
 */
function queryWordBySoundexAndParts(word){
	
	return new Promise(function(resolve, reject) {

		//try to find an word is our dictionary using soundex and parts of the word
		//todo: research a better way to improve the performance
		var queryCriteria = [{ soundex: soundex(word) }];

		var wordWithoutAccents = accent_fold(word);

		for (var i=2; i<=4 && i<=wordWithoutAccents.length; i++){
			var objCriteriaIni = JSON.parse('{ "p' + i + 'i" : "" }');
			objCriteriaIni[Object.keys(objCriteriaIni)[0]] = wordWithoutAccents.substr(0, i).toLowerCase();
			queryCriteria.push(objCriteriaIni);

			var objCriteriaEnd = JSON.parse('{ "p' + i + 'e" : "" }');
			objCriteriaEnd[Object.keys(objCriteriaEnd)[0]] = wordWithoutAccents.substr(wordWithoutAccents.length-i, wordWithoutAccents.length).toLowerCase();
			queryCriteria.push(objCriteriaEnd);
		}

		db.words.find({$or: queryCriteria}).exec(function (err, items) {

			if (err) return reject(err);

			if (items.length > 0) {

				// before return the result, lets give a similarity rank for each result	
				resolve(items.map(function (obj, i){
								obj.similarity = similarity(obj.word, word);
								return obj;
							})
					);

			} else {

				//nothing was found... should we try another method?
				//todo: research for another method
				resolve(null);

			}

		});
	
	});

}

/**
 * Return json words object similar to the word parameter 
 * @param {String} word to search
 * @param {Int} limit the result
 * returns {Promise(JSON)}
 */
function listMoreWordsLike(word, limit){

	return new Promise(function(resolve, reject) {

		var queryCriteria;

		//create a search criteria for 2 to 4 letters to try to find words that starts like this one
		for (var i=4; i>=2; i--){
			if (word.length >= i) {
				queryCriteria = JSON.parse('{ "p' + i + 'i" : "" }');
				queryCriteria[Object.keys(queryCriteria)[0]] = word.substr(0, i).toLowerCase();
				break;
			}
		}

		//execute the query
		db.words.find(queryCriteria).exec(function (err, foundItems) {
			if (err) return reject(err);

			if (foundItems.length > 0) {

				//return item that begins with same characters, from smallest to biggest and then alphabetically
				resolve(foundItems.filter(function (objWord) {
						return objWord.wordLcase.indexOf(word.toLowerCase()) == 0;
					}).sort(function(a, b){
						if (a.word.length > b.word.length) {
							return 1;
						} else if (a.word.length < b.word.length) {
							return -1;
						}
						return a.word > b.word;
					})
					.slice(0, ((limit > 0) ? limit : foundItems.length)));
	
			}else{

				resolve(null);

			}

		});

	});

}



/**
 * Return array of words from words objects with same itemsID (it is like a join... must improve a lot...) 
 * @param {String} word to search
 * @param {Int} limit the result
 * returns {Promise(JSON)}
 */
function selectWordsWithSameItems(items, moreThanOneWord){

	return new Promise(function(resolve, reject) {

		//response
		var arrResponse = [];

		//acumulated itemsId to use to offers more words from those items
		var arrItemsId = null;

		//acumulated related words
		var arrRelatedWords = [];

		//take care of all the words but the last
		for (var word = 0; word<items.length; word ++){
			var objWord = items[word];

			if (objWord && !Array.isArray(objWord)){

				if (!objWord.correct){
					//some word is not correct
					resolve(null);
					return;
				}

				if (!arrItemsId){
					arrResponse.push("");
					arrItemsId = objWord.items;
				}
				
				var newarrItemsId = [];

				for (var i = 0; i < arrItemsId.length; i++) {
					for (var x = 0; x < objWord.items.length; x++) {
						if (arrItemsId[i] == objWord.items[x]){
							newarrItemsId.push(arrItemsId[i]);
						}
					}
				}

				arrItemsId = newarrItemsId;

				if (arrItemsId.length == 0 && moreThanOneWord){
					//some word does not have itens related.. break the response
					resolve(null);
					return;
				}

				arrResponse[0] = (arrResponse[0] + " " + objWord.word).trim();
				arrRelatedWords.push(objWord.relatedWords);
			}
		}

		//take care of the last separatedelly because this could be an array with more results
		for (var word in items){
			var objWord = items[word];

			if (!arrItemsId){
				arrItemsId = [];
			}

			if (objWord && Array.isArray(objWord)){

				for (var i=0; i < objWord.length; i++){

					var itemExist = false;

					var newarrItemsId = [];

					if (moreThanOneWord){

						for (var j = 0; j < arrItemsId.length; j++) {
							for (var x = 0; x < objWord[i].items.length; x++) {
								if (arrItemsId[j] == objWord[i].items[x]){
									itemExist = true;
									newarrItemsId.push(arrItemsId[j]);
								}
							}
						}

						if (itemExist) {
							arrItemsId = newarrItemsId;
							arrResponse.push(arrResponse[0] + " " + objWord[i].word);
							arrRelatedWords.push(objWord[i].relatedWords);
						}

					}else{

						arrResponse.push(objWord[i].word);

						for (var x = 0; x < objWord[i].items.length; x++) {
							newarrItemsId.push(objWord[i].items[x]);
						}

						arrItemsId = arrItemsId.concat(newarrItemsId);
					}
				}

			}
		
		}

		if (arrResponse.length > 3){

			resolve(arrResponse);

		}else{

			getMoreWordsFromItemsID(arrResponse, arrItemsId, arrRelatedWords).then(function(arr){

				resolve(arr);

			});

		}

	});
}


/**
 * Return array of suggestions from a previous suggestions  
 * @param {String} word to search
 * @param {Int} limit the result
 * returns {Promise(JSON)}
 */
function getMoreWordsFromItemsID(arrResponse, arrItemsId, arrRelatedWords){

	//todo: change this query for related words for every result,  arrRelatedWords is unused

	return new Promise(function(resolve, reject) {


		var arrWords = deduplicateArray(arrResponse.join(" ").split(" "))

		var arrCriteria = "";
		for (var i=0; i<arrWords.length; i++){
			arrCriteria += '"objWords.'+ arrWords[i] +'": 1,';
		}

		arrCriteria = "{" + arrCriteria.substring(0, arrCriteria.length - 1) + "}";

		var jsonCriteria = JSON.parse(arrCriteria);

		db.items.find(jsonCriteria).exec(function(err, othersItems){

			//keep the last line from previous suggestions
			var lastLine = arrResponse[arrResponse.length-1];

			//get all item's names from items returned from query
			var strNames = "";
			for (var w=0; w < othersItems.length; w++){
				strNames += othersItems[w].itemName + " "; 
			}

			var arrOtherWords = splitWords(strNames);

			var hist = {};
			arrOtherWords.map( function (a) { if (a in hist) hist[a] ++; else hist[a] = 1; } );
			//console.log(hist);

			//deduplicate, order bigger words fisrt and then alphabetically
			//remove number elements if array is bigger than 2
			arrOtherWords = deduplicateArray(arrOtherWords)
				.sort(function(a, b){
					if (a.length < b.length) {
						return 1;
					} else if (a.length > b.length) {
						return -1;
					}
					return a.toLowerCase() > b.toLowerCase()})
				.filter(function (objWord) {
					return lastLine.indexOf(objWord) == -1 && ((arrOtherWords.length > 2) ? isNaN(parseInt(objWord.substr(0, 1))) : true);
			});

			//add suggestions to the end of response array
			for (var w=0; w < arrOtherWords.length; w++){
				arrResponse.push(lastLine + " " + arrOtherWords[w]);
			}

			resolve(arrResponse.slice(0, 10));
		});

	});

}


/**
 * Load the dictionary database
 * @param {String} filename, jSon file with items
 * @param {String} charset, Charset used in file 
 * returns {Promise(JSON)}
 */
module.exports.loadJson = function(jSonFilePath, charset){

	return new Promise(function(resolve, reject) {
	
		var time = new Date();
		
		if (!charset){
			charset = "utf8";
		}

		//get the file from the path
		fs.readFile(jSonFilePath, charset, function (err, data) {
			if (err) return reject(err);
			
			var itemsJson = JSON.parse(data);

			//todo: test this helper when in getMoreWordsFromItemsID function
			itemsJson.map(function (obj, i){
						obj.objWords = arrToJson(splitWords(obj.itemName));
						return obj;
					});
			
			//clean the database
			db.items.remove({}, { multi: true }, function (err, numRemoved) {
				if (err) return reject(err);
				
				//insert all items in the database
				db.items.insert(itemsJson, function (err, itemsJsonInserted) {
					if (err) return reject(err);

					//try to create an unique index for [itemId] 
					db.items.ensureIndex({ fieldName: 'itemId', unique: true }, function (err) {
						if (err) return reject(err);
					});				

					//from the items, lets extract our dictionary 
					populateWordsJson(itemsJsonInserted).then(function (information){
										
						information.items = itemsJsonInserted.length;
						information.timeElapsed = (new Date() - time) + " ms"

						//return some information about this process
						resolve(information);

					}, function (err){
						return reject(err);
					});

				});		
				
			});
			
		});
	
	});

}  


/**
 * Return items array and words used in the query
 * @param {String} words used in the search
 * returns {Promise(JSON)}
 */
module.exports.query = function(words){
	
	return new Promise(function(resolve, reject) {

		var time = new Date().getTime();
		
		var arrWords = splitWords(words);

		if (arrWords.length <= 0) {
			return resolve({Error : "No word was given to search!"});
		}

		//make a promise for each word from query and create an array of promises
		var promises = arrWords.map(function(word) {

			return new Promise(function(resolve, reject) {

				//first, lets try to find the exact word in our dictionary
				db.words.findOne({ wordLcase: accent_fold( word.toLowerCase() ) }).exec(function (err, foundItem) {
					if (err) return reject(err); 

					//no results :(, lets try with soundex and parts
					if (!foundItem) {

						//this function will try to get words in our dictionary that is similar to the word from the query
						queryWordBySoundexAndParts(word).then(
							function (soudexFoundItems){

								if (soudexFoundItems != null) {
									resolve({word: word, correct: false, results: soudexFoundItems});
								}else{
									resolve({word: word, correct: false, results: []})
								}

							},
							function (){
								//instead of returning an error, lets return an empty result
								resolve({word: word, correct: false, results: []})
							}
						);

					}else{

						//returning the exact match
						resolve({word: word, correct: true, results: [foundItem]});

					}			
					
				});
			
			});
		
		});


		//now, lets resolve all promises from the array of promises
		Promise.all(promises).then(function(items) { 

			//items variable contains an array of word and results for each word from the query
			//if there is any incorrect word, lets choose the best match between the results 
			//to acomplish this, lets iterate over all words and their items to check how many items are similar between the words
			//todo: this is taking too looooooong!!! must improve this when working with 5k more itens
			for (var word in items){
				var objWord = items[word];
					
				for (var otherWord in items){
					var objOtherWord = items[otherWord];

					if (objOtherWord.word.toLowerCase() != objWord.word.toLowerCase()) {

						for (var result in objWord.results){
							var objResult = objWord.results[result];
					
							for (var otherWordResult in objOtherWord.results){
								var objOtherWordResult = objOtherWord.results[otherWordResult];
								
								for (var idxResultItem=0; idxResultItem < objResult.items.length; idxResultItem++){

									for (var idxResultItemOtherWord=0; idxResultItemOtherWord < objOtherWordResult.items.length; idxResultItemOtherWord++){
									
										if (objResult.items[idxResultItem] == objOtherWordResult.items[idxResultItemOtherWord]){
											// lets give a boost in similarity because this word contains items from other words
											objResult.similarity = (objResult.similarity || 0) + 1;
										}
									}
								}
							}
						}
					}
				}
			}

			//get the best match over similarity and transform results in only one result json object for each word from the query
			for (var word in items){
				var objWord = items[word];

				if (objWord.results.length > 0){
				
					objWord.results = objWord.results.reduce(function(x, y){
						return ((x.similarity > y.similarity) ? x : y ) 
					});
				
				}
			
			}


			//join all itemsId from all word's results
			var arrItemsId;

			for (var word in items){
				var objWord = items[word];

				if (!arrItemsId){
					arrItemsId = objWord.results.items;
					continue;
				}

				var itemExist = false;
				var newarrItemsId = [];

				for (var j = 0; j < arrItemsId.length; j++) {
					for (var x = 0; x < objWord.results.items.length; x++) {
						if (arrItemsId[j] === objWord.results.items[x]){
							itemExist = true;
							newarrItemsId.push(arrItemsId[j]);
						}
					}
				}

				arrItemsId = newarrItemsId;
			}


			// todo: 
			// check if all words have the same item
			// if not, remove word from the final result
			// return items found sorted by quantity of items


			var finalWords = [];
			for (var word in items){
				var objWord = items[word];

				//this word has this item
				finalWords.push(objWord.results.word);

			}

			
			var information = {query: words , words: finalWords, itemsId: arrItemsId };
			information.timeElapsed = (new Date().getTime() - time) + " ms"

			resolve(information);


		
		},function(err){
			reject(err)
		});

	});
	
}

/**
 * Return json words object similar to the word parameter 
 * @param {String} word to search
 * @param {Int} limit the result
 * returns {Promise(JSON)}
 */
module.exports.getSuggestedWords = function(words){

	return new Promise(function(resolve, reject) {
		
		var time = new Date();
		
		var arrWords = splitWords(words);

		if (arrWords.length <= 0) {
			return resolve({Error : "No word was given to search!"});
		}

		//only one word came from query
		if (arrWords.length == 1){

			//try to get more words like this one
			listMoreWordsLike(accent_fold(arrWords[0]), 10).then(
				function (results){

					var newResults = [];
					var arrTemp = []

					for (var word in results){
						var objWord = results[word];

						arrTemp.push({word: objWord.word, correct: true, items: objWord.items, relatedWords: objWord.relatedWords});
					}

					newResults.push(arrTemp);

					selectWordsWithSameItems(newResults, false).then(function(arr){
						
						var information = {timeElapsed: (new Date() - time) + " ms"};

						resolve({ suggestions: arr, information: information});

					});

				},
				function (err){

					reject(err);					

				}
			);

		//more than one word came from the query
		}else{ 

			//make a promise for each word from query, but last one and create an array of promises
			var promises = arrWords.slice(0, arrWords.length-1).map(function(word) {

				return new Promise(function(resolve, reject) {

					//try to find the exact word in our dictionary
					db.words.findOne({ wordLcase: accent_fold( word.toLowerCase() ) }).exec(function (err, foundItem) {
						if (err) return reject(err); 

						if (foundItem) {

							//returning the exact match
							resolve({word: foundItem.word, correct: true, items: foundItem.items, relatedWords: foundItem.relatedWords});

						}else{

							//instead of returning an error, lets return null
							resolve(null);

						}			
						
					});
				
				});
			
			});

			//make a promise for the last word from the query to get words like this one
			promises.push(listMoreWordsLike(accent_fold(arrWords[arrWords.length-1]), -1));



			//now, lets resolve all promises from the array of promises
			Promise.all(promises).then(function(items) { 

				var newResults = [];
				var arrTemp = [];

				for (var word in items){
					var objWord = items[word];
					
					if (objWord && !Array.isArray(objWord)){
						newResults.push({word: objWord.word, correct: true, items: objWord.items, relatedWords: objWord.relatedWords});
					}
					if (objWord && Array.isArray(objWord)){
						
						for (var at=0; at< objWord.length; at++){
							arrTemp.push({word: objWord[at].word, correct: true, items: objWord[at].items, relatedWords: objWord[at].relatedWords});
						}

						newResults.push(arrTemp);
					}
					
				}
				
				selectWordsWithSameItems(newResults, true).then(function(arr){
					
					var information = {timeElapsed: (new Date() - time) + " ms"};

					resolve({ suggestions: arr, information: information});

				});

			});
			
		}
	
	});

}


//todo:
//module.exports.getSuggestedItems function(words){...}

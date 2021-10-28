# Node suggestive search
Don't let spelling mistakes prevent your users from finding what they were looking for! 
This node module was built to help type-ahead and dropdown search boxes and also correct misspelled searches (did you mean?).


This module is compatible with:
- Redis Node.JS Client 2.8.0, Client to connect with Redis https://www.npmjs.com/package/redis
- MongoDB Node.JS Driver 2.2.19, Driver to connect with MongoDB http://mongodb.github.io/node-mongodb-native/
- NeDB 1.8.0, The JavaScript Database from Louis Chatriot https://github.com/louischatriot/nedb


## Installation, tests
Module name on npm is "node-suggestive-search".

```
npm install node-suggestive-search --save   # Install the latest version in your project
```

## Example of usage
https://node-suggestive-search.herokuapp.com


## API
* <a href="#Setting-options">Setting options</a>
* <a href="#loading-a-database">Loading a database</a>
* <a href="#searching-for-items">Searching for items</a>
* <a href="#getting-words-suggestions">Getting words suggestions</a>
* <a href="#getting-items-suggestions">Getting items suggestions</a>
* <a href="#insert-items">Insert items</a>
* <a href="#remove-items">Remove items</a>


### Setting options
This module supports Redis, MongoDB and NeDB but you can use an in-memory volatile cache.

Configuration without database (in-memory):
```javascript
var nss = require('node-suggestive-search').init();

```
Configuration without database with cache (in-memory):
```javascript
var nss = require('node-suggestive-search').init({ cache: true });

```
Configuration using Redis: 
```javascript
var nss = require('node-suggestive-search').init(
			{
			dataBase: "redis", 
			redisDatabase: "redis://localhost:6379",
			cache: true
			});

```
Configuration using MongoDB: 
```javascript
var nss = require('node-suggestive-search').init(
			{
			dataBase: "mongodb", 
			mongoDatabase: "mongodb://127.0.0.1:27017/nodeSugestiveSearch",
			cache: true
			});

```
Configuration using NeDB with a datafile: 
```javascript
var nss = require('node-suggestive-search').init(
			{
			dataBase: "nedb", 
			neDbDataPath: "dataFolder",
			neDbInMemoryOnly: false,
			cache: true
			});

```
Configuration using NeDB without a datafile (in-memory): 
```javascript
var nss = require('node-suggestive-search').init(
			{
			dataBase: "nedb", 
			neDbDataPath: "",
			neDbInMemoryOnly: true,
			cache: false
			});

```

There is also an option to include stop-words:
```javascript
var nss = require('node-suggestive-search').init(
			{
			stopWords: ["1033", "1046", ..., __dirname + "\\yourOwnStopWords.json"]
			});
			
//current built-in available stopwords dictionary
//1033 - en-us - English - United States
//1036 - fr-fr - French - France
//1040 - it-it - Italian - Italy
//1046 - pt-br - Portuguese - Brazil
//1048 - ro    - Romanian - Romania
//2057 - en-gb - English - Great Britain
//2070 - pt-pt - Portuguese - Portugal

```


The "cache" option enables an in-memory copy of the data structure boosting the performance. Turn off this option if you have more than one instance accessing the same database. 


### Loading a database
Build a dictionary composed by items and words that need to be searched. 

Example of a JSON to be imported (Items.json): 
```javascript
[  
   {  
      "itemName":"WHISKY RED LABEL",
      "itemId":"1",
      "keywords":"FANCY" 
   },
   {  
      "itemName":"WHISKY BLACK LABEL",
      "itemId":"2",
      "keywords":"EXPENSIVE"
   },
   {  
      "itemName":"BLACK FOREST LABELY HAM L/S",
      "itemId":"3"
   },
   {  
      "itemName":"PESTO PARMESAN HAM",
      "itemId":"4"
   },
   {  
      "itemName":"DELI SWEET SLICE SMOKED HAM",
      "itemId":"5"
   }  
]
```

Load the JSON from file
```javascript
//you can change the charset to match your file
nss.loadJson("Items.json", "utf8").then(data => {
	// response: { words: 17, items: 5, timeElapsed: '4ms' }
});

```

Load the JSON from file with your properties names
```javascript

nss.loadJson("Items.json", "utf8", "itemId", "itemName", "keywords").then(data => {
	// response: { words: 17, items: 5, timeElapsed: '3ms' }
});

```

Load the JSON from string
```javascript

let jSonString = `[{"itemName":"WHISKY RED LABEL", "itemId":"1", "keywords": "fancy"},{  
					"itemName":"WHISKY BLACK LABEL", "itemId":"2"}]`;

nss.loadJsonString(jSonString).then(data => {
	// response: { words: 5, items: 2, timeElapsed: '1ms' }
});

```

Load the JSON from string with additional fields (price, popularity and thumbImg). You can insert any additional field excluding itemId, itemName and keywords.
```javascript

let jSonString = `[{"itemName":"WHISKY RED LABEL", "itemId":"1", "keywords":"fancy", "price":25.57, "popularity":1, "thumbImg":"whisky-red-label.png"},{  
					"itemName":"WHISKY BLACK LABEL", "itemId":"2", "price":19.99, "popularity":0.9, "thumbImg":"whisky-black-label.png"}]`;

nss.loadJsonString(jSonString).then(data => {
	// response: { words: 5, items: 2, timeElapsed: '2ms' }
});

```


Load the JSON from string with your properties names
```javascript

let jSonString = `[{"nm":"WHISKY RED LABEL", "id":"1", "kw": "fancy"},{  
					"nm":"WHISKY BLACK LABEL", "id":"2"}]`;

nss.loadJsonString(jSonString, "id", "nm", "kw").then(data => {
	// response: { words: 5, items: 2, timeElapsed: '2ms' }
});

```

Load the JSON from string with your properties names and additional fields (price, popularity and thumbImg). You can insert any additional field excluding itemId, itemName and keywords.
```javascript

let jSonString = `[{"nm":"WHISKY RED LABEL", "id":"1", "kw":"fancy", "price":25.57, "popularity":1, "thumbImg":"whisky-red-label.png"},{  
					"nm":"WHISKY BLACK LABEL", "id":"2", "price":19.99, "popularity":0.9, "thumbImg":"whisky-black-label.png"}]`;

nss.loadJsonString(jSonString, "id", "nm", "kw").then(data => {
	// response: { words: 5, items: 2, timeElapsed: '2ms' }
});

```




### Searching for items
Getting itemsId from searched words.

Examples of how to call the api and responses:
```javascript

nss.query("whisky").then(data => {
	//response:  { query: 'whisky', words: [ 'whisky' ], missingWords: [], expressions: [], missingExpressions: [], itemsId: [ '1', '2' ], timeElapsed: '1ms' }
});

//did you mean search result with misspelled search criteria
nss.query("wisk").then(data => {
	//response: { query: 'wisk', words: [ 'whisky' ], missingWords: ['wisk'], expressions: [], missingExpressions: [], itemsId: [ '1', '2' ], timeElapsed: '1ms' }
});

//did you mean search result with misspelled search criteria
nss.query("wisk read lbel").then(data => {
	//response: { query: 'Wisk Read Labl', words: [ 'Whisky', 'Red', 'Label' ], missingWords: ['Wisk', 'Read', 'Labl'], expressions: [], missingExpressions: [], itemsId: [ '1' ], timeElapsed: '2ms' }
});

//query with paramenter returnItemsJson = true  
nss.query("whisky", true).then(data => {
	/*response:  { query: 'whisky', words: [ 'whisky' ], missingWords: [], expressions: [], missingExpressions: [], 
		[ 
			{ itemName: 'WHISKY RED LABEL', itemId: '1', keywords: 'fancy' },
			{ itemName: 'WHISKY BLACK LABEL', itemId: '2' } 
		], 
		timeElapsed: '1ms' }
	*/
});

//query with paramenter returnItemsJson = true and ordering by popularity, desc using an object on a database loaded with additional fields
let orderByObject = {field: "popularity", direction: "desc"};

nss.query("whisky", true, orderByObject).then(data => {
	/*response:  { query: 'whisky', words: [ 'whisky' ], missingWords: [], expressions: [], missingExpressions: [], 
		[ 
			{ itemName: 'WHISKY RED LABEL', itemId: '1', keywords: 'fancy', price: 25.57, popularity: 1, thumbImg: 'whisky-red-label.png' },
			{ itemName: 'WHISKY BLACK LABEL', itemId: '2', price: 19.99, popularity: 0.9, thumbImg: 'whisky-black-label.png' } 
		], 
		timeElapsed: '1ms' }
	*/
});

//query with paramenter returnItemsJson = true and ordering by popularity, desc using a function on a database loaded with additional fields
let orderByFunc = ((x, y) => { return x.popularity < y.popularity; });

nss.query("whisky", true, orderByFunc).then(data => {
	/*response:  { query: 'whisky', words: [ 'WHISKY' ], missingWords: [], expressions: [], missingExpressions: [], 
		[ 
			{ itemName: 'WHISKY RED LABEL', itemId: '1', keywords: 'fancy', price: 25.57, popularity: 1, thumbImg: 'whisky-red-label.png' },
			{ itemName: 'WHISKY BLACK LABEL', itemId: '2', price: 19.99, popularity: 0.9, thumbImg: 'whisky-black-label.png' } 
		], 
		timeElapsed: '1ms' }
	*/
});

//quoted search criteria
nss.query("'red label'").then(data => {
	//response: { query: '\'RED LABEL\'', words: [ 'RED', 'LABEL' ], missingWords: [], expressions: [ 'RED LABEL' ], missingExpressions: [], itemsId: [ '1' ], timeElapsed: '1ms' }
});

//quoted search criteria
nss.query("'label red'").then(data => {
	//response: { query: '\'label red\'', words: [ 'label', 'red' ], missingWords: [], expressions: [], missingExpressions: [ 'label red' ], itemsId: [ '1' ], timeElapsed: '2ms' }
});

//dashed search criteria
nss.query("Red-Blood").then(data => {
	//response: { query: 'Red-Blood', words: [ 'Red' ], missingWords: [ 'Blood' ], expressions: [], missingExpressions: [ 'Red-Blood' ], itemsId: [ '1' ], timeElapsed: '2ms' }
});

//slashed search criteria
nss.query("HAM L/S").then(data => {
	//response: { query: 'HAM L/S', words: [ 'HAM', 'L', 'S' ], missingWords: [], expressions: [ 'L/S' ], missingExpressions: [], itemsId: [ '3' ], timeElapsed: '2ms' }
});

//double quoted search criteria
nss.query("\"HAM L/S\"").then(data => {
	//response: { query: '"HAM L/S"', words: [ 'HAM', 'L', 'S' ], missingWords: [], expressions: [ 'HAM L/S' ], missingExpressions: [], itemsId: [ '3' ], timeElapsed: '2ms' }
});

  
```


### Getting words suggestions
Getting words suggestions to fill dropdown boxes or type-ahead text fields.

Examples of how to call the api and responses:
```javascript

nss.getSuggestedWords("La").then(data => {
	//response: { suggestions: [ 'Label', 'Labely' ], timeElapsed: '1ms' }
});

nss.getSuggestedWords("whi").then(data => {
	//response: { suggestions: [ 'whisky label', 'whisky red', 'whisky black' ], timeElapsed: '1ms' }
});

nss.getSuggestedWords("whisky re").then(data => {
	//response: { suggestions: [ 'whisky red' ], timeElapsed: '2ms' }
});
  
```



### Getting items suggestions
Getting items suggestions to fill dropdown boxes or type-ahead text fields.

Examples of how to call the api and responses:
```javascript

nss.getSuggestedItems("PARME").then(data => {
	//response: { items: [ { itemId: '4', itemName: 'PESTO PARMESAN HAM' } ], timeElapsed: '2ms' }
});

nss.getSuggestedItems("Whisky fancy").then(data => {
	//response: { items: [ { itemId: '1', itemName:'WHISKY RED LABEL' } ], timeElapsed: '1ms' }
});

nss.getSuggestedItems("whisky re").then(data => {
	//response: { items:[ { itemId: '1', itemName: 'WHISKY RED LABEL' } ], timeElapsed: '1ms' }
});

nss.getSuggestedItems("whisky label").then(data => {
	//response: { items: [ {itemId: '1', itemName: 'WHISKY RED LABEL' }, { itemId: '2', itemName: 'WHISKY BLACK LABEL' } ], timeElapsed: '2ms' }
});

//get one item suggestions ordering by price, asc using a function and omitting the direction.
let orderByObject = {field: "price"};

nss.getSuggestedItems("whisky label", 1, orderByObject).then(data => {
	//response: { items: [ { itemName: 'WHISKY BLACK LABEL', itemId: '2', price: 19.99, popularity: 0.9, thumbImg: 'whisky-black-label.png' } ], timeElapsed: '2ms' }
});
  
//get one item suggestions ordering by price, asc using a function.
let orderByFunc = ((x, y) => { return x.price > y.price; });

nss.getSuggestedItems("whisky label", 1, orderByFunc).then(data => {
	//response: { items: [ { itemName: 'WHISKY BLACK LABEL', itemId: '2', price: 19.99, popularity: 0.9, thumbImg: 'whisky-black-label.png' } ], timeElapsed: '2ms' }
});
  
  
```


### Insert items
Insert a new item into the database.

Examples of how to call the api and responses:
```javascript

let newItem = {  
	"itemId": "VODKA ABSOLUT",
	"itemName": "6",
	"keywords": "Keyword1, keyword2..."
	};

nss.insertItem(newItem).then(data => {
	//response: { timeElapsed: '2ms' }
});

```

Insert an item with your properties names.
```javascript

let newItem = {  
	"id": "VODKA ABSOLUT",
	"nm": "6",
	"kw": "Keyword1, keyword2..."
	};

nss.insertItem(newItem, "id", "nm", "kw").then(data => {
	//response: { timeElapsed: '2ms' }
});

```

Insert an item with additional fields (price, popularity and thumbImg). You can insert any additional field excluding itemId, itemName and keywords.
```javascript

let newItem = {  
	"itemId": "VODKA ABSOLUT",
	"itemName": "6",
	"keywords": "Keyword1, keyword2...",
	"price": 25.57,
	"popularity": 1,
	"thumbImg": "vodka-absolute.png"
	};

nss.insertItem(newItem).then(data => {
	//response: { timeElapsed: '2ms' }
});

```


### Remove items
Remove an item from the database.

Examples of how to call the api and responses:
```javascript

let itemId = "6";

nss.removetItem(itemId).then(data => {
	//response: { timeElapsed: '2ms' }
});

```


## Roadmap
* Catalog (several dictionaries)
* More databases support
* Inject your database plugin
* Browser version.
* Translate JS to TS 

## Pull requests
If you submit a pull request, thanks! There are a couple of rules to follow to make it manageable:
* The pull request should be atomic, i.e. contain only one feature. If it contains more, please submit multiple pull requests.
* Please stick to the current coding style. It's important that the code uses a coherent style for readability.
* Update the readme accordingly.
* Last but not least: The goal here is simplicity.


## Bug reporting guidelines
If you report a bug, thank you! That said for the process to be manageable please strictly adhere to the following guidelines. I'll not be able to handle bug reports that don't:
* Your bug report should be a self-containing project with a package.json for any dependencies you need. I need to run through a simple `npm install; node bugreport.js`.
* It should use assertions to showcase the expected vs actual behavior.
* Simplify as much as you can. Strip all your application-specific code.
* Please explain precisely in the issue.
* The code should be Javascript.


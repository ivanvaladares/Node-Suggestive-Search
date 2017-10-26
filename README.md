# Node suggestive search
A node module to help type-ahead and dropdown search boxes and also correct misspelled searches (did you mean?).


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
https://ivanvaladares.herokuapp.com

## Playground on Runkit
https://runkit.com/ivanvaladares/node-suggestive-search-1.9.0


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

The "cache" option enables an in-memory copy of the data structure boosting the performance. If you have more than one instance accessing the same database, turn off this option. 


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

nss.loadJson("Items.json", "utf8").then( //you can change the charset to match your file
	data => {
		// response: { "words": 17, "items": 5, "timeElapsed": 4 }
	},
	err => {
		//...
	}
);

```

Load the JSON from file with your properties names
```javascript

nss.loadJson("Items.json", "utf8", "itemId", "itemName", "keywords").then(
	data => {
		// response: { "words": 17, "items": 5, "timeElapsed": 3 }
	},
	err => {
		//...
	}
);

```

Load the JSON from string
```javascript

let jSonString = `[{"itemName":"WHISKY RED LABEL", "itemId":"1", "keywords": "fancy"},{  
					"itemName":"WHISKY BLACK LABEL", "itemId":"2"}]`;

nss.loadJsonString(jSonString).then(
	data => {
		// response: { "words": 5, "items": 2, "timeElapsed": 1 }
	},
	err => {
		//...
	}
);

```

Load the JSON from string with additional fields (price, popularity and thumbImg). You can insert any additional field excluding itemId, itemName and keywords.
```javascript

let jSonString = `[{"itemName":"WHISKY RED LABEL", "itemId":"1", "keywords":"fancy", "price":25.57, "popularity":1, "thumbImg":"whisky-red-label.png"},{  
					"itemName":"WHISKY BLACK LABEL", "itemId":"2", "price":19.99, "popularity":0.9, "thumbImg":"whisky-black-label.png"}]`;

nss.loadJsonString(jSonString).then(
	data => {
		// response: { "words": 5, "items": 2, "timeElapsed": 2 }
	},
	err => {
		//...
	}
);

```


Load the JSON from string with your properties names
```javascript

let jSonString = `[{"nm":"WHISKY RED LABEL", "id":"1", "kw": "fancy"},{  
					"nm":"WHISKY BLACK LABEL", "id":"2"}]`;

nss.loadJsonString(jSonString, "id", "nm", "kw").then(
	data => {
		// response: { "words": 5, "items": 2, "timeElapsed": 2 }
	},
	err => {
		//...
	}
);

```

Load the JSON from string with your properties names and additional fields (price, popularity and thumbImg). You can insert any additional field excluding itemId, itemName and keywords.
```javascript

let jSonString = `[{"nm":"WHISKY RED LABEL", "id":"1", "kw":"fancy", "price":25.57, "popularity":1, "thumbImg":"whisky-red-label.png"},{  
					"nm":"WHISKY BLACK LABEL", "id":"2", "price":19.99, "popularity":0.9, "thumbImg":"whisky-black-label.png"}]`;

nss.loadJsonString(jSonString, "id", "nm", "kw").then(
	data => {
		// response: { "words": 5, "items": 2, "timeElapsed": 2 }
	},
	err => {
		//...
	}
);

```




### Searching for items
Getting itemsId from searched words.

Examples of how to call the api and responses:
```javascript

nss.query("whisky").then(
	data => {
		//response:  { query: 'whisky', words: [ 'WHISKY' ], missingWords: [], expressions: [], missingExpressions: [], itemsId: [ '1', '2' ], timeElapsed: 1 }
	},
	err => {
		//...
	}
);

//did you mean search result
nss.query("wisk").then( //misspelled search criteria
	data => {
		//response: { query: 'wisk', words: [ 'WHISKY' ], missingWords: [], expressions: [], missingExpressions: [], itemsId: [ '1', '2' ], timeElapsed: 1 }
	},
	err => {
		//...
	}
);

//did you mean search result
nss.query("wisk read lbel").then( //misspelled search criteria
	data => {
		//response: { query: 'wisk read labl', words: [ 'WHISKY', 'RED', 'LABEL' ], missingWords: [], expressions: [], missingExpressions: [], itemsId: [ '1' ], timeElapsed: 2 }
	},
	err => {
		//...
	}
);

//query with paramenter returnItemsJson = true  
nss.query("whisky", true).then(
	data => {
		/*response:  { query: 'whisky', words: [ 'WHISKY' ], missingWords: [], expressions: [], missingExpressions: [], 
			[ 
				{ itemName: 'WHISKY RED LABEL', itemId: '1', keywords: 'fancy' },
				{ itemName: 'WHISKY BLACK LABEL', itemId: '2' } 
			], 
			timeElapsed: 1 }
			*/
	},
	err => {
		//...
	}
);

//query with paramenter returnItemsJson = true and ordering function (popularity desc) on a database loaded with additional fields
let orderFunc = ((x, y) => { return x.popularity < y.popularity; });

nss.query("whisky", true, orderFunc).then(
	data => {
		/*response:  { query: 'whisky', words: [ 'WHISKY' ], missingWords: [], expressions: [], missingExpressions: [], 
			[ 
				{ itemName: 'WHISKY RED LABEL', itemId: '1', keywords: 'fancy', price: 25.57, popularity: 1, thumbImg: 'whisky-red-label.png' },
				{ itemName: 'WHISKY BLACK LABEL', itemId: '2', price: 19.99, popularity: 0.9, thumbImg: 'whisky-black-label.png' } 
			], 
			timeElapsed: 1 }
			*/
	},
	err => {
		//...
	}
);

//quoted search criteria
nss.query("'red label'").then(
	data => {
		//response: { query: '\'red label\'', words: [ 'RED', 'LABEL' ], missingWords: [], expressions: [ 'red label' ], missingExpressions: [], itemsId: [ '1' ], timeElapsed: 1 }
	},
	err => {
		//...
	}
);

//quoted search criteria
nss.query("'label red'").then(
	data => {
		//response: { query: '\'label red\'', words: [ 'LABEL', 'RED' ], missingWords: [], expressions: [], missingExpressions: [ 'label red' ], itemsId: [ '1' ], timeElapsed: 2 }
	},
	err => {
		//...
	}
);

//dashed search criteria
nss.query("Red-Blood").then(
	data => {
		//response: { query: 'Red-Blood', words: [ 'RED' ], missingWords: [ 'Blood' ], expressions: [], missingExpressions: [ 'Red-Blood' ], itemsId: [ '1' ], timeElapsed: 2 }
	},
	err => {
		//...
	}
);

//slashed search criteria
nss.query("HAM L/S").then(
	data => {
		//response: { query: 'HAM L/S', words: [ 'HAM', 'L', 'S' ], missingWords: [], expressions: [ 'L/S' ], missingExpressions: [], itemsId: [ '3' ], timeElapsed: 2 }
	},
	err => {
		//...
	}
);

//double quoted search criteria
nss.query("\"HAM L/S\"").then(
	data => {
		//response: { query: '"HAM L/S"', words: [ 'HAM', 'L', 'S' ], missingWords: [], expressions: [ 'HAM L/S' ], missingExpressions: [], itemsId: [ '3' ], timeElapsed: 2 }
	},
	err => {
		//...
	}
);

  
```


### Getting words suggestions
Getting words suggestions to fill dropdown boxes or type-ahead text fields.

Examples of how to call the api and responses:
```javascript

nss.getSuggestedWords("la").then(
	data => {
		//response: { "suggestions": [ "LABEL", "LABELY" ], "timeElapsed": 1 }
	},
	err => {
		//...
	}
)

nss.getSuggestedWords("whi").then(
	data => {
		//response: { "suggestions": [ "WHISKY LABEL", "WHISKY RED", "WHISKY BLACK" ], "timeElapsed": 1 }
	},
	err => {
		//...
	}
)

nss.getSuggestedWords("whisky re").then(
	data => {
		//response: { "suggestions": [ "WHISKY RED" ], "timeElapsed": 2 }
	},
	err => {
		//...
	}
)
  
```



### Getting items suggestions
Getting items suggestions to fill dropdown boxes or type-ahead text fields.

Examples of how to call the api and responses:
```javascript

nss.getSuggestedItems("parme").then(
	data => {
		//response: { "items": [ { "itemId": "4", "itemName": "PESTO PARMESAN HAM" } ], "timeElapsed": 2 }
	},
	err => {
		//...
	}
)

nss.getSuggestedItems("whisky fancy").then(
	data => {
		//response: { "items": [ { "itemId": "1", "itemName":"WHISKY RED LABEL" } ], "timeElapsed": 1 }
	},
	err => {
		//...
	}
)

nss.getSuggestedItems("whisky re").then(
	data => {
		//response: { "items":[ { "itemId": "1", "itemName": "WHISKY RED LABEL" } ], "timeElapsed": 1 }
	},
	err => {
		//...
	}
)

nss.getSuggestedItems("whisky label").then(
	data => {
		//response: { "items": [ {"itemId": "1", "itemName": "WHISKY RED LABEL" }, { "itemId": "2", "itemName": "WHISKY BLACK LABEL" } ], "timeElapsed": 2 }
	},
	err => {
		//...
	}
)

//get one item suggestions ordering by price (asc).
let orderFunc = ((x, y) => { return x.price > y.price; });

nss.getSuggestedItems("whisky label", 1, orderFunc).then(
	data => {
		//response: { "items": [ { itemName: 'WHISKY BLACK LABEL', itemId: '2', price: 19.99, popularity: 0.9, thumbImg: 'whisky-black-label.png' } ], "timeElapsed": 2 }
	},
	err => {
		//...
	}
)
  
  
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

nss.insertItem(newItem).then(
	data => {
		//response: { "timeElapsed": 2 }
	},
	err => {
		//...
	}
);

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

nss.insertItem(newItem).then(
	data => {
		//response: { "timeElapsed": 2 }
	},
	err => {
		//...
	}
);

```


### Remove items
Remove an item from the database.

Examples of how to call the api and responses:
```javascript

let itemId = "6";

nss.removetItem(itemId).then(
	data => {
		//response: { "timeElapsed": 2 }
	},
	err => {
		//...
	}
);

```


## Roadmap
* catalog (several dictionaries)
* More databases support
* Inject your database plugin
* filter stopwords
* Browser version.


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


## License 
See [License](LICENSE)

# Node suggestive search
A node module to help type-ahead and dropdown search boxes and also correct misspelled searches (did you mean?).


This module requires:
- NeDB 1.8.0, The JavaScript Database from Louis Chatriot https://github.com/louischatriot/nedb
- MongoDB Node.JS Driver 2.2.19, Driver to connect with MongoDB 3.2 http://mongodb.github.io/node-mongodb-native/

## Installation, tests
Module name on npm is "node-suggestive-search".

```
npm install node-suggestive-search --save   # Put latest version in your package.json
```


## Example of usage
http://node-suggestive-search.azurewebsites.net/


## API
* <a href="#Setting-options">Setting options</a>
* <a href="#loading-a-database">Loading a database</a>
* <a href="#searching-for-items">Searching for items</a>
* <a href="#getting-words-suggestions">Getting words suggestions</a>
* <a href="#getting-items-suggestions">Getting items suggestions</a>
* <a href="#insert-items">Insert items</a>
* <a href="#remove-items">Remove items</a>


### Setting options
This module supports MongoDB and NeDB. You must set this options in order to use this module. 

Here is an example of a configuration to use MongoDB: 
```javascript
var nss = require('node-suggestive-search').init(
			{
			dataBase: "mongodb", 
			mongoDatabase: "mongodb://127.0.0.1:27017/nodeSugestiveSearch"
			});

```
Here is an example of a configuration to use NeDB with a datafile: 
```javascript
var nss = require('node-suggestive-search').init(
			{
			dataBase: "nedb", 
			neDbDataPath: path.join(__dirname, "..", "data"),
			neDbInMemoryOnly: false
			});

```
Here is an example of a configuration to use NeDB without a datafile (in memory): 
```javascript
var nss = require('node-suggestive-search').init(
			{
			dataBase: "nedb", 
			neDbDataPath: "",
			neDbInMemoryOnly: true
			});

```

### Loading a database
It uses an in-memory database to build a dictionary composed by itens and words that need to be searched. 

Here is an example of a JSON to be imported (Itens.json): 
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
      "itemName":"BLACK FOREST BEECHWOOD HAM L/S",
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

nss.loadJson("Itens.json", "utf8").then( //you can change the charset to match your file
	data => {
		// response: {"words":16,"items":6,"timeElapsed":15}
	},
	err => {
		//...
	}
);

```

Load the JSON from file with your own poperties names
```javascript

nss.loadJson("Itens.json", "utf8", "itemId", "itemName", "keywords").then(
	data => {
		// response: {"words":16,"items":6,"timeElapsed":15}
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
		// response: {"words":16,"items":6,"timeElapsed":17}
	},
	err => {
		//...
	}
);

```

Load the JSON from string with your own poperties names
```javascript

let jSonString = `[{"nm":"WHISKY RED LABEL", "id":"1", "kw": "fancy"},{  
					"nm":"WHISKY BLACK LABEL", "id":"2"}]`;

nss.loadJsonString(jSonString, "id", "nm", "kw").then(
	data => {
		// response: {"words":16,"items":6,"timeElapsed":17}
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
		//response: {"query":"whisky","words":["WHISKY"],"itemsId":["1","2"],"timeElapsed":1}
	},
	err => {
		//...
	}
);

//did you mean search result
nss.query("wisk").then( //misspelled search criteria
	data => {
		//response: {"query":"wisk","words":["WHISKY"],"itemsId":["1","2"],"timeElapsed":1}
	},
	err => {
		//...
	}
);

//did you mean search result
nss.query("wisk read lbel").then( //misspelled search criteria
	data => {
		//response: {"query":"wisk read lbel","words":["WHISKY","RED","LABEL"],"itemsId":["1"],"timeElapsed":4}
	},
	err => {
		//...
	}
);
  
```


### Getting words suggestions
Getting suggestions to fill dropdown boxes or type ahead in text fields.

Examples of how to call the api and responses:
```javascript

nss.getSuggestedWords("whi").then(
	data => {
		//response: {"suggestions":["WHISKY"],"timeElapsed":1}
	},
	err => {
		//...
	}
)

nss.getSuggestedWords("whisky ").then(
	data => {
		//response: {"suggestions":["WHISKY","WHISKY LABEL","WHISKY BLACK","WHISKY RED"],"timeElapsed":1}
	},
	err => {
		//...
	}
)

nss.getSuggestedWords("whisky re").then(
	data => {
		//response: {"suggestions":["WHISKY","WHISKY RED"],"timeElapsed":2}
	},
	err => {
		//...
	}
)
  
```



### Getting items suggestions
Getting suggestions to fill dropdown boxes.

Examples of how to call the api and responses:
```javascript

nss.getSuggestedItems("parme").then(
	data => {
		//response: {"items":[{"itemId":"4","itemName":"PESTO PARMESAN HAM"}],"timeElapsed":2}
	},
	err => {
		//...
	}
)

nss.getSuggestedItems("whisky fancy").then(
	data => {
		//response: {"items":[{"itemId":"1","itemName":"WHISKY RED LABEL"}],"timeElapsed":1}
	},
	err => {
		//...
	}
)

nss.getSuggestedItems("whisky re").then(
	data => {
		//response: {"items":[{"itemId":"1","itemName":"WHISKY RED LABEL"}],"timeElapsed":1}
	},
	err => {
		//...
	}
)

nss.getSuggestedItems("whisky label").then(
	data => {
		//response: {"items":[{"itemId":"1","itemName":"WHISKY RED LABEL"},{"itemId":"2","itemName":"WHISKY BLACK LABEL"}],"timeElapsed":2}
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
	"iName":"VODKA ABSOLUT",
	"iId":"6",
	"iKw":"Keyword1, keyword2..."
	};

nss.insertItem(newItem, "iId", "iName", "iKw").then(
	data => {
		//response: {"timeElapsed":2}
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
		//response: {"timeElapsed":2}
	},
	err => {
		//...
	}
);

```


## Roadmap
* catalog (several dictionaries)
* SQL Server and MySql support
* filter stopwords
* Browser version.


## Pull requests
If you submit a pull request, thanks! There are a couple rules to follow though to make it manageable:
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

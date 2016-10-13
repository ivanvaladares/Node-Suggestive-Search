# node-suggestive-search
A node module to help type-ahead search boxes and also correct misspelled searches.

This module requires NeDB 1.8.0, The JavaScript Database from Louis Chatriot https://github.com/louischatriot/nedb

## API
* <a href="#loading-a-database">Loading a database</a>
* <a href="#getting-suggestions">Getting suggestions</a>
* <a href="#searching-for-items">Searching for items</a>

### Loading a database
It uses an in-memory datastore to build a dictionary composed by itens that needs to be searched. 

Here is an example of a JSON to be imported (Itens.json): 
```javascript
[  
   {  
      "itemName":"WHISKY RED LABEL",
      "itemId":"1"
   },
   {  
      "itemName":"WHISKY BLACK LABEL",
      "itemId":"2"
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

Code to load the JSON
```javascript
var nss = require('node-suggestive-search.js');

nss.loadJson("Itens.json.json").then(
	function(data){
		res.send(JSON.stringify(data)); 
		// response: {"words":15,"items":5,"timeElapsed":"13 ms"}
	},
	function(err){
		res.send("Error: " + err.message);
	}
);

```


### Getting Suggestions
Getting suggestions to fill dropdown boxes or type ahead in text fields.

Examples of how to call the api and responses:
```javascript
var nss = require('node-suggestive-search.js');

nss.getSuggestedWords("whisky").then(
	function (data){
		res.send(JSON.stringify(data));
		//response: {"suggestions":["WHISKY","WHISKY BLACK","WHISKY LABEL","WHISKY RED"],"information":{"timeElapsed":"1 ms"}}
	}
)

nss.getSuggestedWords("whisky re").then(
	function (data){
		res.send(JSON.stringify(data));
		//response: {"suggestions":["WHISKY","WHISKY RED","WHISKY RED LABEL"],"information":{"timeElapsed":"2 ms"}}
	}
)
  
```


### Searching for items
Getting itemsId from searched words.

Examples of how to call the api and responses:
```javascript
var nss = require('node-suggestive-search.js');

nss.query("whisky").then(
	function(data) {
		res.send(JSON.stringify(data));
		//response: {"query":"whisky","words":["WHISKY"],"itemsId":["1","2"],"timeElapsed":"1 ms"}
	},
	function(err){
		res.send("Error: " + err.message);
	}
);

//did you mean search result
nss.query("wisk read lbel").then(
	function(data) {
		res.send(JSON.stringify(data));
		//response: {"query":"wisk read lbel","words":["WHISKY","RED","LABEL"],"itemsId":["1"],"timeElapsed":"4 ms"}
	},
	function(err){
		res.send("Error: " + err.message);
	}
);
  
```


## Pull requests
If you submit a pull request, thanks! There are a couple rules to follow though to make it manageable:
* The pull request should be atomic, i.e. contain only one feature. If it contains more, please submit multiple pull requests.
* Please stick to the current coding style. It's important that the code uses a coherent style for readability.
* Update the readme accordingly.
* Last but not least: The goal here is simplicity.


## Bug reporting guidelines
If you report a bug, thank you! That said for the process to be manageable please strictly adhere to the following guidelines. I'll not be able to handle bug reports that don't:
* Your bug report should be a self-containing gist complete with a package.json for any dependencies you need. I need to run through a simple `git clone gist; npm install; node bugreport.js`.
* It should use assertions to showcase the expected vs actual behavior and be hysteresis-proof.
* Simplify as much as you can. Strip all your application-specific code.
* Please explain precisely in the issue.
* The code should be Javascript.


## License 
See [License](LICENSE)

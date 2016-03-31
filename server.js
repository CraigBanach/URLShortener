'use strict';

var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var validurl = require("valid-url");

var app = express();

app.get("/*", function (req, res) {
    var query = req.params[0];
	
	// parse query
	// if query is number, then search database for route
	if (!isNaN(query)) {
		searchDB({"url-code": +query}, res);
	// if query is a valid web address
	} else if (validurl.isUri(query)) {
		console.log("Looks like a URI");
		
		searchDBforURL("orig-url", query, res);
		// search db for web address
		// if exists give number url
		// if doesnt exist, create new db entry
	} else {
		console.log("Error");
	}
})

function searchDBforURL(queryName, queryValue, res) {
	MongoClient.connect("mongodb://localhost:27017/url_shortener", function(err, db) {
		if (err) throw err;
		var collection = db.collection("urls");
		var query = {};
		query[queryName] = queryValue;
		collection.find(query).toArray(function(err, docs) {
			if (err) throw err;
			if (docs.length === 0) {
				collection.count(function (err, count) {
					if (err) throw err;
					var insertion = {};
					insertion[queryName] = queryValue;
					insertion["url-code"] = count + 1;
					collection.insert(insertion);
					//console.log(count);
					var output = {};
					output["original-url"] = queryValue;
					output["url-code"] = "https://url-shortener-cragsify.c9users.io/" + (count + 1);
					res.end(JSON.stringify(output));
				});
			} else {
				var output = {};
				output["original-url"] = queryValue;
				output["url-code"] = "https://url-shortener-cragsify.c9users.io/" + docs[0]["url-code"];
				res.end(JSON.stringify(output));
			}
			
		})
	});
}

function searchDB(dbQuery, res) {
	MongoClient.connect("mongodb://localhost:27017/url_shortener", function(err, db) {
	    if(err) {
	  		console.log("failed");
	  		throw err;
	    } else {
	  		var collection = db.collection("urls");
	  		collection.find(dbQuery).toArray(function(err, docs) {
	  			if (err) throw err;
	  			if (docs.length === 0) {
	  				res.end(JSON.stringify({error: "There was no url corresponding to that code found"}));
	  			} else {
					var output = {};
					output["original-url"] = docs[0]["orig-url"];
					output["url-code"] = "https://url-shortener-cragsify.c9users.io/" + docs[0]["url-code"];
					res.redirect(docs[0]["orig-url"]);
	  			}
	  			db.close();
	  		});
		}
	});
}

var port = process.env.PORT || 8080;
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});

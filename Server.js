var express = require("express");
var app = express();

app.get("/*", function (req, res) {
    var query = req.params[0];
    console.log(query);
 //you need add next, otherwise your query will hang there
})

var port = process.env.PORT || 8080;
app.listen(port,  function () {
    console.log('Node.js listening on port ' + port + '...');
});
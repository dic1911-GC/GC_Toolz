var shell = require('shelljs')
var fs = require('fs')
var code = require('urlencode')

var date = shell.exec("date --rfc-3339=date").stdout.split("\n")[0]
shell.exec("touch date");
if(fs.readFileSync("date", 'utf8') == date){
	console.log("Already Updated. Abort.")
	process.exit()
}


var cmd = "curl 'http://gc.kt-flcl.com/json/ranking.php?type=pref&id=158'"
var data = JSON.parse(shell.exec(cmd).stdout);

//file header
var buffer = data.name + "@" + data.date + "\n\n"

//ranking
data = data.ranking
for(i=0; i<data.length; i++){
	buffer = buffer + data[i].rank + "." + code.decode(code.decode(data[i].name)) + "(" + data[i].all_rank + ")  ["
	buffer = buffer + code.decode(code.decode(data[i].title)) + "]  Score: " + data[i].score + "\n"
}

fs.writeFileSync(date + ".txt", buffer)
fs.writeFileSync("date", date)

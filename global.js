var shell = require('shelljs')
var fs = require('fs')
var xml = require('libxmljs')
var code = require('urlencode')

var date = shell.exec("date --rfc-3339=date").stdout.split("\n")[0]
var cmd = ["curl -o ", "'http://groovecoaster.jp/xml/fmj2100/rank/all/rank_", ".xml' --silent"]

shell.exec("mkdir " + date);
shell.exec("mkdir " + date + "/xml");
for(i=1; i<11; i++){
	console.log("Fetching global top 1000 list... [" + i + "/10]")
	shell.exec(cmd[0] + date + "/xml/" + i + " " + cmd[1] + i + cmd[2])
}

var buf1 = '', buf2 = '', buffer = '', buf_full = ''
var area_ls = [], area_2_player = []
for(ii=1; ii<11; ii++){
	shell.exec("mkdir " + date + "/" + ii)
}
shell.exec("mkdir " + date + "/100");
shell.exec("mkdir " + date + "/orp");

for(i=1; i<11; i++){
	console.log("Parsing xml... ["+ i +"/10]")
	
	var data = xml.parseXmlString(fs.readFileSync(date + "/xml/" + i.toString(), 'utf8'))
	for(ii=1; ii<101; ii++){
		var rank = data.get('/results/data['+ii+']/rank').text()
		var rank_real = data.get('/results/data['+ii+']/rank2').text()
		var player = code.decode(data.get('/results/data['+ii+']/player_name').text())
		var title = data.get('/results/data['+ii+']/title').text()
		var score = data.get('/results/data['+ii+']/score_bi1').text()
		var site = data.get('/results/data['+ii+']/tenpo_name').text()
		var site_id = data.get('/results/data['+ii+']/last_play_tenpo_id').text()
		var area = data.get('/results/data['+ii+']/area').text()
		var area_id = data.get('/results/data['+ii+']/area_id').text()
		var region = data.get('/results/data['+ii+']/pref').text()
		var region_id = data.get('/results/data['+ii+']/pref_id').text()
		
		var cur = rank + ". " + player + " [" + title + "]    [" + site + "@" + region + "@" + area + "] Score: " + score
		var cur_f = "rank:" + rank + "(" + rank_real + ")\ntitle: " + title + "\nsite: " + site + "\nscore: " + score + "\nregion: " + region + "(ID: " + region_id + ")\narea: " + area + "(ID: " + area_id + ")\n\n"
		//console.log(cur)
		cur += "\n"
		buffer += cur
		buf_full += cur_f
		if(area_id >= 100){
			buf1 += cur
		}else{
			buf2 += cur
		}
		
		//area sheet?
		var index = area_ls.indexOf(region_id)
		if(index == -1){
			area_ls.push(region_id)
			area_2_player.push([rank]);
		}else{
			area_2_player[index].push(rank);
		}
	}
}

fs.writeFileSync(date + "/data.txt", buffer)
fs.writeFileSync(date + "/full.txt", buf_full)
fs.writeFileSync(date + "/oversea.txt", buf1)
fs.writeFileSync(date + "/japan.txt", buf2)
var t1k = buffer.split('\n')
for(ii=0; ii<area_ls.length; ii++){
	console.log("Parsing player area [" + (ii+1) + "/" + area_ls.length + "] ID: "+area_ls[ii])
	var areabuf = ''
	var tmp = ''
	
	for(iii=0; iii<area_2_player[ii].length; iii++){
		tmp = t1k[(area_2_player[ii][iii]-1)]
		if(tmp != undefined){
			areabuf = areabuf + tmp + '\n'
		}
	}
	if(area_ls[ii] == 1){
		var name = date + "/1/" + area_ls[ii].toString() + ".txt"
		fs.writeFileSync(name, areabuf);
	}else if(area_ls[ii] > 1 && area_ls[ii] <= 7){
		var name = date + "/2/" + area_ls[ii].toString() + ".txt"
		fs.writeFileSync(name, areabuf);
	}else if(area_ls[ii] > 7 && area_ls[ii] <= 15){
		var name = date + "/3/" + area_ls[ii].toString() + ".txt"
		fs.writeFileSync(name, areabuf);
	}else if(area_ls[ii] > 15 && area_ls[ii] <= 17){
		var name = date + "/4/" + area_ls[ii].toString() + ".txt"
		fs.writeFileSync(name, areabuf);
	}else if(area_ls[ii] > 17 && area_ls[ii] <= 20){
		var name = date + "/5/" + area_ls[ii].toString() + ".txt"
		fs.writeFileSync(name, areabuf);
	}else if(area_ls[ii] > 20 && area_ls[ii] <= 24){
		var name = date + "/6/" + area_ls[ii].toString() + ".txt"
		fs.writeFileSync(name, areabuf);
	}else if(area_ls[ii] > 24 && area_ls[ii] <= 30){
		var name = date + "/7/" + area_ls[ii].toString() + ".txt"
		fs.writeFileSync(name, areabuf);
	}else if(area_ls[ii] > 30 && area_ls[ii] <= 35){
		var name = date + "/8/" + area_ls[ii].toString() + ".txt"
		fs.writeFileSync(name, areabuf);
	}else if(area_ls[ii] > 35 && area_ls[ii] <= 39){
		var name = date + "/9/" + area_ls[ii].toString() + ".txt"
		fs.writeFileSync(name, areabuf);
	}else if(area_ls[ii] > 39 && area_ls[ii] <= 46){
		var name = date + "/10/" + area_ls[ii].toString() + ".txt"
		fs.writeFileSync(name, areabuf);
	}else if(area_ls[ii] >= 100){
		var name = date + "/100/" + area_ls[ii].toString() + ".txt"
		fs.writeFileSync(name, areabuf);
	}else{
		var name = date + "/orp/" + area_ls[ii].toString() + ".txt"
		fs.writeFileSync(name, areabuf);
	}
}
console.log("Done!")

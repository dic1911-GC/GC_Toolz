var fs = require('fs');
var shell = require('shelljs');
//var shellescape = require('shell-escape');

var debug = true;
var local = false;
var sessionID = [""]; //set your cookie here, F12, network tab is your friend ;)
var output = "full.csv" //set output filename here;

var url = ["http://mypage.groovecoaster.jp/sp/json/music_list.php",
	"http://mypage.groovecoaster.jp/sp/json/music_detail.php?music_id="];
var cmd = ['curl -o ', ' -H \'DNT: 1\' -H \'Accept-Encoding: gzip, deflate, sdch, br\' -H \'Accept-Language: en-US,en;q=0.8\' -H \'Upgrade-Insecure-Requests: 1\' -H \'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36\' -H \'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8\' -H \'Cache-Control: max-age=0\' -H \'Cookie: PHPSESSID=', '\' -H \'Connection: keep-alive\' --compressed'];

console.log("Grabbing teh list...");
//shellescape(sessionID);

if(debug){
	console.log(cmd[0] + "music_list " + url[0] + cmd[1] + sessionID + cmd[2]);
}
if(!local){
	shell.exec(cmd[0] + "music_list " + url[0] + cmd[1] + sessionID + cmd[2]);
}
console.log("Parsing teh list...");
var list = JSON.parse(fs.readFileSync('music_list', 'utf8'));
console.log("status: " + list.status);
console.log();

console.log("Downloading all teh score...");
var id_list = [];
music_list = list.music_list;
var size = music_list.length;
console.log("You have played " + size + " Songs on Groove Coaster...");
shell.exec("mkdir tmp");
for(i = 0; i < size; i++){
	console.log(i+1 + "/" + size + " " + music_list[i].music_title);
	if(!local){
		if(debug){
			console.log(cmd[0] + "tmp/" + music_list[i].music_id + " " + url[1] + music_list[i].music_id + cmd[1] + sessionID + cmd[2]);
		}
		shell.exec(cmd[0] + "tmp/" + music_list[i].music_id + " " + url[1] + music_list[i].music_id + cmd[1] + sessionID + cmd[2]);
	}
	id_list.push(music_list[i].music_id);
}

console.log("Parsing all teh score...");
var sc;
var current;
var buffer="";
var id;
var stat;
//header for teh output csv, [INFO],{4xdiff}[mark, rating, score, chain, play count, rank]
fs.writeFileSync(output, 'id,song,artist,simple_mk,simple_rt,simple_sc,sp_chain,simple_pc,sp_rank,normal_mk,normal_rt,normal_sc,nm_chain,normal_pc,nm_rank,hard_mk,hard_rt,hard_sc,hd_chain,hard_pc,hd_rank,extra_mk,extra_rt,extra_sc,ex_chain,extra_pc,ex_rank\n');
for(i=0; i < size; i++){
	id = id_list.pop();
	sc = JSON.parse(fs.readFileSync('tmp/'+id, 'utf8'));
	if(sc.status == 0){
		sc = sc.music_detail;
	}else{
		console.log("Error while parsing song_id=" + id + ", ignoring...");
		continue;
	}
	var cur = i+1;
	console.log("[" + cur + "/" + size + "]" + id + ". " + sc.music_title);
	
	//fix "quote" in names
	var title = '"';
	var artist = "";
	var quote = [false,false];
	for(ii=0; ii < sc.music_title.length; ii++){
		if(sc.music_title[ii] == '"'){
			quote[0] = true
			title = title + '""';
		}else{
			title += sc.music_title[ii];
		}
	}
	title += '"';
	for(ii=0; ii < sc.artist.length; ii++){
		if(sc.artist[ii] == '"'){
			quote[1] = true;
			artist = artist + '""';
		}else{
			artist += sc.artist[ii];
		}
	}
	artist += '"';
	if(quote[0] && quote[1]){ //iNFO
		current = sc.music_id + ',' + title + ',' + artist + ',';
	}else if(quote[0] && !quote[1]){
		current = sc.music_id + ',' + title + '","' + sc.artist + '",';
	}else if(!quote[0] && quote[1]){
		current = sc.music_id + ',' + sc.music_title + '","' + artist + '",';
	}else{
		current = sc.music_id + ',"' + sc.music_title + '","' + sc.artist + '",';
	}
	//simple
	if(sc.simple_result_data == null){
		current += ",,,,,,";
	}else{
		stat = true;
		if(sc.simple_result_data.perfect != 0){
			current += "PERFECT,";
		}else if(sc.simple_result_data.full_chain != 0){
			current += "FULLCHAIN,";
		}else if(sc.simple_result_data.no_miss != 0){
			current += "NO MISS,";
		}else if(sc.simple_result_data.is_clear_mark == true){
			current += "CLEAR,";
		}else if(sc.simple_result_data.is_failed_mark == true){
			current += "FAILED,";
		}else{
			current += ",";
			stat = false;
		}

		if(!stat){
			console.log("Not played.. skipping....");
			current += ",";
		}else if(sc.simple_result_data.perfect == 1 || sc.simple_result_data.score >= 990000){
			current += "S++,";
		}else if(sc.simple_result_data.score >= 950000){
			current += "S+,";
		}else if(sc.simple_result_data.score >= 900000){
			current += "S,";
		}else if(sc.simple_result_data.score >= 900000){
			current += "S,";
		}else if(sc.simple_result_data.score >= 800000){
			current += "A,";
		}else if(sc.simple_result_data.score >= 700000){
			current += "B,";
		}else if(sc.simple_result_data.score >= 600000){
			current += "C,";
		}else if(sc.simple_result_data.score >= 500000){
			current += "D,";
		}else if(sc.simple_result_data.score >= 400000){
			current += "E,";
		}

		if(!stat){
			current +=",,,,";
		}else{
			current += sc.simple_result_data.score;
			current += ",";
			current += sc.simple_result_data.max_chain;
			current += ",";
			current += sc.simple_result_data.play_count;
			current += ",";
			current += sc.user_rank[0].rank;
			current += ",";
		}
	}
	//normal
	if(sc.normal_result_data == null){
		current += ",,,,,,";
	}else{
		stat = true;
		if(sc.normal_result_data.perfect != 0){
			current += "PERFECT,";
		}else if(sc.normal_result_data.full_chain != 0){
			current += "FULLCHAIN,";
		}else if(sc.normal_result_data.no_miss != 0){
			current += "NO MISS,";
		}else if(sc.normal_result_data.is_clear_mark == true){
			current += "CLEAR,";
		}else if(sc.normal_result_data.is_failed_mark == true){
			current += "FAILED,";
		}else{
			current += ",";
			stat = false;
		}

		if(!stat){
			console.log("Not played.. skipping....");
			current += ",";
		}else if(sc.normal_result_data.perfect == 1 || sc.normal_result_data.score >= 990000){
			current += "S++,";
		}else if(sc.normal_result_data.score >= 950000){
			current += "S+,";
		}else if(sc.normal_result_data.score >= 900000){
			current += "S,";
		}else if(sc.normal_result_data.score >= 900000){
			current += "S,";
		}else if(sc.normal_result_data.score >= 800000){
			current += "A,";
		}else if(sc.normal_result_data.score >= 700000){
			current += "B,";
		}else if(sc.normal_result_data.score >= 600000){
			current += "C,";
		}else if(sc.normal_result_data.score >= 500000){
			current += "D,";
		}else if(sc.normal_result_data.score >= 400000){
			current += "E,";
		}

		if(!stat){
			current +=",,,,";
		}else{
			current += sc.normal_result_data.score;
			current += ",";
			current += sc.normal_result_data.max_chain;
			current += ",";
			current += sc.normal_result_data.play_count;
			current += ",";
			current += sc.user_rank[1].rank;
			current += ",";
		}
	}
	//hard
	if(sc.normal_result_data == null){
		current += ",,,,,,";
	}else{
		stat = true;
		if(sc.hard_result_data.perfect == 1){
			current += "PERFECT,";
		}else if(sc.hard_result_data.full_chain == 1){
			current += "FULLCHAIN,";
		}else if(sc.hard_result_data.no_miss == 1){
			current += "NO MISS,";
		}else if(sc.hard_result_data.is_clear_mark == 1){
			current += "CLEAR,";
		}else if(sc.hard_result_data.is_failed_mark == 1){
			current += "FAILED,";
		}else{
			current += ",";
			stat = false;
		}

		if(!stat){
			console.log("Not played.. skipping....");
			current += ",";
		}else if(sc.hard_result_data.perfect == 1 || sc.hard_result_data.score >= 990000){
			current += "S++,";
		}else if(sc.hard_result_data.score >= 950000){
			current += "S+,";
		}else if(sc.hard_result_data.score >= 900000){
			current += "S,";
		}else if(sc.hard_result_data.score >= 900000){
			current += "S,";
		}else if(sc.hard_result_data.score >= 800000){
			current += "A,";
		}else if(sc.hard_result_data.score >= 700000){
			current += "B,";
		}else if(sc.hard_result_data.score >= 600000){
			current += "C,";
		}else if(sc.hard_result_data.score >= 500000){
			current += "D,";
		}else if(sc.hard_result_data.score >= 400000){
			current += "E,";
		}

		if(!stat){
			current +=",,,,";
		}else{
			current += sc.hard_result_data.score;
			current += ",";
			current += sc.hard_result_data.max_chain;
			current += ",";
			current += sc.hard_result_data.play_count;
			current += ",";
			current += sc.user_rank[2].rank;
			current += ",";
		}
	}
	//extra
	if(sc.ex_flag == 1 && sc.extra_result_data != null){
		stat = true;
		if(sc.extra_result_data.perfect != 0){
			current += "PERFECT,";
		}else if(sc.extra_result_data.full_chain != 0){
			current += "FULLCHAIN,";
		}else if(sc.extra_result_data.no_miss != 0){
			current += "NO MISS,";
		}else if(sc.extra_result_data.is_clear_mark == true){
			current += "CLEAR,";
		}else if(sc.extra_result_data.is_failed_mark == true){
			current += "FAILED,";
		}else{
			current += ",";
			stat = false;
		}

		if(!stat){
			console.log("Not played.. skipping....");
			current += ",";
		}else if(sc.extra_result_data.perfect == 1 || sc.extra_result_data.score >= 990000){
			current += "S++,";
		}else if(sc.extra_result_data.score >= 950000){
			current += "S+,";
		}else if(sc.extra_result_data.score >= 900000){
			current += "S,";
		}else if(sc.extra_result_data.score >= 900000){
			current += "S,";
		}else if(sc.extra_result_data.score >= 800000){
			current += "A,";
		}else if(sc.extra_result_data.score >= 700000){
			current += "B,";
		}else if(sc.extra_result_data.score >= 600000){
			current += "C,";
		}else if(sc.extra_result_data.score >= 500000){
			current += "D,";
		}else if(sc.extra_result_data.score >= 400000){
			current += "E,";
		}

		if(!stat){
			current +=",,,,";
		}else{
			current += sc.extra_result_data.score;
			current += ",";
			current += sc.extra_result_data.max_chain;
			current += ",";
			current += sc.extra_result_data.play_count;
			current += ",";
			current += sc.user_rank[3].rank;
			current += "\n";
		}
	}else{
		current += "\n";
	}
	if(debug){
		console.log(current);
	}
	buffer += current;
	if(i > 99 && i%100 == 0){
		fs.appendFileSync(output, buffer);
		buffer = "";
	}
	if(i == size-1){
		fs.appendFileSync(output, buffer);
		buffer = "";
	}
}

if(!debug){
	shell.exec("rm -rf tmp");
}

function convert_case(str) {
	//dont get surprised its copied. i dont even understand the logic behind this
  str = str.toLowerCase().replace( /(^| )(\w)/g, function(x){return x.toUpperCase();} );
  //this is written by me
  return str.replace(/\s/g,'_');
}

function camelCase(str){
    var arr = str.split(' ');
    var result = "";
    for (var x=0;x<arr.length;x++)
        result+=arr[x].substring(0,1).toUpperCase()+arr[x].substring(1)+' ';
    return result.substring(0, result.length-1);
}

function modify(str){
	str = str.toLowerCase();
	return str.replace(/\s/,'-');
}

function currDate(){
	var date = new Date();
	var str = date.getFullYear();
	var month = date.getMonth()+1;
	str += ((month<10)?'-0':'-')+month;
	var cdate = date.getDate();
	str += ((cdate<10)?'-0':'-')+cdate;
	return str;
}

function epDate(epname){

	var searchstr = modify(epname);
	var url = 'http://next-episode.net/site-search-'+searchstr+'.html';
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(){
		if(xhr.readyState == 4){
			if(xhr.status == 404){
				chrome.extension.getViews()[1].setdata('Not Found','');
			}
			traverseNextEpisode($($.parseHTML(xhr.responseText)),epname);
		}
	}
	xhr.open("GET",url,true);
	xhr.send();
}

function redirectedEpDate(epname){

	var url = 'http://next-episode.net'+epname;
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(){
		if(xhr.readyState == 4){
			if(xhr.status == 404){
				chrome.extension.getViews()[1].setdata('Not Found','');
			}
			traverseNextEpisode($($.parseHTML(xhr.responseText)),epname.slice(1));
		}
	}
	xhr.open("GET",url,true);
	xhr.send();

}

function verifyPage(body){
	if(body.find("a[href='http://next-episode.net/submit']").length == 1)
		return 0;
	if(body.find('div.item').length > 0)
		return 1;
	else 
		return 2;
}

function traverseNextEpisode(body,epname){
	var type = verifyPage(body);
	//chrome.extension.getViews()[1].setdata(body);
	switch(type){
		case 0: 
			chrome.extension.getViews()[1].setdata('Sorry! Dude.. Cant find it.. Better watch some popular series.. :P','');
			break;
		case 1:
			var list = [];
			var img;
			body.find('div.item').each(function(index){
				var aTag = $(this).find('span.headlinehref').find('a');
				img = aTag.find('img').attr('src');
				list.push({srName:aTag.text(),sLink:aTag.attr('href'),img:img});
			});
			chrome.extension.getViews()[1].setList(list);
			break;
		case 2:
			var status = body.find('#middle_section').text();
			var prevEp = body.find('#previous_episode').text();
			var prevDate = prevEp.substring(prevEp.indexOf('Date:')+5,prevEp.indexOf('Season:'));
			var imgsrc = body.find('#big_image').attr('src');
			if(status.indexOf('Cancelled/Ended') == -1){
				var nextep = body.find('#next_episode');
				if(nextep.text().indexOf('Sorry') == -1){
					var text = nextep.text();
					var date = text.substring(text.indexOf('Date:')+5,text.indexOf('Season:'));
					var season = parseInt(text.substring(text.indexOf('Season:')+7,text.indexOf('Episode:')));
					var episode = parseInt(text.substring(text.indexOf('Episode:')+8,text.indexOf('Summary:')));
					var epName = text.substring(text.indexOf('Name:')+5,text.indexOf('Countdown'));
					var toWrite ='<div><img src="'+imgsrc+'" width="90px" height="70px" class="lazy"></div>';
					toWrite += camelCase(epname)+' S'+((season<10)?('0'+season):season)+'E'+((episode<10)?('0'+episode):episode)+' - '+epName;
					toWrite+='<br><span>The Next Episode is On : ' + date+'</span>';
					toWrite += '<br><span>Previous Episode Was On : '+prevDate+'</span>';
					chrome.extension.getViews()[1].setdata(toWrite,'save');
				}
				else{
					var toWrite = '<div><img src="'+imgsrc+'" width="90px" height="70px" class="lazy"></div>Sorry! no info about the next episode of '+camelCase(epname)+' is available yet.'
					toWrite += '<br><span>Previous Episode Was On : '+prevDate+'</span>'; 
					chrome.extension.getViews()[1].setdata(toWrite,'save');
				}
			}
			else{
				chrome.extension.getViews()[1].setdata('This TV Series has run its course and has been either cancelled or has ended!','save');
			}
			break;

	}
}

function disperr(err){
	console.log(err);
}

var _gaq = _gaq || [];
 _gaq.push(['_setAccount', 'UA-XXXXXXXX-X']);
 _gaq.push(['_trackPageview']);

 (function() {
   var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
   ga.src = 'https://ssl.google-analytics.com/ga.js';
   var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
 })();
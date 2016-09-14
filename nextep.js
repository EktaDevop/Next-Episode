$(document).ready(function(e){
	$('#loader').hide();
	$(document).bind('keypress',function(e){
		if(e.keyCode == 13){
			$('#fetch').trigger('click');
		}
	});

	$('#fetch').bind('click',function(){
		if($('#epname').val().length==0)
			return false;
		getNextEpisode();
	});

	//try catch block for debugging purpose
	//This block of code shows the episode suggestion when user types in the keyword
	//It uses the jquery autocomplete plugin
	try{
		$('#epname').autocomplete({
			source : function(request,response){
				chrome.storage.sync.get('epname',function(data){
					var eplist = [];
					if(data.epname){
						eplist = data.epname.slice();
						console.log(eplist);
						var matcher = new RegExp("^"+$.ui.autocomplete.escapeRegex(request.term),"i");
						var list = [];
						$.grep(eplist,function(item){
							if(matcher.test(item))
								list.push(item);
						});
						if(list.length>7)
							repsonse(list.slice(0,7));
						else
							response(list);
					}
					else
						response(eplist);
				});
			}
		});
	}catch(err){
		chrome.extension.getBackgroundPage().disperr(err);
	}
});


//Function sends request to the background page to fetch the next episode date
function getNextEpisode(){
	chrome.extension.getBackgroundPage().epDate($('#epname').val());
	$('#loader').show('fast');
	$('#fetch').prop('disabled',true);
}

//Function sets up a list of TV series to give out suggestions
// for the episode entered.
function setList(list){
	//chrome.extension.getBackgroundPage().disperr(list);
	var epname = $('#epname').val();
	$('#epname').val('');
	$('#loader').hide('slow');
	$('#content').hide('slow');
	$('#result').text('');
	$('#result').append('Select your desired TV Series <br><br>');
	for(var i=0; i<list.length; i++){
		var div = $('<div class="item" data-slink="'+list[i].sLink+'"><img style="margin-left:10px;clear:both;" src="'+list[i].img+'" height = "70px" width="90px" class="lazy"/><span>'+list[i].srName+'</span></div><br>');
		div.on('click',function(){
			$('#result').html('');
			chrome.extension.getBackgroundPage().redirectedEpDate($(this).data('slink'));
			$('#content').show('fast');
			$('#loader').show();
		});
		$('#result').append(div);
	}
}


//Function stores the searched episode name if the search is successfully completed
function setdata(str,tosave){
	var epname = $('#epname').val();
	$('#epname').val('');
	$('#loader').hide('slow');
	$('#result').html(str);
	$('#fetch').prop('disabled',false);
	var eplist = [];
	if(tosave === 'save'){
		chrome.storage.sync.get('epname',function(data){
			if(data.epname)
				eplist = data.epname.slice();
			if($.inArray(epname,eplist) == -1)
				eplist.push(epname);
			if(eplist.length > 1000){
				eplist = [];
				eplist.push(epname);
			}
			chrome.storage.sync.set({'epname':eplist},function(){
				chrome.extension.getBackgroundPage().disperr('Saved');
			});
		});
	}
}


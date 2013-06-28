/*!
 * jQuery plug-in for iVouch
 * Version 1.0.0
 * @requires jQuery v1.5 or later
 *
 * Documentation and examples at: http://open.ivouch.com
 * Copyright (c) Diamond Review, Inc. aka iVouch
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 *
 */

(function ( $ ) {
  $.fn.ivouch = function( options ) {
  
    var settings = $.extend({
      // officially documented
	  key: '',
	  ondone : function(t) { },
	  onfail : function(err) { },
	  reviews_start : undefined,
	  reviews_num : undefined,
	  reviews_selector : '.reviews',
	  // not documented
	  reviews_sortby : undefined, // not supported by API
	  default_author_photo_url : '//open.ivouch.com/v1/static/img/author_nophoto_sm.gif',
	  endpoint : '//open.ivouch.com/v1/api/'
      }, options );

    var txt2html = function(t) {
	  return t.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>').replace(/"/g, '&quot;');
	  };
	  	  
    var display = function(jq, t) {
      // reviews
      jq.find(settings.reviews_selector).each(function() {
	    var one = $(this).html();
		var all = '';
		if (t.reviews) {
	  	  for (var i=0; i<t.reviews.length; i++) {
		    all += one.replace(/\<!\-\-([^%]*)%%([a-z_]+)%%([^%]*)\-\-\>/gi, function(match, s1, v, s2) {
			  var value = typeof(t.reviews[i][v]) === 'string' ? t.reviews[i][v] : typeof(t.reviews[i][v]) === 'number' ? t.reviews[i][v].toString() : '';
              switch (v) {
			    case 'written_dt':
				  value = new Date(value).toLocaleDateString() + '&nbsp;&nbsp;&nbsp;' + new Date(value).toLocaleTimeString(); 
				  break;
				default:
				  value = txt2html(value);
				  break;
				}
	          return s1 + (value.length > 0 ? value : (settings['default_'+v] || '')) + s2;
			  });
			}
		  }
		$(this).html(all);
		});
      // everything else
      jq.html(jq.html().replace(/\<!\-\-([^%]*)%%([a-z_]+)%%([^%]*)\-\-\>/gi, function(match, s1, v, s2) {
        var value = typeof(t[v]) === 'string' ? t[v] : typeof(t[v]) === 'number' ? t[v].toString() : '';
        value = txt2html(value);
	    return s1 + (value.length > 0 ? value : (settings['default_'+v] || '')) + s2;
	    }));
	  };

    var jqxhr = {};

    return this.each(function() {

      var jq = $(this);

      var topic_id = jq.attr('rel');

      if (typeof(jqxhr[topic_id]) === 'undefined') {
        jqxhr[topic_id] = $.ajax({
          type: 'GET',
		  dataType: 'jsonp',
          url: settings.endpoint+
		    'topic/id='+topic_id+
			'&key='+settings.key+
			(typeof(settings.reviews_start)!=='undefined' ? '&reviews_start='+settings.reviews_start : '')+
			(typeof(settings.reviews_num)!=='undefined' ? '&reviews_num='+settings.reviews_num : '')+
			(typeof(settings.reviews_sortby)!=='undefined' ? '&reviews_sortby='+settings.reviews_sortby : '')+
			'&callback=?'
		  });
        }
		
      jqxhr[topic_id].done(function(t) {
	    if (t.error) {
          if ((typeof(settings.onfail) === 'function') && (settings.onfail(t.error) === false)) {
	        return; }
          alert(t.error);
		  }
        if ((typeof(settings.ondone) === 'function') && (settings.ondone(t) === false)) {
 	      return; }
        display(jq, t);
		});

      jqxhr[topic_id].fail(function(jqXHR) {
	    var error = 'http '+jqXHR.status+' error';
        if ((typeof(settings.onfail) === 'function') && (settings.onfail(error) === false)) {
	      return; }
		alert(error);
        });

  	  });
	  
  };
}( jQuery ));


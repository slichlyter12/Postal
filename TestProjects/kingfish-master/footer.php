</div> <!-- END CONTENT -->
<footer>

	<div id="hours">
		<ul id="todays-hours">
			<li><h4>Today: <span class="time">5pm &ndash; 1am</span></h4></li>
		</ul>

		<a id="all-hours-button" href="#">Show All Hours</a>

		<ul id="all-hours">
		 	<li id="monday"> Monday: <span class="time">5pm &ndash; 1am</span> </li>
		 	<li id="tuesday"> Tuesday: <span class="time">5pm &ndash; 12am</span> </li>
		 	<li id="wednesday"> Wednesday: <span class="time">5pm &ndash; 1am</span> </li>
		 	<li id="thursday"> Thursday: <span class="time">5pm &ndash; 1am</span> </li>
			<li id="friday"> Friday: <span class="time">5pm &ndash; 1am</span> </li>
			<li id="saturday"> Saturday: <span class="time">5pm &ndash; 1am</span> </li>
			<li id="sunday"> Sunday: <span class="time">5pm &ndash; 12am</span> </li>
		</ul>
	</div>

	<div id="contact_info">
		<ul id="contact_details">
			<li><a href="tel:5417530787">541-753-0787</a></li>
			<li><a href="https://www.google.com/maps/place/151+NW+Monroe+Ave+%23107,+Corvallis,+OR+97330/@44.5641493,-123.2611558,17z/data=!3m1!4b1!4m2!3m1!1s0x54c040eb824139e9:0xf6460850f090980" target="_blank">151 NW Monroe Ave Suite 107</a></li>
		</ul>
	</div>

</footer>

<!-- INCLUDE LATEST JQUERY -->
<script src="//code.jquery.com/jquery-2.2.1.min.js"></script>

<!-- Latest compiled and minified JavaScript -->
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js" integrity="sha384-0mSbJDEHialfmuBBQP6A4Qrprq5OVfW37PRR3j5ELqxss1yVqOtnepnHVP9aJ7xS" crossorigin="anonymous"></script>

<script>
	
	$(document).ready(function() {
		
		//Toggle all hours
	    $("#all-hours-button").click(function(e) {
		    e.preventDefault();
		    $("html, body").animate({ scrollTop: $(document).height() }, "slow"); //© Mark Ursino & xaxxon @ http://stackoverflow.com/questions/1890995/jquery-scroll-to-bottom-of-page-iframe 
		    $("#all-hours").toggle();
	    });
	    
	    //Display today's hours
	    var today = new Date;
	    function getWeek(today) {
		    weekFromToday = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
		    var dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
		    var day = dayNames[weekFromToday.getDay()];
		    return day;
	    }
	    
	    var time = $("#all-hours #" + getWeek(today) + " .time").text();
	    $("#todays-hours .time").text(time);
	});
</script>

</body>
</html>
<?php ob_flush(); ?>

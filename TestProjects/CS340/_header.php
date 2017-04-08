<?php 
header('Content-Type: text/html; charset=ISO-8859-1'); //Makes the server allow names with accents on letters
?>

<!DOCTYPE html>
<html>
	<head>
		
		<meta charset="utf-8">
		<link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
		<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
		<link rel="stylesheet" type="text/css" href="style.css">



	</head>     
	<body>
		<nav class="navbar navbar-inverse navbar-static">
			<div class="container">
				<div class="navbar-header">
				<button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#navbar" >
					<span class="sr-only">Toggle navigation</span>
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
				</button>
				<a class="navbar-brand" href="index.php">World War One Database</a>
				</div>
				<div id="navbar" class="navbar-collapse collapse">
				<ul class="nav navbar-nav">
					<li id="navbarHome"><a href="index.php">Home</a></li>
					<li id="navbarEntente"><a href="entente.php">Triple Entente</a></li>
					<li id="navbarCentral"><a href="central.php">Central Powers</a></li>
					<li id="navbarBattles"><a href="battles.php">Battles</a></li>
					<li id="navbarAbout"><a href="tables.php">Tables</a></li>				
				</ul>
				</div>
			</div>

			<!-- Highlight the current page in navbar -->
			<script>
			pathname = window.location.pathname;
			scriptname = pathname.substring(pathname.lastIndexOf('/') + 1);
			if (scriptname === "index.php") {
				$("#navbarHome").addClass("active");
			} else if (scriptname === "entente.php") {
				$("#navbarEntente").addClass("active");
			} else if (scriptname === "central.php") {
				$("#navbarCentral").addClass("active");
			} else if (scriptname === "battles.php") {
				$("#navbarBattles").addClass("active");
			} else if (scriptname === "about.php") {
				$("#navbarAbout").addClass("active");
			}
			</script>
		</nav>



	</body>
</html>

<?php
ini_set('display_errors', 'On');

if(!$mysqli = new mysqli("oniddb.cws.oregonstate.edu","schneidz-db","79bOvbUpNObiJC6S","schneidz-db")){
	echo 'Database connection failed!';
}







?>
<?php ob_start(); ?>
<?php require_once 'dbconnect.php'; ?>
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Kingfish Lounge</title>
	<!-- Latest compiled and minified CSS -->
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">

	<!-- Optional theme -->
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap-theme.min.css" integrity="sha384-fLW2N01lMqjakBkx3l/M9EahuwpSfeNvV63J5ezn3uZzapT0u7EYsXMjQV+0En5r" crossorigin="anonymous">
	<link href='https://api.mapbox.com/mapbox.js/v2.4.0/mapbox.css' rel='stylesheet' />
	<link rel="stylesheet" type="text/css" href="css/stylesheet.css">
</head>
<body>
	<!-- nav bar -->
	<header>
		<nav class="navbar navbar-transparent">
			<div class="container-fluid">
				<div class="navbar-header">
					<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#site-menu" aria-expanded="false">
						<span class="sr-only">Toggle Navigation</span>
						<span class="icon-bar"></span>
						<span class="icon-bar"></span>
						<span class="icon-bar"></span>
					</button>
					<a class="navbar-brand" href="index.php">Kingfish Lounge</a>
				</div>
					<div class="collapse navbar-collapse" id="site-menu">
						<ul class="nav navbar-nav navbar-right" id="site-menu">
						<!-- <li><a href="#">About</a></li> -->
						<li class="menu-button"><a href="menu.php?id=bites">Bites</a></li>
						<li class="menu-button"><a href="menu.php?id=cocktails">Cocktails</a></li>
<!-- 						<li class="menu-button"><a href="neighborhood.php">Neighborhood</a></li> -->
					</ul>
				</div>
			</div>
		</nav>
	</header>
	<div class="content container">
		<div class="imageContainer">
			<img id="landingImage" src="img/bar.jpg">
		</div>
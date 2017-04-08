<?php require_once 'dbconnect.php'; ?>
<?php
	
	// check last activity, if longer than 30 minutes ago, require login; if sooner, refresh token
	if (isset($_SESSION['LAST_ACTIVITY']) && (time() - $_SESSION['LAST_ACTIVITY'] > 1800)) {
		// last request was longer than 30 minutes ago
		session_unset();
		session_destroy();
		header("Location: admin.php");
	}
	$_SESSION['LAST_ACTIVITY'] = time();
	
	if (!isset($_SESSION['username'])) {
		header("Location: index.php");
	}
	
	if (isset($_GET['menu']) && !empty($_GET['menu']) && isset($_GET['action']) && !empty($_GET['action'])) {
		$menu = mysqli_real_escape_string($mysqli, strip_tags($_GET['menu']));
		$action = mysqli_real_escape_string($mysqli, strip_tags($_GET['action']));
	} else {
		header("Location: 404.php");
	}

	$url = "editing.php?menu=$menu";


	// This is what Cramer took that databases class for
	if ($_SERVER['REQUEST_METHOD'] == 'POST') {
		if ($action == 'adding') {
			// adding to the database 
			$newname = mysqli_real_escape_string($mysqli, strip_tags($_POST["name"]));
			$newdecs = mysqli_real_escape_string($mysqli, strip_tags($_POST["decs"]));
			$newprice = mysqli_real_escape_string($mysqli, strip_tags($_POST["price"]));
			$newpriority = mysqli_real_escape_string($mysqli, strip_tags($_POST["priority"]));
			$sql = "INSERT INTO $menu (name, `desc`, price, priority) 
					VALUE ('$newname', '$newdecs', '$newprice', '$newpriority')";
			$query = mysqli_query($mysqli, $sql);
			if ($query) {
				echo "<strong class='success'>Success!</strong>";
			}

		} else if ($action == 'editing') {
			// editing the database 
			//var_dump($_POST);
			echo "<br>";
			$sql = "SELECT * FROM kingfishlounge.$menu";
			$querys = mysqli_query($mysqli, $sql);
			switch ($menu) {
				case 'bites': $id = 'bid'; break;
				case 'drinks': $id = 'did'; break;
				default: header("Location: 404.php");
			} 

			$fail = False;

			while ($row = mysqli_fetch_assoc($querys)) {
				$newname = mysqli_real_escape_string($mysqli, strip_tags($_POST["name_" . $row[$id]]));
				$newdecs = mysqli_real_escape_string($mysqli, strip_tags($_POST["decs_" . $row[$id]]));
				$newprice = mysqli_real_escape_string($mysqli, strip_tags($_POST["price_" . $row[$id]]));
				$newpriority = mysqli_real_escape_string($mysqli, strip_tags($_POST["priority_" . $row[$id]]));

				$sqls = "UPDATE $menu
						 SET name='$newname', `desc`='$newdecs', price='$newprice', priority='$newpriority'
						 WHERE $id=$row[$id]";
				$edited = mysqli_query($mysqli, $sqls);
				if (!$edited) {
					$failmessage = $sql;
					break;
				}
			}
			if ($fail) {
				echo "<label class='error'>Error</label>";
			} else {
				echo "<label class='success'>Success!</label>";
			}

		} else if ($action == 'deleting') { 
			// deleting from the database 
			switch ($menu) {
				case 'bites': $id = 'bid'; break;
				case 'drinks': $id = 'did'; break;
				default: header("Location: 404.php");
			} 
			$todelete = mysqli_real_escape_string($mysqli, strip_tags($_POST["delete"]));
			$todelete = explode(" ", $todelete)[1];
			$sql = "DELETE FROM $menu
					 WHERE $id='$todelete' ";
			$query = mysqli_query($mysqli, $sql);
			if ($query) {
				echo "<strong class='success'>Success!</strong>";
			}
		} else {
			header("Location: 404.php");
		} 
	}
?>

<!DOCTYPE html>
<html>
<head>
	<title><?php echo ucfirst($action) ." ". ucfirst($menu); ?></title>
	<style type="text/css" media="screen">
		nav a, nav span {
			padding-right: 5px;
		}
		
		.selected_action {
			font-weight: bold;
		}
		
		.other_action {
			color: #cb3737;
		}

		.toprow {
			font-weight: bold;
		}

		.red {
			color: red;
			font-weight: bold;
		}

		.green {
			color: #00FF00;
			font-weight: bold;
		}
	</style>
</head>
<body>


<?php
	
	$actions = ['editing', 'adding', 'deleting'];
	switch ($action) {
		case 'editing': 
		case 'adding':
		case 'deleting': 
			echo "<h1>".ucfirst($action) . " " . ucfirst($menu) . "</h1>";
			echo "<nav>";
			foreach ($actions as $oaction) {
				if ($action != $oaction) {
					echo "<a href='$url&action=$oaction' class='other_action'>$oaction</a>";
				} else {
					echo "<span class='selected_action'>$action</span>";
				}	
			}
			echo "</nav>";
			break;
		default: header("Location: 404.php");
	}

	$menus = ['bites', 'drinks'];
	switch ($menu) {
		case 'bites': 
		case 'drinks':
			echo "<nav>";
			foreach ($menus as $omenu) {
				if ($menu != $omenu) {
					echo "<a href='editing.php?menu=$omenu&action=$action' class='other_action'>$omenu</a>";
				} else {
					echo "<span class='selected_action'>$menu</span>";
				}	
			}
			echo "</nav>";
			echo "<hr>";
			break;
		default: header("Location: 404.php");
	}

	if ($action == 'editing') {
		// This form is for edditing
		$dbc = $mysqli;
		$menu = mysqli_real_escape_string($mysqli, strip_tags($_GET['menu']));
		switch ($menu) {
			case 'bites': $id = 'bid'; break;
			case 'drinks': $id = 'did'; break;
			default: header("Location: 404.php");
		}
		$sql = "SELECT * FROM kingfishlounge.$menu";
		$query = mysqli_query($dbc, $sql);
		
		echo "<form action='$url&action=editing' method='POST'>";
		echo "<table>";
		echo "<tr class='toprow'><td>ID</td> <td>Name</td> <td>Description</td> <td>Price</td> <td>Order</td> <td></td></tr>";
		while ($row = mysqli_fetch_assoc($query)) {
			$rid = $row["$id"];
			$name = ($row['name']);
			$desc = $row['desc'];
			$price = $row['price'];
			$priority = $row['priority'];
			//echo '<td><input type=\"text\" name=\"name\" ' . $rid . ' value=' . $name . '></td>';
			?>
			<tr>
				<td><label><?=$rid?></label>
				<td><input type="text" name="name <?=$rid?>" value="<?=$name?>"></td>
				<td><input type="text" name='decs <?=$rid?>' value="<?=$desc?>"></td>
				<td><input type='number' name="price <?=$rid?>" value="<?=$price?>"></td>
				<td><input type='number' name='priority <?=$rid?>' value="<?=$priority?>"></td>
			</tr>
			<?php
		}
		echo "<tr><td><input type='submit'><tf></tr>";
		echo "</table";
		echo "</form>";

	} else if ($action == 'adding') {
		// This is the add form 
		echo "<form action='$url&action=adding' method='POST''>";
			echo "<input type='text' name='name'>";
			echo "<input type='text' name='decs'>";
			echo "<input type='number' name='price'>";
			echo "<input type='number' name='priority'>";
			echo "<input type='submit' value='add'>";
		echo "</form>";

	} else if ($action == 'deleting') {
		$sql = "SELECT * FROM kingfishlounge.$menu";
		$query = mysqli_query($mysqli, $sql);
		
		echo "<form action='$url&action=deleting' method='POST'>";
		echo "<table>";
		echo "<tr class='toprow'><td>ID</td> <td>Name</td> <td>Description</td> <td>Price</td> <td>Order</td> <td></td></tr>";
		while ($row = mysqli_fetch_assoc($query)) {
			switch ($menu) {
				case 'bites': $id = 'bid'; break;
				case 'drinks': $id = 'did'; break;
				default: header("Location: 404.php");
			}
			$rid = $row["$id"];
			$name = $row['name'];
			$desc = $row['desc'];
			$price = $row['price'];
			$priority = $row["priority"];

			echo "<tr> <td> $rid </td><td> $name </td><td> $desc </td><td> $price </td><td> $priority</td><td>  <input type='submit' name=delete value='delete $rid'> </td></tr>";
		}
		echo "</table";
		echo "</form>";
	}
?>
</body>
</html>
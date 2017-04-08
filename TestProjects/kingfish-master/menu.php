<?php include_once 'header.php'; //header.php: <html> <head> <body> <div class='content'> ?>
<?php

	if (isset($_GET['id']) && !empty($_GET['id'])) {
		$type = mysqli_real_escape_string($mysqli, strip_tags($_GET['id']));
	} else {
		header("Location: 404.php");
	}
	
	switch ($type) {
		case 'bites': break;
		case 'cocktails': $type = 'drinks'; break;
		default: $type = 'drinks'; break;
	}	
	
?>
	
	<div class="offerings">
		<!-- Drink menu -->
		<?php 	
			$sql = "SELECT * FROM $type ORDER BY priority";
			$query = mysqli_query($mysqli, $sql);
			if ($query) {
				echo "<table class='offerings'>";
				while ($row = mysqli_fetch_assoc($query)) {
					$name = mysqli_real_escape_string($mysqli, strip_tags($row['name']));
					$desc = mysqli_real_escape_string($mysqli, strip_tags($row['desc']));
					$price = mysqli_real_escape_string($mysqli, strip_tags($row['price']));
					echo "<tr>";
					if ($desc == NULL) {
						echo "<td class='drink'>".stripslashes($name)."</td><td class='menu_right'></td><td class='menu_center'>$$price</td>";
					} else {
						echo "<td class='drink'>".stripslashes($name)."</td><td class='menu_right'>".stripslashes($desc)."</td><td class='menu_center'>$$price</td>";
					}
					echo "<tr>";
				}
				echo "</table>"; 
			}			
		?>
	</div>
<?php include_once 'footer.php'; //footer.php: </div>(class='content') <script> </body> </html> ?>
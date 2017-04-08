<?php include_once 'header.php'; 
	
	// check last activity, if longer than 30 minutes ago, require login; if sooner, refresh token
	if (isset($_SESSION['LAST_ACTIVITY']) && (time() - $_SESSION['LAST_ACTIVITY'] > 1800)) {
		// last request was longer than 30 minutes ago
		session_unset();
		session_destroy();
	}
	$_SESSION['LAST_ACTIVITY'] = time();

	// If you've logged in before, you will be redirected
	if (isset($_SESSION["username"]) && isset($_SESSION["uid"]) && !empty($_SESSION["username"]) && !empty($_SESSION["uid"])) {
		header("Location: editing.php?menu=bites&action=editing");
	}
	// END WARNING
	
	if (isset($_POST['username']) && !empty($_POST['username']) && isset($_POST['password']) && !empty($_POST['password'])) {
		
		$username = mysqli_real_escape_string($mysqli, strip_tags($_POST["username"]));
		$password = mysqli_real_escape_string($mysqli, strip_tags($_POST["password"]));
				
		$sql = "SELECT uid, username, password FROM users WHERE username=? LIMIT 1";
		$stmt = mysqli_prepare($mysqli, $sql);
		mysqli_stmt_bind_param($stmt, 's', $username);
		mysqli_stmt_execute($stmt);
		mysqli_stmt_bind_result($stmt, $uid, $dbusername, $dbpassword);
		mysqli_stmt_fetch($stmt);
		
		//check username and password are correct
		if ($username == $dbusername && password_verify($password."kingfisher", $dbpassword)) {
			//set session variables
			$_SESSION['username'] = $username;
			$_SESSION['uid'] = $uid;
			
			//now redirect user
			header("Location: editing.php?menu=bites&action=editing");
		} else {
			die( "<h2 class='error'>Username/password not found. Please try again.</h2>" );
		}
	}	
	
?>

<h2 class="title">Admin menu</h2>
<form id="admin_form" action="admin.php" method="POST">
	<p>Username: <input class="input_field" type="text" name="username" required autofocus></p>
	<p>Password: <input class="input_field" type="password" name="password"></p>
	<input class="submit" type="submit" value="Login">
</form>

<?php include_once 'footer.php'; ?>
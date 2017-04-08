<?php include("_header.php");
    //Prepared statement into Leader table from tables.php input
    $sqlIn = $mysqli->prepare("INSERT INTO Leader (Leader_Fname, Leader_Lname, Title, Age) VALUES(?,?,?,?) ");
                                
    //Assign values from the POST inputs
    $Leader_Fname = htmlspecialchars($_REQUEST['Leader_Fname']);
    $Leader_Lname = htmlspecialchars($_REQUEST['Leader_Lname']);
    $Title = htmlspecialchars($_REQUEST['Title']);
    $Age = htmlspecialchars($_REQUEST['Age']);

    $sqlIn->bind_param("sssi", $Leader_Fname, $Leader_Lname, $Title, $Age);

    if(!$sqlIn){
        echo "Bind failed";
    }
    $sqlIn->execute();
    if(!$sqlIn){
        echo "Execute failed";
    }

    $sqlIn->close();


?>
<!--Redirect to tables page after the data is written to db -->
<script>location.replace("tables.php");</script>
    </body>
</html>
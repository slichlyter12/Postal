<?php include("_header.php");
    //Prepared statement into Battles table from tables.php input
    $sqlIn = $mysqli->prepare("INSERT INTO Battles (Battle_Name, Battle_Date, Location) VALUES(?,?,?) ");
                                
    //Assign values from the POST inputs
    $Battle_Name = htmlspecialchars($_REQUEST['Battle_Name']);
    $Battle_Date = htmlspecialchars($_REQUEST['Battle_Date']);
    $Location = htmlspecialchars($_REQUEST['Location']);


    $sqlIn->bind_param("sss", $Battle_Name, $Battle_Date, $Location);

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
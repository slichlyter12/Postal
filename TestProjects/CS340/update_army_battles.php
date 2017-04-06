<?php include("_header.php");
    //Prepared statement into Army_Battles table from tables.php input
    $sqlIn = $mysqli->prepare("INSERT INTO Army_Battles (Army_ID, Battle_ID) VALUES(?,?) ");
                                
    //Assign values from the POST inputs
    $Army_ID = htmlspecialchars($_REQUEST['Army_ID']);
    $Battle_ID = htmlspecialchars($_REQUEST['Battle_ID']);


    $sqlIn->bind_param("ii", $Army_ID, $Battle_ID);

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
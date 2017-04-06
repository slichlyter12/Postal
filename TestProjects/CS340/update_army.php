<?php include("_header.php");
    //Prepared statement into Army table from tables.php input
    $sqlIn = $mysqli->prepare("INSERT INTO Army (Army_Country, Army_Leader, Manpower) VALUES(?,?,?) ");
                                
    //Assign values from the POST inputs
    $Army_Country = htmlspecialchars($_REQUEST['Army_Country']);
    $Army_Leader = htmlspecialchars($_REQUEST['Army_Leader']);
    $Manpower = htmlspecialchars($_REQUEST['Manpower']);


    $sqlIn->bind_param("iii", $Army_Country, $Army_Leader, $Manpower);

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
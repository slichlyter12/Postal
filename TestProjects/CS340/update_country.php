<?php include("_header.php");
    //Prepared statement into Country table from tables.php input
    $sqlIn = $mysqli->prepare("INSERT INTO Country (Country_Name, Country_Leader, Population, Alliance) VALUES(?,?,?,?) ");
                                
    //Assign values from the POST inputs
    $Country_Name = htmlspecialchars($_REQUEST['Country_Name']);
    $Country_Leader = htmlspecialchars($_REQUEST['Country_Leader']);
    $Population = htmlspecialchars($_REQUEST['Population']);
    $Alliance = htmlspecialchars($_REQUEST['Alliance']);
    //If this was left blank, just assign it to Neutral
    if($Alliance == ""){
        $Alliance = "Neutral";
    }
    $sqlIn->bind_param("siis", $Country_Name, $Country_Leader, $Population, $Alliance);

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
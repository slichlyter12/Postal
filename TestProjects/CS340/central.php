<?php include("_header.php");

?>

    <div class="container">
			<h1 style="text-align: center;">The Central Powers</h1>
            
	</div>
    <!--Left side picture -->
    <div class="container-fluid">
        <div class="row" style="margin-top:25px;">
            <div class="col-lg-5">
                <img src="images/map-entente.png" alt="The Triple Entente alliance in 1914" style="width:100%;border-style:solid;border-width:2px;"></img>
            </div>
            <!--Right Side Table -->
            <div class="col-lg-7">
                <?php

                //First query is to show relevant stats for the Central nations, pulled from country, army, leader
                $sql = "SELECT Country_Name as 'Country Name', CONCAT(Leader.Title, ' ',Leader.Leader_Fname,' ',Leader.Leader_Lname) as 'Country Leader', Population, Alliance, Army.Manpower as 'Army Manpower'
                        FROM Country
                        JOIN Leader ON Country.Country_Leader = Leader.Leader_ID
                        JOIN Army ON Country.Country_ID = Army.Army_Country
                        WHERE Alliance = 'Central Powers';";
                 //SUM function for manpower of the Central, from Army table       
                $sumsql = "SELECT SUM(Army.Manpower) as 'Total Manpower'
                        FROM Country
                        JOIN Army ON Country.Country_ID = Army.Army_Country
                        WHERE Alliance = 'Central Powers';";

              
                 //Print out table results, execute query           
                echo "<table class='table table-striped' id='entente_table'><tr><th>Country Name<th>Country Leader<th>Population<th>Alliance<th>Army Manpower</tr>";
                if($result = $mysqli->query($sql)){
	                while($obj = $result->fetch_assoc()){
                        echo "<tr>";
		                echo "<td>".htmlspecialchars($obj["Country Name"])."</td>";
                        echo "<td>".htmlspecialchars($obj["Country Leader"], ENT_QUOTES, 'ISO-8859-1')."</td>"; //'ISO-8859-1' is a charset that allows accents on letters
                        echo "<td>".htmlspecialchars($obj["Population"])."</td>";
                        echo "<td>".htmlspecialchars($obj["Alliance"])."</td>";
                        echo "<td>".htmlspecialchars($obj["Army Manpower"])."</td>";
                        echo "</tr>";

                    }
                    $result->close();
                }
                //Print out SUM query result
                if($result2 = $mysqli->query($sumsql)){
                    while($obj2 = $result2->fetch_assoc()){
                        echo "<tr>";
                        echo "<td></td>";
                        echo "<td></td>";
                        echo "<td></td>";
                        echo "<td><b>Total Manpower:</b></td>";
                        echo "<td>".htmlspecialchars($obj2["Total Manpower"])."</td>";
                        echo "</tr>";
                    }
                    $result2->close();
                }
                echo "</table>";
                ?>
            </div>
        </div>
    </div>






    </body>
</html>
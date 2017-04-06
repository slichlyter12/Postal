<?php include("_header.php");

?>
        <!--Instructions and search bar with submit button, does a POST on this page -->
        <div class="container">
                <h1 style="text-align: center;">The Battles of WW1</h1>
                <p style="text-align: center;">Search for the name of a battle for details about it. A list of battles is displayed on the left.</p>
                <form action='' method='post'>
                <div style="margin: auto;width:33%;">
                    <input type='text'  name='search' value=''><input type='submit' class='btn btn-primary' value='Search'>
                </div>
                </form>
        </div>
        <!--Left side picture and list of battles -->
        <div class="container-fluid">
            <div class="row" style="margin-top:25px;">
                <div class="col-lg-5">
                    <img src="images/French_bayonet_charge.jpg" alt="A French bayonet charge in 1914" style="width:60%;border-style:solid;border-width:2px;margin-top:-100px;"></img>
                    <?php
                        //Get all battle names
                        $sql = "SELECT Battle_Name FROM Battles";
                        //Print table of names
                        echo "<table style='width:50%;' class='table table-striped' id='battle_table'><tr><th>Battle List</tr>";
                        if($result = $mysqli->query($sql)){
                            while($obj = $result->fetch_assoc()){
                                echo "<tr>";
                                echo "<td>".htmlspecialchars($obj["Battle_Name"])."</td>";
                                echo "</tr>";

                             }   
                            $result->close();
                        }
                        echo "</table>";
                    ?>
                </div>
                
                <div class="col-lg-7">


<?php 
                //Check if value has been submitted previously, assign to input, otherwise it's null and don't display anything yet
                if (isset($_POST['search'])){
                    $input = htmlspecialchars("%{$_POST['search']}%");
                }
                else{
                    $input = null;
                }
                
                //Prepared statement from Battles tables where search input is similar to a Battle_Name
                $sqlIn = $mysqli->prepare("SELECT Battle_Name FROM Battles WHERE Battle_Name LIKE ? ");
                $sqlIn->bind_param("s", $input);
                
                if(!$sqlIn){
                    echo "Bind failed";
                }
                $sqlIn->execute();
                if(!$sqlIn){
                    echo "Execute failed";
                }
                //Bind the return from the search to this variable
                $sqlIn->bind_result($Battle_Return);

                //Get the value from db
                $sqlIn->fetch();

                $sqlIn->close();

                //Force value to be a string for a second query, search for the full name of the battle and display its attributes
                $Battle_Query = strval($Battle_Return);
                $sql = "SELECT Battle_Name, Battle_Date, Location FROM Battles WHERE Battle_Name = '$Battle_Query'";

                //Print table for 1 result from search
                echo "<table class='table table-striped' id='battle_table'><tr><th>Battle Name<th>Battle Start Date<th>Location</tr>";
                if($result = $mysqli->query($sql)){
	                while($obj = $result->fetch_assoc()){
                        echo "<tr>";
		                echo "<td>".htmlspecialchars($obj["Battle_Name"])."</td>";
                        echo "<td>".htmlspecialchars($obj["Battle_Date"])."</td>";
                        echo "<td>".htmlspecialchars($obj["Location"])."</td>";
                        echo "</tr>";

                    }
                    $result->close();
                }
                echo "</table>";

?>
                </div>
            </div>
        </div>
    </body>
</html>
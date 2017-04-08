<?php include("_header.php");

?>
    <!--Keep the table last selected as the first table to load, selected table is the POST var and select it in the dropdown with js-->
    <script type="text/javascript">
    var selectedvar = 
    <?php echo json_encode($_POST['var']); 
    ?>;
    function Selected() {
        document.getElementById(selectedvar).selected = true;
    }
    window.onload = Selected;
    </script>
    <!--Instructions -->
    <div class="container">
			<h1 style="text-align: center;">All WW1 Tables</h1>
			<p class="large" style="text-align: center;">These are the database tables used to populate the previous pages of the site.
            There are 5 tables, Country, Leader, Army, Battles, and Army_Battles. You can update each table below it's currently displayed data. Required fields will be marked with a *.
            </p>
	</div>

    <div class="container-fluid">
        <div class="row" style="margin-top:25px;">
            <div class="col-lg-6">
                <!--The dropdown menu selection is an input, submit it when it changes and POST the value that was selected-->
                <form action="" method="post"> 
                <select class="btn btn-primary btn-larger" name="var" onchange="this.form.submit();"> 
                <option id="Country" value="Country">Country Table</option> 
                <option id="Leader" value="Leader">Leader Table</option> 
                <option id="Army" value="Army">Army Table</option> 
                <option id="Battles" value="Battles">Battles Table</option> 
                <option id="Army_Battles" value="Army_Battles">Army_Battles Table</option> 
                </select> 
                </form> 

                

                <?php 
                //Check if a table was selected previously, otherwise default to country table
                if (isset($_POST['var'])){
                    $table = $_POST['var'];
                }
                else{
                    $table = "Country";
                }
                    //BIG switch statement for each selection. For each case, print out that respective table by selecting * from that table
                    switch ($table){
                        case "Country":
                            $sql = "SELECT * FROM Country;";
                            echo "<table class='table table-striped' id='country_table'><tr><th>Country ID<th>Country Name<th>Country Leader<th>Population<th>Alliance</tr>";
                            if($result = $mysqli->query($sql)){
                                while($obj = $result->fetch_assoc()){
                                    echo "<tr>";
                                    echo "<td>".htmlspecialchars($obj["Country_ID"])."</td>";
                                    echo "<td>".htmlspecialchars($obj["Country_Name"])."</td>";
                                    echo "<td>".htmlspecialchars($obj["Country_Leader"])."</td>"; 
                                    echo "<td>".htmlspecialchars($obj["Population"])."</td>";
                                    echo "<td>".htmlspecialchars($obj["Alliance"])."</td>";
                                    echo "</tr>";
                                }
                             $result->close();
                            }
                            echo "</table>";
                            break;

                        case "Leader":
                            $sql = "SELECT * FROM Leader;";
                            echo "<table class='table table-striped' id='leader_table'><tr><th>Leader ID<th>Leader First Name<th>Leader Last Name<th>Title<th>Age</tr>";
                            if($result = $mysqli->query($sql)){
                                while($obj = $result->fetch_assoc()){
                                    echo "<tr>";
                                    echo "<td>".htmlspecialchars($obj["Leader_ID"])."</td>";
                                    echo "<td>".htmlspecialchars($obj["Leader_Fname"], ENT_QUOTES, 'ISO-8859-1')."</td>"; //'ISO-8859-1' is a charset that allows accents on letters
                                    echo "<td>".htmlspecialchars($obj["Leader_Lname"], ENT_QUOTES, 'ISO-8859-1')."</td>"; 
                                    echo "<td>".htmlspecialchars($obj["Title"])."</td>";
                                    echo "<td>".htmlspecialchars($obj["Age"])."</td>";
                                    echo "</tr>";
                                }
                             $result->close();
                            }
                            echo "</table>";
                            break;

                        case "Army":
                            $sql = "SELECT * FROM Army;";
                            echo "<table class='table table-striped' id='army_table'><tr><th>Army ID<th>Army Country<th>Army Leader<th>Manpower</tr>";
                            if($result = $mysqli->query($sql)){
                                while($obj = $result->fetch_assoc()){
                                    echo "<tr>";
                                    echo "<td>".htmlspecialchars($obj["Army_ID"])."</td>";
                                    echo "<td>".htmlspecialchars($obj["Army_Country"])."</td>";
                                    echo "<td>".htmlspecialchars($obj["Army_Leader"])."</td>"; 
                                    echo "<td>".htmlspecialchars($obj["Manpower"])."</td>";
                                    echo "</tr>";
                                }
                             $result->close();
                            }
                            echo "</table>";
                            break;

                        case "Battles":
                            $sql = "SELECT * FROM Battles;";
                            echo "<table class='table table-striped' id='battles_table'><tr><th>Battle ID<th>Battle Name<th>Start Date<th>Location</tr>";
                            if($result = $mysqli->query($sql)){
                                while($obj = $result->fetch_assoc()){
                                    echo "<tr>";
                                    echo "<td>".htmlspecialchars($obj["Battle_ID"])."</td>";
                                    echo "<td>".htmlspecialchars($obj["Battle_Name"])."</td>";
                                    echo "<td>".htmlspecialchars($obj["Battle_Date"])."</td>"; 
                                    echo "<td>".htmlspecialchars($obj["Location"])."</td>";
                                    echo "</tr>";
                                }
                             $result->close();
                            }
                            echo "</table>";
                            break;

                        case "Army_Battles":
                            $sql = "SELECT * FROM Army_Battles;";
                            echo "<table class='table table-striped' id='country_table'><tr><th>Army ID<th>Battle ID</tr>";
                            if($result = $mysqli->query($sql)){
                                while($obj = $result->fetch_assoc()){
                                    echo "<tr>";
                                    echo "<td>".htmlspecialchars($obj["Army_ID"])."</td>";
                                    echo "<td>".htmlspecialchars($obj["Battle_ID"])."</td>";
                                    echo "</tr>";
                                }
                             $result->close();
                            }
                            echo "</table>";
                            break;

                        default:
                            $sql = "SELECT * FROM Country;";
                            echo "<table class='table table-striped' id='country_table'><tr><th>Country ID<th>Country Name<th>Country Leader<th>Population<th>Alliance</tr>";
                            if($result = $mysqli->query($sql)){
                                while($obj = $result->fetch_assoc()){
                                    echo "<tr>";
                                    echo "<td>".htmlspecialchars($obj["Country_ID"])."</td>";
                                    echo "<td>".htmlspecialchars($obj["Country_Name"])."</td>";
                                    echo "<td>".htmlspecialchars($obj["Country_Leader"])."</td>"; 
                                    echo "<td>".htmlspecialchars($obj["Population"])."</td>";
                                    echo "<td>".htmlspecialchars($obj["Alliance"])."</td>";
                                    echo "</tr>";
                                }
                             $result->close();
                            }
                            echo "</table>";
                            break;
                    }

                
                    
                
                ?>    

                </div>
                <div class="col-lg-6">
                    <?php 
                        //User input section, BIG switch statement based on the same cases from above, give the form input respective of the dropdown selections
                        switch ($table){
                            case "Country":
                                //Send form input to country update page
                                echo "<form action='update_country.php' method='post'>"; 
                                echo "<table style='margin-top: 71px;' class='table table-striped' id='country_input'><tr><th>Country Values<th>Country Inputs</tr>";

                                echo "<tr>";
                                echo "<td>Country_Name (string) *</td>";
                                echo "<td><input type='text' name='Country_Name' value='' required></td>";
                                echo "</tr>";
                                echo "<tr>";
                                echo "<td>Country_Leader (int, Leader must exist) *</td>"; //Must be a number for existing leader, otherwise data doesn't go in database
                                echo "<td><input type='text' name='Country_Leader' value='' required></td>";
                                echo "</tr>";
                                echo "<tr>";
                                echo "<td>Population (int)</td>";
                                echo "<td><input type='text' name='Population' value=''></td>";
                                echo "</tr>";
                                echo "<tr>";
                                echo "<td>Alliance (string, Neutral if blank)</td>";
                                echo "<td><input type='text' name='Alliance' value=''></td>";
                                echo "</tr>";

                                echo "</table>";
                                echo "<input type='submit' class='btn btn-primary' value='Submit'>";
                                echo "</form>";
                                break;

                            case "Leader":
                                //Send input form to leader update page
                                echo "<form action='update_leader.php' method='post'>"; 
                                echo "<table style='margin-top: 71px;' class='table table-striped' id='leader_input'><tr><th>Leader Values<th>Leader Inputs</tr>";

                                echo "<tr>";
                                echo "<td>Leader_Fname (string) *</td>";
                                echo "<td><input type='text' name='Leader_Fname' value='' required></td>";
                                echo "</tr>";
                                echo "<tr>";
                                echo "<td>Leader_Lname (string) *</td>";
                                echo "<td><input type='text' name='Leader_Lname' value='' required></td>";
                                echo "</tr>";
                                echo "<tr>";
                                echo "<td>Title (string)</td>";
                                echo "<td><input type='text' name='Title' value=''></td>";
                                echo "</tr>";
                                echo "<tr>";
                                echo "<td>Age (int)</td>";
                                echo "<td><input type='text' name='Age' value=''></td>";
                                echo "</tr>";

                                echo "</table>";
                                echo "<input type='submit' class='btn btn-primary' value='Submit'>";
                                echo "</form>";
                                break;

                            case "Army":
                                // Send input form to army update page
                                echo "<form action='update_army.php' method='post'>"; 
                                echo "<table style='margin-top: 71px;' class='table table-striped' id='army_input'><tr><th>Army Values<th>Army Inputs</tr>";

                                echo "<tr>";
                                echo "<td>Army_Country (int, Country must exist) *</td>";
                                echo "<td><input type='text' name='Army_Country' value='' required></td>"; //Must be an int for existing country, other data doesn't go through
                                echo "</tr>";
                                echo "<tr>";
                                echo "<td>Army_Leader (int, Leader must exist) *</td>";
                                echo "<td><input type='text' name='Army_Leader' value='' required></td>"; //Must be an int for existing leader, other data doesn't go through
                                echo "</tr>";
                                echo "<tr>";
                                echo "<td>Manpower (int)</td>";
                                echo "<td><input type='text' name='Manpower' value=''></td>";
                                echo "</tr>";

                                echo "</table>";
                                echo "<input type='submit' class='btn btn-primary' value='Submit'>";
                                echo "</form>";
                                break;

                            case "Battles":
                                //Send input form to battles update page
                                echo "<form action='update_battles.php' method='post'>"; 
                                echo "<table style='margin-top: 71px;' class='table table-striped' id='battles_input'><tr><th>Battles Values<th>Battles Inputs</tr>";

                                echo "<tr>";
                                echo "<td>Battle_Name (string) *</td>";
                                echo "<td><input type='text' name='Battle_Name' value='' required></td>";
                                echo "</tr>";
                                echo "<tr>";
                                echo "<td>Battle_Date (date, MM/DD/YYYY) </td>";
                                echo "<td><input type='date' name='Battle_Date' value='' ></td>";
                                echo "</tr>";
                                echo "<tr>";
                                echo "<td>Location (string)</td>";
                                echo "<td><input type='text' name='Location' value=''></td>";
                                echo "</tr>";

                                echo "</table>";
                                echo "<input type='submit' class='btn btn-primary' value='Submit'>";
                                echo "</form>";
                                break;

                            case "Army_Battles":
                                //Send input to army_battles update page
                                echo "<form action='update_army_battles.php' method='post'>"; 
                                echo "<table style='margin-top: 71px;' class='table table-striped' id='country_input'><tr><th>Army_Battles Values<th>Army_Battles Inputs</tr>";

                                echo "<tr>";
                                echo "<td>Army_ID (int, Army must exist) *</td>";
                                echo "<td><input type='text' name='Army_ID' value='' required></td>"; //Both army ID and battle ID must exist for data to go through to db
                                echo "</tr>";
                                echo "<tr>";
                                echo "<td>Battle_ID (int, Battle must exist) *</td>";
                                echo "<td><input type='text' name='Battle_ID' value='' required></td>";
                                echo "</tr>";

                                echo "</table>";
                                echo "<input type='submit' class='btn btn-primary' value='Submit'>";
                                echo "</form>";
                                break;
                            default:
                                break;
                        }

                    ?>
                </div>
            </div>
        </div>
    </div>
    </body>
</html>
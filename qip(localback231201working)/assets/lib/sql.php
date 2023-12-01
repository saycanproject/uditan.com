<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
define('BASE_PATH', __DIR__);

require_once('CRUD.php');

$crud = new CRUD();

// Create operation
if (isset($_POST['create'])) {
    $table = $_POST['table'];
    $data = $_POST['data'];
    $crud->create($table, $data);
}

// Read operation
if (isset($_GET['read'])) {
    $table = $_GET['table'];
    $data = $crud->read($table);
    // Display the data
    foreach ($data as $row) {
        echo "<p>";
        foreach ($row as $key => $value) {
            echo "$key: $value<br>";
        }
        echo "</p>";
    }
}

// Update operation
if (isset($_POST['update'])) {
    $table = $_POST['table'];
    $data = $_POST['data'];
    $condition = $_POST['condition'];
    $crud->update($table, $data, $condition);
}

// Delete operation
if (isset($_POST['delete'])) {
    $table = $_POST['table'];
    $condition = $_POST['condition'];
    $crud->delete($table, $condition);
}
?>

<html>
<body>

<h2>Create an Item</h2>
<form action="sql.php" method="post">
    <input type="hidden" name="create" value="true">
    <input type="hidden" name="table" value="items">
    Name: <input type="text" name="data[name]"><br>
    Description: <input type="text" name="data[description]"><br>
    Price: <input type="text" name="data[price]"><br>
    Image: <input type="text" name="data[img]" value="/assets/img/"><br>
    Specs: <input type="text" name="data[specs]"><br>
    <input type="submit">
</form>

<h2>Update an Item</h2>
<form action="sql.php" method="post">
    <input type="hidden" name="update" value="true">
    <input type="hidden" name="table" value="items">
    ID: <input type="text" name="condition"><br>
    Name: <input type="text" name="data[name]"><br>
    Description: <input type="text" name="data[description]"><br>
    Price: <input type="text" name="data[price]"><br>
    Image: <input type="text" name="data[img]" value="/assets/img/"><br>
    Specs: <input type="text" name="data[specs]"><br>
    <input type="submit">
</form>

<h2>Delete an Item</h2>
<form action="sql.php" method="post">
    <input type="hidden" name="delete" value="true">
    <input type="hidden" name="table" value="items">
    ID: <input type="text" name="condition"><br>
    <input type="submit">
</form>

</body>
</html>
<?php
require_once('../../m/DB.php');

class CRUD {
    private $db;

    public function __construct() {
        $this->db = new DB();
    }

    // Create
    // public function create($table, $data) {
    //     $columns = implode(", ", array_keys($data));
    //     $values  = implode(", ", array_map([$this->db, 'escape'], array_values($data)));
        
    //     $this->db->query("INSERT INTO {$table} ({$columns}) VALUES ({$values})");
    // }

    // // Create
    // public function create($table, $data) {
    //     $columns = implode(", ", array_keys($data));
    //     $values  = implode(", ", array_map(function($value) {
    //         return $this->db->escape(is_string($value) ? "'{$value}'" : $value);
    //     }, array_values($data)));
        
    //     $this->db->query("INSERT INTO {$table} ({$columns}) VALUES ({$values})");
    // }

    // Create
    public function create($table, $data) {
        $columns = implode(", ", array_keys($data));
        $values = array_values($data);
        $escaped_values = array_map([$this->db, 'escape'], $values);
        $quoted_values = array_map(function ($value) {
            return is_numeric($value) ? $value : "'" . $value . "'";
        }, $escaped_values);
        $value_string = implode(", ", $quoted_values);
        
        $this->db->query("INSERT INTO {$table} ({$columns}) VALUES ({$value_string})");
    }

    // Read
    public function read($table) {
        $result = $this->db->query("SELECT * FROM {$table}");
        return $result->rows;
    }

    // Update
    public function update($table, $data, $condition) {
        $updateData = "";
        foreach($data as $column => $value) {
            $updateData .= "{$column} = '{$this->db->escape($value)}',";
        }
        $updateData = rtrim($updateData, ",");

        $this->db->query("UPDATE {$table} SET {$updateData} WHERE {$condition}");
    }

    // Delete
    public function delete($table, $condition) {
        $this->db->query("DELETE FROM {$table} WHERE {$condition}");
    }
}
?>
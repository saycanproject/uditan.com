<?php
class Cart {
    private $db;

    public function __construct(DB $db) {
        $this->db = $db;
    }

    public function checkout($data) {
        // Here, implement your database operations.
        // This function should return true if the operation was successful, and false otherwise.

        if(!isset($data['cart'])) {
            return false;
        }

        $userId = $_SESSION['user_id'];

        foreach($data['cart'] as $itemId => $itemData) {
            $itemId = $this->db->escape($itemId);
            $quantity = $this->db->escape($itemData['quantity']);
            $totalPrice = $this->db->escape($itemData['price']) * $quantity;
            $orderId = uniqid(); // You can use a more sophisticated order id generation logic

            $result = $this->db->query("INSERT INTO cart (user_id, item_id, quantity, order_id, total_price) VALUES ('$userId', '$itemId', '$quantity', '$orderId', '$totalPrice')");
            if(!$result) {
                return false;
            }
        }

        return true;
    }
}
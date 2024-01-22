<?php
class Order {
    private $database;

    public function __construct(DB $database) {
        $this->database = $database;
    }

    public function getOrdersByUserId($userId) {
        $userId = $this->database->escape($userId);

        return $this->database->query("
        SELECT cart.item_id, cart.quantity, cart.total_price, items.name as item_name, items.price as unit_price 
        FROM cart 
        INNER JOIN items ON cart.item_id = items.id 
        WHERE cart.user_id = '{$userId}'
        ")->rows;
    }

    public function getFinalOrdersByUserId($userId) {
        $userId = $this->database->escape($userId);

        return $this->database->query("
            SELECT id, order_number, item_name, unit_price, quantity, sold, stock, returned, order_time 
            FROM orders 
            WHERE user_id = '{$userId}'
            ORDER BY order_time DESC
        ")->rows;
    }

    public function sellItem($userId, $itemName, $quantityToSell) {
        $this->database->query("START TRANSACTION");
        
        try {
            $orders = $this->database->query("SELECT * FROM orders WHERE user_id = '$userId' AND item_name = '$itemName' ORDER BY order_time ASC")->rows;
            
            foreach ($orders as $order) {
                if ($quantityToSell <= 0) break;
                
                $sellQuantity = min($order['stock'], $quantityToSell);
                $newSold = $order['sold'] + $sellQuantity;
                $newStock = $order['stock'] - $sellQuantity;
                $quantityToSell -= $sellQuantity;
                
                $this->database->query("UPDATE orders SET sold = '$newSold', stock = '$newStock' WHERE id = '{$order['id']}'");
            }
            
            if ($quantityToSell > 0) {
                throw new Exception('Not enough stock to sell the requested quantity.');
            }
            
            $this->database->query("COMMIT");
            return ['success' => true, 'message' => 'Items sold successfully.'];
        } catch (Exception $e) {
            $this->database->query("ROLLBACK");
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function returnItem($userId, $itemName, $quantityToReturn) {
        $this->database->query("START TRANSACTION");
        
        try {
            $orders = $this->database->query("SELECT * FROM orders WHERE user_id = '$userId' AND item_name = '$itemName' ORDER BY order_time ASC")->rows;
            
            foreach ($orders as $order) {
                if ($quantityToReturn <= 0) break;
                
                $returnQuantity = min(($order['quantity'] - $order['returned'] - $order['sold']), $quantityToReturn);
                $newReturned = $order['returned'] + $returnQuantity;
                $newStock = $order['stock'] + $returnQuantity;
                $quantityToReturn -= $returnQuantity;
                
                $this->database->query("UPDATE orders SET returned = '$newReturned', stock = '$newStock' WHERE id = '{$order['id']}'");
            }
            
            if ($quantityToReturn > 0) {
                throw new Exception('Not enough items to return the requested quantity.');
            }
            
            $this->database->query("COMMIT");
            return ['success' => true, 'message' => 'Items returned successfully.'];
        } catch (Exception $e) {
            $this->database->query("ROLLBACK");
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
}
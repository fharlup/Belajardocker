CREATE TABLE IF NOT EXISTS `obat` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `stock` INT NOT NULL DEFAULT 0,
    `price` DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS `suppliers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `contact` VARCHAR(50)
);



CREATE TABLE IF NOT EXISTS `orders` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `obat_id` INT NOT NULL,
    `supplier_id` INT NOT NULL, -- Kolom baru untuk ID Supplier
    `quantity` INT NOT NULL,
    `order_date` DATE NOT NULL,
    -- Foreign key constraint untuk obat_id
    FOREIGN KEY (`obat_id`) REFERENCES `obat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    -- Foreign key constraint untuk supplier_id
    FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);



CREATE TABLE IF NOT EXISTS `purchase_history` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL, -- Kolom untuk ID Order
    -- Kolom patient_id dihapus
    `medicine_name` VARCHAR(255) NOT NULL,
    `quantity` INT NOT NULL,
    `purchase_date` DATE NOT NULL,
    -- Foreign key constraint untuk order_id
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);
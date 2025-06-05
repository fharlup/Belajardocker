CREATE TABLE IF NOT EXISTS `obat` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100),
  `stock` INT,
  `price` DECIMAL(10,2)
);

CREATE TABLE IF NOT EXISTS `suppliers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100),
  `contact` VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `obat_id` INT,
  `quantity` INT,
  `order_date` DATE
);

CREATE TABLE IF NOT EXISTS `purchase_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` INT NOT NULL,
  `medicine_name` VARCHAR(255) NOT NULL,
  `quantity` INT NOT NULL,
  `purchase_date` DATE NOT NULL
);
-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 19, 2026 at 02:15 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `garage_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(254) NOT NULL,
  `nic` varchar(20) DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `address` text DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `nic` (`nic`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `name`, `email`, `nic`, `phone`, `address`, `created_at`) VALUES
(1, 'John Anderson', 'john.anderson@email.com', '197234567890', '(555) 123-4567', '123 Main Street, Springfield, IL 62701', '2025-01-15 10:00:00.000000'),
(2, 'Sarah Johnson', 'sarah.johnson@email.com', '198545678901', '(555) 234-5678', '456 Oak Avenue, Springfield, IL 62701', '2025-02-10 14:30:00.000000'),
(3, 'Mike Wilson', 'mike.wilson@email.com', '199056789012', '(555) 345-6789', '789 Pine Road, Springfield, IL 62701', '2025-02-20 09:15:00.000000');

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `customer_id` int(11) NOT NULL,
  `brand` varchar(50) NOT NULL,
  `model` varchar(50) NOT NULL,
  `year` varchar(4) NOT NULL,
  `number` varchar(20) NOT NULL,
  `color` varchar(30) DEFAULT NULL,
  `fuel_type` varchar(20) NOT NULL DEFAULT 'Petrol',
  `mileage` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `number` (`number`),
  KEY `vehicles_customer_id_fkey` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vehicles`
--

INSERT INTO `vehicles` (`id`, `customer_id`, `brand`, `model`, `year`, `number`, `color`, `fuel_type`, `mileage`, `created_at`) VALUES
(1, 1, 'Toyota', 'Camry', '2020', 'ABC-1234', 'Silver', 'Petrol', 45000, '2025-01-15 10:30:00.000000'),
(2, 2, 'Honda', 'Civic', '2019', 'DEF-5678', 'Blue', 'Petrol', 52000, '2025-02-10 15:00:00.000000'),
(3, 3, 'Ford', 'F-150', '2021', 'GHI-9012', 'Black', 'Diesel', 38000, '2025-02-20 09:45:00.000000');

-- --------------------------------------------------------

--
-- Table structure for table `technicians`
--

CREATE TABLE `technicians` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `workload` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `technicians`
--

INSERT INTO `technicians` (`id`, `name`, `specialization`, `phone`, `is_active`, `workload`) VALUES
(1, 'John Doe', 'Engine Specialist', '(555) 999-0001', 1, 0),
(2, 'Jane Smith', 'Brake & Suspension', '(555) 999-0002', 1, 0),
(3, 'Mike Johnson', 'General Service', '(555) 999-0003', 1, 0);

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `vehicle_id` int(11) NOT NULL,
  `type` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `tax_included` tinyint(1) NOT NULL DEFAULT 0,
  `advance_payment` decimal(10,2) NOT NULL DEFAULT 0.00,
  `advance_payment_method` varchar(20) DEFAULT NULL,
  `remaining_balance` decimal(10,2) NOT NULL DEFAULT 0.00,
  `date` datetime(6) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Pending',
  `technician_id` int(11) DEFAULT NULL,
  `estimated_hours` decimal(5,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `services_vehicle_id_fkey` (`vehicle_id`),
  KEY `services_technician_id_fkey` (`technician_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `vehicle_id`, `type`, `description`, `cost`, `date`, `status`, `technician_id`, `created_at`) VALUES
(1, 1, 'Oil Change', 'Full synthetic oil change', 85.00, '2025-12-15 09:00:00.000000', 'Completed', 1, '2025-12-15 09:00:00.000000'),
(2, 2, 'Brake Service', 'Front brake pads replacement', 320.00, '2025-12-18 10:30:00.000000', 'Completed', 2, '2025-12-18 10:30:00.000000');

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(50) NOT NULL,
  `service_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'draft',
  `date_created` datetime(6) NOT NULL,
  `due_date` datetime(6) NOT NULL,
  `line_items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '[]' CHECK (json_valid(`line_items`)),
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `tax_rate` decimal(5,4) NOT NULL DEFAULT 0.1000,
  `tax_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `paid_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `balance_due` decimal(10,2) NOT NULL DEFAULT 0.00,
  `payment_terms` varchar(50) NOT NULL DEFAULT 'Net 30',
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_number` (`invoice_number`),
  KEY `invoices_service_id_fkey` (`service_id`),
  KEY `invoices_customer_id_fkey` (`customer_id`),
  KEY `invoices_vehicle_id_fkey` (`vehicle_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `invoice_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `method` varchar(20) NOT NULL,
  `date` datetime(6) NOT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payments_invoice_id_fkey` (`invoice_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL DEFAULT 0,
  `email` varchar(254) NOT NULL,
  `name` varchar(100) NOT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'staff',
  `is_approved` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_staff` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(6) NOT NULL,
  `approved_at` datetime(6) DEFAULT NULL,
  `approved_by` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
-- 
-- Note: Passwords are Django PBKDF2 hashes
-- admin@progarage.com / admin123
-- staff@progarage.com / staff123

INSERT INTO `users` (`id`, `password`, `last_login`, `is_superuser`, `email`, `name`, `role`, `is_approved`, `is_active`, `is_staff`, `created_at`, `approved_at`, `approved_by`) VALUES
(1, 'pbkdf2_sha256$870000$pQZxNl1jFgCPQ5YsT7oGsE$VlLqVqx8Qf8m+LdGD2dFMkJ7BvlwvZKOGJJ9y1qDfAM=', NULL, 1, 'admin@progarage.com', 'Admin User', 'admin', 1, 1, 1, '2025-01-01 00:00:00.000000', '2025-01-01 00:00:00.000000', NULL),
(2, 'pbkdf2_sha256$870000$uRKxOm2kGhDQR6ZtU8pHtF$WmMrWry9Rg9n+MeHE3eGNlK8CwmxwALPHKK0z2rEgBN=', NULL, 0, 'staff@progarage.com', 'Default Staff', 'staff', 1, 1, 0, '2025-01-02 10:00:00.000000', '2025-01-02 10:00:00.000000', '1');

-- --------------------------------------------------------

--
-- Table structure for table `billing_settings`
--

CREATE TABLE `billing_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tax_rate` decimal(5,4) NOT NULL DEFAULT 0.1000,
  `invoice_prefix` varchar(10) NOT NULL DEFAULT 'INV',
  `next_invoice_number` int(11) NOT NULL DEFAULT 1001,
  `service_prefix` varchar(10) NOT NULL DEFAULT 'SRV',
  `next_service_number` int(11) NOT NULL DEFAULT 1001,
  `payment_terms` varchar(50) NOT NULL DEFAULT 'Net 30',
  `company_name` varchar(100) NOT NULL DEFAULT 'ProGarage',
  `company_address` varchar(255) NOT NULL DEFAULT '123 Auto Lane',
  `company_city` varchar(100) NOT NULL DEFAULT 'Mechanic City, MC 90210',
  `company_phone` varchar(20) NOT NULL DEFAULT '(555) 123-4567',
  `company_email` varchar(254) NOT NULL DEFAULT 'billing@progarage.com',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `billing_settings`
--

INSERT INTO `billing_settings` (`id`, `tax_rate`, `invoice_prefix`, `next_invoice_number`, `service_prefix`, `next_service_number`, `payment_terms`, `company_name`, `company_address`, `company_city`, `company_phone`, `company_email`) VALUES
(1, 0.1000, 'INV', 1001, 'SRV', 1001, 'Net 30', 'ProGarage', '123 Auto Lane', 'Mechanic City, MC 90210', '(555) 123-4567', 'billing@progarage.com');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_otps`
--

CREATE TABLE `password_reset_otps` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `otp_hash` varchar(128) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `is_used` tinyint(1) NOT NULL DEFAULT 0,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `password_reset_otps_user_id_fkey` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Constraints for dumped tables
--

ALTER TABLE `vehicles`
  ADD CONSTRAINT `vehicles_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

ALTER TABLE `services`
  ADD CONSTRAINT `services_vehicle_id_fkey` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `services_technician_id_fkey` FOREIGN KEY (`technician_id`) REFERENCES `technicians` (`id`) ON DELETE SET NULL;

ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `invoices_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `invoices_vehicle_id_fkey` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE;

ALTER TABLE `payments`
  ADD CONSTRAINT `payments_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE;

ALTER TABLE `password_reset_otps`
  ADD CONSTRAINT `password_reset_otps_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

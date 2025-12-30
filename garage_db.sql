-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 30, 2025 at 12:55 PM
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
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(254) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `address` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `name`, `email`, `phone`, `address`, `created_at`) VALUES
('cust-001', 'John Anderson', 'john.anderson@email.com', '(555) 123-4567', '123 Main Street, Springfield, IL 62701', '2025-01-15 10:00:00'),
('cust-002', 'Sarah Johnson', 'sarah.johnson@email.com', '(555) 234-5678', '456 Oak Avenue, Springfield, IL 62701', '2025-02-10 14:30:00'),
('cust-003', 'Mike Wilson', 'mike.wilson@email.com', '(555) 345-6789', '789 Pine Road, Springfield, IL 62701', '2025-02-20 09:15:00'),
('cust-004', 'Emily Davis', 'emily.davis@email.com', '(555) 456-7890', '321 Elm Street, Springfield, IL 62701', '2025-03-05 16:45:00'),
('cust-005', 'Robert Brown', 'robert.brown@email.com', '(555) 567-8901', '654 Maple Drive, Springfield, IL 62701', '2025-03-12 11:20:00');

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `id` varchar(50) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `brand` varchar(50) NOT NULL,
  `model` varchar(50) NOT NULL,
  `year` varchar(4) NOT NULL,
  `number` varchar(20) NOT NULL,
  `color` varchar(30) DEFAULT NULL,
  `mileage` int(11) DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vehicles`
--

INSERT INTO `vehicles` (`id`, `customer_id`, `brand`, `model`, `year`, `number`, `color`, `mileage`, `created_at`) VALUES
('veh-001', 'cust-001', 'Toyota', 'Camry', '2020', 'ABC-1234', 'Silver', 45000, '2025-01-15 10:30:00'),
('veh-002', 'cust-002', 'Honda', 'Civic', '2019', 'DEF-5678', 'Blue', 52000, '2025-02-10 15:00:00'),
('veh-003', 'cust-003', 'Ford', 'F-150', '2021', 'GHI-9012', 'Black', 38000, '2025-02-20 09:45:00'),
('veh-004', 'cust-004', 'BMW', '328i', '2018', 'JKL-3456', 'White', 67000, '2025-03-05 17:15:00'),
('veh-005', 'cust-005', 'Chevrolet', 'Malibu', '2020', 'MNO-7890', 'Red', 41000, '2025-03-12 11:50:00'),
('veh-006', 'cust-001', 'Toyota', 'RAV4', '2022', 'PQR-1357', 'Gray', 22000, '2025-04-01 13:30:00');

-- --------------------------------------------------------

--
-- Table structure for table `technicians`
--

CREATE TABLE `technicians` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `workload` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `technicians`
--

INSERT INTO `technicians` (`id`, `name`, `specialization`, `workload`) VALUES
('t1', 'John Doe', 'Engine Specialist', 0),
('t2', 'Jane Smith', 'Brake & Suspension', 0),
('t3', 'Mike Johnson', 'General Service', 0);

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` varchar(50) NOT NULL,
  `vehicle_id` varchar(50) NOT NULL,
  `type` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `cost` decimal(10,2) DEFAULT 0.00,
  `date` datetime NOT NULL,
  `status` varchar(20) DEFAULT 'Pending',
  `technician_id` varchar(50) DEFAULT NULL,
  `estimated_hours` decimal(5,2) DEFAULT 0.00,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `vehicle_id`, `type`, `description`, `cost`, `date`, `status`, `technician_id`, `estimated_hours`, `created_at`) VALUES
('srv-001', 'veh-001', 'Oil Change', 'Full synthetic oil change with filter replacement', 85.00, '2025-12-15 09:00:00', 'Completed', 't1', 1.00, '2025-12-15 09:00:00'),
('srv-002', 'veh-002', 'Brake Service', 'Front brake pads replacement and rotor resurfacing', 320.00, '2025-12-18 10:30:00', 'Completed', 't2', 3.00, '2025-12-18 10:30:00'),
('srv-003', 'veh-003', 'Engine Diagnostic', 'Computer diagnostic scan for check engine light', 125.00, '2025-12-20 14:00:00', 'Completed', 't1', 2.00, '2025-12-20 14:00:00'),
('srv-004', 'veh-004', 'Transmission Service', 'Automatic transmission fluid change and filter replacement', 180.00, '2025-12-22 11:15:00', 'Completed', 't3', 2.50, '2025-12-22 11:15:00'),
('srv-005', 'veh-005', 'Tire Rotation', 'Four-wheel tire rotation and pressure check', 45.00, '2025-12-23 15:30:00', 'Completed', 't3', 0.50, '2025-12-23 15:30:00'),
('srv-006', 'veh-006', 'A/C Service', 'Air conditioning system inspection and refrigerant top-off', 95.00, '2025-12-24 08:45:00', 'Completed', 't2', 1.50, '2025-12-24 08:45:00'),
('srv-007', 'veh-001', 'Battery Replacement', 'Replace old battery with new heavy-duty battery', 145.00, '2025-12-26 10:00:00', 'Completed', 't1', 1.00, '2025-12-26 10:00:00'),
('srv-008', 'veh-002', 'Wheel Alignment', 'Four-wheel alignment and suspension check', 89.99, '2025-12-27 13:20:00', 'In Progress', 't2', 2.00, '2025-12-27 13:20:00');

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` varchar(50) NOT NULL,
  `invoice_number` varchar(50) NOT NULL,
  `service_id` varchar(50) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `vehicle_id` varchar(50) NOT NULL,
  `status` varchar(20) DEFAULT 'draft',
  `date_created` datetime NOT NULL DEFAULT current_timestamp(),
  `due_date` datetime NOT NULL,
  `line_items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`line_items`)),
  `subtotal` decimal(10,2) DEFAULT 0.00,
  `tax_rate` decimal(5,4) DEFAULT 0.1000,
  `tax_amount` decimal(10,2) DEFAULT 0.00,
  `discount` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) DEFAULT 0.00,
  `paid_amount` decimal(10,2) DEFAULT 0.00,
  `balance_due` decimal(10,2) DEFAULT 0.00,
  `payment_terms` varchar(50) DEFAULT 'Net 30',
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`id`, `invoice_number`, `service_id`, `customer_id`, `vehicle_id`, `status`, `date_created`, `due_date`, `line_items`, `subtotal`, `tax_rate`, `tax_amount`, `discount`, `total`, `paid_amount`, `balance_due`, `payment_terms`, `notes`) VALUES
('inv-001', 'INV-1001', 'srv-001', 'cust-001', 'veh-001', 'paid', '2025-12-15 09:30:00', '2026-01-14 09:30:00', '[{\"id\":\"li-001\",\"description\":\"Oil Change Service\",\"detail\":\"Full synthetic oil change with premium filter\",\"quantity\":1,\"unitPrice\":75.00,\"total\":75.00,\"type\":\"service\"},{\"id\":\"li-002\",\"description\":\"Shop Supplies\",\"detail\":\"Disposal fees and miscellaneous supplies\",\"quantity\":1,\"unitPrice\":10.00,\"total\":10.00,\"type\":\"parts\"}]', 85.00, 0.1000, 8.50, 0.00, 93.50, 93.50, 0.00, 'Net 30', 'Thank you for choosing ProGarage for your vehicle maintenance needs.'),
('inv-002', 'INV-1002', 'srv-002', 'cust-002', 'veh-002', 'sent', '2025-12-18 11:00:00', '2026-01-17 11:00:00', '[{\"id\":\"li-003\",\"description\":\"Brake Pad Replacement\",\"detail\":\"Premium ceramic brake pads - front axle\",\"quantity\":1,\"unitPrice\":180.00,\"total\":180.00,\"type\":\"parts\"},{\"id\":\"li-004\",\"description\":\"Labor - Brake Service\",\"detail\":\"Front brake service including rotor resurfacing\",\"quantity\":2.5,\"unitPrice\":95.00,\"total\":237.50,\"type\":\"labor\"},{\"id\":\"li-005\",\"description\":\"Brake Fluid Top-off\",\"detail\":\"DOT 3 brake fluid replacement\",\"quantity\":1,\"unitPrice\":15.00,\"total\":15.00,\"type\":\"parts\"}]', 432.50, 0.1000, 43.25, 20.00, 455.75, 0.00, 455.75, 'Net 30', 'Brake system inspection shows rotors in good condition after resurfacing.');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` varchar(50) NOT NULL,
  `invoice_id` varchar(50) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `method` varchar(20) NOT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp(),
  `reference` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `invoice_id`, `amount`, `method`, `date`, `reference`, `notes`) VALUES
('pay-001', 'inv-001', 93.50, 'card', '2025-12-15 10:15:00', 'TXN-789123456', 'Visa ending in 4567 - Approved'),
('pay-002', 'inv-003', 137.50, 'cash', '2025-12-20 15:00:00', 'CASH-001', 'Paid in full at service completion');

-- --------------------------------------------------------

--
-- Table structure for table `users`
-- This table handles authentication for both admin and staff with approval workflow
--

CREATE TABLE `users` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(254) NOT NULL,
  `password` varchar(255) NOT NULL COMMENT 'Bcrypt hashed password',
  `role` varchar(20) DEFAULT 'staff' COMMENT 'admin or staff',
  `is_approved` tinyint(1) DEFAULT 0 COMMENT 'Admin must approve staff registrations',
  `is_active` tinyint(1) DEFAULT 1 COMMENT 'Can be deactivated by admin',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `approved_at` datetime DEFAULT NULL,
  `approved_by` varchar(50) DEFAULT NULL COMMENT 'Admin user ID who approved'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
-- Admin password: adminpassword123 (hashed with bcrypt)
-- Staff password: staffpassword123 (hashed with bcrypt)
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `is_approved`, `is_active`, `created_at`, `approved_at`, `approved_by`) VALUES
('admin-001', 'Admin User', 'admin@progarage.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzNGxPvuDm', 'admin', 1, 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00', NULL),
('staff-default', 'Default Staff', 'staff@progarage.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQam1l267dkyFMaaviac2', 'staff', 1, 1, '2025-01-02 10:00:00', '2025-01-02 10:00:00', 'admin-001');

-- --------------------------------------------------------

--
-- Table structure for table `billing_settings`
--

CREATE TABLE `billing_settings` (
  `id` int(11) NOT NULL,
  `tax_rate` decimal(5,4) DEFAULT 0.1000,
  `invoice_prefix` varchar(10) DEFAULT 'INV',
  `next_invoice_number` int(11) DEFAULT 1001,
  `payment_terms` varchar(50) DEFAULT 'Net 30',
  `company_name` varchar(100) DEFAULT 'ProGarage',
  `company_address` varchar(255) DEFAULT '123 Auto Lane',
  `company_city` varchar(100) DEFAULT 'Mechanic City, MC 90210',
  `company_phone` varchar(20) DEFAULT '(555) 123-4567',
  `company_email` varchar(254) DEFAULT 'billing@progarage.com'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `billing_settings`
--

INSERT INTO `billing_settings` (`id`, `tax_rate`, `invoice_prefix`, `next_invoice_number`, `payment_terms`, `company_name`, `company_address`, `company_city`, `company_phone`, `company_email`) VALUES
(1, 0.1000, 'INV', 1009, 'Net 30', 'ProGarage', '123 Auto Lane', 'Mechanic City, MC 90210', '(555) 123-4567', 'billing@progarage.com');

-- --------------------------------------------------------

--
-- Indexes for dumped tables
--

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `number` (`number`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `technicians`
--
ALTER TABLE `technicians`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vehicle_id` (`vehicle_id`),
  ADD KEY `technician_id` (`technician_id`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_number` (`invoice_number`),
  ADD KEY `service_id` (`service_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `vehicle_id` (`vehicle_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_id` (`invoice_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `role` (`role`),
  ADD KEY `is_approved` (`is_approved`);

--
-- Indexes for table `billing_settings`
--
ALTER TABLE `billing_settings`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `billing_settings`
--
ALTER TABLE `billing_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD CONSTRAINT `vehicles_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `services`
--
ALTER TABLE `services`
  ADD CONSTRAINT `services_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `services_ibfk_2` FOREIGN KEY (`technician_id`) REFERENCES `technicians` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `invoices_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `invoices_ibfk_3` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

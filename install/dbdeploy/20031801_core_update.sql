-- phpMyAdmin SQL Dump
-- version 4.7.7
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Apr 06, 2020 at 09:27 AM
-- Server version: 5.7.29-0ubuntu0.16.04.1
-- PHP Version: 7.3.15

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
-- --------------------------------------------------------

--
-- Table structure for table `melis_core_gdpr_delete_emails_smtp`
--

CREATE TABLE `melis_core_gdpr_delete_emails_smtp` (
  `mgdpr_smtp` int(11) NOT NULL,
  `mgdpr_smtp_host` varchar(255) NOT NULL,
  `mgdpr_smtp_username` varchar(255) NOT NULL,
  `mgdpr_smtp_password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `melis_core_gdpr_delete_emails_smtp`
--
ALTER TABLE `melis_core_gdpr_delete_emails_smtp`
  ADD PRIMARY KEY (`mgdpr_smtp`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `melis_core_gdpr_delete_emails_smtp`
--
ALTER TABLE `melis_core_gdpr_delete_emails_smtp`
  MODIFY `mgdpr_smtp` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

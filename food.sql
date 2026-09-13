-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 01, 2025 at 10:06 PM
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
-- Database: `db_restaurant`
--

-- --------------------------------------------------------

--
-- Table structure for table `food`
--

CREATE TABLE `food` (
  `food_id` int(11) NOT NULL,
  `food_name` varchar(255) DEFAULT NULL,
  `food_star` varchar(255) DEFAULT NULL,
  `food_vote` varchar(255) DEFAULT NULL,
  `food_price` varchar(255) DEFAULT NULL,
  `food_discount` varchar(255) DEFAULT NULL,
  `food_desc` varchar(255) DEFAULT NULL,
  `food_status` varchar(255) DEFAULT NULL,
  `food_type` varchar(255) DEFAULT NULL,
  `food_category` varchar(255) DEFAULT NULL,
  `food_src` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `food`
--

INSERT INTO `food` (`food_id`, `food_name`, `food_star`, `food_vote`, `food_price`, `food_discount`, `food_desc`, `food_status`, `food_type`, `food_category`, `food_src`) VALUES
(1, 'carne asada tacos', '4.5', '999', '12.00', '0.00', '03 pieces per serving', 'best seller', 'meat', 'taco', 'taco/taco-1.png'),
(2, 'shrimp tacos', '4.5', '999', '15.00', '3.00', '03 pieces per serving', 'best seller', 'meat', 'taco', 'taco/taco-2.png'),
(3, 'barbacoa tacos', '4.5', '500', '12.00', '0.00', '03 pieces per serving', 'best seller', 'meat', 'taco', 'taco/taco-3.png'),
(4, 'tacos al pastor', '4.5', '999', '13.00', '2.00', '03 pieces per serving', 'best seller', 'meat', 'taco', 'taco/taco-4.png'),
(5, 'tinga tacos', '4', '500', '11.00', '0.00', '03 pieces per serving', 'normal', 'meat', 'taco', 'taco/taco-5.png'),
(6, 'campechanos tacos', '4', '500', '11.00', '1.00', '03 pieces per serving', 'new dishes', 'meat', 'taco', 'taco/taco-6.png'),
(7, 'carnitas tacos', '4.5', '500', '14.00', '2.00', '03 pieces per serving', 'seasonal dishes online only', 'meat', 'taco', 'taco/taco-7.png'),
(8, 'vegan tacos', '4.5', '100', '9.00', '2.00', '03 pieces per serving', 'new dishes', 'vegan', 'taco', 'taco/taco-8.png'),
(9, 'wet burrito', '4.5', '600', '14.00', '0.00', '01 roll per serving', 'new dishes', 'meat', 'burrito', 'burrito/burrito-1.png'),
(10, 'poncho burrito', '4.5', '999', '15.00', '3.00', '01 roll per serving', 'best seller', 'meat', 'burrito', 'burrito/burrito-2.png'),
(11, 'bean & cheese burrito', '4.5', '999', '14.00', '0.00', '01 roll per serving', 'best seller', 'vegan', 'burrito', 'burrito/burrito-3.png'),
(12, 'breakfast burrito', '4.5', '999', '12.00', '2.00', '01 roll per serving', 'new dishes', 'meat', 'burrito', 'burrito/burrito-4.png'),
(13, 'california burrito', '4.5', '999', '14.00', '0.00', '01 roll per serving', 'best seller', 'meat', 'burrito', 'burrito/burrito-5.png'),
(14, 'chimichanga', '4', '400', '12.00', '2.00', '01 roll per serving', 'seasonal dishes', 'meat', 'burrito', 'burrito/burrito-6.png'),
(15, 'nacho tots', '4', '699', '12.00', '2.00', '01 tray per serving', 'best seller', 'meat', 'nachos', 'nachos/nachos-1.png'),
(16, 'root beer pork nachos', '4.5', '999', '12.00', '0.00', '01 tray per serving', 'best seller', 'meat', 'nachos', 'nachos/nachos-2.png'),
(17, 'shrimp nachos', '4.5', '999', '17.00', '2.00', '01 tray per serving', 'best seller', 'meat', 'nachos', 'nachos/nachos-3.png'),
(18, 'chicken nachos', '4.5', '999', '11.00', '0.00', '01 tray per serving', 'best seller', 'meat', 'nachos', 'nachos/nachos-4.png'),
(19, 'only nachos', '4', '999', '7.00', '2.00', '01 tray per serving', 'normal', 'vegan', 'nachos', 'nachos/nachos-5.png'),
(20, 'pico de gallo', '4.5', '999', '5.00', '2.00', '01 bowl per serving', 'best seller', 'vegan', 'nachos', 'nachos/salsa-1.png'),
(21, 'salsa guille', '4', '699', '5.00', '2.00', '01 bowl per serving', 'best seller', 'vegan', 'nachos', 'nachos/salsa-2.png'),
(22, 'tomatillo salsa', '4.5', '499', '5.00', '2.00', '01 bowl per serving', 'seasonal dishes', 'vegan', 'nachos', 'nachos/salsa-3.png'),
(23, 'roasted tomato salsa', '4.5', '999', '5.00', '2.00', '01 bowl per serving', 'best seller', 'vegan', 'nachos', 'nachos/salsa-4.png'),
(24, 'guacamole', '4.5', '699', '5.00', '2.00', '01 bowl per serving', 'best seller', 'vegan', 'nachos', 'nachos/salsa-5.png'),
(25, 'corn salad', '3.5', '699', '5.00', '1.00', '01 bowl per serving', 'new dishes seasonal dishes', 'vegan', 'sides', 'side/side-1.png'),
(26, 'keto taquitos', '4.5', '999', '9.00', '0.00', '05 pieces per serving', 'best seller', 'meat', 'sides', 'side/side-2.png'),
(27, 'mexican rice', '4', '200', '5.00', '0.00', '01 bowl per serving', 'normal', 'vegan', 'sides', 'side/side-3.png'),
(28, 'cilantro lime rice', '4', '100', '5.00', '0.00', '01 bowl per serving', 'new dishes', 'vegan', 'sides', 'side/side-4.png'),
(29, 'chicken tortilla soup', '3.5', '299', '10.00', '2.00', '01 bowl per serving', 'new dishes', 'meat', 'sides', 'side/side-5.png'),
(30, 'Churros', '4.5', '999', '7.00', '0.00', '05 pieces per serving', 'best seller', 'vegan', 'dessert', 'dessert/dessert-1.png'),
(31, 'Fried Ice Cream', '4.5', '999', '5.00', '1.00', '01 piece per serving', 'best seller', 'vegan', 'dessert', 'dessert/dessert-2.png'),
(32, 'Dulce de Leche', '4.5', '50', '4.00', '0.00', '01 bowl per serving', 'new dishes', 'vegan', 'dessert', 'dessert/dessert-3.png'),
(33, 'Sweet Corn Cake', '3', '599', '4.00', '1.00', '02 pieces per serving', 'seasonal dishes online only', 'vegan', 'dessert', 'dessert/dessert-4.png'),
(34, 'Sopapillas', '4', '199', '4.00', '0.00', '10 pieces per serving', 'normal', 'vegan', 'dessert', 'dessert/dessert-5.png'),
(35, 'Conchas', '4', '299', '5.00', '0.00', '10 pieces per serving', 'normal', 'vegan', 'dessert', 'dessert/dessert-6.png'),
(36, 'Horchata', '4.5', '999', '4.00', '0.00', '01 glass per serving', 'normal', 'vegan', 'dessert', 'dessert/dessert-7.png'),
(37, 'Margarita', '4.5', '999', '5.00', '0.00', '01 glass per serving', 'best seller', 'vegan', 'drink', 'drink/drink-1.png'),
(38, 'Michelada', '4.5', '999', '5.00', '0.00', '01 glass per serving', 'best seller', 'vegan', 'drink', 'drink/drink-2.png'),
(39, 'paloma', '4.5', '599', '5.00', '0.00', '01 glass per serving', 'new dishes seasonal dishes', 'vegan', 'drink', 'drink/drink-3.png'),
(40, 'Atole', '4', '999', '5.00', '1.00', '01 glass per serving', 'best seller', 'vegan', 'drink', 'drink/drink-4.png'),
(41, 'fruit detox', '3.5', '999', '3.00', '0.00', '01 glass per serving', 'seasonal dishes best seller', 'vegan', 'drink', 'drink/drink-5.png'),
(42, 'Coca cola', '4.5', '9999', '3.00', '0.00', '01 glass per serving', 'best seller', 'vegan', 'drink', 'drink/drink-6.png');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `food`
--
ALTER TABLE `food`
  ADD PRIMARY KEY (`food_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `food`
--
ALTER TABLE `food`
  MODIFY `food_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

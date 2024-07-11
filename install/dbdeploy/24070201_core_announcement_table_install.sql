--
-- Table structure for table `melis_core_announcement`
--

DROP TABLE IF EXISTS `melis_core_announcement`;
CREATE TABLE `melis_core_announcement` (
  `mca_id` int(11) NOT NULL,
  `mca_status` tinyint(4) NOT NULL,
  `mca_title` varchar(255) NOT NULL,
  `mca_text` text NOT NULL,
  `mca_date` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `melis_core_announcement`
--
ALTER TABLE `melis_core_announcement`
  ADD PRIMARY KEY (`mca_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `melis_core_announcement`
--
ALTER TABLE `melis_core_announcement`
  MODIFY `mca_id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

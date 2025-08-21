-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 11, 2025 at 03:20 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ai_atlas`
--

-- --------------------------------------------------------

--
-- Table structure for table `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id` int(11) NOT NULL,
  `conversation_id` varchar(50) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role` enum('user','assistant') NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chat_messages`
--

INSERT INTO `chat_messages` (`id`, `conversation_id`, `user_id`, `role`, `message`, `created_at`) VALUES
(7, '6a9dbafc-670d-4253-b506-c03c8acd9702', 1, 'user', 'Hi', '2025-08-10 13:52:28'),
(8, '6a9dbafc-670d-4253-b506-c03c8acd9702', 1, 'assistant', 'Hello! How can I assist you today?', '2025-08-10 13:52:30'),
(9, '5bedd98d-d027-4dda-98b5-2e6abc2998e0', 1, 'user', 'Apple', '2025-08-10 14:00:29'),
(10, '5bedd98d-d027-4dda-98b5-2e6abc2998e0', 1, 'assistant', 'Apple Inc. is a multinational technology company headquartered in Cupertino, California. Known for its innovative products and services, Apple designs, manufactures, and markets a range of consumer electronics, software, and online services. Some of its flagship products include:\n\n1. **iPhone**: A line of smartphones that has become one of the best-selling products in history.\n2. **iPad**: A series of tablet computers that cater to various needs, from casual use to professional applications.\n3. **Mac**: A range of personal computers, including the MacBook line, iMacs, and Mac Minis.\n4. **Apple Watch**: A smartwatch that integrates fitness tracking and health monitoring with mobile notifications.\n5. **Apple TV**: A digital media player and streaming device that also includes a subscription service for original content.\n\nIn addition to hardware, Apple has developed a suite of software products and services, including:\n\n- **iOS and macOS**: Operating systems for mobile devices and computers, respectively.\n- **iCloud**: A cloud storage and cloud computing service.\n- **Apple Music**: A subscription-based music streaming service.\n- **App Store**: A marketplace for applications developed for Apple\'s ecosystem.\n\nApple is also known for its commitment to user privacy, its distinctive retail stores, and its emphasis on design aesthetics. The company has a reputation for creating an ecosystem of products that work seamlessly together, enhancing the user experience.\n\nIf you have more specific questions or topics related to Apple, feel free to ask!', '2025-08-10 14:00:37'),
(11, '2666b1be-9896-4982-8201-6df150605205', 1, 'user', 'My pc was hang ', '2025-08-10 14:03:18'),
(12, '2666b1be-9896-4982-8201-6df150605205', 1, 'assistant', 'When a PC hangs, it can be frustrating. Here are some steps you can take to troubleshoot the issue:\n\n1. **Wait It Out**: Sometimes, the system might be processing something in the background. Give it a minute or two to see if it becomes responsive again.\n\n2. **Check for Noise**: Listen for any unusual noises from the hard drive or fan. If you hear excessive clicking or grinding, it could indicate a hardware problem.\n\n3. **Try Ctrl + Alt + Delete**: This combination may bring up the Task Manager. From there, you can see if any program is using an excessive amount of resources and terminate it.\n\n4. **Force Restart**: If the PC remains unresponsive, you may need to perform a hard restart. Press and hold the power button until the PC turns off, then turn it back on.\n\n5. **Boot into Safe Mode**: If this happens often, consider booting into Safe Mode. This can help determine if the issue is software-related. To do this, restart your PC and press F8 (or Shift + F8) during startup.\n\n6. **Check for Windows Updates**: Make sure your operating system and drivers are up to date.\n\n7. **Run Antivirus**: Scan for malware, as malicious software can cause system instability.\n\n8. **Check Hardware Connections**: Ensure that all internal and external hardware connections are secure.\n\n9. **Check Event Viewer**: After your PC restarts, check the Event Viewer (Control Panel > Administrative Tools > Event Viewer) for any error messages that could indicate the cause of the hang.\n\n10. **Hardware Diagnostics**: If hardware issues are suspected, use built-in diagnostic tools from your manufacturer or third-party software to check components like RAM or hard drive.\n\n11. **Consider System Restore**: If the problem persists, consider restoring your system to an earlier point when it was functioning correctly.\n\n12. **Seek Professional Help**: If you\'re still having issues after trying these steps, it may be worth consulting a technician.\n\nIf you have more details about your situation (like what you were doing when it hung, or if it’s a recurring problem), I can help further!', '2025-08-10 14:03:29'),
(13, '2666b1be-9896-4982-8201-6df150605205', 1, 'user', 'Ouhh i see', '2025-08-10 14:04:43'),
(14, '2666b1be-9896-4982-8201-6df150605205', 1, 'assistant', 'I\'m glad the information was helpful! If you have any more questions or if there\'s anything else you\'d like to know about troubleshooting your PC or related topics, feel free to ask!', '2025-08-10 14:04:44'),
(15, '1307a433-af27-4047-9b7d-2785178c33f6', 1, 'user', 'Hye', '2025-08-10 14:26:01'),
(16, '1307a433-af27-4047-9b7d-2785178c33f6', 1, 'assistant', 'Hello! How can I assist you today?', '2025-08-10 14:26:03'),
(17, '1307a433-af27-4047-9b7d-2785178c33f6', 1, 'user', 'What is requirement in the magazine assignment', '2025-08-10 14:26:26'),
(18, '1307a433-af27-4047-9b7d-2785178c33f6', 1, 'assistant', 'The requirements for a magazine assignment can vary widely depending on the specific guidelines provided by your instructor or the publication you\'re targeting. However, here are some common elements that may be included in a magazine assignment:\n\n1. **Topic Selection**: Choose a relevant, engaging topic that fits the theme of the magazine.\n\n2. **Research**: Conduct thorough research on your topic to gather accurate information and statistics. Use credible sources.\n\n3. **Target Audience**: Identify and consider the magazine\'s target audience. Tailor your content to suit their interests and reading level.\n\n4. **Article Structure**: Follow a clear structure, typically including:\n   - **Headline**: A catchy title that grabs attention.\n   - **Lead**: An engaging opening that summarizes the main idea.\n   - **Body**: Well-organized paragraphs that provide in-depth information, insights, and analysis.\n   - **Conclusion**: A strong closing statement that reinforces the main points.\n\n5. **Visuals**: Include images, graphs, or other graphics if required, and ensure they are relevant and high quality.\n\n6. **Style and Tone**: Write in a style appropriate for the magazine\'s audience. This could be conversational, formal, persuasive, etc.\n\n7. **Citations**: Properly cite any sources used to avoid plagiarism and to lend credibility to your work.\n\n8. **Word Count**: Adhere to the specified word count or length guidelines.\n\n9. **Editing and Proofreading**: Ensure your article is free of typos, grammatical errors, and follows any specific formatting requirements.\n\n10. **Deadline**: Submit your assignment on or before the deadline.\n\nIf you have specific guidelines or requirements from your instructor, it would be helpful to refer to those directly. Let me know if you need help with any specific aspect of your assignment!', '2025-08-10 14:26:34');

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `user_id` int(11) NOT NULL,
  `token` varchar(64) NOT NULL,
  `expires_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `password_resets`
--

INSERT INTO `password_resets` (`user_id`, `token`, `expires_at`) VALUES
(2, '7ae31650491b0cf3b61d2d2c7adec8c65a57ea1fbd7879689215ee6bd08c50db', '2025-08-10 13:57:18');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `created_at`) VALUES
(1, 'admin', 'admin@gmail.com', '$2b$10$nQvREiVqmsCGYV88PbFX/OHqjwxNeXyQE/tYkfC1AsodXYYN1Zddm', '2025-08-10 03:42:31'),
(2, 'Daus', 'dauss1317@gmail.com', '$2b$10$TBdlkP6lAHiZ7WPELedNMOtrFzfYD0bSSFRUeKnjDP.o1P3OkuejW', '2025-08-10 04:06:43'),
(3, 'Adam', 'adam@gmail.com', '$2b$10$yZylaDqnnXz0AG1D1CauduCgmzTv.TLsi0uCguoBKgUO3orEicvvW', '2025-08-10 04:08:01');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD CONSTRAINT `password_resets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

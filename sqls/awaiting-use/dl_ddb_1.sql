-- MySQL dump 10.13  Distrib 5.7.44, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: dl_ddb_1
-- ------------------------------------------------------
-- Server version	5.7.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES latin1 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `dl_ddb_1`
--

/*!40000 DROP DATABASE IF EXISTS `dl_ddb_1`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `dl_ddb_1` /*!40100 DEFAULT CHARACTER SET latin1 */;

USE `dl_ddb_1`;

--
-- Table structure for table `activate_user_data`
--

DROP TABLE IF EXISTS `activate_user_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activate_user_data` (
  `path` varchar(128) NOT NULL DEFAULT '',
  `name` varchar(128) NOT NULL DEFAULT '',
  `branch` varchar(128) NOT NULL DEFAULT '',
  `content` text NOT NULL,
  `time` varchar(14) NOT NULL DEFAULT '',
  `checksum` int(32) NOT NULL DEFAULT '0',
  `memo` text,
  `update_time` varchar(14) NOT NULL DEFAULT '',
  PRIMARY KEY (`path`,`name`,`branch`),
  KEY `name` (`name`) USING BTREE,
  KEY `update_time` (`update_time`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activate_user_data`
--

LOCK TABLES `activate_user_data` WRITE;
/*!40000 ALTER TABLE `activate_user_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `activate_user_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_recognize`
--

DROP TABLE IF EXISTS `admin_recognize`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admin_recognize` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `iid` varchar(32) NOT NULL DEFAULT '',
  `name` varchar(128) NOT NULL DEFAULT '',
  `level` int(11) NOT NULL DEFAULT '0',
  `day` int(11) NOT NULL DEFAULT '0',
  `owner_gid` varchar(16) NOT NULL DEFAULT '',
  `owner_name` varchar(32) NOT NULL DEFAULT '',
  `update_time` varchar(14) NOT NULL DEFAULT '',
  `data` text,
  `reason` text,
  PRIMARY KEY (`id`),
  KEY `iid` (`iid`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_recognize`
--

LOCK TABLES `admin_recognize` WRITE;
/*!40000 ALTER TABLE `admin_recognize` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_recognize` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attention_data`
--

DROP TABLE IF EXISTS `attention_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `attention_data` (
  `attention_type` varchar(32) NOT NULL DEFAULT '',
  `attention_id` varchar(128) NOT NULL DEFAULT '',
  `content` text NOT NULL,
  `time` char(14) NOT NULL DEFAULT '',
  PRIMARY KEY (`attention_type`,`attention_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attention_data`
--

LOCK TABLES `attention_data` WRITE;
/*!40000 ALTER TABLE `attention_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `attention_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `basic_char_info`
--

DROP TABLE IF EXISTS `basic_char_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `basic_char_info` (
  `gid` varchar(32) NOT NULL DEFAULT '',
  `name` varchar(32) NOT NULL DEFAULT '',
  `polar` tinyint(4) NOT NULL DEFAULT '0',
  `gender` tinyint(4) NOT NULL DEFAULT '0',
  `tt_weibo_name` varchar(128) NOT NULL DEFAULT '',
  `hide_tt_weibo` tinyint(4) NOT NULL DEFAULT '0',
  `time` varchar(14) NOT NULL DEFAULT '',
  PRIMARY KEY (`gid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `basic_char_info`
--

LOCK TABLES `basic_char_info` WRITE;
/*!40000 ALTER TABLE `basic_char_info` DISABLE KEYS */;
/*!40000 ALTER TABLE `basic_char_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bottle_data`
--

DROP TABLE IF EXISTS `bottle_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bottle_data` (
  `bid` varchar(48) NOT NULL DEFAULT '',
  `type` tinyint(4) NOT NULL DEFAULT '0',
  `anonymous` tinyint(4) NOT NULL DEFAULT '0',
  `recv_dist` varchar(32) NOT NULL DEFAULT '',
  `recv_gid` char(16) NOT NULL DEFAULT '',
  `recv_name` varchar(32) NOT NULL DEFAULT '',
  `recv_level` int(11) NOT NULL DEFAULT '0',
  `recv_polar` tinyint(4) NOT NULL DEFAULT '0',
  `recv_gender` tinyint(4) NOT NULL DEFAULT '0',
  `recv_time` char(14) NOT NULL DEFAULT '',
  `recv_read` tinyint(4) NOT NULL DEFAULT '0',
  `send_dist` varchar(32) NOT NULL DEFAULT '',
  `send_gid` char(16) NOT NULL DEFAULT '',
  `send_name` varchar(32) NOT NULL DEFAULT '',
  `send_level` int(11) NOT NULL DEFAULT '0',
  `send_polar` tinyint(4) NOT NULL DEFAULT '0',
  `send_gender` tinyint(4) NOT NULL DEFAULT '0',
  `send_time` char(14) NOT NULL DEFAULT '',
  `send_read` tinyint(4) NOT NULL DEFAULT '0',
  `comments` text NOT NULL,
  `destroy_time` char(14) NOT NULL DEFAULT '',
  `time` char(14) NOT NULL DEFAULT '',
  PRIMARY KEY (`bid`),
  KEY `recv_gid` (`recv_dist`,`recv_gid`) USING BTREE,
  KEY `send_gid` (`send_dist`,`send_gid`) USING BTREE,
  KEY `recv_time` (`recv_time`) USING BTREE,
  KEY `send_time` (`send_time`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bottle_data`
--

LOCK TABLES `bottle_data` WRITE;
/*!40000 ALTER TABLE `bottle_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `bottle_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data`
--

DROP TABLE IF EXISTS `data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data` (
  `path` varchar(128) NOT NULL DEFAULT '',
  `name` varchar(128) NOT NULL DEFAULT '',
  `branch` varchar(128) NOT NULL DEFAULT '',
  `content` text NOT NULL,
  `time` varchar(14) NOT NULL DEFAULT '',
  `checksum` int(32) NOT NULL DEFAULT '0',
  `memo` text,
  PRIMARY KEY (`path`,`name`,`branch`),
  KEY `name_path` (`name`,`path`) USING BTREE,
  KEY `path_time` (`path`,`time`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data`
--

LOCK TABLES `data` WRITE;
/*!40000 ALTER TABLE `data` DISABLE KEYS */;
/*!40000 ALTER TABLE `data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data1`
--

DROP TABLE IF EXISTS `data1`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data1` (
  `path` varchar(128) NOT NULL DEFAULT '',
  `name` varchar(128) NOT NULL DEFAULT '',
  `branch` varchar(128) NOT NULL DEFAULT '',
  `content` text NOT NULL,
  `time` varchar(14) NOT NULL DEFAULT '',
  `checksum` int(32) NOT NULL DEFAULT '0',
  `memo` text,
  PRIMARY KEY (`path`,`name`,`branch`),
  KEY `name_path` (`name`,`path`) USING BTREE,
  KEY `path_time` (`path`,`time`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data1`
--

LOCK TABLES `data1` WRITE;
/*!40000 ALTER TABLE `data1` DISABLE KEYS */;
/*!40000 ALTER TABLE `data1` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gid_info`
--

DROP TABLE IF EXISTS `gid_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gid_info` (
  `gid` bigint(20) NOT NULL AUTO_INCREMENT,
  `type` varchar(128) NOT NULL DEFAULT '',
  `name` varchar(128) NOT NULL DEFAULT '',
  `time` varchar(14) NOT NULL DEFAULT '',
  `memo` text,
  PRIMARY KEY (`gid`),
  KEY `name` (`name`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gid_info`
--

LOCK TABLES `gid_info` WRITE;
/*!40000 ALTER TABLE `gid_info` DISABLE KEYS */;
/*!40000 ALTER TABLE `gid_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_deposit`
--

DROP TABLE IF EXISTS `item_deposit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `item_deposit` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_iid` varchar(32) NOT NULL DEFAULT '',
  `item_name` varchar(128) NOT NULL DEFAULT '',
  `item_level` int(4) NOT NULL DEFAULT '0',
  `status` tinyint(4) NOT NULL DEFAULT '0',
  `item_data` text NOT NULL,
  `org_owner_gid` varchar(16) NOT NULL DEFAULT '',
  `org_owner_name` varchar(32) NOT NULL DEFAULT '',
  `new_owner_gid` varchar(16) NOT NULL DEFAULT '',
  `new_owner_name` varchar(32) NOT NULL DEFAULT '',
  `deposit_owner` varchar(32) NOT NULL DEFAULT '',
  `deposit_time` varchar(14) NOT NULL DEFAULT '',
  `deposit_reason` text NOT NULL,
  `take_owner` varchar(32) NOT NULL DEFAULT '',
  `take_time` varchar(14) NOT NULL DEFAULT '',
  `take_reason` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `item_iid` (`item_iid`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_deposit`
--

LOCK TABLES `item_deposit` WRITE;
/*!40000 ALTER TABLE `item_deposit` DISABLE KEYS */;
/*!40000 ALTER TABLE `item_deposit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `online_update`
--

DROP TABLE IF EXISTS `online_update`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `online_update` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `update_name` varchar(128) NOT NULL DEFAULT '',
  `server_ver` varchar(32) NOT NULL DEFAULT '',
  `server_type` varchar(16) NOT NULL DEFAULT '',
  `content` mediumtext NOT NULL,
  `checksum` int(32) NOT NULL DEFAULT '0',
  `memo` text,
  PRIMARY KEY (`update_name`,`server_ver`,`server_type`),
  KEY `ver_type` (`server_ver`,`server_type`) USING BTREE,
  KEY `id` (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `online_update`
--

LOCK TABLES `online_update` WRITE;
/*!40000 ALTER TABLE `online_update` DISABLE KEYS */;
/*!40000 ALTER TABLE `online_update` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pet_deposit`
--

DROP TABLE IF EXISTS `pet_deposit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pet_deposit` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pet_iid` varchar(32) NOT NULL DEFAULT '',
  `pet_name` varchar(128) NOT NULL DEFAULT '',
  `pet_level` int(4) NOT NULL DEFAULT '0',
  `status` tinyint(4) NOT NULL DEFAULT '0',
  `pet_data` text NOT NULL,
  `org_owner_gid` varchar(16) NOT NULL DEFAULT '',
  `org_owner_name` varchar(32) NOT NULL DEFAULT '',
  `new_owner_gid` varchar(16) NOT NULL DEFAULT '',
  `new_owner_name` varchar(32) NOT NULL DEFAULT '',
  `deposit_owner` varchar(32) NOT NULL DEFAULT '',
  `deposit_time` varchar(14) NOT NULL DEFAULT '',
  `deposit_reason` text NOT NULL,
  `take_owner` varchar(32) NOT NULL DEFAULT '',
  `take_time` varchar(14) NOT NULL DEFAULT '',
  `take_reason` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pet_iid` (`pet_iid`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pet_deposit`
--

LOCK TABLES `pet_deposit` WRITE;
/*!40000 ALTER TABLE `pet_deposit` DISABLE KEYS */;
/*!40000 ALTER TABLE `pet_deposit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `property_recall`
--

DROP TABLE IF EXISTS `property_recall`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `property_recall` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `update_time` varchar(14) NOT NULL DEFAULT '',
  `type` varchar(16) NOT NULL DEFAULT '',
  `owner` varchar(16) NOT NULL DEFAULT '',
  `iid` varchar(32) NOT NULL DEFAULT '',
  `name` varchar(32) DEFAULT '',
  `ob_type` tinyint(4) unsigned DEFAULT NULL,
  `take` tinyint(4) unsigned DEFAULT NULL,
  `exchange` tinyint(4) unsigned DEFAULT '0',
  `depend` varchar(16) DEFAULT NULL,
  `checksum` int(32) NOT NULL DEFAULT '0',
  `data` text,
  `memo` text,
  PRIMARY KEY (`id`),
  KEY `iid` (`iid`) USING BTREE,
  KEY `owner` (`update_time`,`owner`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `property_recall`
--

LOCK TABLES `property_recall` WRITE;
/*!40000 ALTER TABLE `property_recall` DISABLE KEYS */;
/*!40000 ALTER TABLE `property_recall` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_store`
--

DROP TABLE IF EXISTS `purchase_store`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `purchase_store` (
  `order_id` varchar(32) NOT NULL DEFAULT '',
  `owner` varchar(16) NOT NULL DEFAULT '',
  `name` varchar(16) NOT NULL DEFAULT '',
  `used` tinyint(1) NOT NULL DEFAULT '0',
  `time` varchar(14) NOT NULL DEFAULT '0',
  `content` text,
  `sub_amount` int(11) unsigned DEFAULT NULL,
  `amount` int(11) unsigned DEFAULT NULL,
  `type` tinyint(2) unsigned DEFAULT NULL,
  `end_time` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`order_id`),
  KEY `owner` (`owner`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_store`
--

LOCK TABLES `purchase_store` WRITE;
/*!40000 ALTER TABLE `purchase_store` DISABLE KEYS */;
/*!40000 ALTER TABLE `purchase_store` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `red_envelope`
--

DROP TABLE IF EXISTS `red_envelope`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `red_envelope` (
  `name` varchar(32) NOT NULL DEFAULT '',
  `iid` varchar(32) NOT NULL DEFAULT '',
  `state` tinyint(4) NOT NULL DEFAULT '0',
  `type` tinyint(4) NOT NULL DEFAULT '0',
  `total_coin` int(11) NOT NULL DEFAULT '0',
  `cur_coin` int(11) NOT NULL DEFAULT '0',
  `total_num` int(11) NOT NULL DEFAULT '0',
  `cur_num` int(11) NOT NULL DEFAULT '0',
  `deadline` int(11) NOT NULL DEFAULT '0',
  `use` tinyint(4) NOT NULL DEFAULT '0',
  `checksum` int(32) NOT NULL DEFAULT '0',
  `memo` text,
  PRIMARY KEY (`name`,`iid`,`use`),
  KEY `iid` (`iid`,`name`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `red_envelope`
--

LOCK TABLES `red_envelope` WRITE;
/*!40000 ALTER TABLE `red_envelope` DISABLE KEYS */;
/*!40000 ALTER TABLE `red_envelope` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `top_data`
--

DROP TABLE IF EXISTS `top_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `top_data` (
  `top_index` int(11) NOT NULL DEFAULT '0',
  `top_key` varchar(128) NOT NULL DEFAULT '',
  `top_content` text NOT NULL,
  `time` char(14) NOT NULL DEFAULT '',
  PRIMARY KEY (`top_index`,`top_key`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `top_data`
--

LOCK TABLES `top_data` WRITE;
/*!40000 ALTER TABLE `top_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `top_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transfer_data`
--

DROP TABLE IF EXISTS `transfer_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transfer_data` (
  `transfer_id` varchar(32) NOT NULL DEFAULT '',
  `owner` varchar(16) NOT NULL DEFAULT '',
  `class` varchar(32) NOT NULL DEFAULT '',
  `type` varchar(32) NOT NULL DEFAULT '',
  `iid` varchar(32) NOT NULL DEFAULT '',
  `name` varchar(32) NOT NULL DEFAULT '',
  `data` text NOT NULL,
  `source` varchar(32) NOT NULL DEFAULT '',
  `title` varchar(128) NOT NULL DEFAULT '',
  `mesg_ok` varchar(255) NOT NULL DEFAULT '',
  `mesg_cht` varchar(255) NOT NULL DEFAULT '',
  `tip` varchar(255) NOT NULL DEFAULT '',
  `time` int(11) NOT NULL DEFAULT '0',
  `limit_day` int(11) NOT NULL DEFAULT '0',
  `state` tinyint(4) NOT NULL DEFAULT '0',
  `transfer_account` varchar(16) NOT NULL DEFAULT '',
  `transfer_time` varchar(14) NOT NULL DEFAULT '',
  `request_gid` varchar(16) NOT NULL DEFAULT '',
  `request_time` varchar(14) NOT NULL DEFAULT '',
  `checksum` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`transfer_id`),
  KEY `owner` (`owner`) USING BTREE,
  KEY `iid` (`iid`) USING BTREE,
  KEY `class` (`class`) USING BTREE,
  KEY `type` (`type`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transfer_data`
--

LOCK TABLES `transfer_data` WRITE;
/*!40000 ALTER TABLE `transfer_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `transfer_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `xg_name`
--

DROP TABLE IF EXISTS `xg_name`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `xg_name` (
  `account` varchar(32) NOT NULL DEFAULT '',
  `xg_type` varchar(32) NOT NULL DEFAULT '',
  `name` varchar(32) NOT NULL DEFAULT '',
  `time` char(14) NOT NULL DEFAULT '',
  PRIMARY KEY (`account`,`xg_type`),
  KEY `xg_type` (`xg_type`,`name`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `xg_name`
--

LOCK TABLES `xg_name` WRITE;
/*!40000 ALTER TABLE `xg_name` DISABLE KEYS */;
/*!40000 ALTER TABLE `xg_name` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'dl_ddb_1'
--

--
-- Dumping routines for database 'dl_ddb_1'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-25  2:15:57

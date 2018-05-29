// Begin Consts
global["SWARM_VERSION_DATE"] = "2018-5-29 06:36:09";

/** Constants for personal swarm configuration */
global["MY_USERNAME"] = "Deign"; 
global["MY_SIGNATURE"] = "Greetings.  I mean you no harm.  But I might defend myself -- SwarmOSv1.0.1"; 

/** Package names for installation */
global["PKG_FlagManager"] = "FlagManager"; 
global["PKG_CreepRegistry"] = "CreepRegistry"; 
global["PKG_SwarmManager"] = "SwarmManager"; 
global["PKG_SpawnRegistry"] = "SpawnRegistry"; 
global["PKG_RoomManager"] = "RoomManager"; 
global["PKG_SimpleOwnedRoom"] = "SimpleOwnedRoom"; 
global["PKG_FlagBase"] = "FlagBase"; 

/** Creep job packages */
global["CJ_Harvester"] = "CJ_Harvester"; 
global["CJ_Refiller"] = "CJ_Refiller"; 
global["CJ_Upgrade"] = "CJ_Upgrade"; 
global["CJ_Build"] = "CJ_Build"; 
global["CJ_Repair"] = "CJ_Repair"; 

/** Creep group packages */
global["CG_SimpleSource"] = "CG_SimpleSource"; 
global["CG_Source"] = "CG_Source"; 
global["CG_Control"] = "CG_Control"; 
global["CG_Infrastructure"] = "CG_Infrastructure"; 
global["CG_Refill"] = "CG_Refill"; 
global["CG_SelfDefense"] = "CG_SelfDefense"; 

/** Extensions provided by packages for processless package interactions */
global["EXT_CreepRegistry"] = "creeps"; 
global["EXT_Registry"] = "extRegistry"; 
global["EXT_SpawnRegistry"] = "spawner"; 
global["EXT_RoomView"] = "roomView"; 
global["EXT_Flags"] = "flags"; 
global["EXT_Kernel"] = "kernel"; 
global["EXT_Sleep"] = "sleep"; 
global["EXT_Interrupt"] = "interrupt"; 
global["EXT_Logger"] = "logger"; 

/** Type of targetting (e.g. how to find new targets) */
global["TT_None"] = 0; 
global["TT_SpawnRefill"] = 1; 
global["TT_Harvest"] = 2; 
global["TT_Repair"] = 3; 
global["TT_Builder"] = 4; 
global["TT_Upgrader"] = 5; 
global["TT_SupportHarvest"] = 6; 
global["TT_SupportFiller"] = 7; 

/** Functional Tests */
global["FT_InterruptListener"] = "interrupt_listener"; 
global["FT_InterruptNotifier"] = "interrupt_notifier"; 

/** Logger Priority */
global["LOG_ALERT"] = 6; 
global["LOG_DEBUG"] = 1; 
global["LOG_ERROR"] = 4; 
global["LOG_FATAL"] = 5; 
global["LOG_INFO"] = 2; 
global["LOG_TRACE"] = 0; 
global["LOG_WARN"] = 3; 

/** Spawn State -- The state of a given spawn request */
global["SP_ERROR"] = -1; 
global["SP_QUEUED"] = 1; 
global["SP_SPAWNING"] = 2; 
global["SP_COMPLETE"] = 3; 

/** Swarm Result -- Unique return results from SwarmOS services */
global["SR_NONE"] = 0; 
global["SR_INVALID"] = -1; 
global["SR_MISSING_TARGET"] = -2; 
global["SR_REQUIRES_ENERGY"] = -3; 
global["SR_TARGET_INELLIGIBLE"] = -4; 
global["SR_ACTION_UNNECESSARY"] = -5; 
global["SR_NOT_IMPLEMENTED"] = -6; 
global["SR_REQ_REJECTED"] = -7; 
global["SR_MOVE"] = -8; 

/** Energy to cost conversion */
global["E2C_MaxSpawnDistance"] = 200; 
global["E2C_SpawnDistance"] = 100; 

/** Default values */
global["DEFAULT_LOG_LEVEL"] = 2; 
global["DEFAULT_LOG_ID"] = "SwarmOS"; 

/** Priority values */
global["Priority_Hold"] = -1; 
global["Priority_Lowest"] = 1; 
global["Priority_Low"] = 3; 
global["Priority_Medium"] = 5; 
global["Priority_High"] = 7; 
global["Priority_Highest"] = 9; 
global["Priority_EMERGENCY"] = 10; 

/** State of a thread */
global["ThreadState_Inactive"] = 0; 
global["ThreadState_Active"] = 1; 
global["ThreadState_Waiting"] = 2; 
global["ThreadState_Done"] = 3; 
global["ThreadState_Overrun"] = 4; 

/** The state of a creep's job assignment */
global["JobState_Inactive"] = 0; 
global["JobState_Starting"] = 1; 
global["JobState_Spawning"] = 2; 
global["JobState_Preparing"] = 3; 
global["JobState_Running"] = 4; 
global["JobState_Complete"] = 5; 

/** Action type */
global["AT_Attack"] = "Attack"; 
global["AT_Build"] = "Build"; 
global["AT_Drop"] = "Drop"; 
global["AT_Harvest"] = "Harvest"; 
global["AT_MoveToPosition"] = "MoveToPosition"; 
global["AT_NoOp"] = "NoOp"; 
global["AT_Pickup"] = "Pickup"; 
global["AT_Repair"] = "Repair"; 
global["AT_RequestTransfer"] = "RequestTransfer"; 
global["AT_Say"] = "Say"; 
global["AT_Transfer"] = "Transfer"; 
global["AT_Upgrade"] = "Upgrade"; 
global["AT_Withdraw"] = "Withdraw"; 

// End Consts

// Begin creep definitions
global["CT_Harvester"] = "Harvester"; 
global["CTREF_Harvester_0"] = {CT_id:CT_Harvester, lvl:0}; 
global["CTREF_Harvester_1"] = {CT_id:CT_Harvester, lvl:1}; 
global["CTREF_Harvester_2"] = {CT_id:CT_Harvester, lvl:2}; 
global["CTREF_Harvester_3"] = {CT_id:CT_Harvester, lvl:3}; 
const DEFINITION_Harvester = [{w:2,c:1,m:1,cost:300,lvl:0,ct_ID:CT_Harvester,ctref_ID:CTREF_Harvester_0},{w:5,m:1,cost:550,lvl:1,ct_ID:CT_Harvester,ctref_ID:CTREF_Harvester_1},{w:6,c:1,m:3,cost:800,lvl:2,ct_ID:CT_Harvester,ctref_ID:CTREF_Harvester_2},{w:15,c:1,m:3,cost:1700,lvl:3,ct_ID:CT_Harvester,ctref_ID:CTREF_Harvester_3}];
global["CT_Worker"] = "Worker"; 
global["CTREF_Worker_0"] = {CT_id:CT_Worker, lvl:0}; 
global["CTREF_Worker_1"] = {CT_id:CT_Worker, lvl:1}; 
global["CTREF_Worker_2"] = {CT_id:CT_Worker, lvl:2}; 
global["CTREF_Worker_3"] = {CT_id:CT_Worker, lvl:3}; 
global["CTREF_Worker_4"] = {CT_id:CT_Worker, lvl:4}; 
global["CTREF_Worker_5"] = {CT_id:CT_Worker, lvl:5}; 
const DEFINITION_Worker = [{w:1,c:2,m:2,cost:300,lvl:0,ct_ID:CT_Worker,ctref_ID:CTREF_Worker_0},{w:2,c:4,m:3,cost:550,lvl:1,ct_ID:CT_Worker,ctref_ID:CTREF_Worker_1},{w:2,c:6,m:4,cost:700,lvl:2,ct_ID:CT_Worker,ctref_ID:CTREF_Worker_2},{w:4,c:8,m:6,cost:1100,lvl:3,ct_ID:CT_Worker,ctref_ID:CTREF_Worker_3},{w:5,c:15,m:10,cost:1750,lvl:4,ct_ID:CT_Worker,ctref_ID:CTREF_Worker_4},{w:15,c:25,m:10,cost:3250,lvl:5,ct_ID:CT_Worker,ctref_ID:CTREF_Worker_5}];
global["CT_Builder"] = "Builder"; 
global["CTREF_Builder_0"] = {CT_id:CT_Builder, lvl:0}; 
global["CTREF_Builder_1"] = {CT_id:CT_Builder, lvl:1}; 
global["CTREF_Builder_2"] = {CT_id:CT_Builder, lvl:2}; 
global["CTREF_Builder_3"] = {CT_id:CT_Builder, lvl:3}; 
const DEFINITION_Builder = [{w:1,c:2,m:2,cost:300,lvl:0,ct_ID:CT_Builder,ctref_ID:CTREF_Builder_0},{w:2,c:6,m:4,cost:700,lvl:1,ct_ID:CT_Builder,ctref_ID:CTREF_Builder_1},{w:4,c:16,m:10,cost:1700,lvl:2,ct_ID:CT_Builder,ctref_ID:CTREF_Builder_2},{w:5,c:25,m:15,cost:2500,lvl:3,ct_ID:CT_Builder,ctref_ID:CTREF_Builder_3}];
global["CT_Upgrader"] = "Upgrader"; 
global["CTREF_Upgrader_0"] = {CT_id:CT_Upgrader, lvl:0}; 
global["CTREF_Upgrader_1"] = {CT_id:CT_Upgrader, lvl:1}; 
global["CTREF_Upgrader_2"] = {CT_id:CT_Upgrader, lvl:2}; 
global["CTREF_Upgrader_3"] = {CT_id:CT_Upgrader, lvl:3}; 
global["CTREF_Upgrader_4"] = {CT_id:CT_Upgrader, lvl:4}; 
global["CTREF_Upgrader_5"] = {CT_id:CT_Upgrader, lvl:5}; 
global["CTREF_Upgrader_6"] = {CT_id:CT_Upgrader, lvl:6}; 
const DEFINITION_Upgrader = [{w:1,c:1,m:1,cost:200,lvl:0,ct_ID:CT_Upgrader,ctref_ID:CTREF_Upgrader_0},{w:2,c:4,m:2,cost:500,lvl:1,ct_ID:CT_Upgrader,ctref_ID:CTREF_Upgrader_1},{w:2,c:7,m:3,cost:700,lvl:2,ct_ID:CT_Upgrader,ctref_ID:CTREF_Upgrader_2},{w:4,c:14,m:6,cost:1400,lvl:3,ct_ID:CT_Upgrader,ctref_ID:CTREF_Upgrader_3},{w:6,c:20,m:2,cost:1700,lvl:4,ct_ID:CT_Upgrader,ctref_ID:CTREF_Upgrader_4},{w:10,c:30,m:5,cost:2750,lvl:5,ct_ID:CT_Upgrader,ctref_ID:CTREF_Upgrader_5},{w:15,c:35,m:5,cost:3500,lvl:6,ct_ID:CT_Upgrader,ctref_ID:CTREF_Upgrader_6}];
global["CT_Refiller"] = "Refiller"; 
global["CTREF_Refiller_0"] = {CT_id:CT_Refiller, lvl:0}; 
global["CTREF_Refiller_1"] = {CT_id:CT_Refiller, lvl:1}; 
global["CTREF_Refiller_2"] = {CT_id:CT_Refiller, lvl:2}; 
global["CTREF_Refiller_3"] = {CT_id:CT_Refiller, lvl:3}; 
global["CTREF_Refiller_4"] = {CT_id:CT_Refiller, lvl:4}; 
const DEFINITION_Refiller = [{w:1,c:2,m:2,cost:300,lvl:0,ct_ID:CT_Refiller,ctref_ID:CTREF_Refiller_0},{c:4,m:4,cost:400,lvl:1,ct_ID:CT_Refiller,ctref_ID:CTREF_Refiller_1},{c:8,m:8,cost:800,lvl:2,ct_ID:CT_Refiller,ctref_ID:CTREF_Refiller_2},{c:12,m:12,cost:1200,lvl:3,ct_ID:CT_Refiller,ctref_ID:CTREF_Refiller_3},{c:20,m:20,cost:2000,lvl:4,ct_ID:CT_Refiller,ctref_ID:CTREF_Refiller_4}];
global["CT_Scout"] = "Scout"; 
global["CTREF_Scout_0"] = {CT_id:CT_Scout, lvl:0}; 
global["CTREF_Scout_1"] = {CT_id:CT_Scout, lvl:1}; 
global["CTREF_Scout_2"] = {CT_id:CT_Scout, lvl:2}; 
global["CTREF_Scout_3"] = {CT_id:CT_Scout, lvl:3}; 
const DEFINITION_Scout = [{t:2,m:2,cost:120,lvl:0,ct_ID:CT_Scout,ctref_ID:CTREF_Scout_0},{t:2,m:4,cost:220,lvl:1,ct_ID:CT_Scout,ctref_ID:CTREF_Scout_1},{t:4,m:8,cost:440,lvl:2,ct_ID:CT_Scout,ctref_ID:CTREF_Scout_2},{t:8,m:8,cost:480,lvl:3,ct_ID:CT_Scout,ctref_ID:CTREF_Scout_3}];
global["CT_Repair"] = "Repair"; 
global["CTREF_Repair_0"] = {CT_id:CT_Repair, lvl:0}; 
global["CTREF_Repair_1"] = {CT_id:CT_Repair, lvl:1}; 
global["CTREF_Repair_2"] = {CT_id:CT_Repair, lvl:2}; 
global["CTREF_Repair_3"] = {CT_id:CT_Repair, lvl:3}; 
const DEFINITION_Repair = [{w:1,c:1,m:1,cost:200,lvl:0,ct_ID:CT_Repair,ctref_ID:CTREF_Repair_0},{w:3,c:13,m:4,cost:1150,lvl:1,ct_ID:CT_Repair,ctref_ID:CTREF_Repair_1},{w:5,c:25,m:6,cost:2050,lvl:2,ct_ID:CT_Repair,ctref_ID:CTREF_Repair_2},{w:10,c:30,m:10,cost:3000,lvl:3,ct_ID:CT_Repair,ctref_ID:CTREF_Repair_3}];
global["CT_FastHauler"] = "FastHauler"; 
global["CTREF_FastHauler_0"] = {CT_id:CT_FastHauler, lvl:0}; 
global["CTREF_FastHauler_1"] = {CT_id:CT_FastHauler, lvl:1}; 
global["CTREF_FastHauler_2"] = {CT_id:CT_FastHauler, lvl:2}; 
global["CTREF_FastHauler_3"] = {CT_id:CT_FastHauler, lvl:3}; 
global["CTREF_FastHauler_4"] = {CT_id:CT_FastHauler, lvl:4}; 
global["CTREF_FastHauler_5"] = {CT_id:CT_FastHauler, lvl:5}; 
global["CTREF_FastHauler_6"] = {CT_id:CT_FastHauler, lvl:6}; 
const DEFINITION_FastHauler = [{c:1,m:1,cost:100,lvl:0,ct_ID:CT_FastHauler,ctref_ID:CTREF_FastHauler_0},{c:2,m:2,cost:200,lvl:1,ct_ID:CT_FastHauler,ctref_ID:CTREF_FastHauler_1},{c:4,m:4,cost:400,lvl:2,ct_ID:CT_FastHauler,ctref_ID:CTREF_FastHauler_2},{c:8,m:8,cost:800,lvl:3,ct_ID:CT_FastHauler,ctref_ID:CTREF_FastHauler_3},{c:12,m:12,cost:1200,lvl:4,ct_ID:CT_FastHauler,ctref_ID:CTREF_FastHauler_4},{c:20,m:20,cost:2000,lvl:5,ct_ID:CT_FastHauler,ctref_ID:CTREF_FastHauler_5},{c:25,m:25,cost:2500,lvl:6,ct_ID:CT_FastHauler,ctref_ID:CTREF_FastHauler_6}];
global["CT_SlowHauler"] = "SlowHauler"; 
global["CTREF_SlowHauler_0"] = {CT_id:CT_SlowHauler, lvl:0}; 
global["CTREF_SlowHauler_1"] = {CT_id:CT_SlowHauler, lvl:1}; 
global["CTREF_SlowHauler_2"] = {CT_id:CT_SlowHauler, lvl:2}; 
global["CTREF_SlowHauler_3"] = {CT_id:CT_SlowHauler, lvl:3}; 
global["CTREF_SlowHauler_4"] = {CT_id:CT_SlowHauler, lvl:4}; 
const DEFINITION_SlowHauler = [{c:4,m:2,cost:300,lvl:0,ct_ID:CT_SlowHauler,ctref_ID:CTREF_SlowHauler_0},{c:8,m:4,cost:600,lvl:1,ct_ID:CT_SlowHauler,ctref_ID:CTREF_SlowHauler_1},{c:12,m:6,cost:900,lvl:2,ct_ID:CT_SlowHauler,ctref_ID:CTREF_SlowHauler_2},{c:20,m:10,cost:1500,lvl:3,ct_ID:CT_SlowHauler,ctref_ID:CTREF_SlowHauler_3},{c:30,m:15,cost:2250,lvl:4,ct_ID:CT_SlowHauler,ctref_ID:CTREF_SlowHauler_4}];
global["CT_CrawlerHauler"] = "CrawlerHauler"; 
global["CTREF_CrawlerHauler_0"] = {CT_id:CT_CrawlerHauler, lvl:0}; 
global["CTREF_CrawlerHauler_1"] = {CT_id:CT_CrawlerHauler, lvl:1}; 
global["CTREF_CrawlerHauler_2"] = {CT_id:CT_CrawlerHauler, lvl:2}; 
global["CTREF_CrawlerHauler_3"] = {CT_id:CT_CrawlerHauler, lvl:3}; 
global["CTREF_CrawlerHauler_4"] = {CT_id:CT_CrawlerHauler, lvl:4}; 
global["CTREF_CrawlerHauler_5"] = {CT_id:CT_CrawlerHauler, lvl:5}; 
const DEFINITION_CrawlerHauler = [{c:4,m:1,cost:250,lvl:0,ct_ID:CT_CrawlerHauler,ctref_ID:CTREF_CrawlerHauler_0},{c:8,m:2,cost:500,lvl:1,ct_ID:CT_CrawlerHauler,ctref_ID:CTREF_CrawlerHauler_1},{c:16,m:4,cost:1000,lvl:2,ct_ID:CT_CrawlerHauler,ctref_ID:CTREF_CrawlerHauler_2},{c:24,m:6,cost:1500,lvl:3,ct_ID:CT_CrawlerHauler,ctref_ID:CTREF_CrawlerHauler_3},{c:32,m:8,cost:2000,lvl:4,ct_ID:CT_CrawlerHauler,ctref_ID:CTREF_CrawlerHauler_4},{c:40,m:10,cost:2500,lvl:5,ct_ID:CT_CrawlerHauler,ctref_ID:CTREF_CrawlerHauler_5}];
global["CT_SuperHauler"] = "SuperHauler"; 
global["CTREF_SuperHauler_0"] = {CT_id:CT_SuperHauler, lvl:0}; 
global["CTREF_SuperHauler_1"] = {CT_id:CT_SuperHauler, lvl:1}; 
global["CTREF_SuperHauler_2"] = {CT_id:CT_SuperHauler, lvl:2}; 
global["CTREF_SuperHauler_3"] = {CT_id:CT_SuperHauler, lvl:3}; 
global["CTREF_SuperHauler_4"] = {CT_id:CT_SuperHauler, lvl:4}; 
const DEFINITION_SuperHauler = [{c:10,m:1,cost:550,lvl:0,ct_ID:CT_SuperHauler,ctref_ID:CTREF_SuperHauler_0},{c:20,m:2,cost:1100,lvl:1,ct_ID:CT_SuperHauler,ctref_ID:CTREF_SuperHauler_1},{c:30,m:3,cost:1650,lvl:2,ct_ID:CT_SuperHauler,ctref_ID:CTREF_SuperHauler_2},{c:40,m:4,cost:2200,lvl:3,ct_ID:CT_SuperHauler,ctref_ID:CTREF_SuperHauler_3},{c:45,m:5,cost:2500,lvl:4,ct_ID:CT_SuperHauler,ctref_ID:CTREF_SuperHauler_4}];
global["CreepBodies"] = {Harvester:DEFINITION_Harvester,Worker:DEFINITION_Worker,Builder:DEFINITION_Builder,Upgrader:DEFINITION_Upgrader,Refiller:DEFINITION_Refiller,Scout:DEFINITION_Scout,Repair:DEFINITION_Repair,FastHauler:DEFINITION_FastHauler,SlowHauler:DEFINITION_SlowHauler,CrawlerHauler:DEFINITION_CrawlerHauler,SuperHauler:DEFINITION_SuperHauler,get: function(id) { return this[id]; }}; 
// End creep definitions

// Primes
global["primes_100"] = [2, 3, 5, 7, 11, 13, 17, 19, 23, 27, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 95, 97]; 
global["primes_300"] = [2, 3, 5, 7, 11, 13, 17, 19, 23, 27, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 95, 97, 101, 103, 107, 109, 113, 121, 127, 131, 137, 139, 147, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 207, 211, 221, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293]; 
global["primes_500"] = [2, 3, 5, 7, 11, 13, 17, 19, 23, 27, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 95, 97, 101, 103, 107, 109, 113, 121, 127, 131, 137, 139, 147, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 207, 211, 221, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 305, 307, 311, 313, 317, 323, 329, 331, 337, 343, 347, 349, 353, 359, 365, 367, 373, 379, 383, 389, 395, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 455, 457, 461, 463, 467, 473, 479, 487, 491, 495, 499]; 
global["primes_1000"] = [2, 3, 5, 7, 11, 13, 17, 19, 23, 27, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 95, 97, 101, 103, 107, 109, 113, 121, 127, 131, 137, 139, 147, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 207, 211, 221, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 305, 307, 311, 313, 317, 323, 329, 331, 337, 343, 347, 349, 353, 359, 365, 367, 373, 379, 383, 389, 395, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 455, 457, 461, 463, 467, 473, 479, 487, 491, 495, 499, 503, 509, 517, 521, 523, 533, 539, 541, 547, 555, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 625, 631, 641, 643, 647, 653, 659, 661, 671, 673, 677, 683, 689, 691, 701, 709, 715, 719, 725, 727, 733, 739, 743, 751, 757, 761, 769, 773, 783, 787, 797, 803, 809, 811, 819, 821, 823, 827, 829, 837, 839, 845, 851, 853, 857, 859, 863, 871, 877, 881, 883, 887, 897, 903, 907, 911, 919, 929, 935, 937, 941, 947, 953, 961, 967, 971, 977, 983, 991, 997]; 
global["primes_1500"] = [2, 3, 5, 7, 11, 13, 17, 19, 23, 27, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 95, 97, 101, 103, 107, 109, 113, 121, 127, 131, 137, 139, 147, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 207, 211, 221, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 305, 307, 311, 313, 317, 323, 329, 331, 337, 343, 347, 349, 353, 359, 365, 367, 373, 379, 383, 389, 395, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 455, 457, 461, 463, 467, 473, 479, 487, 491, 495, 499, 503, 509, 517, 521, 523, 533, 539, 541, 547, 555, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 625, 631, 641, 643, 647, 653, 659, 661, 671, 673, 677, 683, 689, 691, 701, 709, 715, 719, 725, 727, 733, 739, 743, 751, 757, 761, 769, 773, 783, 787, 797, 803, 809, 811, 819, 821, 823, 827, 829, 837, 839, 845, 851, 853, 857, 859, 863, 871, 877, 881, 883, 887, 897, 903, 907, 911, 919, 929, 935, 937, 941, 947, 953, 961, 967, 971, 977, 983, 991, 997, 1007, 1009, 1013, 1019, 1021, 1031, 1033, 1039, 1049, 1051, 1061, 1063, 1069, 1079, 1083, 1087, 1091, 1093, 1097, 1103, 1109, 1117, 1123, 1129, 1139, 1147, 1151, 1153, 1163, 1169, 1171, 1181, 1187, 1193, 1201, 1213, 1217, 1223, 1229, 1231, 1237, 1245, 1249, 1259, 1265, 1275, 1277, 1279, 1283, 1289, 1291, 1297, 1301, 1303, 1307, 1319, 1321, 1327, 1339, 1349, 1357, 1361, 1367, 1373, 1381, 1391, 1399, 1407, 1409, 1417, 1423, 1427, 1429, 1433, 1439, 1447, 1451, 1453, 1459, 1467, 1471, 1481, 1483, 1487, 1489, 1493, 1499]; 
global["primes_2000"] = [2, 3, 5, 7, 11, 13, 17, 19, 23, 27, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 95, 97, 101, 103, 107, 109, 113, 121, 127, 131, 137, 139, 147, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 207, 211, 221, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 305, 307, 311, 313, 317, 323, 329, 331, 337, 343, 347, 349, 353, 359, 365, 367, 373, 379, 383, 389, 395, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 455, 457, 461, 463, 467, 473, 479, 487, 491, 495, 499, 503, 509, 517, 521, 523, 533, 539, 541, 547, 555, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 625, 631, 641, 643, 647, 653, 659, 661, 671, 673, 677, 683, 689, 691, 701, 709, 715, 719, 725, 727, 733, 739, 743, 751, 757, 761, 769, 773, 783, 787, 797, 803, 809, 811, 819, 821, 823, 827, 829, 837, 839, 845, 851, 853, 857, 859, 863, 871, 877, 881, 883, 887, 897, 903, 907, 911, 919, 929, 935, 937, 941, 947, 953, 961, 967, 971, 977, 983, 991, 997, 1007, 1009, 1013, 1019, 1021, 1031, 1033, 1039, 1049, 1051, 1061, 1063, 1069, 1079, 1083, 1087, 1091, 1093, 1097, 1103, 1109, 1117, 1123, 1129, 1139, 1147, 1151, 1153, 1163, 1169, 1171, 1181, 1187, 1193, 1201, 1213, 1217, 1223, 1229, 1231, 1237, 1245, 1249, 1259, 1265, 1275, 1277, 1279, 1283, 1289, 1291, 1297, 1301, 1303, 1307, 1319, 1321, 1327, 1339, 1349, 1357, 1361, 1367, 1373, 1381, 1391, 1399, 1407, 1409, 1417, 1423, 1427, 1429, 1433, 1439, 1447, 1451, 1453, 1459, 1467, 1471, 1481, 1483, 1487, 1489, 1493, 1499, 1505, 1511, 1517, 1523, 1529, 1531, 1539, 1543, 1549, 1553, 1559, 1565, 1567, 1571, 1575, 1579, 1583, 1591, 1597, 1601, 1607, 1609, 1613, 1619, 1621, 1627, 1637, 1643, 1653, 1657, 1663, 1667, 1669, 1677, 1683, 1691, 1693, 1697, 1699, 1709, 1715, 1721, 1723, 1733, 1739, 1741, 1747, 1753, 1759, 1767, 1771, 1777, 1783, 1787, 1789, 1799, 1801, 1811, 1823, 1831, 1841, 1847, 1853, 1859, 1861, 1867, 1871, 1873, 1877, 1879, 1889, 1895, 1901, 1907, 1913, 1925, 1931, 1933, 1943, 1949, 1951, 1961, 1969, 1973, 1979, 1985, 1987, 1993, 1997, 1999]; 
global["primes_2500"] = [2, 3, 5, 7, 11, 13, 17, 19, 23, 27, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 95, 97, 101, 103, 107, 109, 113, 121, 127, 131, 137, 139, 147, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 207, 211, 221, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 305, 307, 311, 313, 317, 323, 329, 331, 337, 343, 347, 349, 353, 359, 365, 367, 373, 379, 383, 389, 395, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 455, 457, 461, 463, 467, 473, 479, 487, 491, 495, 499, 503, 509, 517, 521, 523, 533, 539, 541, 547, 555, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 625, 631, 641, 643, 647, 653, 659, 661, 671, 673, 677, 683, 689, 691, 701, 709, 715, 719, 725, 727, 733, 739, 743, 751, 757, 761, 769, 773, 783, 787, 797, 803, 809, 811, 819, 821, 823, 827, 829, 837, 839, 845, 851, 853, 857, 859, 863, 871, 877, 881, 883, 887, 897, 903, 907, 911, 919, 929, 935, 937, 941, 947, 953, 961, 967, 971, 977, 983, 991, 997, 1007, 1009, 1013, 1019, 1021, 1031, 1033, 1039, 1049, 1051, 1061, 1063, 1069, 1079, 1083, 1087, 1091, 1093, 1097, 1103, 1109, 1117, 1123, 1129, 1139, 1147, 1151, 1153, 1163, 1169, 1171, 1181, 1187, 1193, 1201, 1213, 1217, 1223, 1229, 1231, 1237, 1245, 1249, 1259, 1265, 1275, 1277, 1279, 1283, 1289, 1291, 1297, 1301, 1303, 1307, 1319, 1321, 1327, 1339, 1349, 1357, 1361, 1367, 1373, 1381, 1391, 1399, 1407, 1409, 1417, 1423, 1427, 1429, 1433, 1439, 1447, 1451, 1453, 1459, 1467, 1471, 1481, 1483, 1487, 1489, 1493, 1499, 1505, 1511, 1517, 1523, 1529, 1531, 1539, 1543, 1549, 1553, 1559, 1565, 1567, 1571, 1575, 1579, 1583, 1591, 1597, 1601, 1607, 1609, 1613, 1619, 1621, 1627, 1637, 1643, 1653, 1657, 1663, 1667, 1669, 1677, 1683, 1691, 1693, 1697, 1699, 1709, 1715, 1721, 1723, 1733, 1739, 1741, 1747, 1753, 1759, 1767, 1771, 1777, 1783, 1787, 1789, 1799, 1801, 1811, 1823, 1831, 1841, 1847, 1853, 1859, 1861, 1867, 1871, 1873, 1877, 1879, 1889, 1895, 1901, 1907, 1913, 1925, 1931, 1933, 1943, 1949, 1951, 1961, 1969, 1973, 1979, 1985, 1987, 1993, 1997, 1999, 2003, 2009, 2011, 2017, 2023, 2027, 2029, 2039, 2047, 2053, 2063, 2069, 2075, 2079, 2081, 2083, 2087, 2089, 2097, 2099, 2105, 2111, 2113, 2121, 2129, 2131, 2137, 2141, 2143, 2151, 2153, 2159, 2161, 2171, 2177, 2179, 2187, 2193, 2201, 2203, 2207, 2213, 2219, 2221, 2231, 2237, 2239, 2243, 2251, 2263, 2267, 2269, 2273, 2281, 2287, 2293, 2297, 2309, 2311, 2321, 2329, 2333, 2339, 2341, 2347, 2351, 2357, 2363, 2369, 2371, 2377, 2381, 2383, 2389, 2393, 2399, 2411, 2417, 2423, 2429, 2435, 2437, 2441, 2447, 2459, 2465, 2467, 2473, 2477, 2483, 2489, 2497]; 
global["primes_3000"] = [2, 3, 5, 7, 11, 13, 17, 19, 23, 27, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 95, 97, 101, 103, 107, 109, 113, 121, 127, 131, 137, 139, 147, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 207, 211, 221, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 305, 307, 311, 313, 317, 323, 329, 331, 337, 343, 347, 349, 353, 359, 365, 367, 373, 379, 383, 389, 395, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 455, 457, 461, 463, 467, 473, 479, 487, 491, 495, 499, 503, 509, 517, 521, 523, 533, 539, 541, 547, 555, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 625, 631, 641, 643, 647, 653, 659, 661, 671, 673, 677, 683, 689, 691, 701, 709, 715, 719, 725, 727, 733, 739, 743, 751, 757, 761, 769, 773, 783, 787, 797, 803, 809, 811, 819, 821, 823, 827, 829, 837, 839, 845, 851, 853, 857, 859, 863, 871, 877, 881, 883, 887, 897, 903, 907, 911, 919, 929, 935, 937, 941, 947, 953, 961, 967, 971, 977, 983, 991, 997, 1007, 1009, 1013, 1019, 1021, 1031, 1033, 1039, 1049, 1051, 1061, 1063, 1069, 1079, 1083, 1087, 1091, 1093, 1097, 1103, 1109, 1117, 1123, 1129, 1139, 1147, 1151, 1153, 1163, 1169, 1171, 1181, 1187, 1193, 1201, 1213, 1217, 1223, 1229, 1231, 1237, 1245, 1249, 1259, 1265, 1275, 1277, 1279, 1283, 1289, 1291, 1297, 1301, 1303, 1307, 1319, 1321, 1327, 1339, 1349, 1357, 1361, 1367, 1373, 1381, 1391, 1399, 1407, 1409, 1417, 1423, 1427, 1429, 1433, 1439, 1447, 1451, 1453, 1459, 1467, 1471, 1481, 1483, 1487, 1489, 1493, 1499, 1505, 1511, 1517, 1523, 1529, 1531, 1539, 1543, 1549, 1553, 1559, 1565, 1567, 1571, 1575, 1579, 1583, 1591, 1597, 1601, 1607, 1609, 1613, 1619, 1621, 1627, 1637, 1643, 1653, 1657, 1663, 1667, 1669, 1677, 1683, 1691, 1693, 1697, 1699, 1709, 1715, 1721, 1723, 1733, 1739, 1741, 1747, 1753, 1759, 1767, 1771, 1777, 1783, 1787, 1789, 1799, 1801, 1811, 1823, 1831, 1841, 1847, 1853, 1859, 1861, 1867, 1871, 1873, 1877, 1879, 1889, 1895, 1901, 1907, 1913, 1925, 1931, 1933, 1943, 1949, 1951, 1961, 1969, 1973, 1979, 1985, 1987, 1993, 1997, 1999, 2003, 2009, 2011, 2017, 2023, 2027, 2029, 2039, 2047, 2053, 2063, 2069, 2075, 2079, 2081, 2083, 2087, 2089, 2097, 2099, 2105, 2111, 2113, 2121, 2129, 2131, 2137, 2141, 2143, 2151, 2153, 2159, 2161, 2171, 2177, 2179, 2187, 2193, 2201, 2203, 2207, 2213, 2219, 2221, 2231, 2237, 2239, 2243, 2251, 2263, 2267, 2269, 2273, 2281, 2287, 2293, 2297, 2309, 2311, 2321, 2329, 2333, 2339, 2341, 2347, 2351, 2357, 2363, 2369, 2371, 2377, 2381, 2383, 2389, 2393, 2399, 2411, 2417, 2423, 2429, 2435, 2437, 2441, 2447, 2459, 2465, 2467, 2473, 2477, 2483, 2489, 2497, 2503, 2513, 2519, 2521, 2531, 2537, 2539, 2543, 2549, 2551, 2557, 2565, 2573, 2579, 2591, 2593, 2601, 2607, 2609, 2617, 2621, 2625, 2633, 2639, 2645, 2647, 2655, 2657, 2659, 2663, 2671, 2677, 2683, 2687, 2689, 2693, 2699, 2707, 2711, 2713, 2719, 2727, 2729, 2731, 2741, 2749, 2753, 2759, 2767, 2777, 2789, 2791, 2797, 2801, 2803, 2813, 2819, 2825, 2833, 2837, 2843, 2851, 2857, 2861, 2867, 2875, 2879, 2885, 2887, 2897, 2903, 2909, 2915, 2917, 2925, 2927, 2933, 2939, 2951, 2953, 2957, 2963, 2969, 2971, 2981, 2987, 2993, 2999]; 

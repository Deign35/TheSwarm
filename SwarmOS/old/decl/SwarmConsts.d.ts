declare const SWARM_VERSION_DATE = "CURRENT_VERSION";
declare const MY_USERNAME = "Deign"
declare const MY_SIGNATURE = "Greetings.  I don't bite. -- SwarmOSv2.0.0"

declare const PKG_SwarmManager = "SwarmManager"
declare type PKG_SwarmManager = "SwarmManager"
declare const PKG_FlagBase = "FlagBase"
declare type PKG_FlagBase = "FlagBase"
declare const PKG_EmptyProcess = "EmptyProcess"
declare type PKG_EmptyProcess = "EmptyProcess"
declare type OSPackage = PKG_SwarmManager | PKG_FlagBase | PKG_EmptyProcess

declare const EXT_Logger = "logger"
declare type EXT_Logger = "logger"
declare const EXT_Kernel = "kernel"
declare type EXT_Kernel = "kernel"
declare const EXT_Registry = "extRegistry"
declare type EXT_Registry = "extRegistry"
declare const EXT_Sleep = "sleep"
declare type EXT_Sleep = "sleep"
declare type OSExtension = EXT_Logger | EXT_Kernel | EXT_Registry | EXT_Sleep

declare const TT_None = 0
declare type TT_None = 0
declare const TT_ConstructionSite = 1
declare type TT_ConstructionSite = 1
declare const TT_Resource = 2
declare type TT_Resource = 2
declare const TT_StorageContainer = 3
declare type TT_StorageContainer = 3
declare const TT_Lab = 4
declare type TT_Lab = 4
declare const TT_Controller = 5
declare type TT_Controller = 5
declare const TT_Source = 6
declare type TT_Source = 6
declare const TT_Creep = 7
declare type TT_Creep = 7
declare const TT_AnyStructure = 10
declare type TT_AnyStructure = 10
declare type TargetType = TT_None | TT_ConstructionSite | TT_Resource | TT_StorageContainer | TT_Lab | TT_Controller | TT_Source | TT_Creep | TT_AnyStructure

declare const LOG_ALERT = 6
declare type LOG_ALERT = 6
declare const LOG_DEBUG = 1
declare type LOG_DEBUG = 1
declare const LOG_ERROR = 4
declare type LOG_ERROR = 4
declare const LOG_FATAL = 5
declare type LOG_FATAL = 5
declare const LOG_INFO = 2
declare type LOG_INFO = 2
declare const LOG_TRACE = 0
declare type LOG_TRACE = 0
declare const LOG_WARN = 3
declare type LOG_WARN = 3
declare type LogLevel = LOG_ALERT | LOG_DEBUG | LOG_ERROR | LOG_FATAL | LOG_INFO | LOG_TRACE | LOG_WARN

declare const SP_ERROR = -1
declare type SP_ERROR = -1
declare const SP_QUEUED = 1
declare type SP_QUEUED = 1
declare const SP_SPAWNING = 2
declare type SP_SPAWNING = 2
declare const SP_COMPLETE = 3
declare type SP_COMPLETE = 3
declare type SpawnState = SP_ERROR | SP_QUEUED | SP_SPAWNING | SP_COMPLETE

declare const E2C_MaxSpawnDistance = 200
declare const E2C_SpawnDistance = 100

declare const DEFAULT_LOG_LEVEL = 2
declare const DEFAULT_LOG_ID = "SwarmOS"

declare const Priority_Hold = -1
declare type Priority_Hold = -1
declare const Priority_Lowest = 1
declare type Priority_Lowest = 1
declare const Priority_Low = 3
declare type Priority_Low = 3
declare const Priority_Medium = 5
declare type Priority_Medium = 5
declare const Priority_High = 7
declare type Priority_High = 7
declare const Priority_Highest = 9
declare type Priority_Highest = 9
declare const Priority_EMERGENCY = 10
declare type Priority_EMERGENCY = 10
declare type Priority = Priority_Hold | Priority_Lowest | Priority_Low | Priority_Medium | Priority_High | Priority_Highest | Priority_EMERGENCY

declare const ThreadState_Inactive = 0
declare type ThreadState_Inactive = 0
declare const ThreadState_Active = 1
declare type ThreadState_Active = 1
declare const ThreadState_Waiting = 2
declare type ThreadState_Waiting = 2
declare const ThreadState_Done = 3
declare type ThreadState_Done = 3
declare const ThreadState_Overrun = 4
declare type ThreadState_Overrun = 4
declare type ThreadState = ThreadState_Inactive | ThreadState_Active | ThreadState_Waiting | ThreadState_Done | ThreadState_Overrun

declare const CLI_Launch = "launch"
declare type CLI_Launch = "launch"
declare const CLI_ChangeFlag = "flagColor"
declare type CLI_ChangeFlag = "flagColor"
declare const CLI_Assimilate = "addRoom"
declare type CLI_Assimilate = "addRoom"
declare type CLI_Command = CLI_Launch | CLI_ChangeFlag | CLI_Assimilate

declare const SET_MaxSites = 5
declare const SET_SiteToWorkRatio = 10000
declare const SET_TriggerNewWorker = 500
declare const SET_GroundWorkerRatio = 1200

declare const SPKG_CreepActivity = "CreepActivity"
declare type SPKG_CreepActivity = "CreepActivity"
declare const SPKG_SpawnActivity = "SpawnActivity"
declare type SPKG_SpawnActivity = "SpawnActivity"
declare const SPKG_RoomActivity = "RoomActivity"
declare type SPKG_RoomActivity = "RoomActivity"
declare const SPKG_RepetitiveCreepActivity = "RepetitiveCreepActivity"
declare type SPKG_RepetitiveCreepActivity = "RepetitiveCreepActivity"
declare type SlimOSPackage = SPKG_CreepActivity | SPKG_SpawnActivity | SPKG_RoomActivity | SPKG_RepetitiveCreepActivity

declare const AT_NoOp = 0
declare type AT_NoOp = 0
declare const AT_Attack = 1
declare type AT_Attack = 1
declare const AT_AttackController = 2
declare type AT_AttackController = 2
declare const AT_Build = 3
declare type AT_Build = 3
declare const AT_Drop = 4
declare type AT_Drop = 4
declare const AT_Harvest = 5
declare type AT_Harvest = 5
declare const AT_MoveToPosition = 6
declare type AT_MoveToPosition = 6
declare const AT_Pickup = 7
declare type AT_Pickup = 7
declare const AT_Repair = 8
declare type AT_Repair = 8
declare const AT_RequestTransfer = 9
declare type AT_RequestTransfer = 9
declare const AT_Transfer = 10
declare type AT_Transfer = 10
declare const AT_Upgrade = 11
declare type AT_Upgrade = 11
declare const AT_Withdraw = 12
declare type AT_Withdraw = 12
declare const AT_ClaimController = 13
declare type AT_ClaimController = 13
declare const AT_Dismantle = 14
declare type AT_Dismantle = 14
declare const AT_GenerateSafeMode = 15
declare type AT_GenerateSafeMode = 15
declare const AT_Heal = 16
declare type AT_Heal = 16
declare const AT_MoveByPath = 17
declare type AT_MoveByPath = 17
declare const AT_RangedAttack = 18
declare type AT_RangedAttack = 18
declare const AT_RangedHeal = 19
declare type AT_RangedHeal = 19
declare const AT_RangedMassAttack = 20
declare type AT_RangedMassAttack = 20
declare const AT_ReserveController = 21
declare type AT_ReserveController = 21
declare const AT_SignController = 22
declare type AT_SignController = 22
declare const AT_Suicide = 23
declare type AT_Suicide = 23
declare const AT_Pull = 24
declare type AT_Pull = 24
declare type ActionType = AT_NoOp | AT_Attack | AT_AttackController | AT_Build | AT_Drop | AT_Harvest | AT_MoveToPosition | AT_Pickup | AT_Repair | AT_RequestTransfer | AT_Transfer | AT_Upgrade | AT_Withdraw | AT_ClaimController | AT_Dismantle | AT_GenerateSafeMode | AT_Heal | AT_MoveByPath | AT_RangedAttack | AT_RangedHeal | AT_RangedMassAttack | AT_ReserveController | AT_SignController | AT_Suicide | AT_Pull


declare const CT_Claimer = "Claimer"
declare type CT_Claimer = "Claimer"
declare const CTREF_Claimer_0: {CT_id:CT_Claimer, lvl:0}
declare type CTREF_Claimer_0 = {CT_id:CT_Claimer, lvl:0}
declare const CTREF_Claimer_1: {CT_id:CT_Claimer, lvl:1}
declare type CTREF_Claimer_1 = {CT_id:CT_Claimer, lvl:1}
declare const CTREF_Claimer_2: {CT_id:CT_Claimer, lvl:2}
declare type CTREF_Claimer_2 = {CT_id:CT_Claimer, lvl:2}
declare type CTREF_Claimer_ALL = CTREF_Claimer_0 | CTREF_Claimer_1 | CTREF_Claimer_2
declare type DEFINITION_Claimer = [{cl:1,m:1,cost:650,lvl:0,ct_ID:CT_Claimer,ctref_ID:CTREF_Claimer_0},{cl:2,m:2,cost:1300,lvl:1,ct_ID:CT_Claimer,ctref_ID:CTREF_Claimer_1},{cl:4,m:4,cost:2600,lvl:2,ct_ID:CT_Claimer,ctref_ID:CTREF_Claimer_2}]
declare const CT_Harvester = "Harvester"
declare type CT_Harvester = "Harvester"
declare const CTREF_Harvester_0: {CT_id:CT_Harvester, lvl:0}
declare type CTREF_Harvester_0 = {CT_id:CT_Harvester, lvl:0}
declare const CTREF_Harvester_1: {CT_id:CT_Harvester, lvl:1}
declare type CTREF_Harvester_1 = {CT_id:CT_Harvester, lvl:1}
declare const CTREF_Harvester_2: {CT_id:CT_Harvester, lvl:2}
declare type CTREF_Harvester_2 = {CT_id:CT_Harvester, lvl:2}
declare const CTREF_Harvester_3: {CT_id:CT_Harvester, lvl:3}
declare type CTREF_Harvester_3 = {CT_id:CT_Harvester, lvl:3}
declare type CTREF_Harvester_ALL = CTREF_Harvester_0 | CTREF_Harvester_1 | CTREF_Harvester_2 | CTREF_Harvester_3
declare type DEFINITION_Harvester = [{w:2,c:1,m:1,cost:300,lvl:0,ct_ID:CT_Harvester,ctref_ID:CTREF_Harvester_0},{w:5,m:1,cost:550,lvl:1,ct_ID:CT_Harvester,ctref_ID:CTREF_Harvester_1},{w:6,c:1,m:3,cost:800,lvl:2,ct_ID:CT_Harvester,ctref_ID:CTREF_Harvester_2},{w:15,c:1,m:3,cost:1700,lvl:3,ct_ID:CT_Harvester,ctref_ID:CTREF_Harvester_3}]
declare const CT_Refiller = "Refiller"
declare type CT_Refiller = "Refiller"
declare const CTREF_Refiller_0: {CT_id:CT_Refiller, lvl:0}
declare type CTREF_Refiller_0 = {CT_id:CT_Refiller, lvl:0}
declare const CTREF_Refiller_1: {CT_id:CT_Refiller, lvl:1}
declare type CTREF_Refiller_1 = {CT_id:CT_Refiller, lvl:1}
declare const CTREF_Refiller_2: {CT_id:CT_Refiller, lvl:2}
declare type CTREF_Refiller_2 = {CT_id:CT_Refiller, lvl:2}
declare const CTREF_Refiller_3: {CT_id:CT_Refiller, lvl:3}
declare type CTREF_Refiller_3 = {CT_id:CT_Refiller, lvl:3}
declare type CTREF_Refiller_ALL = CTREF_Refiller_0 | CTREF_Refiller_1 | CTREF_Refiller_2 | CTREF_Refiller_3
declare type DEFINITION_Refiller = [{w:1,c:2,m:2,cost:300,lvl:0,ct_ID:CT_Refiller,ctref_ID:CTREF_Refiller_0},{c:2,m:2,cost:200,lvl:1,ct_ID:CT_Refiller,ctref_ID:CTREF_Refiller_1},{c:8,m:4,cost:600,lvl:2,ct_ID:CT_Refiller,ctref_ID:CTREF_Refiller_2},{c:8,m:8,cost:800,lvl:3,ct_ID:CT_Refiller,ctref_ID:CTREF_Refiller_3}]
declare const CT_Scout = "Scout"
declare type CT_Scout = "Scout"
declare const CTREF_Scout_0: {CT_id:CT_Scout, lvl:0}
declare type CTREF_Scout_0 = {CT_id:CT_Scout, lvl:0}
declare const CTREF_Scout_1: {CT_id:CT_Scout, lvl:1}
declare type CTREF_Scout_1 = {CT_id:CT_Scout, lvl:1}
declare const CTREF_Scout_2: {CT_id:CT_Scout, lvl:2}
declare type CTREF_Scout_2 = {CT_id:CT_Scout, lvl:2}
declare type CTREF_Scout_ALL = CTREF_Scout_0 | CTREF_Scout_1 | CTREF_Scout_2
declare type DEFINITION_Scout = [{t:2,m:2,cost:120,lvl:0,ct_ID:CT_Scout,ctref_ID:CTREF_Scout_0},{t:4,m:4,cost:240,lvl:1,ct_ID:CT_Scout,ctref_ID:CTREF_Scout_1},{t:8,m:8,cost:480,lvl:2,ct_ID:CT_Scout,ctref_ID:CTREF_Scout_2}]
declare const CT_Worker = "Worker"
declare type CT_Worker = "Worker"
declare const CTREF_Worker_0: {CT_id:CT_Worker, lvl:0}
declare type CTREF_Worker_0 = {CT_id:CT_Worker, lvl:0}
declare const CTREF_Worker_1: {CT_id:CT_Worker, lvl:1}
declare type CTREF_Worker_1 = {CT_id:CT_Worker, lvl:1}
declare const CTREF_Worker_2: {CT_id:CT_Worker, lvl:2}
declare type CTREF_Worker_2 = {CT_id:CT_Worker, lvl:2}
declare const CTREF_Worker_3: {CT_id:CT_Worker, lvl:3}
declare type CTREF_Worker_3 = {CT_id:CT_Worker, lvl:3}
declare const CTREF_Worker_4: {CT_id:CT_Worker, lvl:4}
declare type CTREF_Worker_4 = {CT_id:CT_Worker, lvl:4}
declare const CTREF_Worker_5: {CT_id:CT_Worker, lvl:5}
declare type CTREF_Worker_5 = {CT_id:CT_Worker, lvl:5}
declare type CTREF_Worker_ALL = CTREF_Worker_0 | CTREF_Worker_1 | CTREF_Worker_2 | CTREF_Worker_3 | CTREF_Worker_4 | CTREF_Worker_5
declare type DEFINITION_Worker = [{w:1,c:2,m:2,cost:300,lvl:0,ct_ID:CT_Worker,ctref_ID:CTREF_Worker_0},{w:2,c:4,m:3,cost:550,lvl:1,ct_ID:CT_Worker,ctref_ID:CTREF_Worker_1},{w:2,c:6,m:4,cost:700,lvl:2,ct_ID:CT_Worker,ctref_ID:CTREF_Worker_2},{w:4,c:8,m:6,cost:1100,lvl:3,ct_ID:CT_Worker,ctref_ID:CTREF_Worker_3},{w:5,c:15,m:10,cost:1750,lvl:4,ct_ID:CT_Worker,ctref_ID:CTREF_Worker_4},{w:15,c:25,m:10,cost:3250,lvl:5,ct_ID:CT_Worker,ctref_ID:CTREF_Worker_5}]
declare type CT_ALL = CT_Claimer | CT_Harvester | CT_Refiller | CT_Scout | CT_Worker 
declare type DEFINITION_ALL = DEFINITION_Claimer | DEFINITION_Harvester | DEFINITION_Refiller | DEFINITION_Scout | DEFINITION_Worker
declare type CTREF_ALL = CTREF_Claimer_ALL | CTREF_Harvester_ALL | CTREF_Refiller_ALL | CTREF_Scout_ALL | CTREF_Worker_ALL
declare interface ICreepBodies{[id: string]: DEFINITION_ALL,Claimer:DEFINITION_Claimer,Harvester:DEFINITION_Harvester,Refiller:DEFINITION_Refiller,Scout:DEFINITION_Scout,Worker:DEFINITION_Worker}
declare type TCreepBodies = ICreepBodies & {get<T extends keyof ICreepBodies>(id: T): ICreepBodies[T];}
declare var CreepBodies: TCreepBodies

declare const primes_100: [2, 3, 5, 7, 11, 13, 17, 19, 23, 27, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 95, 97]
declare const primes_300: [2, 3, 5, 7, 11, 13, 17, 19, 23, 27, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 95, 97, 101, 103, 107, 109, 113, 121, 127, 131, 137, 139, 147, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 207, 211, 221, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293]
declare const primes_500: [2, 3, 5, 7, 11, 13, 17, 19, 23, 27, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 95, 97, 101, 103, 107, 109, 113, 121, 127, 131, 137, 139, 147, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 207, 211, 221, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 305, 307, 311, 313, 317, 323, 329, 331, 337, 343, 347, 349, 353, 359, 365, 367, 373, 379, 383, 389, 395, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 455, 457, 461, 463, 467, 473, 479, 487, 491, 495, 499]
declare const primes_1000: [2, 3, 5, 7, 11, 13, 17, 19, 23, 27, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 95, 97, 101, 103, 107, 109, 113, 121, 127, 131, 137, 139, 147, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 207, 211, 221, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 305, 307, 311, 313, 317, 323, 329, 331, 337, 343, 347, 349, 353, 359, 365, 367, 373, 379, 383, 389, 395, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 455, 457, 461, 463, 467, 473, 479, 487, 491, 495, 499, 503, 509, 517, 521, 523, 533, 539, 541, 547, 555, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 625, 631, 641, 643, 647, 653, 659, 661, 671, 673, 677, 683, 689, 691, 701, 709, 715, 719, 725, 727, 733, 739, 743, 751, 757, 761, 769, 773, 783, 787, 797, 803, 809, 811, 819, 821, 823, 827, 829, 837, 839, 845, 851, 853, 857, 859, 863, 871, 877, 881, 883, 887, 897, 903, 907, 911, 919, 929, 935, 937, 941, 947, 953, 961, 967, 971, 977, 983, 991, 997]
declare const primes_1500: [2, 3, 5, 7, 11, 13, 17, 19, 23, 27, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 95, 97, 101, 103, 107, 109, 113, 121, 127, 131, 137, 139, 147, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 207, 211, 221, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 305, 307, 311, 313, 317, 323, 329, 331, 337, 343, 347, 349, 353, 359, 365, 367, 373, 379, 383, 389, 395, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 455, 457, 461, 463, 467, 473, 479, 487, 491, 495, 499, 503, 509, 517, 521, 523, 533, 539, 541, 547, 555, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 625, 631, 641, 643, 647, 653, 659, 661, 671, 673, 677, 683, 689, 691, 701, 709, 715, 719, 725, 727, 733, 739, 743, 751, 757, 761, 769, 773, 783, 787, 797, 803, 809, 811, 819, 821, 823, 827, 829, 837, 839, 845, 851, 853, 857, 859, 863, 871, 877, 881, 883, 887, 897, 903, 907, 911, 919, 929, 935, 937, 941, 947, 953, 961, 967, 971, 977, 983, 991, 997, 1007, 1009, 1013, 1019, 1021, 1031, 1033, 1039, 1049, 1051, 1061, 1063, 1069, 1079, 1083, 1087, 1091, 1093, 1097, 1103, 1109, 1117, 1123, 1129, 1139, 1147, 1151, 1153, 1163, 1169, 1171, 1181, 1187, 1193, 1201, 1213, 1217, 1223, 1229, 1231, 1237, 1245, 1249, 1259, 1265, 1275, 1277, 1279, 1283, 1289, 1291, 1297, 1301, 1303, 1307, 1319, 1321, 1327, 1339, 1349, 1357, 1361, 1367, 1373, 1381, 1391, 1399, 1407, 1409, 1417, 1423, 1427, 1429, 1433, 1439, 1447, 1451, 1453, 1459, 1467, 1471, 1481, 1483, 1487, 1489, 1493, 1499]
declare const primes_2000: [2, 3, 5, 7, 11, 13, 17, 19, 23, 27, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 95, 97, 101, 103, 107, 109, 113, 121, 127, 131, 137, 139, 147, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 207, 211, 221, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 305, 307, 311, 313, 317, 323, 329, 331, 337, 343, 347, 349, 353, 359, 365, 367, 373, 379, 383, 389, 395, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 455, 457, 461, 463, 467, 473, 479, 487, 491, 495, 499, 503, 509, 517, 521, 523, 533, 539, 541, 547, 555, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 625, 631, 641, 643, 647, 653, 659, 661, 671, 673, 677, 683, 689, 691, 701, 709, 715, 719, 725, 727, 733, 739, 743, 751, 757, 761, 769, 773, 783, 787, 797, 803, 809, 811, 819, 821, 823, 827, 829, 837, 839, 845, 851, 853, 857, 859, 863, 871, 877, 881, 883, 887, 897, 903, 907, 911, 919, 929, 935, 937, 941, 947, 953, 961, 967, 971, 977, 983, 991, 997, 1007, 1009, 1013, 1019, 1021, 1031, 1033, 1039, 1049, 1051, 1061, 1063, 1069, 1079, 1083, 1087, 1091, 1093, 1097, 1103, 1109, 1117, 1123, 1129, 1139, 1147, 1151, 1153, 1163, 1169, 1171, 1181, 1187, 1193, 1201, 1213, 1217, 1223, 1229, 1231, 1237, 1245, 1249, 1259, 1265, 1275, 1277, 1279, 1283, 1289, 1291, 1297, 1301, 1303, 1307, 1319, 1321, 1327, 1339, 1349, 1357, 1361, 1367, 1373, 1381, 1391, 1399, 1407, 1409, 1417, 1423, 1427, 1429, 1433, 1439, 1447, 1451, 1453, 1459, 1467, 1471, 1481, 1483, 1487, 1489, 1493, 1499, 1505, 1511, 1517, 1523, 1529, 1531, 1539, 1543, 1549, 1553, 1559, 1565, 1567, 1571, 1575, 1579, 1583, 1591, 1597, 1601, 1607, 1609, 1613, 1619, 1621, 1627, 1637, 1643, 1653, 1657, 1663, 1667, 1669, 1677, 1683, 1691, 1693, 1697, 1699, 1709, 1715, 1721, 1723, 1733, 1739, 1741, 1747, 1753, 1759, 1767, 1771, 1777, 1783, 1787, 1789, 1799, 1801, 1811, 1823, 1831, 1841, 1847, 1853, 1859, 1861, 1867, 1871, 1873, 1877, 1879, 1889, 1895, 1901, 1907, 1913, 1925, 1931, 1933, 1943, 1949, 1951, 1961, 1969, 1973, 1979, 1985, 1987, 1993, 1997, 1999]
declare const primes_2500: [2, 3, 5, 7, 11, 13, 17, 19, 23, 27, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 95, 97, 101, 103, 107, 109, 113, 121, 127, 131, 137, 139, 147, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 207, 211, 221, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 305, 307, 311, 313, 317, 323, 329, 331, 337, 343, 347, 349, 353, 359, 365, 367, 373, 379, 383, 389, 395, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 455, 457, 461, 463, 467, 473, 479, 487, 491, 495, 499, 503, 509, 517, 521, 523, 533, 539, 541, 547, 555, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 625, 631, 641, 643, 647, 653, 659, 661, 671, 673, 677, 683, 689, 691, 701, 709, 715, 719, 725, 727, 733, 739, 743, 751, 757, 761, 769, 773, 783, 787, 797, 803, 809, 811, 819, 821, 823, 827, 829, 837, 839, 845, 851, 853, 857, 859, 863, 871, 877, 881, 883, 887, 897, 903, 907, 911, 919, 929, 935, 937, 941, 947, 953, 961, 967, 971, 977, 983, 991, 997, 1007, 1009, 1013, 1019, 1021, 1031, 1033, 1039, 1049, 1051, 1061, 1063, 1069, 1079, 1083, 1087, 1091, 1093, 1097, 1103, 1109, 1117, 1123, 1129, 1139, 1147, 1151, 1153, 1163, 1169, 1171, 1181, 1187, 1193, 1201, 1213, 1217, 1223, 1229, 1231, 1237, 1245, 1249, 1259, 1265, 1275, 1277, 1279, 1283, 1289, 1291, 1297, 1301, 1303, 1307, 1319, 1321, 1327, 1339, 1349, 1357, 1361, 1367, 1373, 1381, 1391, 1399, 1407, 1409, 1417, 1423, 1427, 1429, 1433, 1439, 1447, 1451, 1453, 1459, 1467, 1471, 1481, 1483, 1487, 1489, 1493, 1499, 1505, 1511, 1517, 1523, 1529, 1531, 1539, 1543, 1549, 1553, 1559, 1565, 1567, 1571, 1575, 1579, 1583, 1591, 1597, 1601, 1607, 1609, 1613, 1619, 1621, 1627, 1637, 1643, 1653, 1657, 1663, 1667, 1669, 1677, 1683, 1691, 1693, 1697, 1699, 1709, 1715, 1721, 1723, 1733, 1739, 1741, 1747, 1753, 1759, 1767, 1771, 1777, 1783, 1787, 1789, 1799, 1801, 1811, 1823, 1831, 1841, 1847, 1853, 1859, 1861, 1867, 1871, 1873, 1877, 1879, 1889, 1895, 1901, 1907, 1913, 1925, 1931, 1933, 1943, 1949, 1951, 1961, 1969, 1973, 1979, 1985, 1987, 1993, 1997, 1999, 2003, 2009, 2011, 2017, 2023, 2027, 2029, 2039, 2047, 2053, 2063, 2069, 2075, 2079, 2081, 2083, 2087, 2089, 2097, 2099, 2105, 2111, 2113, 2121, 2129, 2131, 2137, 2141, 2143, 2151, 2153, 2159, 2161, 2171, 2177, 2179, 2187, 2193, 2201, 2203, 2207, 2213, 2219, 2221, 2231, 2237, 2239, 2243, 2251, 2263, 2267, 2269, 2273, 2281, 2287, 2293, 2297, 2309, 2311, 2321, 2329, 2333, 2339, 2341, 2347, 2351, 2357, 2363, 2369, 2371, 2377, 2381, 2383, 2389, 2393, 2399, 2411, 2417, 2423, 2429, 2435, 2437, 2441, 2447, 2459, 2465, 2467, 2473, 2477, 2483, 2489, 2497]
declare const primes_3000: [2, 3, 5, 7, 11, 13, 17, 19, 23, 27, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 95, 97, 101, 103, 107, 109, 113, 121, 127, 131, 137, 139, 147, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 207, 211, 221, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 305, 307, 311, 313, 317, 323, 329, 331, 337, 343, 347, 349, 353, 359, 365, 367, 373, 379, 383, 389, 395, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 455, 457, 461, 463, 467, 473, 479, 487, 491, 495, 499, 503, 509, 517, 521, 523, 533, 539, 541, 547, 555, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 625, 631, 641, 643, 647, 653, 659, 661, 671, 673, 677, 683, 689, 691, 701, 709, 715, 719, 725, 727, 733, 739, 743, 751, 757, 761, 769, 773, 783, 787, 797, 803, 809, 811, 819, 821, 823, 827, 829, 837, 839, 845, 851, 853, 857, 859, 863, 871, 877, 881, 883, 887, 897, 903, 907, 911, 919, 929, 935, 937, 941, 947, 953, 961, 967, 971, 977, 983, 991, 997, 1007, 1009, 1013, 1019, 1021, 1031, 1033, 1039, 1049, 1051, 1061, 1063, 1069, 1079, 1083, 1087, 1091, 1093, 1097, 1103, 1109, 1117, 1123, 1129, 1139, 1147, 1151, 1153, 1163, 1169, 1171, 1181, 1187, 1193, 1201, 1213, 1217, 1223, 1229, 1231, 1237, 1245, 1249, 1259, 1265, 1275, 1277, 1279, 1283, 1289, 1291, 1297, 1301, 1303, 1307, 1319, 1321, 1327, 1339, 1349, 1357, 1361, 1367, 1373, 1381, 1391, 1399, 1407, 1409, 1417, 1423, 1427, 1429, 1433, 1439, 1447, 1451, 1453, 1459, 1467, 1471, 1481, 1483, 1487, 1489, 1493, 1499, 1505, 1511, 1517, 1523, 1529, 1531, 1539, 1543, 1549, 1553, 1559, 1565, 1567, 1571, 1575, 1579, 1583, 1591, 1597, 1601, 1607, 1609, 1613, 1619, 1621, 1627, 1637, 1643, 1653, 1657, 1663, 1667, 1669, 1677, 1683, 1691, 1693, 1697, 1699, 1709, 1715, 1721, 1723, 1733, 1739, 1741, 1747, 1753, 1759, 1767, 1771, 1777, 1783, 1787, 1789, 1799, 1801, 1811, 1823, 1831, 1841, 1847, 1853, 1859, 1861, 1867, 1871, 1873, 1877, 1879, 1889, 1895, 1901, 1907, 1913, 1925, 1931, 1933, 1943, 1949, 1951, 1961, 1969, 1973, 1979, 1985, 1987, 1993, 1997, 1999, 2003, 2009, 2011, 2017, 2023, 2027, 2029, 2039, 2047, 2053, 2063, 2069, 2075, 2079, 2081, 2083, 2087, 2089, 2097, 2099, 2105, 2111, 2113, 2121, 2129, 2131, 2137, 2141, 2143, 2151, 2153, 2159, 2161, 2171, 2177, 2179, 2187, 2193, 2201, 2203, 2207, 2213, 2219, 2221, 2231, 2237, 2239, 2243, 2251, 2263, 2267, 2269, 2273, 2281, 2287, 2293, 2297, 2309, 2311, 2321, 2329, 2333, 2339, 2341, 2347, 2351, 2357, 2363, 2369, 2371, 2377, 2381, 2383, 2389, 2393, 2399, 2411, 2417, 2423, 2429, 2435, 2437, 2441, 2447, 2459, 2465, 2467, 2473, 2477, 2483, 2489, 2497, 2503, 2513, 2519, 2521, 2531, 2537, 2539, 2543, 2549, 2551, 2557, 2565, 2573, 2579, 2591, 2593, 2601, 2607, 2609, 2617, 2621, 2625, 2633, 2639, 2645, 2647, 2655, 2657, 2659, 2663, 2671, 2677, 2683, 2687, 2689, 2693, 2699, 2707, 2711, 2713, 2719, 2727, 2729, 2731, 2741, 2749, 2753, 2759, 2767, 2777, 2789, 2791, 2797, 2801, 2803, 2813, 2819, 2825, 2833, 2837, 2843, 2851, 2857, 2861, 2867, 2875, 2879, 2885, 2887, 2897, 2903, 2909, 2915, 2917, 2925, 2927, 2933, 2939, 2951, 2953, 2957, 2963, 2969, 2971, 2981, 2987, 2993, 2999]
declare const primes_5000: [2, 3, 5, 7, 11, 13, 17, 19, 23, 27, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 95, 97, 101, 103, 107, 109, 113, 121, 127, 131, 137, 139, 147, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 207, 211, 221, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 305, 307, 311, 313, 317, 323, 329, 331, 337, 343, 347, 349, 353, 359, 365, 367, 373, 379, 383, 389, 395, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 455, 457, 461, 463, 467, 473, 479, 487, 491, 495, 499, 503, 509, 517, 521, 523, 533, 539, 541, 547, 555, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 625, 631, 641, 643, 647, 653, 659, 661, 671, 673, 677, 683, 689, 691, 701, 709, 715, 719, 725, 727, 733, 739, 743, 751, 757, 761, 769, 773, 783, 787, 797, 803, 809, 811, 819, 821, 823, 827, 829, 837, 839, 845, 851, 853, 857, 859, 863, 871, 877, 881, 883, 887, 897, 903, 907, 911, 919, 929, 935, 937, 941, 947, 953, 961, 967, 971, 977, 983, 991, 997, 1007, 1009, 1013, 1019, 1021, 1031, 1033, 1039, 1049, 1051, 1061, 1063, 1069, 1079, 1083, 1087, 1091, 1093, 1097, 1103, 1109, 1117, 1123, 1129, 1139, 1147, 1151, 1153, 1163, 1169, 1171, 1181, 1187, 1193, 1201, 1213, 1217, 1223, 1229, 1231, 1237, 1245, 1249, 1259, 1265, 1275, 1277, 1279, 1283, 1289, 1291, 1297, 1301, 1303, 1307, 1319, 1321, 1327, 1339, 1349, 1357, 1361, 1367, 1373, 1381, 1391, 1399, 1407, 1409, 1417, 1423, 1427, 1429, 1433, 1439, 1447, 1451, 1453, 1459, 1467, 1471, 1481, 1483, 1487, 1489, 1493, 1499, 1505, 1511, 1517, 1523, 1529, 1531, 1539, 1543, 1549, 1553, 1559, 1565, 1567, 1571, 1575, 1579, 1583, 1591, 1597, 1601, 1607, 1609, 1613, 1619, 1621, 1627, 1637, 1643, 1653, 1657, 1663, 1667, 1669, 1677, 1683, 1691, 1693, 1697, 1699, 1709, 1715, 1721, 1723, 1733, 1739, 1741, 1747, 1753, 1759, 1767, 1771, 1777, 1783, 1787, 1789, 1799, 1801, 1811, 1823, 1831, 1841, 1847, 1853, 1859, 1861, 1867, 1871, 1873, 1877, 1879, 1889, 1895, 1901, 1907, 1913, 1925, 1931, 1933, 1943, 1949, 1951, 1961, 1969, 1973, 1979, 1985, 1987, 1993, 1997, 1999, 2003, 2009, 2011, 2017, 2023, 2027, 2029, 2039, 2047, 2053, 2063, 2069, 2075, 2079, 2081, 2083, 2087, 2089, 2097, 2099, 2105, 2111, 2113, 2121, 2129, 2131, 2137, 2141, 2143, 2151, 2153, 2159, 2161, 2171, 2177, 2179, 2187, 2193, 2201, 2203, 2207, 2213, 2219, 2221, 2231, 2237, 2239, 2243, 2251, 2263, 2267, 2269, 2273, 2281, 2287, 2293, 2297, 2309, 2311, 2321, 2329, 2333, 2339, 2341, 2347, 2351, 2357, 2363, 2369, 2371, 2377, 2381, 2383, 2389, 2393, 2399, 2411, 2417, 2423, 2429, 2435, 2437, 2441, 2447, 2459, 2465, 2467, 2473, 2477, 2483, 2489, 2497, 2503, 2513, 2519, 2521, 2531, 2537, 2539, 2543, 2549, 2551, 2557, 2565, 2573, 2579, 2591, 2593, 2601, 2607, 2609, 2617, 2621, 2625, 2633, 2639, 2645, 2647, 2655, 2657, 2659, 2663, 2671, 2677, 2683, 2687, 2689, 2693, 2699, 2707, 2711, 2713, 2719, 2727, 2729, 2731, 2741, 2749, 2753, 2759, 2767, 2777, 2789, 2791, 2797, 2801, 2803, 2813, 2819, 2825, 2833, 2837, 2843, 2851, 2857, 2861, 2867, 2875, 2879, 2885, 2887, 2897, 2903, 2909, 2915, 2917, 2925, 2927, 2933, 2939, 2951, 2953, 2957, 2963, 2969, 2971, 2981, 2987, 2993, 2999, 3001, 3011, 3019, 3023, 3029, 3037, 3041, 3049, 3059, 3061, 3067, 3075, 3079, 3083, 3089, 3095, 3101, 3109, 3119, 3121, 3131, 3137, 3145, 3155, 3163, 3167, 3169, 3179, 3181, 3187, 3191, 3201, 3203, 3209, 3217, 3221, 3229, 3239, 3251, 3253, 3257, 3259, 3267, 3271, 3281, 3289, 3297, 3299, 3301, 3307, 3313, 3319, 3323, 3329, 3331, 3343, 3347, 3353, 3359, 3361, 3371, 3373, 3389, 3391, 3403, 3407, 3413, 3423, 3433, 3447, 3449, 3455, 3457, 3461, 3463, 3467, 3469, 3477, 3483, 3491, 3499, 3509, 3511, 3517, 3527, 3529, 3533, 3539, 3541, 3547, 3557, 3559, 3571, 3581, 3583, 3591, 3593, 3605, 3607, 3613, 3617, 3623, 3631, 3637, 3643, 3653, 3659, 3667, 3671, 3673, 3677, 3683, 3689, 3691, 3697, 3701, 3709, 3717, 3719, 3727, 3733, 3739, 3749, 3757, 3761, 3767, 3769, 3779, 3787, 3793, 3797, 3803, 3811, 3821, 3823, 3833, 3839, 3847, 3851, 3853, 3863, 3869, 3875, 3877, 3881, 3887, 3889, 3901, 3907, 3911, 3917, 3919, 3923, 3929, 3931, 3943, 3947, 3953, 3959, 3965, 3967, 3983, 3989, 3995, 4001, 4003, 4007, 4013, 4019, 4021, 4027, 4041, 4049, 4051, 4057, 4067, 4073, 4079, 4085, 4089, 4091, 4093, 4099, 4107, 4111, 4121, 4127, 4129, 4133, 4139, 4145, 4153, 4157, 4159, 4165, 4177, 4187, 4199, 4201, 4211, 4217, 4219, 4229, 4231, 4241, 4243, 4253, 4259, 4261, 4271, 4273, 4283, 4289, 4297, 4313, 4319, 4327, 4335, 4337, 4339, 4349, 4355, 4357, 4363, 4373, 4379, 4387, 4391, 4397, 4403, 4409, 4415, 4421, 4423, 4433, 4441, 4447, 4451, 4457, 4463, 4469, 4477, 4481, 4483, 4493, 4499, 4507, 4513, 4517, 4519, 4523, 4531, 4547, 4549, 4557, 4561, 4567, 4583, 4591, 4597, 4603, 4611, 4621, 4631, 4637, 4639, 4643, 4649, 4651, 4657, 4663, 4673, 4679, 4687, 4691, 4699, 4703, 4709, 4715, 4721, 4723, 4729, 4733, 4739, 4751, 4757, 4759, 4767, 4775, 4783, 4787, 4789, 4793, 4799, 4801, 4813, 4817, 4823, 4829, 4831, 4841, 4853, 4859, 4861, 4871, 4877, 4883, 4889, 4895, 4901, 4903, 4909, 4917, 4919, 4925, 4931, 4933, 4937, 4943, 4951, 4957, 4965, 4967, 4969, 4973, 4987, 4993, 4999]

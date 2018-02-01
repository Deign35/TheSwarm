import { LongCommand } from "Commands/CommandBase";
import { BasicCreepCommand } from "Commands/BasicCreepCommand";

class LongRangeMiningAssignment extends LongCommand {
    protected static HarvesterRole: BasicCreepCommandType[] = [
        C_Harvest, C_Transfer
    ];

    protected static DeliverRole: BasicCreepCommandType[] = [
        C_Withdraw, C_Transfer, C_Repair
    ];
}
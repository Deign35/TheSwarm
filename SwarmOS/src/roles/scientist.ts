export class RoleScientist {
    static roleId = "scientist";
    private static terminal = Game.getObjectById('5a4b9b45a26e0858b28160a8') as StructureTerminal;

    static run(creep: Creep) {
        let labs = {
            Left: {
                Combined: Game.getObjectById(this.LabIds.Left.Combined) as StructureLab,
                Left: Game.getObjectById(this.LabIds.Left.Left) as StructureLab,
                Right: Game.getObjectById(this.LabIds.Left.Right) as StructureLab,
            },
            Right: {
                Combined: Game.getObjectById(this.LabIds.Right.Combined) as StructureLab,
                Left: Game.getObjectById(this.LabIds.Right.Left) as StructureLab,
                Right: Game.getObjectById(this.LabIds.Right.Right) as StructureLab,
            }
        }

        if (labs.Left.Left.mineralType == this.CurrentReaction[this.LeftTarget].Left && labs.Left.Right.mineralType == this.CurrentReaction[this.LeftTarget].Right) {
            labs.Left.Combined.runReaction(labs.Left.Left, labs.Left.Right);
        }

        if (labs.Right.Left.mineralType == this.CurrentReaction[this.RightTarget].Left && labs.Right.Right.mineralType == this.CurrentReaction[this.RightTarget].Right) {
            labs.Right.Combined.runReaction(labs.Right.Left, labs.Right.Right);
        }

        if (!creep.memory.task) {
            let targetReaction = this.CheckReaction(labs.Left, this.LeftTarget) ||
                this.CheckReaction(labs.Right, this.RightTarget);
            creep.memory.task = false;
            if (targetReaction) {
                creep.memory.task = {
                    transferTarget: targetReaction.transferTarget.id,
                    resourceType: targetReaction.resourceType,
                    withdrawTarget: targetReaction.withdrawTarget.id,
                }
            }
        }
        let result = 0;
        let task = creep.memory.task;
        if (task && task.resourceType) {
            if (creep.carry[task.resourceType as ResourceConstant]) {
                let target = Game.getObjectById(task.transferTarget) as StructureLab;
                result = creep.transfer(target, task.resourceType);
                if (result == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                } else if (result == OK) {
                    delete creep.memory.task;
                }
            } else {
                let target = Game.getObjectById(task.withdrawTarget) as StructureStorage;
                result = creep.withdraw(target, task.resourceType);
                if (result == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }
        }
    }



    private static CheckReaction(labs: any, targetResource: ResourceConstant) {
        let result = {} as { [name: string]: any };
        result.transferTarget = this.terminal;
        result.withdrawTarget = labs.Combined;
        result.resourceType = result.withdrawTarget.mineralType;
        if (result.withdrawTarget.mineralAmount == 0) {
            result.withdrawTarget = this.terminal;
            result.transferTarget = labs.Right;
            result.resourceType = this.CurrentReaction[targetResource].Right;
            if (result.transferTarget.mineralAmount > 0 && result.transferTarget.mineralType != result.resourceType) {
                result.resourceType = result.transferTarget.mineralType
                result.withdrawTarget = result.transferTarget;
                result.transferTarget = this.terminal;
            } else if (result.transferTarget.mineralAmount > 10) {
                result.transferTarget = labs.Left;
                result.resourceType = this.CurrentReaction[targetResource].Left;
                if (result.transferTarget.mineralAmount > 0 && result.transferTarget.mineralType != result.resourceType) {
                    result.resourceType = result.transferTarget.mineralType
                    result.withdrawTarget = result.transferTarget;
                    result.transferTarget = this.terminal;
                } else if (result.transferTarget.mineralAmount > 10) {
                    return;
                }
            }
        }

        return result;
    }
    private static CurrentReaction: { [name: string]: any } = {
        RESOURCE_CATALYZED_GHODIUM_ACID: { Left: RESOURCE_GHODIUM_ACID, Right: RESOURCE_CATALYST },
        RESOURCE_GHODIUM_ACID: { Left: RESOURCE_GHODIUM_HYDRIDE, Right: RESOURCE_OXYGEN },
        RESOURCE_GHODIUM_HYDRIDE: { Left: RESOURCE_HYDROXIDE, Right: RESOURCE_OXYGEN },
        RESOURCE_HYDROXIDE: { Left: RESOURCE_HYDROGEN, Right: RESOURCE_OXYGEN }
    };

    private static LeftTarget: RESOURCE_CATALYZED_GHODIUM_ACID
    private static RightTarget: RESOURCE_CATALYZED_GHODIUM_ACID
    private static LabIds: {
        Left: {
            Combined: '5a629bde831ed35b6bc7bd8e',
            Left: '5a62a9c0e628e56ee00ed831',
            Right: '5a629952de95300947678781',
        },
        Right: {
            Combined: '5a62db474c293b01c1c931ff',
            Left: '5a62a4f517172b42c3b3987e',
            Right: '5a62ec4fcb86857369933393',
        }
    }
}
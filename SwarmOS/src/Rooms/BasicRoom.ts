/*let requiresNewRoomProcesses = false;
if (!this.memory[roomID]) {
    requiresNewRoomProcesses = true;
}
let data = this.View.GetRoomData(roomID);
if (!data) {
    this.log.fatal(`(ASSUMPTION FAILURE): A room is visible but has no data (${roomID})`);
    data = this.View.GetRoomData(roomID, true)!;
    if (!data) {
        this.kernel.killProcess(this.pid);
        return;
    } else {
        // Actually assumption should be that this can't happen either
        this.log.warn(`(ASSUMPTION RECOVERY): GetRoomData refresh fixed it (${roomID})`)
    }
}
if (requiresNewRoomProcesses) {
    this.groups[roomID] = {};
    if (data.sourceIDs.length > 0 || data.mineralIDs.length > 0) {
        let newMem: ExtractionGroup_Memory = {
            assignments: {},
            childThreads: {},
            enabled: true,
            homeRoom: roomID,
            PKG: CG_Extraction,
            pri: Priority_Medium,
            targetRoom: roomID
        }
        let newPID = this.kernel.startProcess(CG_Extraction, newMem);
        this.kernel.setParent(newPID);
        this.thread.RegisterAsThread(newPID);
        this.groups[roomID][CG_Extraction] = newPID;
    }
    let newMem: ControlGroup_Memory = {
        assignments: {},
        childThreads: {},
        enabled: true,
        homeRoom: roomID,
        PKG: CG_Control,
        pri: Priority_Medium,
        targetRoom: roomID
    }
    let newPID = this.kernel.startProcess(CG_Control, newMem);
    this.kernel.setParent(newPID);
    this.thread.RegisterAsThread(newPID);
    this.groups[roomID][CG_Control] = newPID;

    let infMem: InfrastructureGroup_Memory = {
        assignments: {},
        childThreads: {},
        enabled: true,
        homeRoom: roomID,
        PKG: CG_Infrastructure,
        pri: Priority_Medium,
        targetRoom: roomID,
        jobs: {
            CreepBuilder: [],
            CreepRefiller: [],
            CreepUpgrader: []
        },
        unprocessedCreeps: []
    }
    let infPID = this.kernel.startProcess(CG_Infrastructure, infMem);
    this.kernel.setParent(infPID);
    this.thread.RegisterAsThread(infPID);
    this.groups[roomID][CG_Infrastructure] = infPID;
}*/
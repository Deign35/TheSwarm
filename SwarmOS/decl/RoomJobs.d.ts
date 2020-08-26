declare interface IRoomJobCreeps_Memory extends MemBase {

}

declare interface IRoomJobCreeps extends IProcess {
  SurrenderCreep(creepID: CreepID): void;
}
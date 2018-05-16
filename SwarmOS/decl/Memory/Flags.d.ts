/** Flag Memory */
declare interface FlagProcess_Memory extends MemBase {
    flagID: FlagID;
}

/** Flags Extension memory */
declare interface FlagMemory extends MemBase {
    [id: string]: PID
}
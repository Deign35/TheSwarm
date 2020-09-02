/** Flag Memory */
declare interface FlagProcess_Memory extends MemBase {
  flagID: FlagID;
}

/** Flags Extension memory */
declare type FlagManagerMemory = MemBase & IDictionary<FlagID, PID>
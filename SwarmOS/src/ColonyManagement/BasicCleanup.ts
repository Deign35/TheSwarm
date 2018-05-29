import { BasicProcess } from "Core/BasicTypes";

class BasicCleanup extends BasicProcess<MemBase> {
    RunThread(): ThreadState {
        // Cleanup old spawn requests and other old memory

        this.sleeper.sleep(this.pid, 500);
        return ThreadState_Done;
    }
}
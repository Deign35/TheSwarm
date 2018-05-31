import { SlimProcess } from "Core/BasicTypes";

class SpawnActivity extends SlimProcess<any> {
    RunThread(): ThreadState {
        return ThreadState_Done;
    }
}
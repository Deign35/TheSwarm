export const OSPackage: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_Player, Player);
    }
}

import { ProcessBase } from "./Types/ProcessTypes";

const REQUIRED_SERVICES = {
    [PKG_CLIProcessor]: {
        pid: 'CLI',
        memPath: SEG_Master_Drive
    },
    [APKG_Room]: {
        pid: 'RA',
        memPath: `${SEG_Master_Drive}${C_SEPERATOR}analyzers${C_SEPERATOR}rooms`
    }
}

class Player extends ProcessBase {
    RunThread(): ThreadState {
        let reqIDs = Object.keys(REQUIRED_SERVICES);
        for (let i = 0; i < reqIDs.length; i++) {
            let pkg = reqIDs[i];
            let data = REQUIRED_SERVICES[pkg];
            MasterFS.EnsurePath(data.memPath);
            if (!this.kernel.getProcessByPID(data.pid)) {
                this.kernel.startProcess(pkg, data.memPath, {
                    desiredPID: data.pid
                });
            }
        }
        this.kernel.sleep(this.pid, 5);
        return ThreadState_Done;
    }
}
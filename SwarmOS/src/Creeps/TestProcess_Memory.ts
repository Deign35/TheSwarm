// CLI(CLI_Launch, PKG_EmptyProcess, {})
export const OSPackage: IPackage<MemBase> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_Test, TestProcess)
    }
}

import { ProcessBase } from "Core/Types/ProcessTypes";

const ENABLE_PROFILING = true;
class TestProcess extends ProcessBase {
    RunThread(): ThreadState {
        let start = Game.cpu.getUsed();
        try {
            let flashFolder = Flash.EnsurePath(`${SEG_Flash_Drive}${C_SEPERATOR}test`);
            let flashFile = flashFolder.CreateFile<any>('test.dat');
            let fVal: number = (flashFile.Get('startTime') || Game.time);
            flashFile.Set('startTime', fVal);

            let RAMFolder = RAM.EnsurePath(`${SEG_RAM_Drive}${C_SEPERATOR}test`);
            let RAMFile = RAMFolder.CreateFile<any>('test.dat');
            let rVal: number = (RAMFile.Get('startTime2') || Game.time);
            RAMFile.Set('startTime2', rVal);

            let memFile = this.memFolder.CreateFile<any>('test.dat');
            let mVal: number = (memFile.Get('startTime3') || Game.time);
            memFile.Set('startTime3', mVal);

            this.log.info(`[${Game.time}] -- ${this.pid} -- Flash: ${fVal} -- RAM: ${rVal} -- Mem: ${mVal}`);
        } catch (ex) {
            this.log.info(`An exception occurred while trying experimental stuff (${ex})`);
        }

        if (ENABLE_PROFILING) {
            this.log.info(`Experimental CPU used (${Game.cpu.getUsed() - start})`);
        }
        return ThreadState_Done;
    }
}
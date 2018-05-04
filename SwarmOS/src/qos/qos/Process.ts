/**
 * Initial commit was copied from 
 * https://github.com/ScreepsQuorum/screeps-quorum/tree/7254e727868fdc30e93b4e4dc8e015021d08a6ef
 * 
 */

declare type ProcessData = {
    children: { [id: string]: PID },
    processes: { [id: string]: PID },
    period: { [id: string]: number }
}
export abstract class Process implements IProcess {
    private priority?: number;
    constructor(public pid: PID, public name: string, public data: ProcessData, public parent?: string) {
        if (!this.data.children) {
            this.data.children = {}
        }
        if (!this.data.processes) {
            this.data.processes = {}
        }
        if (!this.data.period) {
            this.data.period = {}
        }
    }

    getPriority() {
        return this.priority || DEFAULT_PRIORITY
    }

    clean() {
        if (this.data.children) {
            let keys = Object.keys(this.data.children);
            for (let i = 0; i < keys.length; i++) { // jshint ignore:line
                if (!kernel.scheduler.isPidActive(this.data.children[keys[i]])) {
                    delete this.data.children[keys[i]]
                }
            }
        }

        if (this.data.processes) {
            let keys = Object.keys(this.data.processes);
            for (let i = 0; i < keys.length; i++) { // jshint ignore:line
                if (!kernel.scheduler.isPidActive(this.data.processes[keys[i]])) {
                    delete this.data.processes[keys[i]]
                }
            }
        }
    }

    getDescriptor() {
        return ""
    }

    launchChildProcess(label: string, name: string, data = {}) {
        if (this.data.children[label]) {
            //Maybe check if its asleep or something and reactivate it??
            return this.data.children[label];
        }
        this.data.children[label] = kernel.scheduler.launchProcess(name, data, this.pid);
        return this.data.children[label];
    }

    getChildProcessPid(label: string) {
        if (!this.data.children) {
            return Invalid_PID;
        }
        if (!this.data.children[label]) {
            return Invalid_PID;
        }
        return this.data.children[label]
    }

    isChildProcessRunning(label: string) {
        const pid = this.getChildProcessPid(label)
        if (!pid) {
            return false
        }
        return kernel.scheduler.isPidActive(pid)
    }

    launchProcess(label: string, name: string, data = {}) {
        if (this.data.processes[label]) {
            //Maybe check if its asleep or something and reactivate it??
            return this.data.processes[label];
        }
        this.data.processes[label] = kernel.scheduler.launchProcess(name, data)
        return this.data.processes[label]
    }

    getProcessPid(label: string) {
        if (!this.data.processes[label]) {
            return Invalid_PID
        }
        return this.data.processes[label]
    }

    isProcessRunning(label: string) {
        const pid = this.getProcessPid(label)
        if (!pid) {
            return false
        }
        return kernel.scheduler.isPidActive(pid)
    }

    /*launchCreepProcess(label: string, role: string, roomname: string, quantity = 1, options = {}) {
        const room = Game.rooms[roomname]
        if (!room) {
            return false
        }
        if (!this.data.children) {
            this.data.children = {}
        }
        let x
        for (x = 0; x < quantity; x++) {
            const specificLabel = label + x
            if (this.data.children[specificLabel]) {
                continue
            }
            const creepName = room.queueCreep(role, options)
            this.launchChildProcess(specificLabel, 'creep', {
                'creep': creepName
            })
        }
    }*/

    period(interval: number, label = 'default') {
        const lastRun = this.data.period[label] || 0;
        if (lastRun < Game.time - interval) {
            this.data.period[label] = Game.time
            return true
        }

        return false
    }

    sleep(ticks: number) {
        kernel.scheduler.sleep(this.pid, ticks, true)
    }

    suicide() {
        kernel.scheduler.kill(this.pid)
    }

    run() {
        this.clean()
        this.main()
    }
    abstract main(): void;
}
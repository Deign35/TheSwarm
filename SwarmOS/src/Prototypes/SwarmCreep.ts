import { NotifiableSwarmObject } from "./SwarmObject";
import * as _ from "lodash";

const CARRY_TOTAL = 'CT';
const CURRENT_PATH = 'CP';
export class SwarmCreep<T extends Creep> extends NotifiableSwarmObject<Creep> {
    // Instead of T extends Creep, what about different classes??
    protected data: { [id: string]: any } = {};
    get carryTotal() {
        if (!this.data[CARRY_TOTAL]) {
            this.data[CARRY_TOTAL] = _.sum(this._instance.carry);
        }
        return this.data[CARRY_TOTAL];
    }
    get curPath() {
        if (!this.data[CURRENT_PATH]) {
            this.data[CURRENT_PATH] = 'NOT CONFIGURED';
        }
        return this.data[CURRENT_PATH];
    }
    get endTickEnergy() {
        // This should utilize calls to things like Drop/Harvest/Pickup etc... and calculate if reactions aught to be
        // enacted as a result of being invalid next tick.
        return 0;
    }
    Attack(target: Creep | Structure) {
        this._instance.attack(target);
    }
}
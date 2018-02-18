import { ChildMemory, _SwarmMemory } from "./SwarmMemory";
import * as _ from "lodash";

const DEPTH = 'Depth';
const WIDTH = 'Width';
const TRACE = 'Trace';
export class RateTracker extends ChildMemory {
    // Depth is exponential
    // Width is linear
    // Example: Depth = 3, Width = 10
    // tracer[0] = last 10 ticks
    // tracer[1] = last 10 averages of 10 ticks  -- (10)a
    // tracer[2] = last 10 averages of tracer[1] -- ((10)a * 10)a
    // Ends up being a trace of the last 1000 ticks - for 3 arrays of length 10

    Depth!: number;
    Width!: number;
    protected tracer!: (number[])[];
    Save() {
        this.SetData(DEPTH, this.Depth);
        this.SetData(WIDTH, this.Width);
        this.SetData(TRACE, this.tracer);
        super.Save();
    }
    Load() {
        if (!super.Load()) { return false; }
        this.Depth = this.GetData(DEPTH) || 3;
        this.Width = this.GetData(WIDTH) || 10;
        this.tracer = this.GetData(TRACE) || [[]];
        return true;
    }

    InsertData(inVal: number) {
        this.insertAt(inVal, 0);
    }

    GetRate() {
        if (this.tracer.length < this.Depth - 1) {
            return 0;
        }

        let cummulative = _.sum(this.tracer[this.Depth - 1]);
        return cummulative / this.tracer[this.Depth].length;
    }

    protected insertAt(inVal: number, level: number) {
        this.tracer[level].push(inVal);
        if (this.tracer[level].length >= this.Width) {
            if (level < this.Depth - 1) {// All but last
                if (this.tracer.length == level + 1) {
                    this.tracer.push([]);
                }
                let sumForDepth = _.sum(this.tracer[level]);
                this.insertAt(sumForDepth / this.tracer[level].length, level + 1);
                this.tracer[level] = [];
            } else { // Trim off the oldest.
                this.tracer[level].splice(0, 1);
            }
        }
    }
}
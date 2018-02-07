"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var SwarmMemory = /** @class */ (function () {
    function SwarmMemory(MemoryID, Parent) {
        this.MemoryID = MemoryID;
        this.Parent = Parent;
        this._cache = {};
        this.Load();
    }
    SwarmMemory.prototype.GetData = function (id) { return this._cache[id] || undefined; };
    SwarmMemory.prototype.SetData = function (id, data) { this._cache[id] = data; };
    SwarmMemory.prototype.DeleteData = function (id) { delete this._cache[id]; };
    SwarmMemory.prototype.Save = function () {
        if (this._cache) {
            if (this.Parent) {
                this.Parent.SetData(this.MemoryID, this._cache);
            }
            else {
                Memory[this.MemoryID] = this._cache;
            }
        }
    };
    SwarmMemory.prototype.Load = function () {
        if (this.Parent) {
            this._cache = this.Parent.GetData(this.MemoryID) || {};
        }
        else {
            this._cache = Memory[this.MemoryID] || {};
        }
    };
    return SwarmMemory;
}());
exports.SwarmMemory = SwarmMemory;
var SwarmLedger = /** @class */ (function (_super) {
    __extends(SwarmLedger, _super);
    function SwarmLedger() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SwarmLedger.prototype.ForEach = function (inFunc) {
        for (var name_1 in this._cache) {
            inFunc(this._cache[name_1]);
        }
    };
    return SwarmLedger;
}(SwarmMemory));
exports.SwarmLedger = SwarmLedger;
//# sourceMappingURL=SwarmMemory.js.map

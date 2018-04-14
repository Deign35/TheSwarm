Object.defineProperties(Flag.prototype, {
    id: {
        get() {
            return this.name;
        }
    }
});
Object.defineProperties(Room.prototype, {
    id: {
        get() {
            return this.name;
        }
    }
});
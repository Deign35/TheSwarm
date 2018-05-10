if (!Flag.prototype.id) {
    Object.defineProperties(Flag.prototype, {
        id: {
            get() {
                return this.name;
            }
        }
    });
}

if (!Room.prototype.id) {
    Object.defineProperties(Room.prototype, {
        id: {
            get() {
                return this.name;
            }
        }
    });
}
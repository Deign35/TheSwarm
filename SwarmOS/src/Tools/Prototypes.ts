if (!Flag.prototype.SwarmOS) {
  Object.defineProperties(Flag.prototype, {
    id: {
      get() {
        return this.name;
      }
    },
    SwarmOS: {
      get() {
        return true;
      }
    }
  });
}

if (!Room.prototype.SwarmOS) {
  Object.defineProperties(Room.prototype, {
    id: {
      get() {
        return this.name;
      }
    },
    SwarmOS: {
      get() {
        return true;
      }
    }
  });
}
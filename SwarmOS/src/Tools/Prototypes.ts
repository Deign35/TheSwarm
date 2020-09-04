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

if (!Creep.prototype.SwarmOS) {
  Object.defineProperties(Creep.prototype, {
    bodyCost: {
      get() {
        return _.sum(this.body, (bodyPart: BodyPartDefinition) => { return BODYPART_COST[bodyPart.type] });
      }
    },
    SwarmOS: {
      get() {
        return true;
      }
    }
  });
}
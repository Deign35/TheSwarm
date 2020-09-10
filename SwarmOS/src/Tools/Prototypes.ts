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

if (!RoomPosition.prototype.SwarmOS) {
  RoomPosition.prototype.isEdge = function () {
    return this.x == 49 || this.x == 0 || this.y == 0 || this.y == 49;
  }
  RoomPosition.prototype.isExit = function () {
    return this.isEdge() && this.getTerrain() != TERRAIN_MASK_WALL;
  }
  RoomPosition.prototype.getTerrain = function () {
    return Game.map.getRoomTerrain(this.roomName).get(this.x, this.y);
  }
  Object.defineProperties(RoomPosition.prototype, {
    SwarmOS: {
      get() {
        return true;
      }
    }
  });
}
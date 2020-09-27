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
    link: {
      get() {
        return `<a href="#!/room/${Game.shard.name}/${this.name}" >${this.name}</a>`
      }
    },
    id: {
      get() {
        return this.name;
      }
    },
    type: {
      get() {
        const res = /[EW](\d+)[NS](\d+)/.exec(this.name);
        if (res && res.length > 2) {
          const EW = +res[1];
          const NS = +res[2];
          const EWI = EW % 10, NSI = NS % 10;
          if (EWI === 0 || NSI === 0) {
            return RT_Highway;
          } else if (EWI === 5 && NSI === 5) {
            return RT_Center;
          } else if (Math.abs(5 - EWI) <= 1 && Math.abs(5 - NSI) <= 1) {
            return RT_SourceKeeper;
          } else if (this.controller && this.controller.my) {
            return RT_Home;
          } else if (this.controller && this.controller.reservation &&
            this.controller.reservation.username == MY_USERNAME) {
            return RT_RemoteHarvest;
          }
        }

        return RT_Nuetral;
      }
    },
    SwarmOS: {
      get() {
        return true;
      }
    },
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
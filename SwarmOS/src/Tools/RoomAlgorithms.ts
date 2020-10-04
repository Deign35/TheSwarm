const UNSET = 255;
export function GenerateDistanceMatrix(roomTerrain: RoomTerrain, pos: RoomPosition) {
  const matrix = new Array(2500).fill(UNSET);
  const nodeQueue: number[] = [pos.x * 50 + pos.y];
  matrix[nodeQueue[0]] = 0;

  while (nodeQueue.length > 0) {
    const node = nodeQueue.shift()!;
    const nodeX = Math.floor(node / 50);
    const nodeY = node % 50;
    OperateOnNeighbors(nodeX, nodeY, (x, y) => {
      const arrayPos = x * 50 + y;
      if (matrix[arrayPos] != UNSET) { return; }
      if (roomTerrain.get(x, y) === TERRAIN_MASK_WALL) {
        matrix[arrayPos] = Infinity;
      } else {
        matrix[arrayPos] = matrix[node] + 1;
        nodeQueue.push(arrayPos);
      }
    });
  }

  return matrix;
}

export function GenerateWallDistanceMatrix(roomTerrain: RoomTerrain) {
  const matrix = new Array(2500).fill(UNSET);
  const floorQueue: number[] = [];
  OperateOverMap((x, y) => {
    const terrain = roomTerrain.get(x, y);
    if (terrain == TERRAIN_MASK_WALL) {
      matrix[x * 50 + y] = Infinity;
      OperateOnNeighbors(x, y, (x2, y2) => {
        const terrain2 = roomTerrain.get(x2, y2);
        const x2y2 = x2 * 50 + y2;
        if (terrain2 != TERRAIN_MASK_WALL && matrix[x2y2] == UNSET) {
          matrix[x2y2] = 1;
          floorQueue.push(x2y2);
        }
      });
    }
  });

  while (floorQueue.length > 0) {
    const node = floorQueue.shift()!;
    const x = Math.floor(node / 50);
    const y = node % 50;
    OperateOnNeighbors(x, y, (x2, y2) => {
      const x2y2 = x2 * 50 + y2;
      if (matrix[x2y2] == UNSET) {
        matrix[x2y2] = matrix[node] + 1;
        floorQueue.push(x2y2);
      }
    });
  }

  return matrix;
}

export function GetDistancePeaks(matrix: number[]): number[] {
  const maybePeaks: number[] = [];
  OperateOverMap((x, y) => {
    const curNode = matrix[x * 50 + y];
    if (curNode != Infinity) {
      let hasHigherNeighbor = false;
      OperateOnNeighbors(x, y, (x2, y2) => {
        const checkedNode = matrix[x2 * 50 + y2];
        if (checkedNode != Infinity && checkedNode > curNode) {
          hasHigherNeighbor = true;
        }
      });

      if (!hasHigherNeighbor) {
        maybePeaks.push(x * 50 + y);
      }
    }
  });

  const actualPeaks: number[] = [];
  const checkedMatrix: boolean[] = new Array(2500).fill(false);
  while (maybePeaks.length > 0) {
    if (checkedMatrix[maybePeaks[0]]) {
      maybePeaks.shift();
      continue;
    }

    const plateau: number[] = [maybePeaks.shift()!];
    const plateauToProcess: number[] = [plateau[0]];
    checkedMatrix[plateau[0]] = true;
    let hasFoundHigherNeighbor = false;

    while (plateauToProcess.length > 0) {
      const curNode = plateauToProcess.shift()!;
      const curX = Math.floor(curNode / 50);
      const curY = curNode % 50;
      OperateOnNeighbors(curX, curY, (x, y) => {
        const xy = x * 50 + y;
        if (matrix[curNode] < matrix[xy]) {
          hasFoundHigherNeighbor = true;
        }
        if (!checkedMatrix[xy]) {
          if (matrix[curNode] == matrix[xy]) {
            plateau.push(xy);
            plateauToProcess.push(xy);
            checkedMatrix[xy] = true;
          }
        }
      });
    }

    if (!hasFoundHigherNeighbor) {
      actualPeaks.push(...plateau);
    }
  }

  return actualPeaks;
}

export function OperateOverMap(someFunc: (x: number, y: number) => void) {
  for (let x = 0; x < 50; x++) {
    for (let y = 0; y < 50; y++) {
      someFunc(x, y);
    }
  }
}

export function OperateOnNeighbors(xCenter: number, yCenter: number, someFunc: (x: number, y: number) => void) {
  for (let x2 = xCenter - 1; x2 <= xCenter + 1; x2++) {
    for (let y2 = yCenter - 1; y2 <= yCenter + 1; y2++) {
      if (x2 < 0 || x2 > 49 || y2 < 0 || y2 > 49 || (x2 == xCenter && y2 == yCenter)) { continue; }
      someFunc(x2, y2);
    }
  }
}

export function ShrinkRoom(matrix: number[], numToShrink: number) {
  OperateOverMap((x, y) => {
    const xy = x * 50 + y;
    if (matrix[xy] != Infinity) {
      matrix[xy] -= numToShrink;
      if (matrix[xy] <= 0) {
        matrix[xy] = Infinity;
      }
    }
  });
}
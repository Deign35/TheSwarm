
export function GetNextPositionFrom(pos: { x: number, y: number }, dir: DirectionConstant): { x: number, y: number } {
    let retVal = { x: pos.x, y: pos.y };
    switch (dir) {
        case (TOP):
            retVal.y -= 1;
            break;
        case (TOP_LEFT):
            retVal.x -= 1;
            retVal.y -= 1;
            break;
        case (TOP_RIGHT):
            retVal.x += 1;
            retVal.y -= 1;
            break;
        case (RIGHT):
            retVal.x += 1;
            break;
        case (LEFT):
            retVal.x -= 1;
            break;
        case (BOTTOM):
            retVal.y += 1;
            break;
        case (BOTTOM_LEFT):
            retVal.x -= 1;
            retVal.y += 1;
            break;
        case (BOTTOM_RIGHT):
            retVal.x += 1;
            retVal.y += 1;
            break;
    }

    return retVal;
}
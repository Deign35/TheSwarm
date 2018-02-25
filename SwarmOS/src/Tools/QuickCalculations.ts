export function CalculateBodyCost(bodyParts: BodyPartConstant[]) {
    let cost = 0;
    for(let i = 0, length = bodyParts.length; i < length; i++) {
        cost += BODYPART_COST[bodyParts[i]];
    }

    return cost;
}
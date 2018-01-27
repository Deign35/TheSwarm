export type Role = {
    desiredBody: BodyPartConstant[],
    maxWorkers: number,
    run: (creep: Creep) => number;
}
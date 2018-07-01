const CENTER = 0;
const TOP = 1;
const TOP_RIGHT = 2;
const RIGHT = 3;
const BOTTOM_RIGHT = 4;
const BOTTOM = 5;
const BOTTOM_LEFT = 6;
const LEFT = 7;
const TOP_LEFT = 8;

const MAX_WIDTH = 5;
const MAX_HEIGHT = 5;
module.exports = {
    GenerateMapping: function () {
        let baseArray = new Array(MAX_WIDTH * MAX_HEIGHT).fill(0).map((un, index) => {
            let x = index % MAX_WIDTH;
            let y = Math.floor(index / MAX_HEIGHT);

            let mapping = {
                [CENTER]: {
                    x,
                    y,
                    index
                }
            }
            if (x - 1 >= 0) {
                mapping[LEFT] = {
                    x: x - 1,
                    y,
                    index: index - 1
                }
                if (y - 1 >= 0) {
                    mapping[TOP_LEFT] = {
                        x: x - 1,
                        y: y - 1,
                        index: index - 51
                    }
                }
                if (y + 1 < MAX_HEIGHT) {
                    mapping[BOTTOM_LEFT] = {
                        x: x - 1,
                        y: y + 1,
                        index: index + 49
                    }
                }
            }
            if (x + 1 < MAX_WIDTH) {
                mapping[RIGHT] = {
                    x: x + 1,
                    y,
                    index: index + 1
                }
                if (y - 1 >= 0) {
                    mapping[TOP_RIGHT] = {
                        x: x + 1,
                        y: y - 1,
                        index: index - 49
                    }
                }
                if (y + 1 < MAX_HEIGHT) {
                    mapping[BOTTOM_RIGHT] = {
                        x: x + 1,
                        y: y + 1,
                        index: index + 51
                    }
                }
            }

            if (y - 1 >= 0) {
                mapping[TOP] = {
                    x,
                    y: y - 1,
                    index: index - 50
                }
            }

            if (y + 1 < MAX_HEIGHT) {
                mapping[BOTTOM] = {
                    x,
                    y: y + 1,
                    index: index + 50
                }
            }

            return mapping;
        });

        let convertedToString = '['
        for (let i = 0; i < baseArray.length; i++) {
            convertedToString += '{';
            let next = baseArray[i];
            let keys = Object.keys(next);
            if (i == 0) {
                console.log(JSON.stringify(next));
                console.log(JSON.stringify(keys));
            }
            for (let j = 0; j < keys.length; j++) {
                convertedToString += `${keys[j]}:${JSON.stringify(next[keys[j]])},`
            }
            //convertedToString += `${JSON.stringify(next)},`;
            convertedToString = convertedToString.slice(0, -1) + '},';
        }

        convertedToString = convertedToString.slice(0, -1) + ']';
        return convertedToString
    }
};
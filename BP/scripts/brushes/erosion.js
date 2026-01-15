
import * as helper from "../helper.js";

export function melt({
    brushVolume: brushVolume,
    minVertex: minVertex,
    targetBlock: targetBlock,
    targetPosition: targetPosition,
    shape: shape
}) {
    helper.shapes[shape]({
        brushVolume: brushVolume,
        minVertex: minVertex,
        targetBlock: targetBlock,
        targetPosition: targetPosition,
        process: (minVertex, i, k, j, state) => {
            let checkedBlock;
            checkedBlock = minVertex.offset({
                x: i,
                y: k,
                z: j
            });

            let airNeighbours = 0;

            let neighbours = {
                up: checkedBlock.above(),
                down: checkedBlock.below(),
                north: checkedBlock.north(),
                south: checkedBlock.south(),
                east: checkedBlock.east(),
                west: checkedBlock.west()
            }


            for (let [key, value] of Object.entries(neighbours)) {
                if (value.typeId == "minecraft:air" && checkedBlock.typeId != "minecraft:air")
                    airNeighbours++;
                else continue;
            }

            if (airNeighbours >= 2) {
                state.affectedBlocks.push(checkedBlock);
            }
        },
        outSideProcess: (minVertex, state) => {
            for (let affectedBlock of state.affectedBlocks) {
                affectedBlock.setType("minecraft:air");
            }
            state.affectedBlocks = [];
        }
    });
}

export function fill({
    brushVolume: brushVolume,
    minVertex: minVertex,
    targetBlock: targetBlock,
    targetPosition: targetPosition,
    shape: shape
}) {
    helper.shapes[shape]({
        brushVolume: brushVolume,
        minVertex: minVertex,
        targetBlock: targetBlock,
        targetPosition: targetPosition,
        process: (minVertex, i, k, j, state) => {
            let checkedBlock;
            checkedBlock = minVertex.offset({
                x: i,
                y: k,
                z: j
            });

            let blockNeighbours = 0;

            let neighbours = {
                up: checkedBlock.above(),
                down: checkedBlock.below(),
                north: checkedBlock.north(),
                south: checkedBlock.south(),
                east: checkedBlock.east(),
                west: checkedBlock.west()
            }


            for (let [key, value] of Object.entries(neighbours)) {
                if (value.typeId != "minecraft:air" && checkedBlock.typeId == "minecraft:air")
                    blockNeighbours++;
                else continue;
            }

            if (blockNeighbours >= 2) {
                state.affectedBlocks.push(checkedBlock);
            }
        },
        outSideProcess: (minVertex, state) => {
            let neighbours;
            for (let affectedBlock of state.affectedBlocks) {
                neighbours = {
                    up: affectedBlock.above(),
                    down: affectedBlock.below(),
                    north: affectedBlock.north(),
                    south: affectedBlock.south(),
                    east: affectedBlock.east(),
                    west: affectedBlock.west()
                }
                let blockNeighbours = [];

                for (let [key, value] of Object.entries(neighbours)) {
                    if (value.typeId != "minecraft:air" && affectedBlock.typeId == "minecraft:air")
                        blockNeighbours.push(value.typeId);
                    else continue;
                }
                affectedBlock.setType(helper.mode(blockNeighbours));
            }
            state.affectedBlocks = [];
        }
    });
}

export function smooth({
    brushVolume: brushVolume,
    minVertex: minVertex,
    targetBlock: targetBlock,
    targetPosition: targetPosition,
    shape: shape
}) {
    helper.shapes[shape]({
        brushVolume: brushVolume,
        minVertex: minVertex,
        targetBlock: targetBlock,
        targetPosition: targetPosition,
        process: (minVertex, i, k, j, state) => {
            let checkedBlock;
            checkedBlock = minVertex.offset({
                x: i,
                y: k,
                z: j
            });

            let blockNeighbours = 0;

            let neighbours = {
                up: checkedBlock.above(),
                down: checkedBlock.below(),
                north: checkedBlock.north(),
                south: checkedBlock.south(),
                east: checkedBlock.east(),
                west: checkedBlock.west()
            }


            for (let [key, value] of Object.entries(neighbours)) {
                if ((value.typeId != "minecraft:air" && checkedBlock.typeId == "minecraft:air") || (value.typeId == "minecraft:air" && checkedBlock.typeId != "minecraft:air"))
                    blockNeighbours++;
                else continue;
            }

            if (blockNeighbours > 3) {
                state.affectedBlocks.push(checkedBlock);
            }
        },
        outSideProcess: (minVertex, state) => {
            let neighbours;
            for (let affectedBlock of state.affectedBlocks) {
                neighbours = {
                    up: affectedBlock.above(),
                    down: affectedBlock.below(),
                    north: affectedBlock.north(),
                    south: affectedBlock.south(),
                    east: affectedBlock.east(),
                    west: affectedBlock.west()
                }
                let blockNeighbours = [];

                for (let [key, value] of Object.entries(neighbours)) {
                    if (value.typeId != "minecraft:air" && affectedBlock.typeId == "minecraft:air")
                        blockNeighbours.push(value.typeId);
                    else continue;
                }
                if (affectedBlock.typeId == "minecraft:air")
                    affectedBlock.setType(helper.mode(blockNeighbours));
                else if (affectedBlock.typeId != "minecraft:air")
                    affectedBlock.setType("minecraft:air");
            }
            state.affectedBlocks = [];
        }
    });
}
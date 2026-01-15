import * as helper from "../helper.js";

export function overlay({
    brushVolume,
    minVertex,
    targetBlock,
    targetPosition,
    shape,
    depth,
    placedBlock
}) {
    const limit = Math.round((shape === "sphere") ? brushVolume.width : brushVolume.height / 2);

    helper.shapes[shape]({
        brushVolume,
        minVertex,
        targetBlock,
        targetPosition,
        process: (minVertex, i, k, j, state) => {
            if (k > limit) return;

            let checkedBlock;

            checkedBlock = minVertex.offset({
                x: i,
                y: k,
                z: j
            });

            if (checkedBlock.typeId !== "minecraft:air") return;

            for (let l = 1; l <= depth; l++) {
                const below = checkedBlock.offset({ x: 0, y: -l, z: 0 });

                if (below.typeId === "minecraft:air") continue

                state.affectedBlocks.push(below);
            }
        },
        outSideProcess: (minVertex, state) => {
            for (let affectedBlock of state.affectedBlocks) {
                affectedBlock.setType(placedBlock);
            }
            state.affectedBlocks = [];
        }
    });
}
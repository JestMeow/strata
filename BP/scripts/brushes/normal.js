
import * as helper from "../helper.js";

function cuboid({ minVertex, brushVolume, targetBlock, placedBlock }) {
    helper.shapes.cuboid({
        brushVolume: brushVolume,
        minVertex: minVertex,
        targetBlock: targetBlock,
        process: (minVertex, i, k, j) => {
            minVertex.offset({
                x: i,
                y: k,
                z: j
            }).setType(placedBlock);
        }
    });
}

function sphere({ minVertex, brushVolume, targetBlock, targetPosition, placedBlock }) {
    helper.shapes.sphere({
        brushVolume: brushVolume,
        minVertex: minVertex,
        targetBlock: targetBlock,
        targetPosition: targetPosition,
        process: (minVertex, i, k, j) => {
            minVertex.offset({
                x: i,
                y: k,
                z: j
            }).setType(placedBlock);
        }
    });
}

function cylinder({ minVertex, brushVolume, targetBlock, targetPosition, placedBlock }) {
    helper.shapes.cylinder({
        brushVolume: brushVolume,
        minVertex: minVertex,
        targetBlock: targetBlock,
        targetPosition: targetPosition,
        process: (minVertex, i, k, j) => {
            minVertex.offset({
                x: i,
                y: k,
                z: j
            }).setType(placedBlock);
        }
    });
}

export function normalBrush({
    player,
    tag,
    minVertex,
    brushVolume,
    targetBlock,
    targetPosition,
    placedBlock
}) {
    if (player.hasTag(tag.cuboid))
        cuboid({ minVertex, brushVolume, targetBlock, placedBlock });
    if (player.hasTag(tag.sphere))
        sphere({ minVertex, brushVolume, targetBlock, targetPosition, placedBlock });
    if (player.hasTag(tag.cylinder))
        cylinder({ minVertex, brushVolume, targetBlock, targetPosition, placedBlock });
}
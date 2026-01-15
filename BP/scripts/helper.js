import { world, system } from "@minecraft/server";
import * as config from "./config/config.js";

export let shapes = {
    cuboid: ({
        brushVolume,
        minVertex,
        targetBlock,
        process,
        outSideProcess
    }) => {
        minVertex = targetBlock.offset({
            x: -Math.floor(brushVolume.width / 2),
            y: -Math.floor(brushVolume.height / 2),
            z: -Math.floor(brushVolume.width / 2)
        });

        let state = {
            affectedBlocks: []
        };

        let width = brushVolume.width, height = brushVolume.height;

        for (let i = 0; i < width; i++) {
            for (let j = 0; j < width; j++) {
                for (let k = 0; k < height; k++) {
                    process(minVertex, i, k, j, state);
                }
            }
        }
        outSideProcess?.(minVertex, state)
    },
    sphere: ({
        brushVolume,
        minVertex,
        targetBlock,
        targetPosition,
        process,
        outSideProcess
    }) => {
        let radius = brushVolume.width;

        minVertex = targetBlock.offset({
            x: -Math.round(radius),
            y: -Math.round(radius),
            z: -Math.round(radius)
        });

        let state = {
            affectedBlocks: []
        };
        let minPosition = {
            x: targetPosition.x - Math.round(radius),
            y: targetPosition.y - Math.round(radius),
            z: targetPosition.z - Math.round(radius)
        };

        if (config.config.optimize == false) {
            for (let k = 0; k <= 2 * radius; k++) {
                let radiusL2 = (2 * radius - k) * k;
                let radiusL = Math.floor(Math.sqrt(radiusL2));

                for (let j = 0; j <= 2 * radiusL; j++) {
                    for (let i = 0; i <= 2 * radiusL; i++) {
                        let offsetx = radius - radiusL + i, offsety = k, offsetz = radius - radiusL + j;

                        if ((targetPosition.x - (minVertex.x + offsetx)) * (targetPosition.x - (minVertex.x + offsetx)) + (targetPosition.z - (minVertex.z + offsetz)) * (targetPosition.z - (minVertex.z + offsetz)) > radiusL2) continue;
                        process(minVertex, offsetx, offsety, offsetz, state);
                    }
                }
            }
        }
        else if (config.config.optimize === true) {
            let k = 0;
            let tim = system.runInterval(() => {
                if (k > 2 * radius) system.clearRun(tim);

                let radiusL2 = (2 * radius - k) * k;
                let radiusL = Math.floor(Math.sqrt(radiusL2));

                for (let j = 0; j <= 2 * radiusL; j++) {
                    for (let i = 0; i <= 2 * radiusL; i++) {
                        let offsetx = radius - radiusL + i, offsety = k, offsetz = radius - radiusL + j;

                        if ((targetPosition.x - (minVertex.x + offsetx)) * (targetPosition.x - (minVertex.x + offsetx)) + (targetPosition.z - (minVertex.z + offsetz)) * (targetPosition.z - (minVertex.z + offsetz)) > radiusL2) continue;
                        process(minVertex, offsetx, offsety, offsetz, state);
                    }
                }

                k++;
            }, 1);
        }


        outSideProcess?.(minVertex, state)
    },
    cylinder: ({
        brushVolume,
        minVertex,
        targetBlock,
        targetPosition,
        process,
        outSideProcess
    }) => {
        let radius = brushVolume.width;

        minVertex = targetBlock.offset({
            x: -Math.round(radius),
            y: -Math.round(brushVolume.height / 2),
            z: -Math.round(radius)
        });

        let state = {
            affectedBlocks: []
        };


        for (let k = 0; k <= brushVolume.height; k++) {
            for (let j = 0; j <= 2 * radius; j++) {
                let radiusL2 = (2 * radius - j) * j;
                let radiusL = Math.floor(Math.sqrt(radiusL2));
                for (let i = 0; i <= 2 * radiusL; i++) {
                    let offsetx = radius - radiusL + i, offsety = k, offsetz = j;
                    process(minVertex, offsetx, offsety, offsetz, state);
                }
            }
        }
        
        outSideProcess?.(minVertex, state)
    }
}

export function mode(array) {
    if (array.length == 0)
        return null;
    var modeMap = {};
    var maxEl = array[0], maxCount = 1;
    for (var i = 0; i < array.length; i++) {
        var el = array[i];
        if (modeMap[el] == null)
            modeMap[el] = 1;
        else
            modeMap[el]++;
        if (modeMap[el] > maxCount) {
            maxEl = el;
            maxCount = modeMap[el];
        }
    }
    return maxEl;
}

import { system, world } from "@minecraft/server";

import * as config from "./config/config.js";

import * as normalBrush from "./brushes/normal.js";
import * as erosionBrush from "./brushes/erosion.js";
import * as overlayBrush from "./brushes/overlay.js";

//temporary
import * as helper from "./helper.js";

console.warn("Working");

let overworld;
let players;

function createScoreboardObj(name) {
    if (!world.scoreboard.getObjective(name))
        world.scoreboard.addObjective(name);
}

system.runInterval(() => {
    config.testTag();
}, 8);

const brush = {
    shape: {
        cuboid: "__brush.shape=cuboid",
        sphere: "__brush.shape=sphere",
        cylinder: "__brush.shape=cylinder"
    },
    size: {
        width: "__brush.size.width",
        height: "__brush.size.height"
    },
    mode: {
        normal: "__brush.mode.normal",
        erosion: {
            melt: "__brush.mode.erosion.melt",
            fill: "__brush.mode.erosion.fill",
            lift: "__brush.mode.erosion.lift",
            smooth: "__brush.mode.erosion.smooth"
        },
        overlay: "__brush.mode.overlay"
    },
    slot: "__brush.slot"
};

system.run(() => {
    overworld = world.getDimension("overworld");
    players = overworld.getPlayers();

    createScoreboardObj(brush.size.width);
    createScoreboardObj(brush.size.height);

    createScoreboardObj(brush.mode.overlay);

    createScoreboardObj(brush.slot);
});

const tools = {
    brush: "Brushy",
    inverseBrush: "Gunpowdery"
}

const prefix = ">";

// Brush Functions
world.beforeEvents.itemUse.subscribe((eventData) => {
    const item = eventData.itemStack;
    const player = eventData.source;
    if (!item) return;

    if ((eventData.itemStack.typeId == "minecraft:brush" || eventData.itemStack.typeId == "minecraft:feather" || eventData.itemStack.typeId == "minecraft:gunpowder") && item.nameTag == tools.brush || item.nameTag == tools.inverseBrush) {
        let inventory = player.getComponent("minecraft:inventory");

        let brushSlot = world.scoreboard.getObjective(brush.slot).getScore(player);

        let placedBlock = inventory.container.getItem(brushSlot);

        if (placedBlock)
            placedBlock = placedBlock.typeId;
        else
            placedBlock = "minecraft:stone";



        let block = eventData.source.getBlockFromViewDirection().block;
        let viewDirection = {
            x: 0,
            y: 0,
            z: 0
        };

        let face = eventData.source.getBlockFromViewDirection().face;

        if (face == "West") viewDirection.x = -1;
        else if (face == "East") viewDirection.x = 1;

        if (face == "Down") viewDirection.y = -1;
        else if (face == "Up") viewDirection.y = 1;

        if (face == "North") viewDirection.z = -1;
        else if (face == "South") viewDirection.z = 1;



        // Brush
        let targetBlock = block.offset({
            x: viewDirection.x,
            y: viewDirection.y,
            z: viewDirection.z
        });

        let targetPosition = {
            x: block.offset({ x: viewDirection.x, y: viewDirection.y, z: viewDirection.z }).x,
            y: block.offset({ x: viewDirection.x, y: viewDirection.y, z: viewDirection.z }).y,
            z: block.offset({ x: viewDirection.x, y: viewDirection.y, z: viewDirection.z }).z
        };

        let brushVolume = {
            width: world.scoreboard.getObjective(brush.size.width).getScore(player),
            height: world.scoreboard.getObjective(brush.size.height).getScore(player)
        };

        let minVertex;

        let depth = world.scoreboard.getObjective(brush.mode.overlay).getScore(player);

        let shape;

        if (player.hasTag(brush.shape.cuboid))
            shape = "cuboid";
        else if (player.hasTag(brush.shape.sphere))
            shape = "sphere";
        else if (player.hasTag(brush.shape.cylinder))
            shape = "cylinder";

        if ((eventData.itemStack.typeId == "minecraft:brush" || eventData.itemStack.typeId == "minecraft:feather") && eventData.itemStack.nameTag == tools.brush) {
            system.run(() => {
                // Normal
                if (player.hasTag(brush.mode.normal)) {
                    targetBlock = block;

                    targetPosition = {
                        x: block.x,
                        y: block.y,
                        z: block.z
                    };
                }

                if (player.hasTag(brush.mode.erosion.melt)) {
                    erosionBrush.melt({
                        brushVolume: brushVolume,
                        minVertex: minVertex,
                        targetBlock: targetBlock,
                        targetPosition: targetPosition,
                        shape: shape
                    });
                }
                if (player.hasTag(brush.mode.erosion.fill)) {
                    erosionBrush.fill({
                        brushVolume: brushVolume,
                        minVertex: minVertex,
                        targetBlock: targetBlock,
                        targetPosition: targetPosition,
                        shape: shape
                    });
                }
                if (player.hasTag(brush.mode.erosion.smooth)) {
                    erosionBrush.smooth({
                        brushVolume: brushVolume,
                        minVertex: minVertex,
                        targetBlock: targetBlock,
                        targetPosition: targetPosition,
                        shape: shape
                    });
                }

                if (player.hasTag(brush.mode.overlay)) {
                    overlayBrush.overlay({
                        brushVolume,
                        minVertex,
                        targetBlock,
                        targetPosition,
                        shape,
                        depth,
                        placedBlock
                    });
                }
            });
        }

        // Inverse Brush
        if (eventData.itemStack.typeId == "minecraft:gunpowder" && eventData.itemStack.nameTag == tools.inverseBrush) {
            system.run(() => {
                if (player.hasTag(brush.mode.erosion.melt)) {
                    erosionBrush.fill({
                        brushVolume: brushVolume,
                        minVertex: minVertex,
                        targetBlock: targetBlock,
                        targetPosition: targetPosition,
                        shape: shape
                    });
                }
                if (player.hasTag(brush.mode.erosion.fill)) {
                    erosionBrush.melt({
                        brushVolume: brushVolume,
                        minVertex: minVertex,
                        targetBlock: targetBlock,
                        targetPosition: targetPosition,
                        shape: shape
                    });
                }
                if (player.hasTag(brush.mode.erosion.smooth)) {
                    erosionBrush.smooth({
                        brushVolume: brushVolume,
                        minVertex: minVertex,
                        targetBlock: targetBlock,
                        targetPosition: targetPosition,
                        shape: shape
                    });
                }

                if (player.hasTag(brush.mode.overlay)) {
                    overlayBrush.overlay({
                        brushVolume,
                        minVertex,
                        targetBlock,
                        targetPosition,
                        shape,
                        depth,
                        placedBlock
                    });
                }
            });
        }
        system.run(() => {
            //Normal
            if (player.hasTag(brush.mode.normal)) {
                normalBrush.normalBrush({
                    player: player,
                    tag: brush.shape,
                    minVertex: minVertex,
                    brushVolume: brushVolume,
                    targetBlock: targetBlock,
                    targetPosition: targetPosition,
                    placedBlock: placedBlock
                });
            }
        });
    }
});

function matchCommand(cmd, sender) {
    if (cmd[0] == "test") {
        world.sendMessage(sender.nameTag)
    }
    if (cmd[0] == "config" || "c") {
        system.run(() => {
            switch (cmd[2]) {
                case "t":
                case "true":
                    if (config.config[cmd[1]] != undefined) {
                        sender.addTag(config.configTag[cmd[1]]);
                        world.sendMessage(`Strata-config: ${cmd[1]} -> True`);
                    }
                    break;
                case "f":
                case "false":
                    if (config.config[cmd[1]] != undefined) {
                        sender.removeTag(config.configTag[cmd[1]]);
                        world.sendMessage(`Strata-config: ${cmd[1]} -> False`);
                    }
                    break;
            }
        });

    }
    if (cmd[0] == "brush" || cmd[0] == "b") {
        system.run(() => {
            switch (cmd[1]) {
                case "sh":
                case "shape": {
                    for (const [key, value] of Object.entries(brush.shape)) {
                        if (sender.hasTag(value))
                            sender.removeTag(value);
                    }

                    let brushShapeName;

                    switch (cmd[2]) {
                        case "cuboid":
                            sender.addTag(brush.shape.cuboid);
                            brushShapeName = "cuboid";
                            break;
                        case "b":
                        case "ball":
                        case "sphere":
                            sender.addTag(brush.shape.sphere);
                            brushShapeName = "sphere";
                            break;
                        case "d":
                        case "disk":
                        case "cyl":
                        case "cylinder":
                            sender.addTag(brush.shape.cylinder);
                            brushShapeName = "cylinder";
                            break;
                    }
                    sender.runCommand(`tellraw @s {"rawtext":[{"text":"Updated brush shape to ${brushShapeName}."}]}`);
                    break;
                }
                case "sz":
                case "size": {
                    if (Number.isFinite(Number(cmd[2])) && Number.isFinite(Number(cmd[3]))) {
                        let width = Number(cmd[2]), height = Number(cmd[3]);
                        world.scoreboard.getObjective(brush.size.width).setScore(sender, width);
                        world.scoreboard.getObjective(brush.size.height).setScore(sender, height);


                        world.sendMessage(`It works. Width ${cmd[2]}, height ${cmd[3]}`);
                    }
                    break;
                }
                case "m":
                case "mode": {
                    for (const [key, value] of Object.entries(brush.mode)) {
                        if (key == "erosion")
                            for (const [key, value] of Object.entries(brush.mode.erosion)) {
                                if (sender.hasTag(value))
                                    sender.removeTag(value);
                            }
                        else if (sender.hasTag(value))
                            sender.removeTag(value);
                    }

                    let brushModeName;

                    switch (cmd[2]) {
                        case "n":
                        case "normal":
                            sender.addTag(brush.mode.normal);
                            brushModeName = "normal";
                            break;
                        case "e":
                        case "erosion": {
                            for (const [key, value] of Object.entries(brush.mode.erosion)) {
                                if (sender.hasTag(value))
                                    sender.removeTag(value);
                            }
                            switch (cmd[3]) {
                                case "melt":
                                    sender.addTag(brush.mode.erosion.melt);
                                    brushModeName = "melt";
                                    break;
                                case "fill":
                                    sender.addTag(brush.mode.erosion.fill);
                                    brushModeName = "fill";
                                    break;
                                case "lift":
                                    sender.addTag(brush.mode.erosion.lift);
                                    brushModeName = "lift";
                                    break;
                                case "smooth":
                                    sender.addTag(brush.mode.erosion.smooth);
                                    brushModeName = "smooth";
                                    break;
                            }

                            break;
                        }
                        case "o":
                        case "overlay": {
                            if (Number.isInteger(Number(cmd[3]))) {
                                sender.addTag(brush.mode.overlay);
                                world.scoreboard.getObjective(brush.mode.overlay).setScore(sender, Number(cmd[3]));
                                brushModeName = `overlay with depth ${cmd[3]}`;
                            }
                            break;
                        }
                    }
                    sender.runCommand(`tellraw @s {"rawtext":[{"text":"Updated brush shape to ${brushModeName}."}]}`);
                    break;
                }
                case "slot":
                    if (Number.isInteger(Number(cmd[2]))) {
                        world.scoreboard.getObjective(brush.slot).setScore(sender, Number(cmd[2]));
                        sender.runCommand(`tellraw @s {"rawtext":[{"text":"Updated brush slot to ${cmd[2]}."}]}`);
                    }
                    break;
            }
        });
    }
}

world.beforeEvents.chatSend.subscribe((eventData) => {
    if (eventData.message.substr(0, 1) == prefix) {
        eventData.cancel = true;
        matchCommand(eventData.message.substr(1, eventData.message.length).split(" "), eventData.sender);
    }
});
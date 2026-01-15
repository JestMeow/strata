
import { world, system } from "@minecraft/server";

export const configTag = {
    optimize: "__config:optimize"
}

export const config = {
    optimize: false
}

const configTagValues = Object.values(configTag);

export function testTag() {
    configTagValues.forEach(tag => {
        const playersWithTag = world.getPlayers().filter(player => player.hasTag(tag));

        if (playersWithTag.length === 1) {
            const key = Object.keys(configTag).find(k => configTag[k] === tag);
            if (key) config[key] = true;

        } else if (playersWithTag.length > 1) {
            console.warn(`More than one player has tag ${tag}. Removing it from all.`);
            playersWithTag.forEach(player => player.removeTag(tag));

            const key = Object.keys(configTag).find(k => configTag[k] === tag);
            if (key) config[key] = false;
        } else {
            const key = Object.keys(configTag).find(k => configTag[k] === tag);
            if (key) config[key] = false;
        }
    });

}
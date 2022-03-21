const ModifierType = {
    UNDEFINED: -1,
    CIRCUMSTANCE: 0,
    NATURAL: 1,
    TRAINING: 2,
    EQUIPMENT: 3,
    MAGICAL: 4,
    DIVINE: 5,
    LUCK: 6
}
Object.freeze(ModifierType);

const modifier = function() {
    return {
        type: -1,
        stat: -1,
        mod: 0
    }
}
const wound = require("./Wound.js");
const armourData = require("../reference/armour.json");

const ArmourType = {
    NONE: 0,
    CLOTH: 1,
    HIDE: 2,
    MAILLE: 3,
    PLATE: 4
};
Object.freeze(ArmourType);

const Armour = function (armourName = "None", armourType = ArmourType.NONE, armourDR = 0, armourHP = 0, 
                    skillPenalty = 0, armourWeight = 0, coverage = []) {
    this.uniqueName = "";
    this.name = armourName;
    this.type = armourType;
    this.DR = armourDR;
    this.maxHP = armourHP;
    this.currentHP = armourHP;
    this.skillMod = skillPenalty;
    this.weight = armourWeight;
    this.covers = coverage;                           //  Uses _HITLOCATIONS enum from Wound

    if (this.DR == 0) {
        switch (this.type) {
            case ArmourType.NONE:
                this.DR = 0;
                break;
            case ArmourType.CLOTH:
                this.DR = 1;
                break;
            case ArmourType.HIDE:
                this.DR = 2;
                break;
            case ArmourType.MAILLE:
                this.DR = 4;
                break;
            case ArmourType.PLATE:
                this.DR = 8;
                break;
            default:
        };
    };
    if (this.skillMod == 0) {
        switch (this.type) {
            case ArmourType.NONE:
                this.skillMod = 0;
                break;
            case ArmourType.CLOTH:
                this.skillMod = 0;
                break;
            case ArmourType.HIDE:
                this.skillMod = 5;
                break;
            case ArmourType.MAILLE:
                this.skillMod = 15;
                break;
            case ArmourType.PLATE:
                this.skillMod = 25;
                break;
            default:
        };        
    };
    if (this.weight == 0) {
        switch (this.type) {
            case ArmourType.NONE:
                this.weight = 0;
                break;
            case ArmourType.CLOTH:
                this.weight = 2;
                break;
            case ArmourType.HIDE:
                this.weight = 5;
                break;
            case ArmourType.MAILLE:
                this.weight = 15;
                break;
            case ArmourType.PLATE:
                this.weight = 25;
                break;
            default:
        };        
    }
};


Armour.prototype.loadFromFile = function(armourName, armourType = armourType.CLOTH) {
    let armourReturn = null;
    let statName = armourName.toLowerCase();
    statName = statName.replace(/ /g, "");
    let typeName = "";
    switch (armourType) {
        case ArmourType.CLOTH:
            typeName = "cloth";
            break;
        case ArmourType.HIDE:
            typeName = "hide";
            break;
        case ArmourType.MAILLE:
            typeName = "maille";
            break;
        case ArmourType.PLATE:
            typeName = "plate";
            break;
        default:
    };

    let stats = armourData[typeName][statName];
    if (!stats) {
        return null;
    };

    this.name = stats.name;
    this.type = armourType;
    this.DR = stats.dr;
    this.maxHP = stats.hp;
    this.currentHP = stats.hp;
    this.skillMod = stats.skillMod;
    this.weight = stats.weight;
    this.covers = stats.coverage;
};


module.exports = { Armour, ArmourType };

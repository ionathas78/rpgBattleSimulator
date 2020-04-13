const shieldData = require("../reference/shields.json");

const ShieldType = {
    NONE: 0,
    BUCKLER: 1,
    SMALL: 2,
    LARGE: 3,
};
Object.freeze(ShieldType);

const Shield = function(shieldName = "None", shieldType = ShieldType.NONE, shieldBonus = 0, shieldDamage = 0, 
                    shieldHP = 0, shieldWeight = 0) {
    this.uniqueName;
    this.name = shieldName;
    this.type = shieldType;
    this.bonus = shieldBonus;
    this.damage = shieldDamage;
    this.maxHP = shieldHP;
    this.currentHP = shieldHP;
    this.weight = shieldWeight;

    this.isBroken = () => this.currentHP <= 0;
    this.isDestroyed = () => this.currentHP <= this.maxHP * -1;

    if (this.bonus == 0) {
        switch (this.type) {
            case ShieldType.NONE:
                this.bonus = 0;
                break;
            case ShieldType.BUCKLER:
                this.bonus = 5;
                break;
            case ShieldType.SMALL:
                this.bonus = 15;
                break;
            case ShieldType.LARGE:
                this.bonus = 25;
                break;
            default:
                this.bonus = 0;
        };
    };

    if (this.maxHP == 0) {
        switch (this.type) {
            case ShieldType.NONE:
                this.maxHP = 0;
                this.currentHP = 0
                break;
            case ShieldType.BUCKLER:
                this.maxHP = 10;
                this.currentHP = 10;
                break;
            case ShieldType.SMALL:
                this.maxHP = 20;
                this.currentHP = 20;
                break;
            case ShieldType.LARGE:
                this.maxHP = 40;
                this.currentHP = 40;
                break;
            default:
                this.bonus = 0;
        };
    };
    
    if (this.weight == 0) {
        switch (this.type) {
            case ShieldType.NONE:
                this.weight = 0;
                break;
            case ShieldType.BUCKLER:
                this.weight = 1;
                break;
            case ShieldType.SMALL:
                this.weight = 4;
                break;
            case ShieldType.LARGE:
                this.weight = 8;
                break;
            default:
                this.weight = 0;
        };
    };
};

Shield.prototype.takeDamage = function(damage) {
    this.currentHP -= damage;
};

Shield.prototype.loadFromFile = function(shieldName, shieldType = ShieldType.BUCKLER) {
    let shieldReturn = null;
    let statName = shieldName.toLowerCase();
    statName = statName.replace(/ /g, "");
    let typeName = "";
    switch (shieldType) {
        case ShieldType.BUCKLER:
            typeName = "buckler";
            break;
        case ShieldType.SMALL:
            typeName = "small";
            break;
        case ShieldType.LARGE:
            typeName = "large";
            break;
        default:
    };

    let stats = shieldData[typeName][statName];
    if (!stats) {
        return null;
    };

    this.name = stats.name;
    this.type = shieldType;
    this.bonus = stats.bonus;
    this.damage = stats.damage;
    this.maxHP = stats.hp;
    this.currentHP = stats.hp;
    this.weight = stats.weight;
};

function returnShieldType(type) {
    let returnValue = ShieldType.NONE;

    switch (type) {
        case "none":
            returnValue = ShieldType.NONE;
            break;
        case "buckler":
            returnValue = ShieldType.BUCKLER;
            break;
        case "small":
            returnValue = ShieldType.SMALL;
            break;
        case "large":
            returnValue = ShieldType.LARGE;
            break;
        default:           
    };
    return returnValue;
};

module.exports = { Shield, ShieldType };
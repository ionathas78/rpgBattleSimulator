const woundz = require("./Wound.js");

const WoundList = function() {
    this.wounds = [];

    this.isWounded = () => this.wounds.length > 0;

    this.totalWounds = () => {
        let returnValue = 0;
        this.wounds.forEach(element => returnValue += element.damage);
        return returnValue;
    };

    this.totalHPMod = () => {
        let returnValue = 0;
        this.wounds.forEach(element => returnValue += element.hpMod);
        return returnValue;
    };

    this.totalWoundMod = () => {
        let totalPenalty = 0;
        this.wounds.forEach(element => totalPenalty += element.damage + element.woundMod);
        return totalPenalty;
    };
};

WoundList.prototype.addWound = function (hitLocation = "", damage = 0, dmgType = woundz.DamageType.UNDEFINED, desc = "",
woundType = "", woundModifier = 0, recoveryModifier = 0, hpModifier = 0) {
    this.wounds.push(new woundz.Wound(hitLocation, damage, dmgType, desc, woundType, woundModifier, recoveryModifier, hpModifier))
};

WoundList.prototype.addRandomWound = function(damage, dmgType = woundz.DamageType.UNDEFINED) {
    let newWound = new woundz.Wound();
    newWound.randomWound(damage, dmgType);
    this.wounds.push(newWound);
    return newWound;
}

WoundList.prototype.heal = function (days = 1) {
    this.wounds.forEach(element => element.heal(days));   
};

WoundList.prototype.toString = () => {
    let returnString = "";
    if (this.wounds) {
        this.wounds.forEach(element => {
            if (returnString != "") {
                returnString += ", ";
            };
            returnString += element.description;
        });
    };
    return returnString;
};

module.exports = { WoundList };

const woundz = require("./Wound.js");
const weaponData = require("../reference/weapons.json");

const WeaponType = {
    UNARMED: 0,
    MELEE: 1,
    RANGED: 2
};
Object.freeze(WeaponType);

const WeaponSpecialty = {
    BRAWL: 0,
    AXE: 1,
    BOW: 2,
    CLUB: 3,
    CROSSBOW: 4,
    DAGGER: 5,
    FLAIL: 6,
    HAMMER: 7,
    MACE: 8,
    POLEARM: 9,
    SLING: 10,
    SPEAR: 11,
    STAFF: 12,
    SWORD: 13,
    THROW: 14,
    THROWINGAXE: 15,
    THROWINGDAGGER: 16
};
Object.freeze(WeaponSpecialty);

const FirearmSpecialty = {
    NONE: 0,
    PISTOL: 1,
    LASERPISTOL: 2,
    RIFLE: 3,
    LASERRIFLE: 4
};
Object.freeze(FirearmSpecialty);

const WeaponStrMod = {
    NONE: 0,
    HALF: 1,
    FULL: 2
};
Object.freeze(WeaponStrMod);

const Weapon = function (weaponName = "Unarmed", weaponType = WeaponType.UNARMED, skillModifier = 0,
            weaponDmg = 3, dmgMod = 0, dmgType = woundz.DamageType.UNDEFINED, armorPiercing = 0,
            weaponHands = 1, weaponWeight = 0, weaponHP = 0, strengthModifier = WeaponStrMod.FULL, 
            weaponSpec = WeaponSpecialty.BRAWL) {
    this.uniqueName = "";
    this.name = weaponName;
    this.type = weaponType;
    this.attackMod = skillModifier;
    this.damage = weaponDmg;
    this.damageMod = dmgMod;
    this.AP = armorPiercing;
    this.damageType = dmgType;
    this.hands = weaponHands;
    this.maxHP = weaponHP;
    this.currentHP = weaponHP;
    this.range = 0;
    this.weight = weaponWeight;
    this.usesStrengthMod = strengthModifier;
    this.specialty = weaponSpec;

    if (this.damage == 0) {
        switch (this.type) {
            case WeaponType.UNARMED:
                this.damage = 3;
                break;
            case WeaponType.MELEE:
                this.damage = 6;
                break;
            case WeaponType.RANGED:
                this.damage = 8;
                break;
            default:
                this.damage = 3;
        };
    };
};

/**
 * Rolls damage for the weapon
 * @param {Number} strModifier Full strength modifier. Function will apply modifications as appropriate. Default is 0.
 * @param {Number} woundModifier Full wound modifier. Function will apply modifications as appropriate. Default is 0.
 * @param {Boolean} isCritical Indicates a critical success. FALSE by default.
 */
Weapon.prototype.rollDamage = function(strModifier = 0, woundModifier = 0, isCritical = false) {
    let damageRoll = Math.floor(Math.random() * this.damage) + 1 + this.damageMod;
    let woundDamageMod = Math.abs(Math.floor(woundModifier / 5));
    let strDamageMod = strModifier;
    if (this.usesStrengthMod == WeaponStrMod.HALF) {
        strDamageMod = Math.floor(strDamageMod / 2);
    } else if (this.usesStrengthMod == WeaponStrMod.NONE) {
        strDamageMod = 0;
    }

    damageRoll -= woundDamageMod;
    damageRoll += strDamageMod;

    if (isCritical) {
        damageRoll += this.damage;
    };

    return damageRoll;
};

Weapon.prototype.loadFromFile = function(weaponName, weaponType = WeaponType.MELEE) {
    let statName = weaponName.toLowerCase();
    statName = statName.replace(/ /g, "");
    let typeName = "";
    switch (weaponType) {
        case WeaponType.MELEE:
            typeName = "meleeweapons";
            break;
        case WeaponType.RANGED:
            typeName = "rangedweapons";
            break;
        default:
    };

    let stats = weaponData[typeName][statName];
    if (!stats) {
        return null;
    };

    this.name = stats.name;
    this.type = weaponType;
    this.attackMod = stats.attackMod;
    this.damage = stats.damage;
    this.damageMod = stats.damageMod;
    this.damageType = stats.damageType;
    this.armorPiercing = stats.ap;
    this.hands = stats.hands;
    this.weight = stats.weight;
    this.maxHP = stats.hp;
    this.currentHP = stats.hp;
    this.usesStrengthMod = stats.usesStrMod;
    this.specialty = stats.weaponSpecialty;
};


module.exports = { Weapon, WeaponType, WeaponStrMod, WeaponSpecialty, FirearmSpecialty };

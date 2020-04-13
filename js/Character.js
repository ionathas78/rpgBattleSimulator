const armours = require("./Armour.js");
const diceBags = require("./DiceBag.js");
const shields = require("./Shield.js");
const weapons = require("./Weapon.js");
const woundz = require("./Wound.js");
const woundLists = require("./WoundList.js");
const pronounz = require("./Pronouns.js");
const characterData = require("../reference/character.json");

const JobType = {
    UNDETERMINED: 0,
    SQUIRE: 1,
    CHEMIST: 2
};
Object.freeze(JobType);

const SkillResult = {
    FAILURE: 0,
    PARTIALSUCCESS: 1,
    SUCCESS: 2,
    CRITICAL: 3
};
Object.freeze(SkillResult);

const _IS_ROLLOVER = false;

let myDiceBag = diceBags.DiceBag;

const Character = function (characterName = "", characterJobClass = JobType.SQUIRE, characterAge = 15, 
                strengthScore = 11, sizeScore = 11, dexterityScore = 11, constitutionScore = 11, 
                meleeSkill = 30, rangedSkill = 30, dodgeSkill = 30, parrySkill = 30,
                hitPoints = 15, weaponChoice = new weapons.Weapon(), armourChoice = new armours.Armour(), shieldChoice = new shields.Shield()) {
    this.name = characterName;
    this.job = characterJobClass;
    this.age = characterAge;
    this.pronouns = new pronounz.Pronouns();

    this.strength = strengthScore;
    this.size = sizeScore;
    this.dexterity = dexterityScore;
    this.constitution = constitutionScore;

    this.melee = meleeSkill;
    this.ranged = rangedSkill;
    this.dodge = dodgeSkill;
    this.parry = parrySkill;

    this.maxHP = hitPoints;
    this.currentHP = hitPoints;

    this.wounds = new woundLists.WoundList();
    this.turnsStunned = 0;

    this.weapon = null;
    this.armour = null;
    this.shield = null;

    if (weaponChoice) {
        this.weapon = weaponChoice;
    } else {
        this.weapon = new weapons.Weapon();
    };

    if (armourChoice) {
        this.armour = armourChoice;
    } else {
        this.armour = new armours.Armour();
    };

    if (shieldChoice) {
        this.shield = shieldChoice;
    } else {
        this.shield = new shields.Shield()
    }

    this.isAlive = () => this.wounds.totalWounds() < this.constitution;
    this.isStunned = () => this.turnsStunned > 0;

    this.isDisabled = () => this.wounds.totalWounds() > this.constitution / 2;
    
    this.printStats = function() {
        let myTotalWounds = this.wounds.totalWounds();
        let woundsList = this.wounds.toString();

        let msgReport = 
        `
        Name: ${this.name} (${this.pronouns.subj}/${this.pronouns.obj}/${this.pronouns.possPron})
        Job: ${jobName(this.job)}
        Age: ${this.age}
        Strength: ${this.strength}
        Size: ${this.size}
        Dexterity: ${this.dexterity}
        Constitution: ${this.constitution}
        ---
        Melee Skill: ${this.melee}
        Ranged Skill: ${this.ranged}
        Dodge Skill: ${this.dodge}
        Parry Skill: ${this.parry}
        ---
        Gear:
          Weapon: ${this.weapon.name}
            Dam:  ${1 + this.weapon.damageMod} - ${this.weapon.damage + this.weapon.damageMod}
          Armour: ${this.armour.name}
            DR:   ${this.armour.DR}
        ---
        Health:
            Max HP: ${this.maxHP}
            Current HP: ${this.currentHP}
            Wounds: ${myTotalWounds}
              ${woundsList}
        `;
    
        console.log(msgReport);
    };
    this.printCondition = function() {
        let myTotalWounds = this.wounds.totalWounds();
        let woundsList = this.wounds.toString();

        let msgReport =
        `
        Name: ${this.name}
        Status: ${this.getStatus()}
        HP: ${this.currentHP} / ${this.maxHP}
        Wounds: ${myTotalWounds}
            ${woundsList}
        `
        console.log(msgReport);
    };
    this.strMod = function() {
        returnValue = 0;
        let strPlusSiz = this.strength + this.size;
        let damageValue = 0;
        let woundMod = Math.floor(this.wounds.totalWounds() / 5);

        if (strPlusSiz < 13) {
            damageValue = -1 * myDiceBag.rollDx(6);
        } else if (strPlusSiz < 17) {
            damageValue = -1 * myDiceBag.rollDx(4);
        } else if (strPlusSiz < 25) {
            damageValue = 0;
        } else if (strPlusSiz < 33) {
            damageValue = myDiceBag.rollDx(4);
        } else if (strPlusSiz < 41) {
            damageValue = myDiceBag.rollDx(6);
        } else {
            damageValue = myDiceBag.rollxDy(2, 6);
        };

        return returnValue - woundMod;
    };

    /**
     * Returns margin of success (or failure) on an ability check.
     * @param {Number} modifier Positive bonus or negative penalty to apply to the check. Default is 0.
     */
    this.strCheck = function(modifier = 0) {
        return myDiceBag.rollxDyForSuccesses(3, 6, this.strength, modifier, _IS_ROLLOVER);
    };

    /**
     * Returns margin of success (or failure) on an ability check.
     * @param {Number} modifier Positive bonus or negative penalty to apply to the check. Default is 0.
     */
    this.dexCheck = function(modifier = 0) {
        return myDiceBag.rollxDyForSuccesses(3, 6, this.dexterity, modifier, _IS_ROLLOVER);
    };

    /**
     * Returns margin of success (or failure) on an ability check.
     * @param {Number} modifier Positive bonus or negative penalty to apply to the check. Default is 0.
     */
    this.conCheck = function(modifier = 0) {
        return myDiceBag.rollxDyForSuccesses(3, 6, this.constitution, modifier, _IS_ROLLOVER);
    };

    /**
     * Returns success or failure value according to the SkillResult.x enumerated constants.
     * @param {Number} modifier Positive bonus or negative penalty to apply to the check. Default is 0.
     */
    this.attackRoll = function(attackWeapon, modifier = 0) {
        let attackResult = SkillResult.FAILURE;

        if (this.isStunned() || this.isDisabled()) {
            return SkillResult.FAILURE;
        };

        let woundModifier = this.wounds.totalWoundMod();
        let targetNumber = this.melee;
        let d100Roll = myDiceBag.rollD100();
        let criticalTarget = 0;
        
        if (attackWeapon.type == weapons.WeaponType.RANGED) {
            targetNumber = this.ranged;
        };
        targetNumber -= woundModifier;
        targetNumber += attackWeapon.attackMod;
        targetNumber += modifier;
        criticalTarget = targetNumber / 5;

        if (d100Roll <= criticalTarget) {
            attackResult = SkillResult.CRITICAL;
        } else if (d100Roll <= targetNumber) {
            attackResult = SkillResult.SUCCESS;
        };

        return attackResult;
    };

    /**
     * Returns success or failure value according to the SkillResult.x constant enum.
     * SkillResult.PARTIALSUCCESS means the shield took the hit.
     * @param {Number} attackType Attack code per the WeaponType. constant enum.
     * @param {Number} modifier Positive bonus or negative penalty to apply to the check. Default is 0.
     */
    this.defenseRoll = function(attackType = weapons.WeaponType.MELEE, modifier = 0) {
        let defenseResult = SkillResult.FAILURE;

        if (this.isDisabled()) {
            return SkillResult.FAILURE;
        };

        let woundModifier = this.wounds.totalWoundMod();
        let targetNumber = this.parry;
        let d100Roll = myDiceBag.rollD100();
        let criticalTarget = 0;
        
        if ((attackType == weapons.WeaponType.RANGED) || (this.dodge > this.parry)) {
            targetNumber = this.dodge;
        };
        targetNumber -= woundModifier;
        targetNumber += modifier;
        criticalTarget = targetNumber / 5;

        if (d100Roll <= criticalTarget) {
            defenseResult = SkillResult.CRITICAL;
        } else if (d100Roll <= targetNumber) {
            defenseResult = SkillResult.SUCCESS;
        };

        if (defenseResult == SkillResult.FAILURE) {
            let shieldedTargetNumber = targetNumber + this.shield.bonus;
            if (d100Roll <= shieldedTargetNumber) {
                defenseResult = SkillResult.PARTIALSUCCESS;
            };
        };

        return defenseResult;
    };
};

/**
 * Creates a random character
 * @param {Text} characterName Name to assign
 * @param {Number} characterJob Character's job class
 */
Character.prototype.makeCharacter = function(characterName = "", characterJob = JobType.UNDETERMINED) {
    if (characterName != "") {
        this.name = characterName;
    };
    if (characterJob != JobType.UNDETERMINED) {
        this.job = getJobType(characterJob);
    };

    this.age = 17 + myDiceBag.rollD10();
    this.strength = myDiceBag.rollxDyDropOne(4, 6);
    this.size = myDiceBag.rollxDyDropOne(4, 6);
    this.dexterity = myDiceBag.rollxDyDropOne(4, 6);
    this.constitution = myDiceBag.rollxDyDropOne(4, 6);

    if (this.job == JobType.SQUIRE) {
        if (this.strength < 12) {
            this.strength = 12;
        };
        if (this.constitution < 12) {
            this.constitution = 12;
        };
    } else {
        if (this.dexterity < 14) {
            this.dexterity = 14;
        };
    };

    this.melee = this.strength + this.dexterity;
    this.ranged = this.dexterity * 2;
    this.dodge = this.dexterity * 2 - this.size;
    this.parry = this.dexterity + this.strength;

    this.maxHP = Math.floor((this.constitution + this.size) / 2) + myDiceBag.rollDx(6);
    this.currentHP = this.maxHP;
    
    if (this.job == JobType.SQUIRE) {
        this.melee += 30;
        this.ranged += 15;
        this.dodge += 25;
        this.parry += 30;

        this.weapon = new weapons.Weapon("Arming Sword", weapons.WeaponType.MELEE, 8, 1, woundz.DamageType.CUT, 0, 1, 1);
        this.armour = new armours.Armour("Leather Armour", armours.ArmourType.HIDE, 0, 0);
        this.shield = new shields.Shield("Leather Shield", shields._SHIELDTYPE_SMALL, 0, 0, 2);

    } else if (this.job == JobType.CHEMIST) {
        this.melee += 10;
        this.ranged += 20;
        this.dodge += 30;
        this.parry += 20;

        this.weapon = new weapons.Weapon("Dagger", weapons.WeaponType.MELEE, 4, 0, woundz.DamageType.STAB, 4, 1, 0.25);
        this.armour = new armours.Armour("Clothes", armours.ArmourType.CLOTH, 0, 0);
    };
};

Character.prototype.getStatus = function() {
    returnString = "Hale";

    let totalWounds = this.wounds.totalWounds();
    let percentHP = this.currentHP * 100 / this.maxHP;
    let percentWounds = totalWounds * 100 / this.constitution;

    if (!this.isAlive()) {
        returnString = "Dead";
    } else if (this.isDisabled()) {
        returnString = "Disabled";
    } else if (this.isStunned()) {
        returnString = "Stunned";
    } else if (percentWounds > 75) {
        returnString = "Critically Wounded";
    } else if (percentWounds > 50) {
        returnString = "Seriously Wounded";
    } else if (percentWounds > 25) {
        returnString = "Moderately Wounded";
    } else if (percentWounds > 10) {
        returnString = "Lightly Wounded";
    } else if (percentHP <= 10) {
        returnString = "Weak";
    } else if (percentHP <= 25) {
        returnString = "Ailing";
    } else if (percentHP <= 50) {
        returnString = "Winded";
    } else if (percentHP <= 75) {
        returnString = "Okay"
    } else if (percentHP <= 90) {
        returnString = "Good"
    };
    return returnString;
};

/**
 * Resolve an attack and report the result to the console.
 * @param {Character} target The target of the attack. If the attack succeeds, will call the target's defend() method.
 */
Character.prototype.attack = function (target) {
    //  Returns true on a hit or false on a miss
    let returnValue = false;

    if (this.isDisabled()) {
        return false;
    } else if (this.isStunned()) {
        this.turnsStunned--;
        if (this.isStunned()) {
            console.log(this.name + " staggers in a daze.");
        } else {
            console.log(this.name + " takes a moment to recover hir senses!");
        };
        return false;
    };

    let circumstanceModifier = 0;
    let attackDamage = 0;
    let attackResult = this.attackRoll(this.weapon, circumstanceModifier);
    let isCritical = (attackResult == SkillResult.CRITICAL);

    if (attackResult <= SkillResult.FAILURE) {
        console.log(`${this.name} strikes with ${this.pronouns.possAdj} ${this.weapon.name} and misses.`);
    } else {
        attackDamage = this.weapon.rollDamage(this.strMod(), this.wounds.totalWoundMod(), isCritical);
        returnValue = !target.defend(this, attackDamage, this.weapon.damageType, this.weapon.armourPiercing, isCritical);
    };
   return returnValue;
};

/**
 * Resolve a successful attack against the target and report the result to the console.
 * @param {Character} attacker Character attacking the subject
 * @param {Number} damage Amount of damage dealt in the attack
 * @param {Number} damageType Type of damage dealt in the attack, per the DamageType enum
 * @param {Number} armourPiercing AP value of the damage dealt in the attack
 * @param {Boolean} attackIsCritical A critical attack is harder to defend against. FALSE by default.
 */
Character.prototype.defend = function (attacker, damage, damageType, armourPiercing, attackIsCritical) {
    //  Returns true on a successful defense or false on a hit.
    let returnValue = false;

    let circumstanceModifier = 0;
    let defenseResult = this.defenseRoll(attacker.weapon.type, circumstanceModifier);
    returnValue = (defenseResult >= SkillResult.PARTIALSUCCESS);

    if (defenseResult == SkillResult.PARTIALSUCCESS) {
        this.shield.takeDamage(damage, damageType, armourPiercing);

        if (!this.shield.isBroken()) {
            console.log(`${this.name} just managed to catch the attack on ${this.pronouns.possAdj} shield.`);
        } else {
            console.log(`${this.name} got ${this.pronouns.possAdj} shield up in time, but the shield shattered under the mighty blow!`);
        };

    } else if (defenseResult == SkillResult.FAILURE) {
        this.takeDamage(damage, damageType, armourPiercing);
        //  takeDamage() logs the action to console itself.
    
    } else if (attackIsCritical) {
        if (defenseResult == SkillResult.CRITICAL) {
            console.log(`${this.name} masterfully voids a deadly stroke.`);
        } else if (defenseResult == SkillResult.SUCCESS) {
            this.takeDamage(Math.floor(damage / 2), damageType, armourPiercing);
            //  takeDamage() logs the action to console itself.
        };

    } else if (defenseResult >= SkillResult.SUCCESS) {
        console.log(`${this.name} skillfully defends against a solid attack.`);
    };

    return returnValue;
};

/**
 * Resolve damage against the character
 * @param {Number} damage Amount of damage inflicted in the attack
 * @param {Number} damageType Type of damage dealt in the attack, per the DamageType enum
 * @param {Number} armourPiercing AP value of the damage dealt in the attack
 */
Character.prototype.takeDamage = function(damage, damageType, armourPiercing = 0) {
    let returnValue = false;
    let actualDamage = damage;
    let armourDR = this.armour.DR - armourPiercing;
    let stunResult = 0;
    let msgPrint = "";
    let newWound;

    if (armourDR < 0) {
        armourDR = 0;
    };
    actualDamage -= armourDR;

    if (actualDamage < 0) {
        msgPrint = `${this.name}'s ${this.armour.name} protects ${this.pronouns.obj} from a deadly attack!`

    } else {
        returnValue = true;

        stunResult = this.resistStun(actualDamage);
    
        if (actualDamage <= this.currentHP) {
            this.currentHP -= actualDamage;

            if (stunResult < 1) {
                msgPrint = `${this.name} escapes a nasty wound by the skin of ${this.pronouns.possAdj} teeth!`
            } else {
                msgPrint = `${this.name} reels from a sound blow! That's going to leave a mark...`
            }
        } else {
            actualDamage -= this.currentHP;
            this.currentHP = 0;
            newWound = this.wounds.addRandomWound(actualDamage, damageType);

            if (stunResult < 1) {
                msgPrint = `${this.name} endures a ${newWound.description}, but ${this.pronouns.subj} remains on ${this.pronouns.possAdj} feet!`
            } else {
                msgPrint = `${this.name} suffers from a ${newWound.description} and falls to the ground in agony!`
            }
        };
    };

    console.log(msgPrint);
    return returnValue;
};

/**
 * Resolve potential stun results on the character
 * @param {Number} damage Amount of damage dealt in the attack
 */
Character.prototype.resistStun = function(damage) {
    let stunResult = 0;
    if (woundz.returnWoundSeverity(damage) != "minor") {
        stunResult = Math.floor(damage / 5) + 1;
    
        let conRoll = myDiceBag.rollxDyForMargin(3, 6, this.constitution, 0, _IS_ROLLOVER);
        if (conRoll > -1) {
            stunResult -= conRoll + 1;
        };
        if (stunResult < 0) {
            stunResult = 0;
        };
    };

    this.turnsStunned += stunResult;
    return stunResult;
};

/**
 * Rest to recover Hit Points
 * @param {Number} hpAmount Amount of Hit Points to recover. If no amount specified, defaults to CON / 2
 * @param {Number} hpModifier Amount by which to modify the healing result
 */
Character.prototype.rest = function(hpAmount = 0, hpModifier = 0) {
    if (hpAmount < 1) {
        hpAmount = myDiceBag.rollDx(10) + Math.floor(this.constitution / 2);
    };

    let totalHealing = hpAmount + hpModifier;

    if (totalHealing > 0) {
        this.currentHP += totalHealing;
        if (this.currentHP > this.maxHP) {
            this.currentHP = this.maxHP;
        };
        console.log(this.name + " recovered much-needed vitality.");
    };
};

/**
 * Heal Wounds
 * @param {1} days Number of days' healing to apply. By default, each wound heals 1 point per day.
 */
Character.prototype.heal = function(days = 1) {
    this.wounds.heal(days);
    if (totalHealing > 0) {
        this.wounds -= totalHealing;
        if (this.wounds < 0) {
            this.wounds = 0;
            console.log(this.name + " fully recovered from hir wounds.");
        } else {
            console.log(this.name + " recuperated from his wounds.");
        };
    }
}

/**
 * Advance the character's abilities
 */
Character.prototype.levelUp = function () {
    if (this.isDying) {
        return false;
    }

    this.age++;
    
    if (this.strCheck() > 0) {
        this.strength++;
        this.melee++;
    };
    if (this.dexCheck() > 0) {
        this.dexterity++;
        this.ranged++;
        this.dodge += 2;
        this.parry++;
    };
    if (this.conCheck() > 0) {
        this.constitution++;
        this.maxHP++;
    };

    this.melee += myDiceBag.rollDx(4) + 1;
    this.ranged += myDiceBag.rollDx(4) + 1;
    this.dodge += myDiceBag.rollDx(4) + 1;
    this.parry += myDiceBag.rollDx(4) + 1;

    this.maxHP += myDiceBag.rollDx(6);

    return true;
}

Character.prototype.loadFromFile = function(characterName) {
    let characterReturn = null;
    let statName = characterName.toLowerCase();
    statName = statName.replace(/ /g, "");

    let stats = characterData.characters[statName];
    if (!stats) {
        return null;
    };

    let jobType = getJobType(stats.job);

    let wpnStats = stats.weapon;
    let wpnType = null;
    if (wpnStats) {
        wpnType = stats.weapon.type;
    };
    let shldStats = stats.shield;
    let shldType = null;
    if (shldStats) {
        shldType = stats.shield.type;
    };
    let armourStats = stats.armour;
    let armourType = null;
    if (armourStats) {
        armourType = stats.armour.type;
    };

    let wpnTypeCode = 0;
    switch (wpnType) {
        case "melee":
            wpnTypeCode = weapons.WeaponType.MELEE;
            break;
        case "ranged":
            wpnTypeCode = weapons.WeaponType.RANGED;
            break;
        default:
            wpnTypeCode = weapons.WeaponType.BRAWL;
    };

    let shldTypeCode = 0;
    switch (shldType) {
        case "buckler":
            shldTypeCode = shields.ShieldType.BUCKLER;
            break;
        case "small":
            shldTypeCode = shields.ShieldType.SMALL;
            break;
        case "large":
            shldTypeCode = shields.ShieldType.LARGE;
            break;
        default:
            shldTypeCode = shields.ShieldType.NONE;
    };

    let armourTypeCode = 0;
    switch (armourType) {
        case "cloth":
            armourTypeCode = armours.ArmourType.CLOTH;
            break;
        case "hide":
            armourTypeCode = armours.ArmourType.HIDE;
            break;
        case "maille":
            armourTypeCode = armours.ArmourType.MAILLE;
            break;
        case "plate":
            armourTypeCode = armours.ArmourType.PLATE;
            break;
        default:
            armourTypeCode = armours.ArmourType.NONE;
    };
    
    let newWpn = null;
    if (wpnStats) {
        new weapons.Weapon(wpnStats.name, wpnTypeCode, wpnStats.attackMod, wpnStats.damage, wpnStats.damageMod,
                            wpnStats.damageType, wpnStats.ap, wpnStats.hands, wpnStats.weight, wpnStats.hp,
                            wpnStats.usesStrMod, wpnStats.weaponSpecialty);
    };

    let newShield = null;
    if (shldStats) {
        newShield = new shields.Shield(shldStats.name, shldType, shldStats.bonus, shldStats.damage, shldStats.hp, shldStats.weight);
    };

    let newArmour = null;
    if (armourStats) {
        newArmour = new armours.Armour(armourStats.name, armourTypeCode, armourStats.dr, armourStats.hp, armourStats.skillMod,
                            armourStats.weight, armourStats.coverage);
    };

    this.name = stats.name;
    this.jobType = jobType;
    this.age = stats.age;
    this.strength = stats.strength;
    this.size = stats.size;
    this.dexterity = stats.dexterity;
    this.constitution = stats.constitution;
    this.melee = stats.melee;
    this.ranged = stats.ranged;
    this.dodge = stats.dodge;
    this.parry = stats.parry;
    this.maxHP = stats.hp;
    this.currentHP = stats.hp;
    this.weapon = newWpn;
    this.armour = newArmour;
    this.shield = newShield;
};


//  **  Utility Functions


function getJobType(typeString) {
    let returnValue = JobType.UNDETERMINED;

    if (typeof(typeString) == "string") {
        typeString = typeString.trim().toLowerCase();
    }
    switch (typeString) {
        case "squire", "knight", "dragoon", "lancer", "fighter", "warrior", "monk", "archer":
            returnValue = JobType.SQUIRE;
        case "alchemist", "chemist", "mage", "wizard", "priest", "white mage", "black mage", "red mage":
            returnValue = JobType.CHEMIST;
        case JobType.SQUIRE, JobType.CHEMIST:
            returnValue = parseInt(typeString);
        default:
            returnValue = JobType.SQUIRE;
    };

    return returnValue;
};

function jobName(jobType) {
    let returnString = "";

    switch (jobType) {
        case JobType.UNDETERMINED:
            returnString = "Vagabond";
            break;
        case JobType.SQUIRE:
            returnString = "Squire";
            break;
        case JobType.CHEMIST:
            returnString = "Chemist";
            break;
        default:
    };
    return returnString;
};

module.exports = { Character, JobType, SkillResult };

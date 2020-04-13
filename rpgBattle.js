const armours = require("./js/Armour.js");
const characters = require("./js/Character.js");
const myDiceBag = require("./js/DiceBag.js");
const shields = require("./js/Shield.js");
const weapons = require("./js/Weapon.js");
const woundz = require("./js/Wound.js");
const pronounz = require("./js/Pronouns.js");

//  **  Declarations

const _MAX_NUMBEROFROUNDS = 6;

let chA = new characters.Character();
chA.loadFromFile("Kilik");
let chB = new characters.Character();
chB.loadFromFile("Sophitia");


let roundNumber = 0;


//  **  Logic


function battleContenders(contender1, contender2) {
    // chA.makeCharacter("Kilik");
    // chB.makeCharacter("Sophitia");

    chA.weapon = new weapons.Weapon("Staff", weapons.WeaponType.MELEE, 0, 8, 0, woundz.DamageType.CRUSH, 2, 2, 1, weapons.WeaponStrMod.FULL);
    chA.shield = new shields.Shield("None", shields.ShieldType.NONE);
    chA.armour = new armours.Armour("Clothes", armours.ArmourType.CLOTH);
    chA.pronouns = new pronounz.Pronouns("he", "him", "his");

    chB.weapon = new weapons.Weapon("Broad Sword", weapons.WeaponType.MELEE, 0, 8, 1, woundz.DamageType.CUT, 0, 1, 1, weapons.WeaponStrMod.FULL);
    chB.shield = new shields.Shield("Steel Shield", shields.ShieldType.SMALL);
    chB.armour = new armours.Armour("Leather Plate", armours.ArmourType.HIDE);
    chB.pronouns = new pronounz.Pronouns("she", "her", "her");

    console.log("And now... for a taste of things to come!");

    contender1.printStats();
    contender2.printStats();

    while ((roundNumber < _MAX_NUMBEROFROUNDS) && 
                (contender1.isAlive() && contender2.isAlive())) {

        roundNumber++;
        console.log("Round #" + roundNumber + ":");
        contender1.attack(contender2);
        contender2.attack(contender1);

        if (contender1.isDisabled()) {
            console.log(`\n${contender1.name} passes out from the pain and falls!`);
            contender1.printCondition();
            contender2.printCondition();
                break;
        };
        if (contender2.isDisabled()) {
            console.log(`\n${contender2.name} faints from ${contender2.pronouns.possAdj} wounds and passes out!`);
            contender1.printCondition();
            contender2.printCondition();
                break;
        };
        
        contender1.printCondition();
        contender2.printCondition();
    };

    if (contender2.isDisabled()) {
        console.log(contender1.name + " is victorious!");
    } else if (contender1.isDisabled()) {
        console.log(contender2.name + " carries the day!");
    } else {
        percentA = contender1.currentHP * 100 / contender1.maxHP;
        percentB = contender2.currentHP * 100 / contender2.maxHP;

        if (percentA > (percentB + 10)) {
            console.log(`${contender1.name} carries the day and the crowd roars!`);
        } else if (percentB > (percentA + 10)) {
            console.log(`${contender2.name} scores a victory and wins the crowd!`);
        } else {
            console.log(`${contender1.name} and ${contender2.name} withdraw to assess their wounds.`);
        };
    };
};

battleContenders(chA, chB);

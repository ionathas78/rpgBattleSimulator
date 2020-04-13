const woundData = require("../reference/wounds.json");

const DamageType = {
    UNDEFINED: 0,
    BRUISE: 1,
    CHOP: 2,
    CRUSH: 3,
    CUT: 4,
    STAB: 5,
    BURN: 6,
    FROST: 7,
    LIGHTNING: 8,
    NECROTIC: 9,
    PSYCHIC: 10
};
Object.freeze(DamageType);

const HitLocation = {
    BODY: 0,
    HEAD: 1,
    ARM: 2,
    VITALS: 3,
    LEG: 4,
    length: 5                           //  for use in random functions
};
Object.freeze(HitLocation);

const WoundType = {
    UNDEFINED: 0,
    SKIN: 1,
    BLOOD: 2,
    MUSCLE: 3,
    BONE: 4,
    JOINT: 5,
    ORGAN: 6,
    NERVE: 7
};
Object.freeze(WoundType);

const WoundSeverity = {
    NONE: 0,
    MINOR: 1,
    LIGHT: 2,
    MODERATE: 3,
    SERIOUS: 4,
    CRITICAL: 5
};
Object.freeze(WoundSeverity);

const Wound = function (hitLocation = "", damage = 0, dmgType = DamageType.UNDEFINED, desc = "",
                    woundType = "", woundModifier = 0, recoveryModifier = 0, hpModifier = 0) {
    this.location = hitLocation;
    this.woundType = woundType;
    this.damage = damage;
    this.initialDamage = damage;
    this.damageType = dmgType;
    this.description = desc;
    this.woundMod = woundModifier;
    this.recoveryMod = recoveryModifier;
    this.hpMod = hpModifier;
    this.recoveryProgress = 0;

    this.willScar = () => this.initialDamage > 5;
    this.severity = () => returnWoundSeverity(this.damage);
    this.randomHitLocation = () => Math.floor(Math.random() * HitLocation.length);
};

Wound.prototype.randomWound = function (damage, damageType, hitLocation = -1) {
    if (hitLocation < 0) {
        hitLocation = this.randomHitLocation();
    };

    assignRandomInjury(this, hitLocation, damage, damageType);
};

Wound.prototype.heal = function (days = 1) {
    if (this.damage == 0) {
        return;
    }

    if (this.recoveryMod == 0) {
        this.damage -= days;
    } else {
        let recoveryIntervals = Math.floor((days + this.recoveryProgress) / this.recoveryMod);
        let recoveryRemnants = (days + this.recoveryProgress) % this.recoveryMod;

        this.damage -= recoveryIntervals;
        this.recoveryProgress = recoveryRemnants;
    };
    if (this.damage < 0) {
        this.damage = 0;
    };
};

//  **  Utility functions

function assignRandomInjury(targetWound, hitLocation, damage, damageType) {
    let returnValue = false;

    let severity = returnWoundSeverity(damage);
    let severityString = returnWoundSeverityString(severity);
    let hitLocationString = returnHitLocationString(hitLocation);
    let damageTypeString = returnDamageTypeString(damageType);
    let injuryArray = [];
    let locationArray = [];
    let injuryResult = "";
    let locationResult = "";

    for (let i = severity; i > 0; i--) {
        let currentSeverity = returnWoundSeverityString(i);
        locationArray.push(...woundData.locations[hitLocationString][currentSeverity]);
    };
    injuryArray = woundData.injuries[damageTypeString][severityString];

    locationResult = locationArray[Math.floor(Math.random() * locationArray.length)];
    injuryResult = injuryArray[Math.floor(Math.random() * injuryArray.length)];

    targetWound.damage = damage;
    targetWound.damageType = damageType;
    targetWound.initialDamage = damage;
    targetWound.woundType = locationResult.type;
    targetWound.description = injuryResult + " " + locationResult.name;
    targetWound.woundModifier = returnWoundModifier(hitLocation, damage, damageType);
    targetWound.recoveryMod = returnRecoveryModifier(hitLocation, damage, damageType);
    targetWound.hpMod = returnHPModifier(hitLocation, damage, damageType);
    returnValue = true;

    return returnValue;
};

function returnWoundSeverity(damage) {
    let returnValue = WoundSeverity.NONE;
    if (damage < 3) {
        returnValue = WoundSeverity.MINOR;
    } else if (damage < 5) {
        returnValue = WoundSeverity.LIGHT;
    } else if (damage < 8) {
        returnValue = WoundSeverity.MODERATE;
    } else if (damage < 11) {
        returnValue = WoundSeverity.SERIOUS;
    } else {
        returnValue = WoundSeverity.CRITICAL;
    };
    return returnValue;
};

function returnWoundSeverityString(woundSeverity) {
    let returnString = "none";
    switch (woundSeverity) {
        case WoundSeverity.MINOR:
            returnString = "minor"
            break;
        case WoundSeverity.LIGHT:
            returnString = "light"
            break;
        case WoundSeverity.MODERATE:
            returnString = "moderate"
            break;
        case WoundSeverity.SERIOUS:
            returnString = "serious"
            break;
        case WoundSeverity.CRITICAL:
            returnString = "critical"
            break;
        default:                                    
    };
    return returnString;
};

function returnHitLocationString (hitLocation) {
    let returnString = "";
    switch (hitLocation) {
        case HitLocation.ARM:
            returnString = "arm";
            break;
        case HitLocation.BODY:
            returnString = "body";
            break;
        case HitLocation.HEAD:
            returnString = "head";
            break;
        case HitLocation.LEG:
            returnString = "leg";
            break;
        case HitLocation.VITALS:
            returnString = "vitals";
            break;
        default:
    };
    return returnString;
};

function returnDamageTypeString(damageType) {
    let returnString = "";
    switch (damageType) {
        case DamageType.BRUISE:
            returnString = "bruise";
            break;
        case DamageType.BURN:
            returnString = "burn";
            break;
        case DamageType.CHOP:
            returnString = "chop";
            break;
        case DamageType.CRUSH:
            returnString = "crush";
            break;
        case DamageType.CUT:
            returnString = "cut";
            break;
        case DamageType.FROST:
            returnString = "frost";
            break;
        case DamageType.LIGHTNING:
            returnString = "lightning";
            break;
        case DamageType.NECROTIC:
            returnString = "necrotic";
            break;
        case DamageType.PSYCHIC:
            returnString = "psychic";
            break;
        case DamageType.STAB:
            returnString = "stab";
            break;
        default:        
    };
    return returnString;
};

function returnWoundModifier(hitLocation, damage, damageType) {
    let woundModifier = 0;

    let severity = returnWoundSeverity(damage);
    switch (severity) {
        case "minor":
            woundModifier = 0;
            break;
        case "light":
            woundModifier = 1;
            break;
        case "moderate":
            woundModifier = 3;
            break;
        case "serious":
            woundModifier = 5;
            break;
        case "critical":
            woundModifier = 10;
            break;
        default:
    };

    switch (hitLocation) {
        case HitLocation.HEAD:
            woundModifier += 2;
            break;
        case HitLocation.BODY:
            woundModifier += 0;
            break;
        case HitLocation.ARM:
            woundModifier += 5;
            break;
        case HitLocation.VITALS:
            woundModifier += 5;
            break;
        case HitLocation.LEG:
            woundModifier += 2;
            break;
        default:
    };

    switch (damageType) {
        case DamageType.BRUISE:
            woundModifier -= 5;
            break;
        case DamageType.CHOP:
            woundModifier += 5;
            break;
        case DamageType.CRUSH:
            woundModifier += 2;
            break;
        case DamageType.CUT:
            woundModifier += 0;
            break;
        case DamageType.STAB:
            woundModifier += 2;
            break;
        default:
    };
    if (woundModifier < 0) {
        woundModifier = 0;
    };

    return woundModifier;
};

function returnRecoveryModifier(hitLocation, damage, damageType) {
    let recoveryMod = 0;

    let severity = returnWoundSeverity(damage);
    switch (severity) {
        case "minor":
            recoveryMod = 0;
            break;
        case "light":
            recoveryMod = 0;
            break;
        case "moderate":
            recoveryMod = 0;
            break;
        case "serious":
            recoveryMod = 1;
            break;
        case "critical":
            recoveryMod = 2;
            break;
        default:
    };

    switch (hitLocation) {
        case HitLocation.HEAD:
            recoveryMod += 0;
            break;
        case HitLocation.BODY:
            recoveryMod += 0;
            break;
        case HitLocation.ARM:
            recoveryMod -= 1;
            break;
        case HitLocation.VITALS:
            recoveryMod += 1;
            break;
        case HitLocation.LEG:
            recoveryMod -= 1;
            break;
        default:
    };

    switch (damageType) {
        case DamageType.BRUISE:
            recoveryMod -= 2;
            break;
        case DamageType.CHOP:
            recoveryMod += 0;
            break;
        case DamageType.CRUSH:
            recoveryMod += 0;
            break;
        case DamageType.CUT:
            recoveryMod += 0;
            break;
        case DamageType.STAB:
            recoveryMod += 1;
            break;
        default:
    };
    if (recoveryMod < 0) {
        recoveryMod = 0;
    };

    return recoveryMod;
};

function returnHPModifier(hitLocation, damage, woundType) {
    let hpMod = 0;

    let severity = returnWoundSeverity(damage);
    switch (severity) {
        case "minor":
            hpMod = 0;
            break;
        case "light":
            hpMod = 1;
            break;
        case "moderate":
            hpMod = 2;
            break;
        case "serious":
            hpMod = 4;
            break;
        case "critical":
            hpMod = 8;
            break;
        default:
    };

    switch (hitLocation) {
        case HitLocation.HEAD:
            hpMod += 2;
            break;
        case HitLocation.BODY:
            hpMod += 0;
            break;
        case HitLocation.ARM:
            hpMod += 2;
            break;
        case HitLocation.VITALS:
            hpMod += 4;
            break;
        case HitLocation.LEG:
            hpMod += 2;
            break;
        default:
    };

    switch (woundType) {
        case WoundType.SKIN:
            hpMod *= 0.5;
            break;
        case WoundType.BLOOD:
            hpMod *= 1.5;
            break;
        case WoundType.MUSCLE:
            hpMod *= 1;
            break;
        case WoundType.BONE:
            hpMod *= 1.5;
            break;
        case WoundType.ORGAN:
            hpMod *= 1.5;
            break;
        case WoundType.JOINT:
            hpMod *= 1.75;
            break;
        case WoundType.NERVE:
            hpMod *= 2;
            break;
        default:
    };
    hpMod = Math.floor(hpMod);
    if (hpMod < 0) {
        hpMod = 0;
    };

    return hpMod;
};

module.exports = { Wound, DamageType, HitLocation, WoundType, WoundSeverity, returnWoundSeverity }
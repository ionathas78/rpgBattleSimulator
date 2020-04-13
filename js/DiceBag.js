class DiceBag {
    /**
     * Roll one x-sided die and add the modifier
     * @param {Number} dieType Number of sides on the die
     * @param {Number} modifier Bonus or penalty to apply to the total. Default is 0.
     */
    static rollDx(dieType, modifier = 0) {
        return Math.floor(Math.random() * dieType) + 1 + modifier;
    };

    /**
     * Roll x y-sided dice and apply the modifier
     * @param {Number} diceNumber Number of dice to roll
     * @param {Number} dieType Number of sides on each die
     * @param {Number} modifier Bonus or penalty to apply to the total. Default is 0.
     */
    static rollxDy(diceNumber, dieType, modifier = 0) {
        let rollTotal = 0;
        for (let i = 0; i < diceNumber; i++) {
            rollTotal += Math.floor(Math.random() * dieType) + 1;
        };
        return rollTotal + modifier;
    };

    /**
     * Roll a Fudge die and apply the modifier.
     * @param {Number} modifier Bonus or penalty to apply to the total. Default is 0.
     */
    static rollDF(modifier = 0) {
        return Math.floor(Math.random() * 3) - 1 + modifier;
    };

    /**
     * Roll x Fudge dice and apply the modifier
     * @param {Number} diceNumber Number of Fudge dice to roll
     * @param {Number} modifier Bonus or penalty to apply to the total. Default is 0.
     */
    static rollxDF(diceNumber, modifier = 0) {
        let rollTotal = 0;
        for (let i = 0; i < diceNumber; i++) {
            rollTotal += Math.floor(Math.random() * 3) - 1;
        };
        return rollTotal + modifier;
    }

    /**
     * Roll 4 Fudge/Fate dice and apply the modifier
     * @param {Number} modifier Bonus or penalty to apply to the total. Default is 0.
     */
    static rollDFate(modifier = 0) {
        return this.rollxDF(4, modifier);
    };

    /**
     * Rolls x number of y-sided dice and drops either the highest or lowest result
     * @param {Number} diceNumber Number of dice to roll
     * @param {Number} dieType Number of sides on each die
     * @param {Number} modifier Bonus or penalty to apply to the final total. Default is 0.
     * @param {Boolean} dropLow TRUE to drop the lowest die; FALSE to drop the highest die. Default is TRUE.
     */
    static rollxDyDropOne(diceNumber, dieType, modifier = 0, dropLow = true) {
        let rollTotal = 0;
        let rolls = [];
        for (let i = 0; i < diceNumber; i++) {
            rolls.push(Math.floor(Math.random() * dieType) + 1);
        };
        
        rollTotal = rolls.reduce((total, element) => total + element);
        if (dropLow) {
            rollTotal -= Math.min(...rolls);
        } else {
            rollTotal -= Math.max(...rolls);
        };
        return rollTotal + modifier;
    };

    /**
     * Roll x-sided die for a given target number and report success
     * @param {Number} dieType Number of sides on the die
     * @param {Number} targetNumber Number to beat on the roll
     * @param {Number} modifier Bonus or penalty to apply to the roll. Default is 0.
     * @param {Boolean} isRollOver TRUE if success means rolling higher than the TN, FALSE if lower. Default is TRUE.
     */
    static rollDxForSuccess(dieType, targetNumber, modifier = 0, isRollOver = true) {
        let returnValue = false;
        let roll = Math.floor(Math.random() * dieType) + 1 + modifier;
        if (isRollOver) {
            returnValue = (roll >= targetNumber);
        } else {
            returnValue = (roll <= targetNumber);
        };
        return returnValue;
    };

    /**
     * Roll x-sided die for a given target number and report degree of success
     * @param {Number} dieType Number of sides on the die
     * @param {Number} targetNumber Number to beat on the roll
     * @param {Number} modifier Bonus or penalty to apply to the roll. Default is 0.
     * @param {Boolean} isRollOver TRUE if success means rolling higher than the TN, FALSE if lower. Default is TRUE.
     */
    static rollDxForMargin(dieType, targetNumber, modifier = 0, isRollOver = true) {
        let returnValue = 0;
        let roll = Math.floor(Math.random() * dieType) + 1 + modifier;
        if (isRollOver) {
            returnValue = roll - targetNumber;
        } else {
            returnValue = targetNumber - roll;
        };
        return returnValue;
    };


    /**
     * Roll x y-sided dice for a given target number, apply the given modifier, and report success.
     * @param {Number} diceNumber Number of dice to roll
     * @param {Number} dieType Number of sides on each die
     * @param {Number} targetNumber Number to beat on each die
     * @param {Number} modifier Bonus or penalty to apply to the result
     * @param {Boolean} isRollOver TRUE if success means rolling higher than the TN, FALSE if lower. Default is TRUE.
     */
   static rollxDyForSuccesses(diceNumber, dieType, targetNumber, modifier = 0, isRollOver = true) {
    let returnValue = false;
    let rollTotal = 0;
    for (let i = 0; i < diceNumber; i++) {
        rollTotal += Math.floor(Math.random() * dieType) + 1;
    };
    rollTotal += modifier;
    
    if (isRollOver) {
        returnValue = (rollTotal >= targetNumber);
    } else {
        returnValue = (rollTotal <= targetNumber);
    };
    return returnValue;
};

    /**
     * Roll x y-sided dice for a given target number, apply the given modifier, and report degree of success.
     * @param {Number} diceNumber Number of dice to roll
     * @param {Number} dieType Number of sides on each die
     * @param {Number} targetNumber Number to beat on each die
     * @param {Number} modifier Bonus or penalty to apply to the result
     * @param {Boolean} isRollOver TRUE if success means rolling higher than the TN, FALSE if lower. Default is TRUE.
     */
    static rollxDyForMargin(diceNumber, dieType, targetNumber, modifier = 0, isRollOver = true) {
        let returnValue = 0;
        let rollTotal = 0;
        for (let i = 0; i < diceNumber; i++) {
            rollTotal += Math.floor(Math.random() * dieType) + 1;
        };
        rollTotal += modifier;
        
        if (isRollOver) {
            returnValue = rollTotal - targetNumber;
        } else {
            returnValue = targetNumber - rollTotal;
        };
        return returnValue;
    };
    
    /**
     * Roll a pool of x y-sided dice for a given target number and report number of successes
     * @param {Number} diceNumber Number of dice to roll
     * @param {Number} dieType Number of sides on each die
     * @param {Number} targetNumber Number to beat on each die
     * @param {Boolean} isRollOver TRUE if success means rolling higher than the TN, FALSE if lower. Default is TRUE.
     */
   static rollxDyPoolForSuccess(diceNumber, dieType, targetNumber, isRollOver = true) {
        let successCount = 0;
        let rolls = [];
        for (let i = 0; i < diceNumber; i++) {
            rolls.push(Math.floor(Math.random() * dieType) + 1);
        };
        
        if (isRollOver) {
            successCount = rolls.filter(element => element >= targetNumber).length;
        } else {
            successCount = rolls.filter(element => element <= targetNumber).length;
        };
        return successCount;
    };

    static rollD2() {return this.rollDx(2)};
    static rollD3() {return this.rollDx(3)};
    static rollD4() {return this.rollDx(4)};
    static rollD6() {return this.rollDx(6)};
    static rollD8() {return this.rollDx(8)};
    static rollD10() {return this.rollDx(10)};
    static rollD12() {return this.rollDx(12)};
    static rollD20() {return this.rollDx(20)};
    static rollD100() {return this.rollDx(100)};
    
    static roll2d6() {return this.rollxDy(2, 6)};
    static roll3d6() {return this.rollxDy(3, 6)};
};

module.exports = { DiceBag };

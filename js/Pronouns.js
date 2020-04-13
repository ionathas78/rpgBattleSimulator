/**
 * Constructor function for Pronouns
 * @param {Text} subjectivePronoun Pronoun form in the Nominative case
 * @param {Text} objectivePronoun Pronoun form in the Objective case
 * @param {Text} possessivePronoun Singular Pronoun form in the Possessive case. Plural form will add 's' to this if 's' is not the last letter.
 */
const Pronouns = function(subjectivePronoun = "ze", objectivePronoun = "hir", possessiveAdjective = "hir") {
    this.subj = subjectivePronoun;
    this.obj = objectivePronoun;
    this.possAdj = possessiveAdjective;
    this.possPron = possessiveAdjective;

    if (this.possAdj[this.possAdj.length - 1] != "s") {
        this.possPron += "s";
    };
};

module.exports = { Pronouns };

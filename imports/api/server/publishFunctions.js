/**
 * Created by vergo on 3/26/17.
 */

import * as trueskill from "trueskill";

export const updatePublishedDocuments = function (id, fields, self, initialDocumentsPublished) {
    animeDetailsArray = fields.animeDetailsArray;
    animeToCompare = getBestQualityMatch(animeDetailsArray);

    if(!initialDocumentsPublished) {
        self.added("animeToCompare", 1, {animeDetails: animeToCompare[0]});
        self.added("animeToCompare", 2, {animeDetails: animeToCompare[1]});
    } else {
        self.changed("animeToCompare", 1, {animeDetails: animeToCompare[0]});
        self.changed("animeToCompare", 2, {animeDetails: animeToCompare[1]});
    }
};

export const getBestQualityMatch = function (animeDetailsArray) {
    // gets object with max sigma value
    maxSigmaObject = animeDetailsArray.reduce(function (prev, curr) {
        // http://stackoverflow.com/a/31844649
        // is prev.sigma greater than curr.sigma? if yes, return prev, otherwise return curr
        return prev.sigma > curr.sigma ? prev : curr;
    });

    // we define most interesting chance of winning to be the one closest to 0.5, thus start with 1 which is one of the 2 possible values for least interesting (0 being the other)
    mostInterestingChanceOfWinning = 1;
    bestQualityMatchObjectIndex = 0;
    _.each(animeDetailsArray, function (animeObject, index) {
        // want to make sure we don't end up getting maxSigmaObject as the best match for itself!
        if(!_.isEqual(animeObject, maxSigmaObject)) {
            maxSigmaObjectSkill = [maxSigmaObject.score, maxSigmaObject.sigma];
            animeObjectSkill = [animeObject.score, animeObject.sigma];

            chanceOfWinning = trueskill.ChanceOfWinning(maxSigmaObjectSkill, animeObjectSkill);

            // if current chance of winning is closer to 0.5 than the best one we have recorded so far, update our record
            if(Math.abs(chanceOfWinning - 0.5) < Math.abs(mostInterestingChanceOfWinning - 0.5)) {
                mostInterestingChanceOfWinning = chanceOfWinning;
                bestQualityMatchObjectIndex = index;
            }
        }
    });

    return [maxSigmaObject, animeDetailsArray[bestQualityMatchObjectIndex]];
};
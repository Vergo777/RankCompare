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

    // define match quality as in equation (7) of https://www.microsoft.com/en-us/research/publication/trueskilltm-a-bayesian-skill-rating-system/
    matchQualityFunction = function(defaultSigma, mu1, mu2, sigma1, sigma2) {
        performanceVariance = Math.pow(defaultSigma/2, 2);
        varianceConstant = 2*performanceVariance + Math.pow(sigma1, 2) + Math.pow(sigma2, 2);
        matchQuality = Math.sqrt(2*performanceVariance/varianceConstant)*Math.exp(-Math.pow(mu1 - mu2, 2)/(2*varianceConstant));
        return matchQuality;
    }

    // we maximize the match quality between the object with max sigma value and other objects
    bestMatchQuality = 0;
    bestQualityMatchObjectIndex = 0;
    _.each(animeDetailsArray, function (animeObject, index) {
        // want to make sure we don't end up getting maxSigmaObject as the best match for itself!
        if(!_.isEqual(animeObject, maxSigmaObject)) {
            currentMatchQuality = trueskill.matchQualityFunction(TRUESKILL_DEFAULT_SIGMA, maxSigmaObject.score, animeObject.score, maxSigmaObject.sigma, animeObject.sigma);

            // if current match quality is greater than the best one we have recorded so far, update our record
            if(currentMatchQuality > bestMatchQuality) {
                bestMatchQuality = currentMatchQuality;
                bestQualityMatchObjectIndex = index;
            }
        }
    });

    return [maxSigmaObject, animeDetailsArray[bestQualityMatchObjectIndex]];
};

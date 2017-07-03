/**
 * Created by vergo on 3/26/17.
 */

export const scaleAnimeArrayScores = function (animeDetailsArray) {
    minAndMaxScores = getMinAndMaxScores(animeDetailsArray);

    _.each(animeDetailsArray, function (animeDetails) {
        animeUnscaledScore = animeDetails.score;
        animeUnscaledSigma = animeDetails.sigma;
        
        animeScaledAndRoundedScore = scoreScalingFunction(animeUnscaledScore, animeUnscaledSigma, minAndMaxScores.maxScore, minAndMaxScores.minScore, MAX_SCALED_SCORE, MIN_SCALED_SCORE, SCORE_INCREMENT, TRUESKILL_CONSERVATIVITY);
        animeScaledSigma = sigmaScalingFunction(animeUnscaledSigma, 2*TRUESKILL_DEFAULT_SCORE, MAX_SCALED_SCORE, MIN_SCALED_SCORE, SCORE_INCREMENT);

        animeDetails.score = animeScaledAndRoundedScore;
        animeDetails.sigma = animeScaledSigma;
    });

    return animeDetailsArray;
};

// http://stackoverflow.com/questions/18798568/get-max-and-min-of-object-values-from-javascript-array
export const getMinAndMaxScores = function (animeDetailsArray) {
    var lowest = Number.POSITIVE_INFINITY;
    var highest = Number.NEGATIVE_INFINITY;
    var tmp;
    for(var i = animeDetailsArray.length-1; i >= 0; i--) {
        tmp = animeDetailsArray[i].score;
        if(tmp < lowest) {
            lowest = tmp;
        }

        if(tmp > highest) {
            highest = tmp;
        }
    }

    return {
        maxScore: highest,
        minScore: lowest
    }
};

export const scoreScalingFunction = function(unscaledScore, unscaledSigma, currentMax, currentMin, wantedMax, wantedMin, wantedIncrement, conservativity) {
    conservativeScore = unscaledScore - conservativity*unscaledSigma;
    if (conservativeScore >= currentMax) {
        return wantedMax;
    } else {
        return Math.round((conservativeScore - currentMin)*((wantedMax - wantedMin)/wantedIncrement + 1)/(currentMax - currentMin) - 0.5)*wantedIncrement + wantedMin;
    }
};

export const sigmaScalingFunction = function(unscaledSigma, unscaledScoreRange, wantedMaxScore, wantedMinScore, wantedScoreIncrement) {
    return unscaledSigma*(wantedMaxScore - wantedMinScore + wantedScoreIncrement)/(unscaledScoreRange);
};

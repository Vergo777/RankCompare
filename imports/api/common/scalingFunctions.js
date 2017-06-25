/**
 * Created by vergo on 3/26/17.
 */

export const scaleAnimeArrayScores = function (animeDetailsArray) {
    minAndMaxScores = getMinAndMaxScores(animeDetailsArray);

    _.each(animeDetailsArray, function (animeDetails) {
        animeUnscaledScore = animeDetails.score;
        animeScaledAndRoundedScore = scalingFunction(animeUnscaledScore, minAndMaxScores.maxScore, minAndMaxScores.minScore, MAX_SCALED_SCORE, MIN_SCALED_SCORE, SCORE_INCREMENT);

        animeDetails.score = animeScaledAndRoundedScore;
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

export const scalingFunction = function(unscaledScore, currentMax, currentMin, wantedMax, wantedMin, wantedIncrement) {
    if (unscaledScore >= currentMax) {
        return wantedMax;
    } else {
        return Math.round((unscaledScore - currentMin)*((wantedMax - wantedMin)/wantedIncrement + 1)/(currentMax - currentMin) - 0.5)*wantedIncrement + wantedMin;
    }
};

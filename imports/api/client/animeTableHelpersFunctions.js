/**
 * Created by vergo on 3/26/17.
 */

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

// http://stackoverflow.com/questions/5294955/how-to-scale-down-a-range-of-numbers-with-a-known-min-and-max-value
export const scalingFunction = function(unscaledScore, currentMax, currentMin, wantedMax, wantedMin) {
    scaledScore = ((wantedMax - wantedMin)*(unscaledScore - currentMin))/(currentMax - currentMin) + wantedMin;
    return Math.round(scaledScore);
};
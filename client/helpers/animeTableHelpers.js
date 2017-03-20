/**
 * Created by vergo on 3/12/17.
 */

Template.animeTable.helpers({
    'tableSettings' : function () {
        animeDetailsArray = UserScoresTable.findOne({sessionID: Router.current().params.sessionID}).animeDetailsArray;
        minAndMaxScores = getMinAndMaxScores(animeDetailsArray);

        _.each(animeDetailsArray, function (animeDetails) {
            animeUnscaledScore = animeDetails.score;
            animeScaledAndRoundedScore = scalingFunction(animeUnscaledScore, minAndMaxScores.maxScore, minAndMaxScores.minScore, MAX_SCALED_SCORE, MIN_SCALED_SCORE);

            animeDetails.score = animeScaledAndRoundedScore;
        });

        return {
            collection: animeDetailsArray,
            fields: ["name", "score"]
        }
    }
});

// http://stackoverflow.com/questions/18798568/get-max-and-min-of-object-values-from-javascript-array
getMinAndMaxScores = function (animeDetailsArray) {
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
scalingFunction = function(unscaledScore, currentMax, currentMin, wantedMax, wantedMin) {
    scaledScore = ((wantedMax - wantedMin)*(unscaledScore - currentMin))/(currentMax - currentMin) + wantedMin;
    return Math.round(scaledScore);
};
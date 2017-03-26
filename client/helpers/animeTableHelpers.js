/**
 * Created by vergo on 3/12/17.
 */

import {getMinAndMaxScores, scalingFunction} from '/imports/api/client/animeTableHelpersFunctions.js';

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
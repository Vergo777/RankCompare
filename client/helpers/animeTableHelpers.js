/**
 * Created by vergo on 3/12/17.
 */

import {scaleAnimeArrayScores} from '/imports/api/common/scalingFunctions.js';
import {UserScores} from "../../lib/collections/database";
UserScoresTable = UserScores;

Template.animeTable.helpers({
    'tableSettings' : function () {
        animeDetailsArray = UserScoresTable.findOne({sessionID: Router.current().params.sessionID}).animeDetailsArray;

        return {
            collection: scaleAnimeArrayScores(animeDetailsArray),
            fields: ["name", "score", "sigma"]
        }
    }
});

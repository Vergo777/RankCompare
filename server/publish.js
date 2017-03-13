/**
 * Created by Varun on 05/03/2017.
 */

import { UserScores } from '../lib/collections/database'
import * as trueskill from "trueskill";

Meteor.publish({
    'animeListData': function(sessionID) {
        let self = this;
        let query = UserScores.find({sessionID: sessionID});

        if(query.fetch().length == 0) {
            throw new Meteor.Error('publish.AnimeListData', "Whoops, couldn't find any existing session with ID " + sessionID);
        }

        /**
         * https://docs.meteor.com/api/collections.html#Mongo-Cursor-observeChanges
         * 'added' is called zero or more times to deliver the initial results of the query
         * thus we use the boolean variable below in the 'added' block for deciding whether to add the 2 documents to be compared to
         * the publication (if they haven't been added yet) or to update them instead (if they've already been added)
         */
        let initialDocumentsPublished = false;

        let handle = query.observeChanges({
            added: function (id, fields) {
                updatePublishedDocuments(id, fields, self, initialDocumentsPublished);
                initialDocumentsPublished = true;
            },
            changed: function (id, fields) {
                updatePublishedDocuments(id, fields, self, initialDocumentsPublished);
            }
        });

        self.ready();

        self.onStop(function() {
           handle.stop();
        });
    },
    'tableData': function (sessionID) {
        let query = UserScores.find({sessionID: sessionID});
        if(query.fetch().length == 0) {
            throw new Meteor.Error('publish.tableData', "Whoops, couldn't find any existing session with ID " + sessionID);
        }

        return query;
    }
});

updatePublishedDocuments = function (id, fields, self, initialDocumentsPublished) {
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

getBestQualityMatch = function (animeDetailsArray) {
    // gets object with max sigma value
    minSigmaObject = animeDetailsArray.reduce(function (prev, curr) {
        // http://stackoverflow.com/a/31844649
        // is prev.sigma greater than curr.sigma? if yes, return prev, otherwise return curr
        return prev.sigma > curr.sigma ? prev : curr;
    });

    // we define most interesting chance of winning to be the one closest to 0.5, thus start with 1 which is one of the 2 possible values for least interesting (0 being the other)
    mostInterestingChanceOfWinning = 1;
    bestQualityMatchObjectIndex = 0;
    _.each(animeDetailsArray, function (animeObject, index) {
        // want to make sure we don't end up getting minSigmaObject as the best match for itself!
        if(!_.isEqual(animeObject, minSigmaObject)) {
            minSigmaObjectSkill = [minSigmaObject.score, minSigmaObject.sigma];
            animeObjectSkill = [animeObject.score, animeObject.sigma];

            chanceOfWinning = trueskill.ChanceOfWinning(minSigmaObjectSkill, animeObjectSkill);

            // if current chance of winning is closer to 0.5 than the best one we have recorded so far, update our record
            if(Math.abs(chanceOfWinning - 0.5) < Math.abs(mostInterestingChanceOfWinning - 0.5)) {
                mostInterestingChanceOfWinning = chanceOfWinning;
                bestQualityMatchObjectIndex = index;
            }
        }
    });

    return [minSigmaObject, animeDetailsArray[bestQualityMatchObjectIndex]];
};

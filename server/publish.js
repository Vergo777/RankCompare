/**
 * Created by Varun on 05/03/2017.
 */

import { UserScores } from '../lib/collections/database'

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
    }
});

updatePublishedDocuments = function (id, fields, self, initialDocumentsPublished) {
    animeDetailsArray = fields.animeDetailsArray;
    animeToCompare = _.sample(animeDetailsArray, 2);

    if(!initialDocumentsPublished) {
        self.added("animeToCompare", 1, {animeDetails: animeToCompare[0]});
        self.added("animeToCompare", 2, {animeDetails: animeToCompare[1]});
    } else {
        self.changed("animeToCompare", 1, {animeDetails: animeToCompare[0]});
        self.changed("animeToCompare", 2, {animeDetails: animeToCompare[1]});
    }
};

/**
 * Created by Varun on 05/03/2017.
 */

Template.animeCompare.events({
    'click .animeImage' (event, template) {
        event.preventDefault();
        winningAnimeID = this.animeDetails.ID;

        documentID = 1;
        /**
         * Document here refers to the 2 documents (the 2 objects being compared) that are published by the server
         * to find the document ID of the losing object, we set it to 1 initially and
         * compare it to the ID of the winning one (we can get it from 'this' because the winning one has been clicked).
         * If it's equal to the ID of the winning one, this means that the object with ID 2 has lost, so we increment document ID.
         * This works because there will always be only 2 documents published for this template - the objects to be compared
         */
        if(this._id == documentID) {
            documentID++;
        }
        losingAnimeID = AnimeToCompare.findOne(documentID).animeDetails.ID;

        callUpdateAnimeScores(winningAnimeID, losingAnimeID, 0);
    },
    'click #drawButton' (event, template) {
        event.preventDefault();
        // if draw, we don't care which one won or which one lost so just assign first doc to winning and second to losing
        winningAnimeID = AnimeToCompare.findOne(1).animeDetails.ID;
        losingAnimeID = AnimeToCompare.findOne(2).animeDetails.ID;

        callUpdateAnimeScores(winningAnimeID, losingAnimeID, 1);
    }
});

callUpdateAnimeScores = function (winningAnimeID, losingAnimeID, draw) {
    Meteor.call('updateAnimeScores', Router.current().params.sessionID, {
        winningAnimeID: winningAnimeID,
        losingAnimeID: losingAnimeID,
        draw: draw
    }, function (error, result) {
        if(error !== undefined)
            sAlert.error(error.reason);
    });
};

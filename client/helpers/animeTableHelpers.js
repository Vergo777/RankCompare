/**
 * Created by vergo on 3/12/17.
 */

Template.animeTable.helpers({
    'tableSettings' : function () {
        return {
            collection: UserScoresTable.findOne({sessionID: Router.current().params.sessionID}).animeDetailsArray,
            fields: ["name", "score"]
        }
    }
});
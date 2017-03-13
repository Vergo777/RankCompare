/**
 * Created by vergo on 3/12/17.
 */
import {UserScores} from "../../lib/collections/database";
AnimeToCompare = new Mongo.Collection("animeToCompare");
UserScoresTable = UserScores;

Template.mainPage.helpers({
    'pageLoaded': function () {
        return (AnimeToCompare.findOne(1) !== undefined);
    }
}); 
/**
 * Created by vergo on 3/12/17.
 */
AnimeToCompare = new Mongo.Collection("animeToCompare");

Template.mainPage.helpers({
    'pageLoaded': function () {
        return (AnimeToCompare.findOne(1) !== undefined);
    }
}); 
/**
 * Created by vergo on 3/11/17.
 */

Template.animeCompare.helpers({
    'anime1Document' : function () {
        return AnimeToCompare.findOne(1);
    },
    'anime2Document' : function () {
        return AnimeToCompare.findOne(2);
    }
});
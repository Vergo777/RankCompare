/**
 * Created by vergo on 3/26/17.
 */

import {UserScores} from '/lib/collections/database';
import {scaleAnimeArrayScores} from '/imports/api/common/scalingFunctions.js';
import xmlbuilder from 'xmlbuilder';

export const exportList = function (animeDetailsArray) {
    let animeDetailsArrayScaledScores = scaleAnimeArrayScores(animeDetailsArray);

    root = xmlbuilder.create('myanimelist');
    root.ele('myinfo')
            .ele('user_export_type', {}, 1);

    _.each(animeDetailsArrayScaledScores, function (anime) {
        let animeElement = root.ele('anime');
        animeElement.ele('series_animedb_id', {}, anime.ID);
        animeElement.ele('my_score', {}, anime.score);
        animeElement.ele('update_on_import', {}, 1);
    });

    xml = root.end({ pretty: true});
    return xml;
};

export const parseResultFromRemoteURL = function (xmlContent) {
    wrappedParseStringCall = Meteor.wrapAsync(xml2js.parseString);
    try {
        parseResult = wrappedParseStringCall(xmlContent);
    } catch (parseResultError) {
        throw new Error("updateUserListData.parseXML2JS");
    }
    if (parseResult.myanimelist == "") {
        throw new Meteor.Error("updateUserListData.incorrectUserID",
            "Failed to get user data from endpoint - Have you entered your user ID correctly?");
    }

    return parseResult;
};

export const addEntryForNewSession = function (webAnimeDetailsArray, sessionID, username) {
    animeDetailsArray = [];
    _.each(webAnimeDetailsArray, function (anime) {
        animeDetailsArray.push({
            "ID": anime.series_animedb_id[0],
            "score": TRUESKILL_DEFAULT_SCORE,
            "sigma": TRUESKILL_DEFAULT_SIGMA,
            "name": anime.series_title[0],
            "image": anime.series_image[0]
        });
    });

    UserScores.insert({
        'sessionID': sessionID,
        'username': username,
        'animeDetailsArray': animeDetailsArray
    }, function (databaseInsertError, databaseInsertResult) {
        if (databaseInsertError) {
            throw new Error("updateUserListData.insertDatabase");
        }
    });
};

// http://stackoverflow.com/a/20797558
export const updateExistingListWithWebList = function (existingAnimeDetailsArray, webAnimeDetailsArray, sessionID) {
    existingAnimeIDs = _.pluck(existingAnimeDetailsArray, "ID");
    webAnimeIDs = _.map(webAnimeDetailsArray, function(animeObject) {return animeObject.series_animedb_id[0]});

    // stuff that's in the existing list but not in the web list, i.e, stuff that's been deleted by the user
    animeIDsToRemove = _.difference(existingAnimeIDs, webAnimeIDs);
    // stuff that's in the web list but not the existing one, i.e, stuff that's been added by the user
    animeIDsToAdd = _.difference(webAnimeIDs, existingAnimeIDs);

    existingAnimeDetailsArrayWithAnimeRemoved = _.filter(existingAnimeDetailsArray, function (animeObject) {
        /**
         * This is essentially a predicate that takes animeObject.ID as input - if the predicate resolves to true for the
         * input then we keep the element in the array, otherwise we discard it. What we're doing here is checking
         * whether each animeObject.ID exists in the array of IDs to remove. If it doesn't exist (i.e, it's index in the
         * remove array is < 0) then we return true (hence keeping it). If it does exist (i.e, index is >= 0) we return
         * false, hence discarding it.
         */
        return animeIDsToRemove.indexOf(animeObject.ID) < 0;
    });

    webAnimeDetailsArrayFilteredByAnimeToBeAdded = _.filter(webAnimeDetailsArray, function (animeObject) {
        /**
         * Similarly in this case, we want to KEEP the elements that occur in the array of IDs to add, so predicate
         * condition is >= 0 instead
         */
        return animeIDsToAdd.indexOf(animeObject.series_animedb_id[0]) >= 0;
    });

    updatedExistingAnimeDetailsArray = existingAnimeDetailsArrayWithAnimeRemoved;

    _.each(webAnimeDetailsArrayFilteredByAnimeToBeAdded, function (animeObject) {
        updatedExistingAnimeDetailsArray.push({
            "ID": animeObject.series_animedb_id[0],
            "score": TRUESKILL_DEFAULT_SCORE,
            "sigma": TRUESKILL_DEFAULT_SIGMA,
            "name": animeObject.series_title[0],
            "image": animeObject.series_image[0]
        });
    });

    UserScores.update({sessionID: sessionID}, {
        $set: {"animeDetailsArray": updatedExistingAnimeDetailsArray}
    }, function (databaseUpdateError, databaseUpdateResult) {
        if (databaseUpdateError) {
            throw new Error("updateExistingListWithWebList.updateDatabase");
        }
    });
};

export const filterListByCompletedShows = function (animeDetailsArray) {
    return _.filter(animeDetailsArray, function (animeObject) {
        return animeObject.my_status[0] == MAL_COMPLETED_STATUS_NUMBER;
    });
};
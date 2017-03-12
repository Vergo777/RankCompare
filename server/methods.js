/**
 * Created by Varun on 05/03/2017.
 */

import {UserScores} from '../lib/collections/database'
import { Random } from 'meteor/random'

Meteor.methods({
    'getNewSessionID': function () {
        let newSessionID;
        while (true) {
            newSessionID = Random.id();
            if (UserScores.findOne({sessionID: newSessionID}) !== undefined) {
                // session ID generated is already in use (wtf how unlikely is that), so try again by generating new one
            } else {
                break;
            }
        }

        return newSessionID;
    },

    'updateUserListData': function (sessionID, username) {
        let existingUser = false;
        let query = UserScores.findOne({sessionID: sessionID});

        // if no username is passed in, it means that we're trying to access an existing session
        if (typeof username === 'undefined') {
            if(query === undefined) {
                throw new Meteor.Error('updateUserListData.findExistingUserBySessionID', "Whoops, couldn't find any existing session with ID " + sessionID);
            }
            username = query.username;
            existingUser = true;
        }

        wrappedHTTPGetCall = Meteor.wrapAsync(HTTP.get);
        result = wrappedHTTPGetCall("https://myanimelist.net/malappinfo.php?u=" + username + "&status=completed&type=anime", {});
        wrappedParseStringCall = Meteor.wrapAsync(xml2js.parseString);
        try {
            parseResult = wrappedParseStringCall(result.content);
        } catch (parseResultError) {
            throw new Error("updateUserListData.parseXML2JS");
        }
        if (parseResult.myanimelist == "") {
            throw new Meteor.Error("updateUserListData.incorrectUserID",
                "Failed to get user data from endpoint - Have you entered your user ID correctly?");
        }

        webAnimeDetailsArray = parseResult.myanimelist.anime;

        if(existingUser) {
            updateExistingListWithWebList(query.animeDetailsArray, webAnimeDetailsArray, sessionID);
        } else {
            addEntryForNewSession(webAnimeDetailsArray, sessionID, username);
        }

        return "daijobu";
    },

    'updateAnimeScores': function (sessionID, comparisonObject) {
        animeDetailsArray = UserScores.findOne({sessionID: sessionID}).animeDetailsArray;
        winningAnime = _.findWhere(animeDetailsArray, {ID: comparisonObject.winningAnimeID});
        winningAnime.score += 0.1;

        UserScores.update({sessionID: sessionID}, {
            $set: {"animeDetailsArray": animeDetailsArray}
        }, function (databaseUpdateError, databaseUpdateResult) {
            if (databaseUpdateError) {
                throw new Error("updateAnimeScores.updateDatabase");
            }
        });
    }
});

addEntryForNewSession = function (webAnimeDetailsArray, sessionID, username) {
    animeDetailsArray = [];
    _.each(webAnimeDetailsArray, function (anime) {
        animeDetailsArray.push({
            "ID": anime.series_animedb_id[0],
            "score": 25,
            "sigma": 25 / 3,
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
updateExistingListWithWebList = function (existingAnimeDetailsArray, webAnimeDetailsArray, sessionID) {
    existingAnimeIDs = _.pluck(existingAnimeDetailsArray, "ID");
    webAnimeIDs = _.map(webAnimeDetailsArray, function(animeObject) {animeObject.series_animedb_id[0]});

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

    _each(webAnimeDetailsArrayFilteredByAnimeToBeAdded, function (animeObject) {
        updatedExistingAnimeDetailsArray.push({
            "ID": animeObject.series_animedb_id[0],
            "score": 25,
            "sigma": 25 / 3,
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
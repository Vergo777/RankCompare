/**
 * Created by Varun on 05/03/2017.
 */

import {UserScores} from '../lib/collections/database'
import { Random } from 'meteor/random'
import * as trueskill from "trueskill";

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

    /**
     * We have 2 situations here - when BOTH sessionID and username are passed in (for creating a new session) and when
     * only sessionID is passed in (for loading an existing session). Username is passed in through URL hash - when
     * the # isn't present or the stuff after the # is empty, username is null. Note that it's possible for a nefarious
     * user to try and include username through the hash for an existing session, so also need to confirm that the accompanying
     * sessionID does not exist when a username is passed in.
     */
    'updateUserListData': function (sessionID, username) {
        let existingUser = false;
        let query = UserScores.findOne({sessionID: sessionID});

        // if !username -> session must exist, if username -> then session must not exist

        // if no username is passed in, it means that we're trying to access an existing session
        // http://stackoverflow.com/a/5515349
        if (!username) {
            if(query === undefined) {
                throw new Meteor.Error('updateUserListData.findExistingUserBySessionID', "Whoops, couldn't find any existing session with ID " + sessionID);
            }
            username = query.username;
            existingUser = true;
        } else {
        // or if it is passed in, we must make sure that the accompanying session ID does not already exist, otherwise it's
        // an attempt by the user to overwrite an existing session
            if(query !== undefined) {
                throw new Error('updateUserListData.attemptToOverwriteExistingSession');
            }
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
        query = UserScores.findOne({sessionID: sessionID});
        if(query === undefined) {
            throw new Meteor.Error('updateAnimeScores', "Session ID not found - did you mess with the URL?");
        }
        animeDetailsArray = query.animeDetailsArray;
        winningAnimeObject = _.findWhere(animeDetailsArray, {ID: comparisonObject.winningAnimeID});
        losingAnimeObject = _.findWhere(animeDetailsArray, {ID: comparisonObject.losingAnimeID});

        winningAnimePlayer = {};
        losingAnimePlayer = {};
        winningAnimePlayer.skill = [winningAnimeObject.score, winningAnimeObject.sigma];
        losingAnimePlayer.skill = [losingAnimeObject.score, losingAnimeObject.sigma];

        if(comparisonObject.draw) {
            winningAnimePlayer.rank = 1;
            losingAnimePlayer.rank = 1;
        } else {
            winningAnimePlayer.rank = 1;
            losingAnimePlayer.rank = 2;
        }

        trueskill.AdjustPlayers([winningAnimePlayer, losingAnimePlayer]);

        winningAnimeObject.score = winningAnimePlayer.skill[0];
        winningAnimeObject.sigma = winningAnimePlayer.skill[1];

        losingAnimeObject.score = losingAnimePlayer.skill[0];
        losingAnimeObject.sigma = losingAnimePlayer.skill[1];

        UserScores.update({sessionID: sessionID}, {
            $set: {"animeDetailsArray": animeDetailsArray}
        }, function (databaseUpdateError, databaseUpdateResult) {
            if (databaseUpdateError) {
                throw new Error("updateAnimeScores.updateDatabase");
            }
        });

        return "daijobu";
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
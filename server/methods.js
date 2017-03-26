/**
 * Created by Varun on 05/03/2017.
 */

import {UserScores} from '../lib/collections/database'
import { Random } from 'meteor/random'
import * as trueskill from "trueskill";
import {parseResultFromRemoteURL, addEntryForNewSession, filterListByCompletedShows, updateExistingListWithWebList} from '/imports/api/server/methodsFunctions.js';

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
        result = wrappedHTTPGetCall("https://myanimelist.net/malappinfo.php?u=" + username + "&status=all&type=anime", {});
        parseResult = parseResultFromRemoteURL(result.content);

        // MAL's API is trash and returns only ALL the anime, including PTW, currently watching etc. Hence need to filter
        // it to just completed shows manually >_>
        webAnimeDetailsArray = filterListByCompletedShows(parseResult.myanimelist.anime);

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

        return "daijoubu";
    }
});
/**
 * Created by vergo on 3/26/17.
 */

import {UserScores} from '/lib/collections/database';
import chai from 'chai';
import chaixml from 'chai-xml';
import {resetDatabase} from 'meteor/xolvio:cleaner';
import {parseResultFromRemoteURL, updateExistingListWithWebList, addEntryForNewSession, exportList} from '/imports/api/server/methodsFunctions.js';
import '/lib/constants.js';

assert = chai.assert;
expect = chai.expect;

describe('Methods', function () {

    describe('parseResultFromRemoteURL', function () {
        it('should parse Cowboy Bebop and Trigun when passed in well formed user list containing those', function () {
            let malListData = Assets.getText('mockData/malListData.xml');
            let parseResult = parseResultFromRemoteURL(malListData);
            let webAnimeDetailsArray = parseResult.myanimelist.anime;
            assert.equal(webAnimeDetailsArray[0].series_title[0], "Cowboy Bebop");
            assert.equal(webAnimeDetailsArray[1].series_title[0], "Trigun");
        });
    });

    describe('exportList', function () {
        before(function () {
            resetDatabase();
            chai.use(chaixml);
        });

        it('should convert anime details array into XML that can be imported by MAL', function () {
            let existingAnimeDetailsArray = JSON.parse(Assets.getText('mockData/existingAnimeDetailsArray.json'));
            let expectedXML = Assets.getText('mockData/exportListXMLExpected.xml');

            let obtainedXML = exportList(existingAnimeDetailsArray);
            wrappedParseStringCall = Meteor.wrapAsync(xml2js.parseString);

            expect(expectedXML).xml.to.equal(obtainedXML);
        })
    });

    describe('addEntryForNewSession', function () {
        before(function () {
            resetDatabase();
        });

        it('should add shows from input array into database', function () {
            let webAnimeDetailsArray = JSON.parse(Assets.getText('mockData/webAnimeDetailsArray.json'));
            addEntryForNewSession(webAnimeDetailsArray, 1, "Vergo");
            let storedDetails = UserScores.findOne({sessionID: 1});

            assert.equal(storedDetails.username, "Vergo");

            let storedDetailsArray = storedDetails.animeDetailsArray;

            assert.lengthOf(storedDetailsArray, 2);

            assert.equal(storedDetailsArray[0].ID, 1);
            assert.equal(storedDetailsArray[0].score, TRUESKILL_DEFAULT_SCORE);

            assert.equal(storedDetailsArray[1].ID, 3);
            assert.equal(storedDetailsArray[1].score, TRUESKILL_DEFAULT_SCORE);
        })
    });

    describe('updateExistingListWithWebList', function () {
        before(function () {
            resetDatabase();
            UserScores.insert({
                'sessionID': 1,
                'username': "Vergo",
                'animeDetailsArray': []
            });
        });
        it('should sync stored copy of list with list obtained from web', function () {
            let existingAnimeDetailsArray = JSON.parse(Assets.getText('mockData/existingAnimeDetailsArray.json'));
            let webAnimeDetailsArray = JSON.parse(Assets.getText('mockData/webAnimeDetailsArray.json'));
            updateExistingListWithWebList(existingAnimeDetailsArray, webAnimeDetailsArray, 1);
            let storedDetailsArray = UserScores.findOne({sessionID: 1}).animeDetailsArray;

            assert.lengthOf(storedDetailsArray, 2);

            assert.equal(storedDetailsArray[0].ID, 1);
            assert.equal(storedDetailsArray[0].score, 10);

            assert.equal(storedDetailsArray[1].ID, 3);
            assert.equal(storedDetailsArray[1].score, TRUESKILL_DEFAULT_SCORE);
        });
    });
});

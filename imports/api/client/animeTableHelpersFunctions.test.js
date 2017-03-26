/**
 * Created by vergo on 3/26/17.
 */

import {assert} from 'meteor/practicalmeteor:chai';
import {getMinAndMaxScores} from '/imports/api/client/animeTableHelpersFunctions.js';

describe('AnimeTable Helpers', function () {
    describe('getMinAndMaxScores', function () {
        let animeDetailsArray = [
            {
                'ID': 1,
                'score': 9
            },
            {
                'ID': 2,
                'score': 7
            },
            {
                'ID': 3,
                'score': 2
            },
            {
                'ID': 4,
                'score': 5
            }
        ];

        it('should get the two objects with max and min score', function () {
            let minAndMaxScores = getMinAndMaxScores(animeDetailsArray);

            assert.equal(minAndMaxScores.minScore, 2);
            assert.equal(minAndMaxScores.maxScore, 9)
        });
    });
    describe('scalingFunction', function () {
        it('should scale the given input scores to the expected outcomes', function () {

        });
    });
});
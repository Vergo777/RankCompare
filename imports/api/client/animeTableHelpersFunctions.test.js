/**
 * Created by vergo on 3/26/17.
 */

import {assert} from 'meteor/practicalmeteor:chai';
import {getMinAndMaxScores, scalingFunction} from '/imports/api/client/animeTableHelpersFunctions.js';
import '/lib/constants.js';

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
        currentMin = 1;
        currentMax = 49;
        it('should scale the given input scores to the expected outcomes', function () {
            assert.equal(scalingFunction(1, currentMax, currentMin, MAX_SCALED_SCORE, MIN_SCALED_SCORE, SCORE_INCREMENT), 1);
            assert.equal(scalingFunction(5.8, currentMax, currentMin, MAX_SCALED_SCORE, MIN_SCALED_SCORE, SCORE_INCREMENT), 2);
            assert.equal(scalingFunction(10.6, currentMax, currentMin, MAX_SCALED_SCORE, MIN_SCALED_SCORE, SCORE_INCREMENT), 3);
            assert.equal(scalingFunction(15.4, currentMax, currentMin, MAX_SCALED_SCORE, MIN_SCALED_SCORE, SCORE_INCREMENT), 4);
            assert.equal(scalingFunction(20.2, currentMax, currentMin, MAX_SCALED_SCORE, MIN_SCALED_SCORE, SCORE_INCREMENT), 5);
            assert.equal(scalingFunction(25, currentMax, currentMin, MAX_SCALED_SCORE, MIN_SCALED_SCORE, SCORE_INCREMENT), 6);
            assert.equal(scalingFunction(29.8, currentMax, currentMin, MAX_SCALED_SCORE, MIN_SCALED_SCORE, SCORE_INCREMENT), 7);
            assert.equal(scalingFunction(34.6, currentMax, currentMin, MAX_SCALED_SCORE, MIN_SCALED_SCORE, SCORE_INCREMENT), 8);
            assert.equal(scalingFunction(39.4, currentMax, currentMin, MAX_SCALED_SCORE, MIN_SCALED_SCORE, SCORE_INCREMENT), 9);
            assert.equal(scalingFunction(44.2, currentMax, currentMin, MAX_SCALED_SCORE, MIN_SCALED_SCORE, SCORE_INCREMENT), 10);
            assert.equal(scalingFunction(49, currentMax, currentMin, MAX_SCALED_SCORE, MIN_SCALED_SCORE, SCORE_INCREMENT), 10);

            assert.equal(scalingFunction(10.599999, currentMax, currentMin, MAX_SCALED_SCORE, MIN_SCALED_SCORE, SCORE_INCREMENT), 2);
            assert.equal(scalingFunction(10.600001, currentMax, currentMin, MAX_SCALED_SCORE, MIN_SCALED_SCORE, SCORE_INCREMENT), 3);
            assert.equal(scalingFunction(48.999999, currentMax, currentMin, MAX_SCALED_SCORE, MIN_SCALED_SCORE, SCORE_INCREMENT), 10);
            assert.equal(scalingFunction(35, currentMax, currentMin, MAX_SCALED_SCORE, MIN_SCALED_SCORE, SCORE_INCREMENT), 8);

            assert.equal(scalingFunction(13.999999, 44, 2, 3.5, 0.5, 0.5), 1);
            assert.equal(scalingFunction(14.000001, 44, 2, 3.5, 0.5, 0.5), 1.5);
        });
    });
});
/**
 * Created by vergo on 3/26/17.
 */

import {assert} from 'meteor/practicalmeteor:chai';
import {getBestQualityMatch} from '/imports/api/server/publishFunctions';

describe('Publish', function () {
    describe('getBestQualityMatch', function () {
        let animeDetailsArray = [
            {
                "ID": 1,
                "score": 50,
                "sigma": 100,
                "name": "Nisekoi",
                animeDetailsArray: []
            },
            {
                "ID": 2,
                "score": 1,
                "sigma": 50,
                "name": "Oregairu",
                animeDetailsArray: []
            },
            {
                "ID": 3,
                "score": 45,
                "sigma": 50,
                "name": "Shirobako",
                animeDetailsArray: []
            }
        ];

        it('should pick the object with highest sigma and closest score as best match', function () {
            let objectArray = getBestQualityMatch(animeDetailsArray);

            if(objectArray[0].name == "Shirobako") {
                assert.equal(objectArray[0].ID, 3);
                assert.equal(objectArray[1].ID, 1);
            } else if(objectArray[0].name == "Nisekoi") {
                assert.equal(objectArray[0].ID, 1);
                assert.equal(objectArray[1].ID, 3);
            }
        });
    });
});
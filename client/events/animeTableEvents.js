/**
 * Created by Varun on 2017/06/24.
 */

import {createAndDownloadXMLFile} from '/imports/api/client/animeTableEventsFunctions.js';

Template.animeTable.events({
    'click #exportListModalSubmitButton' (event, template) {
        event.preventDefault();
        Meteor.call('exportList', Router.current().params.sessionID, function (error, result) {
            if(error !== undefined)
                sAlert.error(error.reason);

            createAndDownloadXMLFile(result);
        });
    }
});
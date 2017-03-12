/**
 * Created by Varun on 05/03/2017.
 */

Template.homepageForm.events({
    'submit #websiteLoginModal' (event, template) {
        event.preventDefault();
        Meteor.call('getNewSessionID', function (getNewSessionIDError, newSessionID) {
            $("#websiteLoginModal").modal('hide');
            Router.go('animeCompare', {sessionID: newSessionID}, {hash: template.find('#websiteUsername').value});
        });
    }
});
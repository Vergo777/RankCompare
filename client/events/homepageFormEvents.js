/**
 * Created by Varun on 05/03/2017.
 */

Template.homepageForm.events({
    'submit #websiteLoginModal' (event, template) {
        event.preventDefault();
        Meteor.call('getNewSessionID', function (getNewSessionIDError, newSessionID) {
            $("#websiteLoginModal").modal('hide');
            console.log(template.find('#websiteUsername').value);
            Router.go('animeCompare', {sessionID: newSessionID}, {hash: template.find('#websiteUsername').value});
            /*            Meteor.call('updateUserListData', newSessionID, template.find('#websiteUsername').value, function (error, result) {
                            $("#websiteLoginModal").modal('hide');
                            if(error) {
                                sAlert.error(error.reason);
                            } else {
                                Router.go('/animeCompare', {sessionID: newSessionID, username: template.find('#websiteUsername').value});
                            }
                        });*/
        });
    }
});
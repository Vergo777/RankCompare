/**
 * Created by Varun on 05/03/2017.
 */

Router.configure({
    layoutTemplate: 'layout'  //can be any template name
});

Router.route('/', {
    template: 'homepageForm'
});

Router.route('/animeCompare/:sessionID', {
    name: 'animeCompare',
    waitOn: function () {
        params = this.params;

        onErrorFunction = function (error, result) {
            sAlert.error(error.reason);
        };

        Meteor.call('updateUserListData', params.sessionID, params.hash, function (error, result) {
            if(error) {
                sAlert.error(error.reason);
            } else {
                return Meteor.subscribe('animeListData', params.sessionID, {onError: onErrorFunction});
            }
        });
    },
    action: function () {
        this.render('mainPage');
    }
});
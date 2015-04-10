define(['underscore', 'jquery', 'utils/treeMixin'], function (_, $, tree) {

    'use strict';

    return _.extend({

        // Clean up view DOM bindings and event listeners.
        cleanup: function (rootNode, viewKey) {
            var views = this.getList('view', rootNode);
            var self = this;

            _.each(views, function (view) {
                view.remove();
            });

            return this;
        },

        attachViews: function (rootNode, callback) {
            var views = this.getList('view', rootNode);
            var self = this;
            var expected = _.size(views);
            var loaded = 0;

            _.each(views, function (view) {
                view.attach($('[' + self._attrs.viewId + '="' + view.cid + '"]')[0], {
                    success: function (response) {
                        view.afterRender();
                        loaded++;
                        if (loaded === expected) {
                            callback(null, true);
                        }
                    },
                    error: function (err) {
                        callback(err, null);
                    }
                });
            });

            return this;
        }

    }, tree);

});
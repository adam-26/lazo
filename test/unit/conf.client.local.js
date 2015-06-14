define(['intern/dojo/text!lib/common/resolver/paths.json', 'test/mocks/lazo', 'intern/dojo/text!conf.json'],
    function (paths, lazo, conf) {

    'use strict';

    paths = JSON.parse(paths);
    conf = JSON.parse(conf);

    try {
        window.LAZO = lazo;
        // used to skip tests in testing environments that do not support specific
        // browser event, e.g., link.onload
        window.lazoLocalTesting = true;
    } catch (err) {
        global.LAZO = lazo;
    }
    LAZO.app.isServer = false;
    LAZO.app.isClient = true;
    LAZO.isServer = false;
    LAZO.isClient = true;

    var needle = '/{env}/';
    var serverPaths = {};
    var env = LAZO.app.isServer ? 'server' : 'client';
    var replace = '/' + env + '/';

    for (var k in paths.common) { // update env specific implementation paths
        paths.common[k] = paths.common[k].replace(needle, replace);
    }
    for (k in paths[env]) { // merge env specific paths
        paths.common[k] = paths[env][k];
    }

        //paths.common['sinon'] = 'node_modules/sinon/lib/sinon';
        //paths.common['sinon-chai'] = 'node_modules/sinon-chai/lib/sinon-chai';
        //paths.common['sinon-event'] = 'node_modules/sinon/lib/sinon/util/event';
        //paths.common['sinon-xhr'] = 'node_modules/sinon/lib/sinon/util/fake_xml_http_request';
        //
        //// conf.requirejs.client.shim['sinon-chai'] = { deps: ['sinon'] };
        //conf.requirejs.client.shim['sinon-event'] = { deps: ['sinon'] };
        //conf.requirejs.client.shim['sinon-xhr'] = { deps: ['sinon-event'] };

    return {

        environments: [
            // { browserName: 'firefox' },
            // { browserName: 'safari' },
            { browserName: 'chrome' }
        ],

        excludeInstrumentation: /^(?:test|node_modules|lib\/vendor)\//,

        useLoader: {
            'host-browser': '../../node_modules/requirejs/require.js'
        },

        loader: {
            shim: conf.requirejs.client.shim,
            paths: paths.common,
            map: {
                intern: {
                    dojo: 'intern/node_modules/dojo',
                    chai: 'intern/node_modules/chai/chai'
                },
                '*': {
                    // testing libs
                    sinon: 'node_modules/sinon/lib/sinon',
                    'sinon-chai': 'node_modules/sinon-chai/lib/sinon-chai',
                    //'sinon-event': '../../node_modules/sinon/lib/sinon/util/event.js',
                    //'sinon-xhr': '../../node_modules/sinon/lib/sinon/util/fake_xml_http_request.js',
                    'bundler': 'lazoBundle'
                }
            }
        },

        webdriver: {
            host: 'localhost',
            port: 4444
        },

        useSauceConnect: false

    };

});
//define([
//    'intern!bdd',
//    'intern/chai!',
//    'intern/chai!expect',
//    'sinon',
//    'sinon-chai',
//    'proxy',
//    'lazoModel'
//], function (bdd, chai, expect, sinon, sinonChai, Proxy, Model) {
//    chai.use(sinonChai);
//
//    with (bdd) {
//        describe('Client Proxy', function () {
//
//            var proxy;
//            var events;
//            var model;
//            var xhr;
//            var requests;
//
//            before(function () {
//                // xhr = sinon.server.create(); //.useFakeXMLHttpRequest();
//                xhr = sinon.useFakeXMLHttpRequest();
//                requests = [];
//
//                xhr.onCreate = function (xhr) {
//                    requests.push(xhr);
//                };
//            });
//
//            after(function () {
//                xhr.restore();
//            });
//
//            beforeEach(function () {
//                // stubClientRouter(LAZO);
//                var ctx = {};
//                events = [];
//                proxy = new Proxy(ctx);
//                model = new Model({}, { name: 'myModel' });
//
//                model.on('request', function (eventName) { events.push(eventName); });
//                model.on('sync', function (eventName) { events.push(eventName); });
//                model.on('error', function (eventName) { events.push(eventName); });
//            });
//
//            afterEach(function () {
//                model.off('request');
//                model.off('sync');
//                model.off('error');
//            });
//
//            describe('#sync', function () {
//
//                it('should trigger sync event on success', function () {
//                    var dfd = this.async();
//
//                    proxy.sync.call(model, 'create', {
//                        success: function (response) {
//                            expect(events.length).to.equal(2);
//                            expect(events[1]).to.equal('sync');
//                            dfd.resolve();
//                        },
//                        error: function (err) {
//                            dfd.reject();
//                        }
//                    });
//
//                    // Response
//                    requests[0].respond(200, { "Content-Type": "application/json" }, '[{ "id": 12, "comment": "Hey there" }]');
//
//                });
//
//                //it('should trigger error event on failure', function () {
//                //        throw new Error('not implemented');
//                //});
//
//            });
//            //
//            //describe('#callSyncher', function () {
//            //
//            //    it('should trigger sync event on success', function () {
//            //        throw new Error('not implemented');
//            //    });
//            //
//            //    it('should trigger error event on failure', function () {
//            //        throw new Error('not implemented');
//            //    });
//            //
//            //});
//
//        });
//    }
//});
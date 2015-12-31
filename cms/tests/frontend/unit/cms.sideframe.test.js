/* global window, document */
'use strict';

describe('CMS.Sideframe', function () {
    fixture.setBase('cms/tests/frontend/unit/fixtures');

    it('creates a Sideframe class', function () {
        expect(CMS.Sideframe).toBeDefined();
    });

    it('has public API', function () {
        expect(CMS.Sideframe.prototype.open).toEqual(jasmine.any(Function));
        expect(CMS.Sideframe.prototype.close).toEqual(jasmine.any(Function));
    });

    describe('instance', function () {
        var sideframe;
        beforeEach(function (done) {
            $(function () {
                sideframe = new CMS.Sideframe();
                done();
            });
        });

        it('has ui', function () {
            expect(sideframe.ui).toEqual(jasmine.any(Object));
            expect(Object.keys(sideframe.ui)).toContain('sideframe');
            expect(Object.keys(sideframe.ui)).toContain('body');
            expect(Object.keys(sideframe.ui)).toContain('window');
            expect(Object.keys(sideframe.ui)).toContain('dimmer');
            expect(Object.keys(sideframe.ui)).toContain('close');
            expect(Object.keys(sideframe.ui)).toContain('resize');
            expect(Object.keys(sideframe.ui)).toContain('frame');
            expect(Object.keys(sideframe.ui)).toContain('shim');
            expect(Object.keys(sideframe.ui)).toContain('historyBack');
            expect(Object.keys(sideframe.ui)).toContain('historyForward');
            expect(Object.keys(sideframe.ui).length).toEqual(10);
        });

        it('has options', function () {
            expect(sideframe.options).toEqual({
                onClose: false,
                sideframeDuration: 300,
                sideframeWidth: 0.8
            });

            sideframe = new CMS.Sideframe({
                onClose: 'something',
                sideframeDuration: 310,
                sideframeWidth: 0.9,
                something: 'else'
            });

            expect(sideframe.options).toEqual({
                onClose: 'something',
                sideframeDuration: 310,
                sideframeWidth: 0.9,
                something: 'else'
            });
        });
    });

    describe('.open()', function () {
        var sideframe;
        var url;

        beforeEach(function (done) {
            fixture.load('sideframe.html');
            CMS.config = {
                request: {}
            };
            CMS.settings = {
                sideframe: {}
            };
            CMS.API.Toolbar = {
                open: jasmine.createSpy(),
                showLoader: jasmine.createSpy(),
                hideLoader: jasmine.createSpy(),
                _lock: jasmine.createSpy()
            };
            $(function () {
                sideframe = new CMS.Sideframe();
                spyOn(sideframe, 'setSettings').and.callFake(function (input) {
                    return input;
                });
                url = '/base/cms/tests/frontend/unit/html/sideframe_iframe.html';
                done();
            });
        });

        afterEach(function () {
            fixture.cleanup();
        });

        it('throws an error if no url was passed', function () {
            expect(sideframe.open.bind(sideframe)).toThrowError(
                Error, 'The arguments passed to "open" were invalid.'
            );
            expect(sideframe.open.bind(sideframe, {})).toThrowError(
                Error, 'The arguments passed to "open" were invalid.'
            );
            expect(sideframe.open.bind(sideframe, {
                url: url
            })).not.toThrow();
        });

        it('shows the dimmer', function () {
            expect(sideframe.ui.dimmer).not.toBeVisible();
            sideframe.open({ url: url });
            expect(sideframe.ui.dimmer).toBeVisible();
        });

        it('shows the toolbar loader', function () {
            expect(CMS.API.Toolbar.showLoader).not.toHaveBeenCalled();
            sideframe.open({ url: url });
            expect(CMS.API.Toolbar.showLoader).toHaveBeenCalled();
        });

        it('shows the loader on the sideframe', function () {
            expect(sideframe.ui.frame).not.toHaveClass('cms-loader');
            sideframe.open({ url: url });
            expect(sideframe.ui.frame).toHaveClass('cms-loader');
        });

        it('correctly modifies the url based on request params', function () {
            spyOn(sideframe, 'makeURL').and.returnValue(url);
            CMS.config.request.tree = 'non-existent-url-part';

            sideframe.open({ url: url });
            expect(sideframe.makeURL.calls.mostRecent().args).toEqual([url, []]);

            CMS.config.request.language = 'ru';
            sideframe.open({ url: url });
            expect(sideframe.makeURL.calls.mostRecent().args).toEqual([url, []]);

            CMS.config.request.language = false;
            CMS.config.request.page_id = 'page_id';
            sideframe.open({ url: url });
            expect(sideframe.makeURL.calls.mostRecent().args).toEqual([url, []]);

            CMS.config.request.language = 'de';
            CMS.config.request.page_id = 'page_id_another';
            sideframe.open({ url: url });
            expect(sideframe.makeURL.calls.mostRecent().args).toEqual([url, []]);

            CMS.config.request.tree = 'sideframe_iframe.html';

            CMS.config.request.language = false;
            CMS.config.request.page_id = false;
            sideframe.open({ url: url });
            expect(sideframe.makeURL.calls.mostRecent().args).toEqual([url, []]);

            CMS.config.request.language = 'ru';
            sideframe.open({ url: url });
            expect(sideframe.makeURL.calls.mostRecent().args).toEqual([url, ['language=ru']]);

            CMS.config.request.language = false;
            CMS.config.request.page_id = 'page_id';
            sideframe.open({ url: url });
            expect(sideframe.makeURL.calls.mostRecent().args).toEqual([url, ['page_id=page_id']]);

            CMS.config.request.language = 'de';
            CMS.config.request.page_id = 'page_id_another';
            sideframe.open({ url: url });
            expect(sideframe.makeURL.calls.mostRecent().args).toEqual(
                [url, ['language=de', 'page_id=page_id_another']]
            );
        });

        it('animates the sideframe to correct width', function () {
            spyOn($.fn, 'animate');
            sideframe.ui.body = $('<div></div>', {
                width: CMS.BREAKPOINTS.mobile + 10
            });

            sideframe.open({ url: url, animate: true });
            expect($.fn.animate).toHaveBeenCalledWith({
                width: '80%',
                overflow: 'visible'
            }, 300);
        });

        it('animates the sideframe to correct width when on mobile', function () {
            spyOn($.fn, 'animate');
            sideframe.ui.body = $('<div></div>', {
                width: CMS.BREAKPOINTS.mobile - 10
            });

            sideframe.open({ url: url, animate: true });
            expect($.fn.animate).toHaveBeenCalledWith({
                width: window.innerWidth,
                overflow: 'visible'
            }, 300);
        });

        it('animates the sideframe to correct width when there was already saved width', function () {
            spyOn($.fn, 'animate');
            sideframe.ui.body = $('<div></div>', {
                width: CMS.BREAKPOINTS.mobile + 10
            });
            CMS.settings.sideframe.position = 200;

            sideframe.open({ url: url, animate: true });
            expect($.fn.animate).toHaveBeenCalledWith({
                width: 200,
                overflow: 'visible'
            }, 300);
        });

        it('does not animate sideframe if sideframe was already open', function () {
            // only works if there was a stored width,
            // because otherwise it's '80%'
            CMS.settings.sideframe.position = 200;
            // has to do this as well since PhantomJS is always 400px wide
            sideframe.ui.body = $('<div></div>', {
                width: CMS.BREAKPOINTS.mobile + 10
            });
            sideframe.open({ url: url, animate: false });
            spyOn($.fn, 'animate');
            sideframe.open({ url: url, animate: true });
            expect($.fn.animate).not.toHaveBeenCalled();
        });

        it('opens the toolbar', function () {
            sideframe.open({ url: url });
            expect(CMS.API.Toolbar.open).toHaveBeenCalled();
        });

        it('locks the toolbar', function () {
            sideframe.open({ url: url });
            expect(CMS.API.Toolbar._lock).toHaveBeenCalledWith(true);
        });

        it('hides the toolbar loader', function () {
            sideframe.open({ url: url });
            expect(CMS.API.Toolbar.hideLoader).toHaveBeenCalled();
        });

        it('prevents scrolling of the outer body for mobile devices', function () {
            spyOn(sideframe, 'preventTouchScrolling');
            spyOn(sideframe, 'allowTouchScrolling');
            sideframe.ui.body.removeClass('cms-prevent-scrolling');

            sideframe.open({ url: url });
            expect(sideframe.ui.body).toHaveClass('cms-prevent-scrolling');
            expect(sideframe.preventTouchScrolling).toHaveBeenCalledWith($(document), 'sideframe');
            expect(sideframe.allowTouchScrolling).not.toHaveBeenCalled();
        });

        it('resets the sideframe history', function () {
            expect(sideframe.history).toEqual(undefined);
            sideframe.open({ url: url });
            expect(sideframe.history).toEqual({
                back: [],
                forward: []
            });

            sideframe.history = 'mock';
            sideframe.open({ url: url });
            expect(sideframe.history).toEqual({
                back: [],
                forward: []
            });
        });

        it('empties frame holder before injecting iframe (to remove events)', function () {
            spyOn($.fn, 'empty').and.callThrough();
            sideframe.ui.frame.append('<div>I should not be here</div>');
            expect(sideframe.ui.frame).toHaveText('I should not be here');
            sideframe.open({ url: url });
            expect(sideframe.ui.frame).not.toHaveText('I should not be here');
            expect($.fn.empty).toHaveBeenCalled();
        });

        it('adds specific classes on the iframe body', function (done) {
            sideframe.open({ url: url });
            expect(sideframe.ui.frame).toContainElement('iframe');

            sideframe.ui.frame.find('iframe').on('load', function () {
                expect($(this.contentDocument.body)).toHaveClass('cms-admin');
                expect($(this.contentDocument.body)).toHaveClass('cms-admin-sideframe');
                done();
            });
        });

        it('adds specific classes on the iframe body if debug mode is on', function (done) {
            CMS.config.debug = true;
            sideframe.open({ url: url });

            sideframe.ui.frame.find('iframe').on('load', function () {
                expect($(this.contentDocument.body)).toHaveClass('cms-debug');
                done();
            });
        });

        it('saves the url in settings', function (done) {
            sideframe.open({ url: url });

            expect(CMS.settings.sideframe).toEqual({});
            sideframe.ui.frame.find('iframe').on('load', function () {
                expect(sideframe.setSettings).toHaveBeenCalled();
                // actual url would be http://localhost:port/${url}
                expect(CMS.settings.sideframe.url).toMatch(new RegExp(url));
                done();
            });
        });

        it('shows iframe after it has been loaded', function (done) {
            sideframe.open({ url: url });

            var iframe = sideframe.ui.frame.find('iframe');
            iframe.on('load', function () {
                expect(iframe).toBeVisible();
                done();
            });
            expect(iframe).not.toBeVisible();
        });

        it('adds target=_top to "view site" links', function (done) {
            sideframe.open({ url: url });

            sideframe.ui.frame.find('iframe').on('load', function () {
                expect($(this.contentDocument.body).find('.viewsitelink')).toHaveAttr('target', '_top');
                done();
            });
        });

        it('is chainable', function () {
            expect(sideframe.open({ url: url })).toEqual(sideframe);
        });
    });

    describe('.close()', function () {
        it('hides the dimmer');
        it('sets correct state');
        it('checks if page requires reloading');
        it('unlocks the toolbar');
        it('removes the loader from sideframe');
        it('restores scrolling of the outer body for mobile devices');
    });
});

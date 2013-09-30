_rekwire.base = '/';

rekwire('addthis', '//s7.addthis.com/js/250/addthis_widget.js#domready=1&async=1');

rekwire('derp');
rekwire('foo');

asyncTest('Loading same origin scripts.', function () {
  expect(2);

  $.when(rekwire('derp'), rekwire('foo')).done(function () {
    equal(derp, 'derp', 'Module "derp" loaded.');
    equal(foo, 'foo', 'Module "foo" loaded.');
    start();
  });
});

asyncTest('Loading external script.', function () {
  expect(1);

  rekwire('addthis').done(function () {
    ok(!!addthis, 'External module "addthis" loaded.');
    start();
  });
});

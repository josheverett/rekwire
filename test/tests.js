window.loadCount = 0;

_rekwire.base = 'fixtures/';

rekwire('derp');
rekwire('foo');

rekwire('addthis', '//s7.addthis.com/js/250/addthis_widget.js#domready=1&async=1');

rekwire('count-loads');

rekwire('A');
rekwire('B');
rekwire('C');
rekwire('D', ['A', 'B', 'C']);
rekwire('X', ['A']);
rekwire('Y', ['D', 'X']);
rekwire('Z', ['X', 'Y']);

test('Arguments test: rekwire(name)', function () {
  rekwire('a');

  equal(typeof _rekwire.a, 'object', 'Module object created.');
  equal(_rekwire.a.path, _rekwire.base + 'a.js', 'Path is correct.');
});

test('Arguments test: rekwire(name, path)', function () {
  rekwire('b', '/foo/bar/b.js');

  equal(typeof _rekwire.b, 'object', 'Module object created.');
  equal(_rekwire.b.path, '/foo/bar/b.js', 'Path is correct.');
});

test('Arguments test: rekwire(name, path, dependencies)', function () {
  rekwire('c', '/foo/bar/c.js', ['a', 'b']);

  equal(typeof _rekwire.c, 'object', 'Module object created.');
  equal(_rekwire.c.path, '/foo/bar/c.js', 'Path is correct.');
  deepEqual(_rekwire.c.dependencies, ['a', 'b'], 'Dependencies are correct.');
});

test('Arguments test: rekwire({ ... })', function () {
  rekwire({
    name: 'd',
    path: '/foo/bar/d.js',
    dependencies: ['a', 'b', 'c']
  });

  equal(typeof _rekwire.d, 'object', 'Module object created.');
  equal(_rekwire.d.path, '/foo/bar/d.js', 'Path is correct.');
  deepEqual(_rekwire.d.dependencies, ['a', 'b', 'c'],
      'Dependencies are correct.');
});

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

asyncTest('Modules are only loaded once.', function () {
  expect(1);

  rekwire('count-loads');
  rekwire('count-loads');
  rekwire('count-loads');

  rekwire('count-loads').done(function () {
    rekwire('count-loads').done(function () {
      equal(window.loadCount, 1, 'Module "count-loads" was only loaded once.');
      start();
    });
  });

  rekwire('count-loads');
  rekwire('count-loads');
  rekwire('count-loads');
});

asyncTest('Rekwired scripts load in order.', function () {
  expect(1);

  rekwire(['A', 'B', 'C']).done(function () {
    ok(true, 'Error will be thrown if this test fails.');
    start();
  });
});

asyncTest('Simple dependency tree loads in order.', function () {
  expect(1);

  rekwire('D').done(function () {
    ok(true, 'Error will be thrown if this test fails.');
    start();
  });
});

asyncTest('Complex dependency tree loads in order.', function () {
  expect(1);

  rekwire('Z').done(function () {
    ok(true, 'Error will be thrown if this test fails.');
    start();
  });
});

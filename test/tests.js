window.loadCount = 0;

_rekwire.base = 'fixtures/';
_rekwire.expires = Date.now() + 86400000; // One day.

rekwire('derp');
rekwire('foo');

rekwire('underscore', '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min.js');

rekwire('count-loads');

rekwire('A');
rekwire('B');
rekwire('C');
rekwire('D', ['A', 'B', 'C']);
rekwire('X', ['A']);
rekwire('Y', ['X']);
rekwire('Z', ['D', 'Y']);

test('Arguments test: rekwire(name)', function () {
  rekwire('a');

  equal(typeof _rekwire.modules.a, 'object', 'Module object created.');
  equal(_rekwire.modules.a.path, _rekwire.base + 'a.js', 'Path is correct.');
});

test('Arguments test: rekwire(name, path)', function () {
  rekwire('b', '/foo/bar/b.js');

  equal(typeof _rekwire.modules.b, 'object', 'Module object created.');
  equal(_rekwire.modules.b.path, '/foo/bar/b.js', 'Path is correct.');
});

test('Arguments test: rekwire(name, path, dependencies)', function () {
  rekwire('c', '/foo/bar/c.js', ['a', 'b']);

  equal(typeof _rekwire.modules.c, 'object', 'Module object created.');
  equal(_rekwire.modules.c.path, '/foo/bar/c.js', 'Path is correct.');
  deepEqual(_rekwire.modules.c.dependencies, ['a', 'b'],
      'Dependencies are correct.');
});

test('Arguments test: rekwire(name, dependencies)', function () {
  rekwire('d', ['a', 'b', 'c']);

  equal(typeof _rekwire.modules.d, 'object', 'Module object created.');
  equal(_rekwire.modules.d.path, _rekwire.base + 'd.js', 'Path is correct.');
  deepEqual(_rekwire.modules.d.dependencies, ['a', 'b', 'c'],
      'Dependencies are correct.');
});

test('Arguments test: rekwire({ ... })', function () {
  rekwire({
    name: 'e',
    path: '/foo/bar/e.js',
    dependencies: ['a', 'b', 'c', 'd']
  });

  equal(typeof _rekwire.modules.e, 'object', 'Module object created.');
  equal(_rekwire.modules.e.path, '/foo/bar/e.js', 'Path is correct.');
  deepEqual(_rekwire.modules.e.dependencies, ['a', 'b', 'c', 'd'],
      'Dependencies are correct.');
});

asyncTest('Loading same origin script.', function () {
  expect(1);

  rekwire('derp').done(function () {
    equal(derp, 'derp', 'Module "derp" loaded.');
    start();
  });
});

asyncTest('Loading external script.', function () {
  expect(1);

  rekwire('underscore').done(function () {
    equal(typeof _, 'function', 'External module "underscore" loaded.');
    start();
  });
});

asyncTest('rekwire([module1, module2, ...moduleN])', function () {
  expect(2);

  rekwire(['derp', 'foo']).done(function () {
    equal(derp, 'derp', 'Module "derp" loaded.');
    equal(foo, 'foo', 'Module "foo" loaded.');
    start();
  });
});

// TODO: A bunch of localStorage tests.
test('Loaded modules are in local storage.', function () {
  ok(localStorage.getItem('rekwire.derp'), 'Module "derp" in storage.');
  ok(localStorage.getItem('rekwire.foo'), 'Module "foo" in storage.');
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

asyncTest('Simple dependency tree loads OK.', function () {
  expect(1);

  rekwire('D').done(function () {
    equal(typeof D, 'function', 'Module "D" loaded.');
    start();
  });
});

asyncTest('Complex dependency tree loads OK.', function () {
  expect(1);

  rekwire('Z').done(function () {
    equal(typeof Z, 'function', 'Module "Z" loaded.');
    start();
  });
});

# rekwire

rekwire is a small utility built on jQuery for loading JavaScript modules
progressively/lazily in the browser. rekwire supports defining dependencies to
make sure your modules load in the proper order, and has an optional
localStorage plugin.

rekwire is under 500 bytes minified/gzipped, or about 1kb when including the
localStorage plugin.

--------------------------------------------------------------------------------

## Usage

Summary:

    rekwire('module-name', 'path/to/module.js', ['module', 'deps']); // Define.

    rekwire('module-name').done(function () { ... }); // Use.

### Defining Modules

The basic syntax to define a module is the following:

    rekwire('module-name', 'path/to/module.js', ['module', 'dependencies']);

#### Modules can also be defined using only their name.

    rekwire('module-name');

Is equivalent to:

    rekwire('module-name', 'module-name.js');

#### Use the `_rekwire.base` option to set the base path for your scripts.

    _rekwire.base = '//static.my.site/js/';

    rekwire('a');
    rekwire('b');

Is equivalent to:

    rekwire('a', '//static.my.site/js/a.js');
    rekwire('b', '//static.my.site/js/b.js');

#### Additional Syntaxes for Defining Modules

`rekwire(name, dependencies)`

    rekwire('module-name', ['a', 'b']);

`rekwire(config)`

    rekwire({
      name: 'module-name',
      path: 'path/to/module.js', // Optional.
      dependencies: ['a', 'b'] // Optional.
    });

### Using Modules

Once defined, a module may be used by calling `rekwire('module-name')`. This
will return a jQuery `Deferred` promise for the module, which you can use to
define callbacks to run when the module loads (or fails to load).

When a module is rekwired, its dependencies will first be loaded, as will the
dependencies for those dependencies and so on, to make sure your modules load in
the proper order. Only when all dependent modules have been loaded will the
rekwired module load and resolve its `Deferred`.

#### Choose Your Own Destiny

There are two basic ways to leverage this behavior. Depending on your use case,
you may find one or the other (or a mix of both) to be the best fit.

To help explain these strategies, consider three modules: A `foo` module which
depends on two other modules, `bar` and `derp`. The `foo` module uses some code
from the `bar` module to boot itself up, and uses some code from the `derp`
module when the user clicks on a button. If one were loading these modules
synchronously on the page, the code for the `foo` module might look like this:

    /* foo.js */
    var data = bar.getData();

    // Do something interesting with `data`.

    $('.btn').click(derp.handleButtonClick);

##### Classic

The simple way to employ rekwire in this situation would be to define the
dependencies of `foo` as any modules containing code that `foo` might ever need:

    /* rekwire config */
    rekwire('foo', ['bar', 'derp']);

The major benefit to this approach is that any code that assumes
traditional/synchronous loading of JavaScript files will continue to work as-is
without modification.

##### Progressive

To achieve the best progressive loading performance, one can choose not to
define any dependencies at all, and instead rekwire modules on the fly as
needed. In this scenario, the code for the `foo` module might look something
like this:

    /* foo.js */
    rekwire('bar').done(function () {
      var data = bar.getData();

      // Do something interesting with `data`.

      $('.btn').click(function () {
        var args = arguments;

        rekwire('derp').done(function () {
          derp.handleButtonClick.apply(this, args);
        });
      });
    });

The major benefit to this approach is that code that is only required under
certain conditions (e.g. user clicks a button) is never loaded if those
conditions are never met.

##### A Mixed Approach

The `foo` module cannot work without the `bar` module, so we don't gain anything
by progressively loading it from within the `foo` module itself. On the other
hand, quite a bit is gained by not loading the `derp` module until the user
clicks on our button if most users do not perform that action. A mixed approach
to the situation would look something like this:

    /* rekwire config */
    rekwire('foo', ['bar']);

    /* foo.js */
    var data = bar.getData();

    // Do something interesting with `data`.

    $('.btn').click(function () {
      var args = arguments;

      rekwire('derp').done(function () {
        derp.handleButtonClick.apply(this, args);
      });
    });

--------------------------------------------------------------------------------

## localStorage Plugin

### Why a localStorage plugin?

Properly configured caching headers are all one should need to make sure static
resources are only downloaded once by a user's browser. These days, however, the
average web page is over 1mb in size, and as a result it's not uncommon to have
your files prematurely evicted from a user's cache.

This is especially problematic on mobile, where minimizing network overhead is
crucial to achieving top performance. By storing your JavaScript modules in
localStorage, you gain a persistent cache that you are much more in control of.

### Using the localStorage Plugin

The localStorage plugin does not require any configuration. If you include it in
your page, it will immediately start storing fetched JavaScript files into
localStorage. You can even use rekwire to load the localStorage plugin. ;)

The localStorage plugin works by examining the Expires and Cache-Control HTTP
headers attached to the JavaScript files it fetches. It uses this information to
determine how long it should store these files in localStorage. By default, if
no expiration date is found from these headers, the module will not be stored.

Each time the localStorage plugin boots up (i.e. page load), it checks its
manifest of stored modules and removes any that have expired. By default, the
plugin will also remove any modules that have not been loaded by the user for
over one week.

You can also call `_rekwire.clear()` to delete all `rekwire`-related
localStorage objects, or `_rekwire.clear('module-name')` to delete specific
modules.

The implementor is responsible for not filling up the user's localStorage - this
is not handled by rekwire itself. If you deploy versioned static assets with
far-future expiration headers, it is recommended to set a cookie or localStorage
flag for your users indicating the build/version number of your release, and
then simply call `_rekwire.clear()` when the build/version changes as part of
your bootstrapping process.

#### Options

##### Global Options

The localStorage plugin extends the `_rekwire` object with a few new options:
`head`, `decay`, and `expires`.

`head` is a reference to the HEAD element, wrapped in jQuery. This is the
element that will be used as the append target for `script` tags.

`decay` is the amount of time (in ms) a module can go unused by the user before
being deleted from localStorage. Defaults to one week.

`expires` is a default expiration date (Unix time in ms) to apply to files that
for which an expiration date was not found. Defaults to `null`.

##### Module-Level Options

Use `module.expires` to set a specific expiration date (Unix time in ms) for a
module.

Set `module.noStore` to `true` to blacklist a module from being saved in
localStorage.

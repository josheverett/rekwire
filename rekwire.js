window._rekwire = {
  base: '',
  modules: {}
};

window.rekwire = function (name, path, dependencies) {
  var depsLoaded = $.Deferred().resolve(),
      module;

  // rekwire([module1, module2, ...moduleN])
  if ($.isArray(name)) {
    return $.when.apply($, $.map(name, rekwire));
  }

  // rekwire({ name: 'foo', 'path': 'bar/foo.js', dependencies: [ ... ] })
  if ($.isPlainObject(name)) {
    path = name.path;
    dependencies = name.dependencies;
    name = name.name;
  }

  // rekwire(name, dependencies)
  if ($.isArray(path)) {
    dependencies = path;
    path = undefined;
  }

  module = _rekwire.modules[name];

  if (!module) {
    path = path || _rekwire.base + name + '.js';

    _rekwire.modules[name] = {
      path: path,
      dependencies: dependencies || [],
      loading: false,
      loaded: false,
      dfd: null
    };

    return;
  }

  if (module.loaded) {
    return module.dfd.resolve();
  }

  if (module.loading) {
    return module.dfd.promise();
  }

  module.loading = true;
  module.dfd = $.Deferred();

  if (module.dependencies.length) {
    depsLoaded = rekwire(module.dependencies);
  }

  depsLoaded.done(function () {
    $.ajax({
      url: module.path,
      dataType: 'script',
      cache: true
    })
    .done(function () {
      module.loaded = true;
      module.dfd.resolve(arguments);
    })
    .fail(module.dfd.reject);
  });

  return module.dfd.promise();
};

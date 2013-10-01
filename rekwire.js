window._rekwire = { base: '' };

window.rekwire = function (name, path, dependencies) {
  var module;

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

  module = _rekwire[name];

  if (!module) {
    path = path || _rekwire.base + name + '.js';

    _rekwire[name] = {
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

  return module.dfd.promise();
};

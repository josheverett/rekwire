/*
 * rekwire
 * Josh Everett
 * MIT License
*/

window._rekwire = { base: '' };

window.rekwire = function (name, path) {
  var module = _rekwire[name];

  if (!module) {
    path = path || _rekwire.base + name + '.js';

    _rekwire[name] = {
      path: path,
      loading: false,
      loaded: false,
      dfd: null
    };

    return;
  }

  if (module.loaded) {
    return dfd.resolve();
  }

  if (module.loading) {
    return module.dfd.promise();
  }

  module.loading = true;
  module.dfd = $.Deferred();

  $.getScript(module.path)
    .done(function () {
      module.loaded = true;
      return module.dfd.resolve(arguments);
    })
    .fail(function () {
      return module.dfd.reject(arguments);
    });

  return module.dfd.promise();
};

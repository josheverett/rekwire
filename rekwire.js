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

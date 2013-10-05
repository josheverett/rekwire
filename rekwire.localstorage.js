(function () {

function appendModule (module, content) {
  _rekwire.head.append('<script>' + content + '</script>');
  updateLastUsed(module.name);
}

function deleteExpiredItems () {
  var now = Date.now(),
      decay = now - _rekwire.decay;

  $.each(getManifest(), function (name) {
    var expires = getExpires(name),
        lastUsed = getLastUsed(name);

    if (now > expires || decay > expires) {
      deleteModule(name);
    }
  });
}

function deleteModule (name) {
  removeItem(LOCAL_STORAGE_PREFIX + name);
  removeItem(PATH_PREFIX + name);
  removeItem(EXPIRES_PREFIX + name);
  removeItem(LAST_USED_PREFIX + name);
}

function getExpires (name) {
  return getItem(EXPIRES_PREFIX + name);
}

function getHeaderExpires (jqXhr) {
  var expires = new Date(jqXhr.getResponseHeader('Expires')).getTime(),
      cacheControl = jqXhr.getResponseHeader('Cache-Control') || '',
      matches = cacheControl.match(/\smax-age=(\d+)/i),
      maxAge = matches && matches[1];

  if (!isNaN(expires)) {
    return expires;
  }

  if (maxAge) {
    return Date.now() + (maxAge * 1000);
  }

  return null;
}

function getLastUsed (name) {
  return getItem(LAST_USED_PREFIX + name);
}

function getManifest () {
  return JSON.parse(getItem(MANIFEST)) || {};
}

function getModule (name) {
  return getItem(LOCAL_STORAGE_PREFIX + name);
}

function getPath (name) {
  return getItem(PATH_PREFIX + name);
}

function setExpires (name, expires) {
  setItem(EXPIRES_PREFIX + name, expires);
}

function setManifest (manifest) {
  setItem(MANIFEST, JSON.stringify(manifest));
}

function setPath (name, path) {
  setItem(PATH_PREFIX + name, path);
}

function setModule (name, content) {
  setItem(LOCAL_STORAGE_PREFIX + name, content);
}

function storeResponse (module, content, jqXhr) {
  var expires = module.expires || getHeaderExpires(jqXhr) || _rekwire.expires,
      manifest;

  if (!expires || module.noStore) {
    deleteModule(module.name);
    return;
  }

  manifest = getManifest();
  manifest[module.name] = Date.now();

  setManifest(manifest);
  setModule(module.name, content);
  setPath(module.name, module.path);
  setExpires(module.name, expires);
}

function updateLastUsed (name) {
  setItem(LAST_USED_PREFIX + name, Date.now());
}

var ls = localStorage,
    getItem = $.proxy(ls.getItem, ls),
    setItem = $.proxy(ls.setItem, ls),
    removeItem = $.proxy(ls.removeItem, ls),

    LOCAL_STORAGE_PREFIX = 'rekwire.',
    PATH_PREFIX = LOCAL_STORAGE_PREFIX + '_path.',
    EXPIRES_PREFIX = LOCAL_STORAGE_PREFIX + '_expires.',
    LAST_USED_PREFIX = LOCAL_STORAGE_PREFIX + '_lastUsed.',
    MANIFEST = LOCAL_STORAGE_PREFIX + '_manifest';

_rekwire.head = $(document.head);
_rekwire.decay = 604800000; // One week.
_rekwire.expires = null;

_rekwire.clear = function (name) {
  if (name) {
    return deleteModule(name);
  }

  $.each(getManifest(), deleteModule);
  removeItem(MANIFEST);
};

_rekwire.loadModule = function (module) {
  var item = getModule(module.name),
      path = item && getPath(module.name);

  if (item && path == module.path) {
    appendModule(module, item);
    return $.Deferred().resolve();
  }

  return $.ajax({
    url: module.path,
    dataType: 'text',
    cache: true
  })
  .done(function (content, status, jqXhr) {
    storeResponse(module, content, jqXhr);
    appendModule(module, content);
  });
};

deleteExpiredItems();

})();

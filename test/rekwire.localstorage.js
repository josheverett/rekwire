(function () {

function appendAndResolve (module, content) {
  _rekwire.head.append('<script>' + content +'</script>');

  module.loaded = true;
  module.dfd.resolve();

  updateLastUsed(module.name);
}

function deleteExpiredItems () {
  // also/todo: keep track of last loaded date for each module, and delete stuff
  // that hasn't been used for a week or more.
}

function deleteModule (name) {
  localStorage.removeItem(LOCAL_STORAGE_PREFIX + name);
  localStorage.removeItem(PATH_PREFIX + name);
  localStorage.removeItem(EXPIRES_PREFIX + name);
  localStorage.removeItem(LAST_USED_PREFIX + name);
}

function fetch (url) {
  return $.ajax({
    url: url,
    dataType: 'text',
    cache: true
  });
}

function getExpires (name) {
  return localStorage.getItem(EXPIRES_PREFIX + name);
}

function getManifest () {
  return JSON.parse(localStorage.getItem(MANIFEST)) || {};
}

function getModule (name) {
  return localStorage.getItem(LOCAL_STORAGE_PREFIX + name);
}

function getPath (name) {
  return localStorage.getItem(PATH_PREFIX + name);
}

function setExpires (name, expires) {
  localStorage.setItem(EXPIRES_PREFIX + name, expires);
}

function setManifest (manifest) {
  localStorage.setItem(MANIFEST, JSON.stringify(manifest));
}

function setPath (name, path) {
  localStorage.setItem(PATH_PREFIX + name, path);
}

function setModule (name, content) {
  localStorage.setItem(LOCAL_STORAGE_PREFIX + name, content);
}

function storeResponse (module, content, jqXhr) {
  /*var cacheControl = jqXhr.getResponseHeader('Cache-Control'),
      etag = jqXhr.getResponseHeader('ETag'),
      expires = jqXhr.getResponseHeader('Expires'),
      lastModified = jqXhr.getResponseHeader('Last-Modified'); // probably nuke*/

  // TODO: Don't store scripts with etag but no cache-control or
  // expires headers.

  // TODO: Use caching headers to determine expires.
  var expires = Date.now() + 86400000, // temp: one day
      manifest = getManifest();

  manifest[module.name] = Date.now();

  setManifest(manifest);
  setModule(module.name, content);
  setPath(module.name, module.path);
  setExpires(module.name, expires);
}

function updateLastUsed (name) {
  localStorage.setItem(LAST_USED_PREFIX + name, Date.now());
}

var LOCAL_STORAGE_PREFIX = 'rekwire.',
    PATH_PREFIX = LOCAL_STORAGE_PREFIX + '_path.',
    EXPIRES_PREFIX = LOCAL_STORAGE_PREFIX + '_expires.',
    LAST_USED_PREFIX = LOCAL_STORAGE_PREFIX + '_lastUsed.',
    MANIFEST = LOCAL_STORAGE_PREFIX + '_manifest';

_rekwire.head = $(document.head);
_rekwire.expires = 604800000; // One week.

_rekwire.clear = function (name) {
  if (name) {
    return deleteModule(name);
  }

  return $.each(getManifest(), deleteModule);
}

_rekwire.loadModule = function (module) {
  var item = getModule(module.name),
      path = item && getPath(module.name);

  if (item && path == module.path) {
    appendAndResolve(module, item);
  } else {
    fetch(module.path)
    .done(function (content, status, jqXhr) {
      storeResponse(module, content, jqXhr);
      appendAndResolve(module, content);
    })
    .fail(module.dfd.reject);
  }

  return module.dfd;
};

deleteExpiredItems();

})();

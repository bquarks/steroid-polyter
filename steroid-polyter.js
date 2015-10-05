Polymer({
  is: 'steroid-polyter',

  //Routes added container
  routes: {},

  //Polymer elements rendered container
  instances: {},

  //Default elements container.
  defaultElements: {},

  //Default added extensions.
  defaultExtensions: null,

  _defaultRendered: false,

  _defaultHooks: {},

  _hashbang: false,
  //Route called previous actual.
  previousRoute: null,

  //Route lifecycle
  _stopped: false,
  _triggered: false,


  // Stop the route lifecycle
  stop: function () {
    this._stopped = true;
  },
  
  _unStop: function () {
    var aux = this._stopped;
    this._stopped = false;
    return aux;
  },

  //Redirect to another route.
  redirect: function (route) {
    this.stop();
    //TODO: make something here!
    //this.previousRoute = this.router.path;
    this.beforeRedirect = this.router.path;
    setTimeout(function () { //Put the redirect at the end of de heap
      page.redirect(route);
    }, 0);
  },

  //This hook run before start loading things.
  run: function (route) {

    if (this._defaultHooks.run) {
      this._defaultHooks.run.call(this);
    }

    if (route && route.run) {
      route.run.call(this);
    }
    return this._unStop();
  },

  //Here you can put async code and wait for it
  wait: function (route, cb) {
    if (this._defaultHooks.wait) {
     this._defaultHooks.wait.call(this, function () {
       if (route && route.wait) {
         route.wait.call(this, cb);
       }
       else {
           cb();
       }
     });
     return;
   }

   if (route && route.wait) {
     route.wait.call(this, cb);
   }
   else {
       cb();
   }
  },

  //Here you have the extensions instances
  before: function (route) {

    if (this._defaultHooks.before) {
      this._defaultHooks.before.call(this);
    }

    if (route && route.before) {
      route.before.call(this);
    }

    return this._unStop();
  },

  //Here you have the element instances
  action: function (route) {

    if (this._defaultHooks.action) {
      this._defaultHooks.action.call(this);
    }

    if (route && route.action) {
        route.action.call(this);
    }

    return this._unStop();
  },

  //Here the elements are rendered
  after: function (route, routeName) {

    if (this._defaultHooks.after) {
      this._defaultHooks.after.call(this);
    }

    if (route && route.after) {
      route.after.call(this);
    }
    this.previousRoute = routeName;
    return this._unStop();
  },

  //Before stop the route
  onStop: function (routeName) {
    this.stopped = false;
    var pRoute = this.routes[this.previousRoute];


    if (this.previousRoute && pRoute) {
      if (this._defaultHooks.stop) {
        this._defaultHooks.stop.call(this);
      }

      if (pRoute.stop) {
        pRoute.stop.call(this);
      }
    }
  },


  created: function () {
    Polyter = this;
    console.log('### Polyter created ###');
  },

  // Extensions container
  ext: {},

  _injectExtensions: function (extName) {
    if (extName instanceof Array) {

      if (this.defaultExtensions) {
        extName = _.union(extName, this.defaultExtensions);
      }
    }
    else {
      extName = this.defaultExtensions;
    }

    for (var i = extName.length; i-- > 0;) {
      if (!this.ext[extName[i]]) {
        this.ext[extName[i]] = document.createElement(extName[i]);
        //TODO: add factoryImpl call.
      }
    }

  },

  _callFactoryImpl: function () {
    for (var ext in this.ext) {
      if (this.ext.hasOwnProperty(ext)) {
        if (typeof this.ext[ext].factoryImpl == 'function') {
          this.ext[ext].factoryImpl.call(this.ext[ext]);
        }
      }
    }
  },

  _clearInstances: function (elementName) {
    var instances = Object.getOwnPropertyNames(this.instances),
        def = _.values(this.defaultElements);

    def.push(elementName);

    var diff = _.difference(instances, def);

    for (var i = diff.length; i-- > 0;) {
      var inst = this.instances[diff[i]];

      if (inst.remove) {
        inst.remove();
      }
      else if (inst.parentNode) {
        inst.parentNode.removeChild(inst);
      }

      delete this.instances[diff[i]]; //TODO: make sure of this!
    }

  },

  _instantiateDef: function () {
    for (var region in this.defaultElements) {
      if (this.defaultElements.hasOwnProperty(region)) {
        var name = this.defaultElements[region];

        if (name) {
          this._instantiate(name);
        }
      }
    }
  },

  _instantiate: function (elementName) {

    if (!this.instances[elementName]) {
      this.instances[elementName] = document.createElement(elementName);
    }

    this.instances[elementName].name = elementName;
    //TODO: make this better.
    this.instances[elementName].ext = this.ext;
    this.instances[elementName].router = this.router;
  },

  _renderDef: function () {
    for (var region in this.defaultElements) {
      if (this.defaultElements.hasOwnProperty(region)) {
        var name = this.defaultElements[region];

        if (name) {
          this._render(name, region);
        }
      }
    }
  },

  _render: function (elementName, region) {
    this.schema[region ? region : 'main'].appendChild(this.instances[elementName]);
  },


  //Load the elements with attr region on it like schema elements.
  loadSchema: function () {
    if (!this.schema) {
      var _this = this;

      _this.schema = {};

      _.each(Polymer.dom(_this).querySelectorAll('*[region]'), function (el) {
        var region = el.attributes.region;
        if (region && region.value) {
          _this.schema[region.value] = el;
        }
      });

    }
  },

  _updateCtx: function () {
    for (var region in this.defaultElements) {
      if (this.defaultElements.hasOwnProperty(region)) {
        var name = this.defaultElements[region];

        if (name && this.instances[name]) {
          this.instances[name].router = this.router;
        }
      }
    }
  },

  //Add a route with options.
  addRoute: function (routeName, options) {
    var _this = this;

    //We need load the schema here?
    this.loadSchema();

    var route = options;

    this.routes[routeName] = route;
    console.log('Adding route! ', routeName);
    page(routeName, function (ctx) {
      _this.executed = true;

      if (_this._triggered) {
        _this.router = ctx;
        _this._triggered = false;
        return;
      }

      _this.onStop(routeName);

      //_.extend(_this, ctx);
      //TODO: check why params is rewrited by pages!
      _this.router = ctx;

      if (_this.run(route)) {
        return;
      }

      _this._injectExtensions(route.extensions);

      _this._updateCtx();

      _this.wait(route, function () {
        if (_this.before(route)) {
          return;
        }

        _this._callFactoryImpl();

        var elements = route.layout;
        if (elements) {
          //TODO: Do the logic for the elements here
          _this.defaultAux = _this.defaultElements;
          _this.defaultElements = elements;
        }

        if (routeName === _this.previousRoute && _this.instances[route.element]) {
          _this.instances[route.element].router = ctx;
        }
        else {

          //TODO: make this more clean
          if (!_this._defaultRendered) {
            _this._instantiateDef();
          }

          _this._instantiate(route.element);

          if (_this.action(route)) {
            return;
          }
          _this._clearInstances(route.element);

          //TODO: make this more clean
          if (!_this._defaultRendered) {
            _this._renderDef();
            _this._defaultRendered = true;
          }

          _this._render(route.element, route.region);
        }

        if (_this.after(route, routeName)) {
          return;
        }

        if (_this.defaultAux) {
          _this.defaultElements = _this.defaultAux;
          _this.defaultAux = null;
          _this._defaultRendered = false;
        }
      });

    });

    //TODO: this is not very clean!
    if (!_this.executed) {
      if (!_this.started) {
        page.start({hashbang: _this._hashbang});
        _this.started = true;
        console.log('### Polyter Started ###');
      }
      else {
        _this.go(window.location.hash);
      }
    }
    else {
      page.startEvent();
    }

  },

  //Add a default configuration
  defaultConfig: function (options) {
    //Load layout
    if (!options) return;

    var layEl = options.layout;

    if (layEl) {
      this.defaultElements = layEl;
    }

    //Default Extensions
    if (options.extensions instanceof Array) {
      this.defaultExtensions = options.extensions;
    }

    //Default hooks
    if (options.hooks) {
      var hooks = options.hooks;
      for (var hook in hooks) {
        if (hooks.hasOwnProperty(hook)) {
          if (typeof hooks[hook] === 'function') {
            this._defaultHooks[hook] = hooks[hook];
          }
        }
      }
    }

    //Load hashband
    if (options.hashbang) {
      this._hashbang = true;
    }

  },

  //Go to another route with extra options like {trigger: false}.
  go: function (route, options) { //TODO: {trigger: false, ...};
    if (route) {
      //this.stop();
      if (options) {
        if (options.silent === true) {
          this._triggered = true;
          page.show(route, undefined, undefined, false);
          window.history.replaceState(undefined, undefined, route);
        }
        else if (options.trigger === false) {
          this._triggered = true;
          page.show(route);
        }
      }
      else {
        page.show(route);
      }
    }
  },

  back: function () {
    window.history.back();
  }
});

Polymer({
  is: 'steroid-polyter',

  routes: {},

  instances: {},

  defaultElements: {},

  defaultExtensions: null,

  _defaultRendered: false,

  _defaultHooks: {},

  previousRoute: null,

  //Route lifecycle
  _stopped: false,
  _triggered: false,

  stop: function () {
    this._stopped = true;
  },

  redirect: function (route) {
    // this.stop();
    //TODO: make something here!
    page.redirect(route);
  },

  //This hook run before start loading things.
  run: function (route) {

    if (this._defaultHooks.run) {
      this._defaultHooks.run.call(this);
    }

    if (route && route.run) {
      route.run.call(this);
    }

    return this._stopped;
  },

  //Here you have the extensions instances
  before: function (route) {

    if (this._defaultHooks.before) {
      this._defaultHooks.before.call(this);
    }

    if (route && route.before) {
      route.before.call(this);
    }

    return this._stopped;
  },

  //Here you have the element instances
  action: function (route) {

    if (this._defaultHooks.action) {
      this._defaultHooks.action.call(this);
    }

    if (route && route.action) {
        route.action.call(this);
    }

    return this._stopped;
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
    return this._stopped;
  },

  //Before stop the route
  onStop: function (routeName) {
    this.stopped = false;
    var pRoute = this.routes[this.previousRoute];

    if (this.previousRoute && pRoute && pRoute.stop) {
      pRoute.stop();
    }
  },

  // Lifecycle callbacks from polymer

  created: function () {
    Polyter = this;
    console.log('### Polyter created ###');
  },

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
    console.log(def, instances);
    var diff = _.difference(instances, def);
    console.log(diff);
    for (var i = diff.length; i-- > 0;) {
      this.instances[diff[i]].remove();
    }

  },

  _instantiateDef: function () {
    for (var region in this.defaultElements) {
      if (this.defaultElements.hasOwnProperty(region)) {
        var name = this.defaultElements[region];

        this._instantiate(name);
      }
    }
  },

  _instantiate: function (elementName) {
    this.instances[elementName] = document.createElement(elementName);
    this.instances[elementName].name = elementName;
    //TODO: make this better.
    this.instances[elementName].ext = this.ext;

    _.defaults(this.instances[elementName], this);
  },

  _renderDef: function () {
    for (var region in this.defaultElements) {
      if (this.defaultElements.hasOwnProperty(region)) {
        var name = this.defaultElements[region];

        this._render(name, region);
      }
    }
  },

  _render: function (elementName, region) {
    this.schema[region ? region : 'main'].appendChild(this.instances[elementName]);
  },

  loadSchema: function () {
    if (!this.schema) {
      var _this = this;

      _this.schema = {};

      _.each(Polymer.dom(_this).querySelectorAll('div[region]'), function (el) {
        var region = el.attributes.region;
        if (region && region.value) {
          _this.schema[region.value] = el;
        }
      });

    }
  },

  addRoute: function (routeName, options) {
    var _this = this;

    //We need load the schema here?
    this.loadSchema();

    var route = options;

    this.routes[routeName] = route;
    console.log('Adding route! ', routeName);
    page(routeName, function (ctx) {

      if (_this._triggered) {
        _this._triggered = false;
        return;
      }
      console.log('Entra en la ruta ' + routeName);

      _this.onStop(routeName);

      _.defaults(_this, ctx);

      if (_this.run(route)) {
        return;
      }

      _this._injectExtensions(route.extensions);

      if (_this.before(route)) {
        return;
      }

      _this._callFactoryImpl();

      var elements = route.layout;
      if (elements) {
        //TODO: Do the logic for the elements here
      }

      if (routeName === _this.previousRoute && _this.instances[route.element]) {
          console.log(_this.previousRoute, routeName);
        _.extend(_this.instances[route.element], _this);
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

    });

    //TODO: not call everytime!
    page.start();

  },

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
          if (typeof hooks[hook] == 'function') {
            this._defaultHooks[hook] = hooks[hook];
          }
        }
      }
    }

  },

  go: function (route, options) { //TODO: {trigger: false, ...};
    if (route) {
      //this.stop();
      if (options && options.trigger) {
        this._triggered = true;
      }
      page(route);
    }
  }
});
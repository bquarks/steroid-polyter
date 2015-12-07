# Polyter

[![Join the chat at https://gitter.im/bquarks/steroid-polyter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/bquarks/steroid-polyter?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

An element providing advanced routing to your polymer apps.
 * Lazy load.
 * Complex layout definition.
 * Add elements as extensions (to the main and sections elements rendered).
 * Hooks (run, wait, before, action, after, stop).
 * Redirections.
 * Inject data to elements by route.

## Using it in your application

Start installing it into your application with Bower

    bower install steroid-polyter

## Basic usage

Configure your layout in html. User `region="region-name"` to set drawable regions into your schema. A reverved word to draw your main content is `main`.

    <steroid-polyter>
        <!-- The regions -->
        <div region="header"></div>
        <div region="sidebar"></div>
        <div region="main"></div>
    </steroid-polyter>

Set the default configuration for the layout schema.

    window.addEventListener('webComponentsReady', function () {
        Polyter.defaultConfig({
            layoutElements: {
                header: 'header-element',
                sidebar: 'sidebar-element'
            }
        });
    });

Add a simple route for a polymer element.

    window.addEventListener('webComponentsReady', function () {
        Polyter.addRoute('/', {
            element: 'page-home'
        });
    });

Add route with params.

    window.addEventListener('webComponentsReady', function () {
        Polyter.addRoute('/store/:category', function () {
            element: 'page-category'
        });
    });

Get params into the polymer element.

    Polymer({
        is: 'page-category',

        created: function () {

            if (this.params.category) {
                //Make something with the params.
            }
        }
    });

## Advanced Usage

### Extensions

A Polyter extension is a Polymer component instance without render into dom.

Define a default extension.

    Polyter.defaultConfig({
        extensions: [polymer-auth, polymer-db]
    });

Define a route extension.

    Polyter.addRoute('/cars', {
        element: 'cars-list',

        extensions: ['price-calculator']
    });

Accessing to an extension.

    //Some script
    Polyter.ext['price-calculator'].getTaxPrice(price);

    //Cars-list main element lifecycle callbacks
    ...
    created: function () {
        this.ext['polymer-db'].find(this.params.id);
    }
    ...

    //Hooks (explained later)
    before: function () {
        if (!this.ext['polymer-auth'].logged()) {
            this.redirect('login');
        }
    }

**If your extension needs some configuration add it in before hook, the polymer method `factoryImpl` will be called just after before hook.**

### Hooks

Polyter have 5 hooks to manage the route lifecycle. You can do anything here. This hooks can be defined by route and by default configuration (complementary).

* **run**: this hook is the first callback in the route lifecycle. You have access to the params here.
* **wait**: here you can wait for some async resources or responses, this method receive a next param, you must call it to continue with the execution.
* **before**: here add the extension instances.
* **action**: here add the layout and main elements instances.
* **after**: here add the layout and main elements rendered instances.
* **stop**: this callback is executed when another route is called.
```
    run: function () {
        //this have the route scope with the params

        //Access to the params.
        console.log('Route params', this.params);

        //Stop the route propagation
        this.stop();

        //Redirect to other route (also stop the route propagation)
        this.redirect('/login');

        //Get the previous route!
        console.log('Previous route: ' + this.previousRoute);

    },
    
    wait: fucntion (next) {
        //route wait until next is called!
        this.ext['poly-ajax'].get('resouce', function (res) {
            //Do something with res here.
            next();
        });
    },

    before: function () {
        //Same as above but now we have the extensions injection.

        //Get example extension information.
        var doc = this.ext['polymer-db'].find(this.params.id);

        if (doc.isValid) {
          // do something
          this.ext.push.send('car-viewed', this.params.id);
        }
        else {
          this.redirect('/error-404');
        }


        // Maintain the route but change the element to render.
        if (!this.ext.auth.isLoggedIn) {
          this.render('my-login', 'main');
        }

    },

    action: function () {
        //Same as above but now we have the instances of the defined elements

        //Get the element instance
        var insPointer = this.instances['cars-list'];

        //Comes from other book?
        if (this.previousRoute === this.route) {
          //Add additional information to the element instance
          // so we can render it with other view.
          insPointer.loadAlternativeView();
        }


    },

    after: function () {
        //Here we have the elements rendered
        this.instances['page-demo'].changeTitle('new title'); //rules!

        //Also we can do the other things but no this.render()

    },

    stop: function () {
        //The route has been changed! Put some information
        // here for the next route.

        this.ext['local-storage'].setAdditionalInfo({previousCar: this.params.id});
    }
```
# Development

## Dependencies

Element dependencies are managed via [Bower](http://bower.io/). You can
install that via:

    npm install -g bower

Then, go ahead and download the element's dependencies:

    bower install


## Playing With Polyter

If you wish to work Polyter in isolation, we recommend that you use
[Polyserve](https://github.com/PolymerLabs/polyserve) to keep your element's
bower dependencies in line. You can install it via:

    npm install -g polyserve

And you can run it via:

    polyserve

Once running, you can preview your element at
`http://localhost:8080/components/steroid-polyter/`, where `steroid-polyter` is the name of the directory containing it.


## Testing Your Element

Simply navigate to the `/test` directory of your element to run its tests. If
you are using Polyserve: `http://localhost:8080/components/steroid-polyter/test/`

## See the demo

Simply navigate to the `/demo` directory of the element to se the demo in action
with Polyserve: `http://localhost:8080/components/steroid-polyter/demo/`

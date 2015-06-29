# Polyter

An element providing advanced routing to your polymer apps

## Using it in your application

Start installing it into your aplication with Bower

    bower install bq-polyter
    
### Layout configuration

Configure your layout in html. User `region="region-name"` to set drawable regions into your schema. A reverved word to draw your main content is `main`.

    <bq-polyter>
        <!-- The regions -->
        <div region="header"></div>
        <div region="sidebar"></div>
        <div region="main"></div>
    </bq-polyter>

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
`http://localhost:8080/components/bq-polyter/`, where `bq-polyter` is the name of the directory containing it.


## Testing Your Element

Simply navigate to the `/test` directory of your element to run its tests. If
you are using Polyserve: `http://localhost:8080/components/bq-polyter/test/`

## See the demo

Simply navigate to the `/demo` directory of the element to se the demo in action
with Polyserve: `http://localhost:8080/components/bq-polyter/demo/`

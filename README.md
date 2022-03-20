# Unforma Club Dialog

# Inspired by [Behance](https://behance.net) gallery modal

## What makes different?

Unlike other libraries that have a `fixed` position on the `modal/top layer` component which results **_bad scroll effect_**. Instead of making the top layer `fixed` position, we do the opposite ways give the bottom layer a `fixed` position and the top layer a `relative` position, so that **_bad scroll effect_** can be avoided.

It has built in **_`Close`_** method if user hit **_`Esc`_** key on their keyboard.
By this time, this component only support querying component using `html id`

## Installation

To install, you can use [npm](https://npmjs.org/) or [yarn](https://yarnpkg.com):

```
npm install --save @unforma-club/dialog
yarn add @unforma-club/dialog
```

## Important Properties

-   Required **_`isOpen`_** `boolean` state
-   Required **_`onRequestClose`_** `void` method for closing this component
-   Required **_`stackId`_** property with existing html `id`
-   Required **_`floatId`_** for dialog `id`

## Example

```jsx
import Dialog from "@unforma-club/dialog";

function App() {
    const [state, setState] = useState(false);

    return (
        <div id="__app">
            <main id="__main">
                <button onClick={() => setState(true)}>Show Modal</button>
                <div>
                    This is main content or will be the bottom layer and will be `fixed` position if
                    `Dialog` showed up
                </div>
            </main>

            <Dialog
                isOpen={state}
                onRequestClose={() => setState(false)}
                parentId="__app"
                stackId="__main"
                floatId="__dialog"
                removeOverscrollBehavior
            >
                <header>This is child header</header>
                <div>This is child content</div>
                <button onClick={() => setState(false)}>Close Modal</button>
            </Dialog>
        </div>
    );
}
```

## License

[MIT](https://choosealicense.com/licenses/mit/)

<p align="center">
JSON TO UI
</p>
<p align="center">JSON based <b>dynamic component or page</b> generation for UI Languages. No HTML or CSS just JSON to create UI.</p>

## Example Component

Component is a reusable block which can compose of multiple nested container or component blocks.

```json
{
    "name": "Button",
    "alias": [],
    "node": "component",
    "element": "button",
    "content": "Generated Button",
    "properties": {
        "style": {
            "height": "60px",
            "width": "200px",
            "backgroundColor": "blue"
        }
    }
}
```

## Example Page

Page is a template block which composes of multiple container or component blocks.

```json
{
    "name": "Home",
    "alias": [],
    "node": "page",
    "element": "div",
    "meta": {
        "title": "Home",
        "description": "This is the meta description for the home page"
    },
    "data": {
        "inputValue": "Hello World"
    },
    "children": [
        {
            "node": "container",
            "element": "div",
            "children": [
                {
                    "node": "component",
                    "element": "input",
                    "properties": {
                        "placeholder": "Please input",
                        "v-model": "inputValue"
                    }
                }
            ]
        }
    ]
}
```

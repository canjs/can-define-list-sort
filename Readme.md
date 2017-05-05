# can-define-list-sort

[![Build Status](https://travis-ci.org/canjs/can-define-list-sort.png?branch=master)](https://travis-ci.org/canjs/can-define-list-sort)

`can-define-list-sort` is a plugin that makes it easy to define and maintain how items are arranged in a [can-define/list/list]. To use it, 
set a `comparator` [can-define/list/list::set set] on a [can-define/list/list]. It can be a `String` or `Function`.

## Overview

Setting a comparator will sort the list immediately and will automatically sort when 
any of its items are changed:

```js
var DefineList = require("can-define/list/list");
require('can-define-list-sort');

var cart = new DefineList([
	{ title: 'Juice', price: 3.05 }
	{ title: 'Butter', price: 3.50 },
	{ title: 'Bread', price: 4.00 }
]);
cart.set("comparator", 'price');
cart[0].price = 5;
cart; // -> [Butter, Bread, Juice]
```

And it will be kept in sorted order when items are pushed, unshifted, or spliced into the [can-define/list/list]:

```js
var cart = new DefineList([
	{ title: 'Juice', price: 3.05 }
	{ title: 'Butter', price: 3.50 },
	{ title: 'Bread', price: 4.00 }
]);
cart.set('comparator', 'price');
cart.push({ title: 'Apple', price: 3.25 });
cart; // -> [Juice, Apple, Butter, Bread]
```

## Usage

### ES6 use

With StealJS, you can import this module directly in a template that is autorendered:

```js
import plugin from 'can-define-list-sort';
```

### CommonJS use

Use `require` to load `can-define-list-sort` and everything else needed to create a template that uses `can-define-list-sort`:

```js
var plugin = require("can-define-list-sort");
```

### AMD use

Configure the `can` and `jquery` paths and the `can-define-list-sort` package:

```html
<script src="require.js"></script>
<script>
	require.config({
	    paths: {
	        "jquery": "node_modules/jquery/dist/jquery",
	        "can": "node_modules/canjs/dist/amd/can"
	    },
	    packages: [{
		    	name: 'can-define-list-sort',
		    	location: 'node_modules/can-define-list-sort/dist/amd',
		    	main: 'lib/can-define-list-sort'
	    }]
	});
	require(["main-amd"], function(){});
</script>
```

### Standalone use

Load the `global` version of the plugin:

```html
<script src='./node_modules/can-define-list-sort/dist/global/can-define-list-sort.js'></script>
```

## Contributing

### Making a Build

To make a build of the distributables into `dist/` in the cloned repository run

```
npm install
node build
```

### Running the tests

Tests can run in the browser by opening a webserver and visiting the `test.html` page.
Automated tests that run the tests from the command line in Firefox can be run with

```
npm test
```

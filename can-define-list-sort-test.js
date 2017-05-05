var DefineList = require("can-define/list/list");
var DefineMap = require("can-define/map/map");
var stache = require("can-stache");
var canBatch = require("can-event/batch/batch");
var QUnit = require("steal-qunit");
var each = require("can-util/js/each/each");

require("can-define-list-sort");

QUnit.module('can-define-list-sort');

test('List events', (4*3), function () {
	var list = new DefineList([{
		name: 'Justin'
	}, {
		name: 'Brian'
	}, {
		name: 'Austin'
	}, {
		name: 'Mihael'
	}]);
	list.set('comparator','name');
	// events on a list
	// - move - item from one position to another
	//          due to changes in elements that change the sort order
	// - add (items added to a list)
	// - remove (items removed from a list)
	// - reset (all items removed from the list)
	// - change something happened
	// a move directly on this list
	list.bind('move', function (ev, item, newPos, oldPos) {
		ok(ev, '"move" event passed `ev`');
		equal(item.name, 'Zed', '"move" event passed correct `item`');
		equal(newPos, 3, '"move" event passed correct `newPos`');
		equal(oldPos, 0, '"move" event passed correct `oldPos`');
	});

	// a remove directly on this list
	list.bind('remove', function (ev, items, oldPos) {
		ok(ev, '"remove" event passed ev');
		equal(items.length, 1, '"remove" event passed correct # of `item`\'s');
		equal(items[0].name, 'Alexis', '"remove" event passed correct `item`');
		equal(oldPos, 0, '"remove" event passed correct `oldPos`');
	});

	list.bind('add', function (ev, items, index) {
		ok(ev, '"add" event passed ev');
		equal(items.length, 1, '"add" event passed correct # of items');
		equal(items[0].name, 'Alexis', '"add" event passed correct `item`');
		equal(index, 0, '"add" event passed correct `index`');
	});

	// Push: Should result in a "add" event
	list.push({
		name: 'Alexis'
	});

	// Splice: Should result in a "remove" event
	list.splice(0, 1);

	// Update: Should result in a "move" event
	list[0].name =  'Zed';
});

test('Passing a comparator function to sort()', 1, function () {
	var list = new DefineList([{
		priority: 4,
		name: 'low'
	}, {
		priority: 1,
		name: 'high'
	}, {
		priority: 2,
		name: 'middle'
	}, {
		priority: 3,
		name: 'mid'
	}]);
	list.sort(function (a, b) {
		// Sort functions always need to return the -1/0/1 integers
		if (a.priority < b.priority) {
			return -1;
		}
		return a.priority > b.priority ? 1 : 0;
	});
	equal(list[0].name, 'high');
	list[0].priority =  17;
});

test('Passing a comparator string to sort()', 1, function () {
	var list = new DefineList([{
		priority: 4,
		name: 'low'
	}, {
		priority: 1,
		name: 'high'
	}, {
		priority: 2,
		name: 'middle'
	}, {
		priority: 3,
		name: 'mid'
	}]);
	list.sort('priority');
	equal(list[0].name, 'high');
});

test('Defining a comparator property', 1, function () {
	var list = new DefineList([{
		priority: 4,
		name: 'low'
	}, {
		priority: 1,
		name: 'high'
	}, {
		priority: 2,
		name: 'middle'
	}, {
		priority: 3,
		name: 'mid'
	}]);
	list.set('comparator','priority');
	equal(list[0].name, 'high');
});

test('Defining a comparator property that is a function of a DefineMap', 4, function () {
	var list = new DefineList([
		new DefineMap({
			text: 'Bbb',
			func: function () {
				return 'bbb';
			}
		}),
		new DefineMap({
			text: 'abb',
			func: function () {
				return 'abb';
			}
		}),
		new DefineMap({
			text: 'Aaa',
			func: function () {
				return 'aaa';
			}
		}),
		new DefineMap({
			text: 'baa',
			func: function () {
				return 'baa';
			}
		})
	]);
	list.set('comparator','func');

	equal(list[0].text, 'Aaa');
	equal(list[1].text, 'abb');
	equal(list[2].text, 'baa');
	equal(list[3].text, 'Bbb');
});

//works with undefined which is okay
test('Sorts primitive items', function () {
	var list = new DefineList(['z', 'y', 'x']);
	list.sort();

	equal(list[0], 'x', 'Moved string to correct index');
});

test('Sort primitive values without a comparator defined', function () {
	var list = new DefineList([8,5,2,1,5,9,3,5]);
	list.sort();
	equal(list[0], 1, 'Sorted the list in ascending order');
});

test('Sort primitive values with a comparator function defined', function () {
	var list = new DefineList([8,5,2,1,5,9,3,5]);
	list.set('comparator' , function (a, b) {
		return a === b ? 0 : a < b ? 1 : -1;
	});
	equal(list[0], 9, 'Sorted the list in descending order');
});

function renderedTests (templateEngine, helperType, renderer) {
	test('Insert pushed item at correct index with ' + templateEngine + ' using ' + helperType +' helper', function () {
		var el = document.createElement('div');

		var items = new DefineList([{
			id: 'b'
		}]);
		items.set('comparator', 'id');

		// Render the template and place inside the <div>
		el.appendChild(renderer({
			items: items
		}));

		var firstElText = el.querySelector('li').firstChild.data;

		/// Check that the template rendered an item
		equal(firstElText, 'b',
			'First LI is a "b"');

		// Add another item
		items.push({
			id: 'a'
		});

		// Get the text of the first <li> in the <div>
		firstElText = el.querySelector('li').firstChild.data;

		// Check that the template rendered that item at the correct index
		equal(firstElText, 'a',
			'An item pushed into the list is rendered at the correct position');

	});

	// TODO: Test that push and sort have the result in the same output

	test('Insert unshifted item at correct index with ' + templateEngine + ' using ' + helperType +' helper', function () {
		var el = document.createElement('div');

		var items = new DefineList([
			{ id: 'a' },
			{ id: 'c' }
		]);
		items.set('comparator', 'id');

		// Render the template and place inside the <div>
		el.appendChild(renderer({
			items: items
		}));

		var firstElText = el.querySelector('li').firstChild.data;

		/// Check that the template rendered an item
		equal(firstElText, 'a', 'First LI is a "a"');

		// Attempt to add an item to the beginning of the list
		items.unshift({
			id: 'b'
		});

		firstElText = el.querySelectorAll('li')[1].firstChild.data;

		// Check that the template rendered that item at the correct index
		equal(firstElText, 'b',
			'An item unshifted into the list is rendered at the correct position');

	});

	test('Insert spliced item at correct index with ' + templateEngine + ' using ' + helperType +' helper', function () {
		var el = document.createElement('div');

		var items = new DefineList([
			{ id: 'b' },
			{ id: 'c' }
		]);
		items.set('comparator','id');

		// Render the template and place inside the <div>
		el.appendChild(renderer({
			items: items
		}));

		var firstElText = el.querySelector('li').firstChild.data;

		// Check that the "b" is at the beginning of the list
		equal(firstElText, 'b',
			'First LI is a b');

		// Add a "1" to the middle of the list
		items.splice(1, 0, {
			id: 'a'
		});

		// Get the text of the first <li> in the <div>
		firstElText = el.querySelector('li').firstChild.data;

		// Check that the "a" was added to the beginning of the list despite
		// the splice
		equal(firstElText, 'a',
			'An item spliced into the list at the wrong position is rendered ' +
			'at the correct position');

	});

	// TODO: Test adding and removing items at the same time with .splice()

	test('Moves rendered item to correct index after "set" using ' + helperType +' helper', function () {
		var el = document.createElement('div');

		var items = new DefineList([
			{ id: 'x' },
			{ id: 'y' },
			{ id: 'z' }
		]);
		items.set('comparator', 'id');

		// Render the template and place inside the <div>
		el.appendChild(renderer({
			items: items
		}));

		var firstElText = el.querySelector('li').firstChild.data;

		// Check that the "x" is at the beginning of the list
		equal(firstElText, 'x', 'First LI is a "x"');

		// Change the ID of the last item so that it's sorted above the first item
		items[2].id = 'a';

		// Get the text of the first <li> in the <div>
		firstElText = el.querySelector('li').firstChild.data;

		// Check that the "a" was added to the beginning of the list despite
		// the splice
		equal(firstElText, 'a', 'The last item was moved to the first position ' +
			'after it\'s value was changed');

	});

  /* 
    this test is not passing, I believe it is tied to issue #1566
   */

	QUnit.skip('Move DOM items when list is sorted with  ' + templateEngine + ' using the ' + helperType +' helper', function () {
		var el = document.createElement('div');

		var items = new DefineList([
			{ id: 4 },
			{ id: 1 },
			{ id: 6 },
			{ id: 3 },
			{ id: 2 },
			{ id: 8 },
			{ id: 0 },
			{ id: 5 },
			{ id: 6 },
			{ id: 9 },
		]);

		// Render the template and place inside the <div>
		el.appendChild(renderer({
			items: items
		}));

		var firstElText = el.querySelector('li').firstChild.data;

		// Check that the "4" is at the beginning of the list
		equal(firstElText, 4, 'First LI is a "4"');

		// Sort the list in-place
		items.set('comparator' , 'id');
		firstElText = el.querySelector('li').firstChild.data;

		equal(firstElText, 0, 'The `0` was moved to beginning of the list' +
			'once sorted.');

	});

	test('Push multiple items with ' + templateEngine + ' using the ' + helperType +' helper (#1509)', function () {
		var el = document.createElement('div');

		var items = new DefineList();
		items.set('comparator' , 'id');

		// Render the template and place inside the <div>
		el.appendChild(renderer({
			items: items
		}));

		items.bind('add', function (ev, items) {
			equal(items.length, 1, 'One single item was added');
		});

		items.push.apply(items, [
			{ id: 4 },
			{ id: 1 },
			{ id: 6 }
		]);

		var liLength = el.getElementsByTagName('li').length;

		equal(liLength, 3, 'The correct number of items have been rendered');

	});

}

var blockHelperTemplate = '<ul>{{#items}}<li>{{id}}</li>{{/items}}</ul>';
var eachHelperTemplate = '<ul>{{#each items}}<li>{{id}}</li>{{/each}}</ul>';


renderedTests('Stache', '{{#block}}', stache(blockHelperTemplate));
renderedTests('Stache', '{{#each}}', stache(eachHelperTemplate));

/* 
  the following two tests are not working. I believe it is tied to the original issue #1566 and 
  how nodelists work with can-define-list
*/
QUnit.skip("sorting works with #each (#1566)", function(){

	var heroes = new DefineList([ { id: 1, name: 'Superman'}, { id: 2, name: 'Batman'} ]);

	heroes.attr('comparator', 'name');

	var template = stache("<ul>\n{{#each heroes}}\n<li>{{id}}-{{name}}</li>\n{{/each}}</ul>");

	var frag = template({
		heroes: heroes
	});

	var lis = frag.childNodes[0].getElementsByTagName("li");

	equal(lis[0].innerHTML, "2-Batman");
	equal(lis[1].innerHTML, "1-Superman");

	heroes.attr('comparator', 'id');

	equal(lis[0].innerHTML, "1-Superman");
	equal(lis[1].innerHTML, "2-Batman");
});

QUnit.skip("sorting works with comparator added after a binding", function(){
	var heroes = new DefineList([ { id: 1, name: 'Superman'}, { id: 2, name: 'Batman'} ]);

	var template = stache("<ul>\n{{#each heroes}}\n<li>{{id}}-{{name}}</li>\n{{/each}}</ul>");

	var frag = template({
		heroes: heroes
	});

	heroes.set('comparator', 'id');

	heroes.set("0.id",3);

	var lis = frag.childNodes[0].getElementsByTagName("li");

	equal(lis[0].innerHTML, "2-Batman");
	equal(lis[1].innerHTML, "3-Superman");

});

test("removing comparator tears down bubbling", function(){

	var heroes = new DefineList([ { id: 1, name: 'Superman'}, { id: 2, name: 'Batman'} ]);
	var lengthHandler = function(){};

	heroes.bind("length",lengthHandler);

	ok(!heroes[0].__bindEvents._lifecycleBindings, "item has no bindings");
	heroes.set('comparator', 'id');

	/* how do we remove attrs from a define list? */
	heroes.set('comparator', undefined);

	ok(heroes.__bindEvents._lifecycleBindings, "list has bindings");
	ok(heroes[0].__bindEvents._lifecycleBindings, "item has bindings");

	heroes.set('comparator', null);

	ok(!heroes[0].__bindEvents._lifecycleBindings, "item has no bindings");
	ok(heroes.__bindEvents._lifecycleBindings, "list has bindings");

	heroes.unbind("length",lengthHandler);
	ok(!heroes.__bindEvents._lifecycleBindings, "list has no bindings");
});

test('sorting works when returning any negative value (#1601)', function() {
	var list = new DefineList([1, 4, 2]);

	list.set('comparator', function(a, b) {
		return a - b;
	});

	list.sort();
	deepEqual(list.get(), [1, 2, 4]);
});

test('Batched events originating from sort plugin lack batchNum (#1707)', function () {
	var list = new DefineList();
	list.set('comparator', 'id');

	list.bind('length', function (ev) {
		ok(ev.batchNum, 'Has batchNum');
	});

	canBatch.start();
	list.push({ id: 'a' });
	list.push({ id: 'a' });
	list.push({ id: 'a' });
	canBatch.stop();
});

// this test pased, but not sure how to translate it for DefineList
// can-define-list-sort does not currenly implement
// ._getReelativeInsertIndex, or ._changes
test('The sort plugin\'s _change handler ignores batched _changes (#1706)', function () {
	var list = new DefineList();
	var _getRelativeInsertIndex = list._getRelativeInsertIndex;
	var sort = list.sort;
	list.set('comparator', 'id');

	list.bind('move', function () {
		ok(false, 'No "move" events should be fired');
	});
	list._getRelativeInsertIndex = function () {
		ok(false, 'No items should be evaluated independently');
		return _getRelativeInsertIndex.apply(this, arguments);
	};
	list.sort = function () {
		ok(true, 'Batching caused sort() to be called');
		return sort.apply(this, arguments);
	};

	canBatch.start();
	list.push({ id: 'c', index: 1 });
	list.push({ id: 'a', index: 2 });
	list.push({ id: 'a', index: 3 });
	canBatch.stop();

	equal(list[2].id, 'c', 'List was sorted');
});

test('Items aren\'t unecessarily swapped to the end of a list of equal items (#1705)', function () {
	var list = new DefineList([
		{ id: 'a', index: 1 },
		{ id: 'b', index: 2 },
		{ id: 'c', index: 3 }
	]);
	list.set('comparator', 'id');
	list.bind('move', function () {
		ok(false, 'No "move" events should be fired');
	});

	list[0].id = 'b';
	equal(list[0].index, 1, 'Item hasn\'t moved');

	ok(true, 'unecessary \'move\' event was prevented');
});

test('Items aren\'t unecessarily swapped to the beginning of a list of equal items (#1705)', function () {
	var list = new DefineList([
		{ id: 'a', index: 1 },
		{ id: 'b', index: 2 },
		{ id: 'c', index: 3 }
	]);
	list.set('comparator', 'id');
	list.bind('move', function () {
		ok(false, 'No "move" events should be fired');
	});

	list[2].id = 'b';
	equal(list[2].index, 3, 'Item hasn\'t moved');

	ok(true, 'an unecessary \'move\' event was prevented');
});

test('Insert index is not evaluted for irrelevant changes', function () {
	var list = new DefineList([
		{
			id: 'a',
			index: 1
		},
		{
			id: 'b',
			index: 2,
			child: {
				grandchild: {
					id: 'c',
					index: 3
				}
			}
		}
	]);

	// Setup
	list.bind('move', function () {
		ok(false, 'No "move" events should be fired');
	});

	list.set('comparator', 'id');

	// Start test
	list[0].index = 4;
	list.set('comparator', 'child.grandchild.id');
	list[1].child.grandchild.index = 4;

	list[1].child = {
		grandchild: {
			id: 'c',
			index: 4
		}
	};

	equal(list[0].id, 'a', 'Item not moved');
});

test('items are positioned correctly', function () {
	var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var alphabet = letters.split('');
	var expected = alphabet.slice(0);
	var sorted = new DefineList(alphabet);

	// Enable the sort plugin
	sorted.sort();
	// There are some gotcha's that we can't compare to native sort:
	// http://blog.rodneyrehm.de/archives/14-Sorting-Were-Doing-It-Wrong.html
	var samples = ['0A','ZZ','**','LM','LL','Josh','James','Juan','Julia',
		'!!HOORAY!!'];

	each(samples, function (value) {
		expected.push(value);
		expected.sort();
		sorted.push(value);

		each(expected, function (value, index) {
			equal(value, sorted[index],
				'Sort plugin output matches native output');
		});
	});
});

/* not sure how to test this or if it should be tested
  when using set on init it created an array with 
  [comparator, isPrimary]
 */
QUnit.skip('set comparator on init', function() {
	var Item = DefineMap.extend();
	Item.List = DefineList.extend({
		init: function() {
			this.set('comparator', 'isPrimary');
		}
	});

	var items = [
		{ isPrimary: false },
		{ isPrimary: true },
		{ isPrimary: false }
	];

	deepEqual(new Item.List(items).serialize(), [
		{ isPrimary: false },
		{ isPrimary: false },
		{ isPrimary: true }
	]);
});

/*
  again, believe this is failing do to issue #1566 with {{#each}} helper
*/
QUnit.skip('{{@index}} is updated for "move" events (#1962)', function () {
	var list = new DefineList([100, 200, 300]);
	list.set('comparator', function (a, b) { return a < b ? -1 : 1; });

	var template = stache('<ul>{{#each list}}<li>' +
			'<span class="index">{{@index}}</span> - ' +
			'<span class="value">{{.}}</span>' +
		'</li>{{/each}}</ul>');

	var frag = template({ list: list });
	var expected;

	var evaluate = function () {
		var liEls = frag.querySelectorAll('li');

		for (var i = 0; i < expected.length; i++) {
			var li = liEls[i];
			var index = li.querySelectorAll('.index')[0].innerHTML;
			var value = li.querySelectorAll('.value')[0].innerHTML;

			equal(index, ''+i, '{{@index}} rendered correct value');
			equal(value, ''+expected[i], '{{.}} rendered correct value');
		}
	};
  
  expected = [100, 200, 300];
	evaluate();

	list.attr('comparator', function (a, b) { return a < b ? 1 : -1; });

	expected = [300, 200, 100];
	evaluate();
});

test(".sort(comparatorFn) is passed list items regardless of .attr('comparator') value (#2159)", function () {
	var list = new DefineList([
		{ letter: 'x', number: 3 },
		{ letter: 'y', number: 2 },
		{ letter: 'z', number: 1 },
	]);

	list.set('comparator', 'number');

	equal(list[0].number, 1, 'First value is correct');
	equal(list[1].number, 2, 'Second value is correct');
	equal(list[2].number, 3, 'Third value is correct');

	list.sort(function (a, b) {
		a = a.letter;
		b = b.letter;
		return (a === b) ? 0 : (a < b) ? -1 : 1;
	});

	equal(list[0].letter, 'x',
		'First value is correct after sort with single use comparator');
	equal(list[1].letter, 'y',
		'Second value is correct after sort with single use comparator');
	equal(list[2].letter, 'z',
		'Third value is correct after sort with single use comparator');
});

test("List is not sorted on change after calling .sort(fn)", function () {
	var list = new DefineList([
		{ letter: 'x', number: 3 },
		{ letter: 'y', number: 2 },
		{ letter: 'z', number: 1 },
	]);

	list.sort(function (a, b) {
		a = a.letter;
		b = b.letter;
		return (a === b) ? 0 : (a < b) ? -1 : 1;
	});

	equal(list[0].letter, 'x',
		'First value is correct after sort with single use comparator');
	equal(list[1].letter, 'y',
		'Second value is correct after sort with single use comparator');
	equal(list[2].letter, 'z',
		'Third value is correct after sort with single use comparator');

	list.sort = function () {
		ok(false, 'The list is not sorted as a result of change');
	};

	list[2].letter = 'a';

	equal(list[0].letter, 'x','First value is still correct');
	equal(list[1].letter, 'y', 'Second value is still correct');
	equal(list[2].letter, 'a', 'Third value is correctly out of place');
});

test('Sort returns a reference to the list', 2, function () {
	var list = new DefineList([{
		priority: 4,
		name: 'low'
	}, {
		priority: 1,
		name: 'high'
	}, {
		priority: 2,
		name: 'middle'
	}, {
		priority: 3,
		name: 'mid'
	}]);
	var sortFn = function (a, b) {
		// Sort functions always need to return the -1/0/1 integers
		if (a.priority < b.priority) {
			return -1;
		}
		return a.priority > b.priority ? 1 : 0;
	};

	var referenceOne = list.sort(sortFn);
	equal(referenceOne, list, 'makeMoveFromPatch returns a reference to the list');
	var referenceTwo = list.sort(sortFn);
	equal(referenceTwo, list, 'skipping makeMoveFromPatch returns a reference to the list');
});
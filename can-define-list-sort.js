var DefineList = require('can-define/list/list');
var assign = require('can-util/js/assign/assign');
var each = require('can-util/js/each/each');

var proto =  DefineList.prototype;
var setup = proto.setup;
var comparatorSetup = false;
var lastComparator = null;
var shouldSort = false;

assign(proto, {
	setup () {
		setup.apply(this, arguments);
		this.on('comparator', this.comparatorEventHandler);
	},
	sort (singleComparator) {
    // setting this flag in case someone pushes without
    // calling sort or setting comparator
    shouldSort = true;
		this.comparator = singleComparator;
		var sorted = this._getSortedArray(Array.from(this));
		this._sortDefineList(sorted);
    return this;
	},
	comparatorEventHandler () {
    var defineList = this;
    // setting this flag in case someone pushes without
    // calling sort or setting comparator
    shouldSort = true;
		//if there is no comparator then set one up
		if (!comparatorSetup) {
			comparatorSetup = true;
			// set up bindings for each item if 
      // it is a define map
			this.each(function(item) {
				if(typeof item !== 'object'){
					return;
				}
				if (defineList.comparator && typeof defineList.comparator === 'string') {
					item.on(defineList.comparator, defineList._createMoveEvent.bind(defineList));
				}
			});
		} else if (!this.comparator) {
			// if there is no comparator remove binding
      var defineList = this;
			this.each(function(item) {
        if(typeof item !== 'object') {
          return;
        }
				if(lastComparator && typeof lastComparator === 'string'){
					item.off(lastComparator, defineList._createMoveEvent);
				}
			});
			comparatorSetup = false;
		} else {
			// if there is a comparator change remove the old bindings 
			// and add the new one
			this.each(function(item) {
				if(typeof item !== 'object') {
					return;
				}
				if(lastComparator && typeof lastComparator === 'string'){
					item.off(lastComparator, defineList._createMoveEvent);
				}
				if(typeof defineList.comparator === 'string') {
					item.on(defineList.comparator, defineList._createMoveEvent.bind(defineList));
				}
			});
		}	
		//sort whenver comparator is set or updated
		if(this.comparator) {
			var sorted = this._getSortedArray(Array.from(this));
			this._sortDefineList(sorted);
		}
		lastComparator = this.comparator;
	},
	_createMoveEvent () {
		var currentItem = arguments[0].target;
		var newPos, oldPos;
		var defineListAsArray = Array.from(this);
		var sorted = this._getSortedArray(defineListAsArray);
		
		oldPos = defineListAsArray.findIndex(function(item){
			return item === currentItem;
		});
		newPos = sorted.findIndex(function(item){
			return item === currentItem;
		});

    if(newPos !== oldPos) {
      this._sortDefineList(sorted);
      // this is the list
      this.dispatch('move', [currentItem, newPos, oldPos]);	
    }
	},
	_getSortedArray (array) {
		var comparator;
		if(typeof this.comparator === 'string') {
			var self = this;
			comparator = function (a, b) {
				return a[self.comparator] > b[self.comparator];
			};
		} else {
			comparator = this.comparator;
		}

		return array.slice().sort(comparator);				
	}, 
	_sortDefineList (sortedArray) {
		var defineList = this;
		sortedArray.forEach(function(map, index) {
			defineList[index] = map;
		});
		// trigger length change so that {{#block}} helper
		// can re-render
		this._length = sortedArray.length;
		this.dispatch('length', [sortedArray.length]);
	}
});

each({
		/**
		 * @function can-define/list/list.prototype.push push
		 * @description Add elements to the end of a list.
		 * @signature `list.push(...elements)`
		 *
		 * `push` adds elements onto the end of a DefineList.
		 *
		 * ```
		 * var names = new DefineList(['Alice']);
		 * names.push('Bob', 'Eve');
		 * names //-> DefineList['Alice','Bob', 'Eve']
		 * ```
		 *
		 *   @param {*} elements the elements to add to the DefineList
		 *
		 *   @return {Number} the new length of the DefineList
		 *
		 * @body
		 *
		 * ## Use
		 *
		 * `push` adds elements onto the end of a DefineList here is an example:
		 *
		 * ```
		 * var list = new DefineList(['Alice']);
		 *
		 * list.push('Bob', 'Eve');
		 * list.get(); // ['Alice', 'Bob', 'Eve']
		 * ```
		 *
		 * If you have an array you want to concatenate to the end
		 * of the DefineList, you can use `apply`:
		 *
		 * ```
		 * var names = ['Bob', 'Eve'],
		 *     list = new DefineList(['Alice']);
		 *
		 * list.push.apply(list, names);
		 * list.get(); // ['Alice', 'Bob', 'Eve']
		 * ```
		 *
		 * ## Events
		 *
		 * `push` causes _add_, and _length_ events to be fired.
		 *
		 * ## See also
		 *
		 * `push` has a counterpart in [can-define/list/list::pop pop], or you may be
		 * looking for [can-define/list/list::unshift unshift] and its counterpart [can-define/list/list::shift shift].
		 */
	push: "length",
		/**
		 * @function can-define/list/list.prototype.unshift unshift
		 * @description Add items to the beginning of a DefineList.
		 * @signature `list.unshift(...items)`
		 *
		 * `unshift` adds items onto the beginning of a DefineList.
		 *
		 * ```
		 * var list = new DefineList(['Alice']);
		 *
		 * list.unshift('Bob', 'Eve');
		 * list; // DefineList['Bob', 'Eve', 'Alice']
		 * ```
		 *
		 * @param {*} items The items to add to the DefineList.
		 *
		 * @return {Number} The new length of the DefineList.
		 *
		 * @body
		 *
		 * ## Use
		 *
		 *
		 *
		 * If you have an array you want to concatenate to the beginning
		 * of the DefineList, you can use `apply`:
		 *
		 * ```
		 * var names = ['Bob', 'Eve'],
		 *     list = new DefineList(['Alice']);
		 *
		 * list.unshift.apply(list, names);
		 * list.get(); // ['Bob', 'Eve', 'Alice']
		 * ```
		 *
		 * ## Events
		 *
		 * `unshift` causes _add_ and _length_ events to be fired.
		 *
		 * ## See also
		 *
		 * `unshift` has a counterpart in [can-define/list/list::shift shift], or you may be
		 * looking for [can-define/list/list::push push] and its counterpart [can-define/list/list::pop pop].
		 */
	unshift: 0
},
	// Adds a method
	// `name` - The method name.
	// `where` - Where items in the `array` should be added.
	function(where, name) {
		DefineList.prototype[name] = function() {
				// Get the items being added
				var args = Array.from(arguments);
				var length = args.length;
				var i = 0;
				var newIndex, val;

				// Increment, don't decrement in order to minimize the
				// number of items after each subsequent .splice();
				while (i < length) {

					// Convert anything to a `map` that needs to be converted.
					val = this.__type(arguments[i], i);
					
					var newList = Array.from(this);
					newList.push(val);
					var sorted = this._getSortedArray(newList);


					newIndex = sorted.findIndex(function(item){
						return item  === val;
					});

					// Get the sorted index
					// newIndex = this._getInsertIndex(val);

					// Insert this item at the correct index
					// NOTE: On ultra-big lists, this will be the slowest
					// part of an "add" because `.splice()` is O(n)
					// Array.prototype.splice.apply(this, [correctIndex, 0, val]);
          if (shouldSort) {
					  this._sortDefineList(sorted);
          }

					// Render, etc
					this._triggerChange('' + newIndex, 'add', [val], undefined);

					// Next
					i++;
				}

				// Render, etc
				this.dispatch('reset', [args]);

				return this;
		};
	});

	// Overwrite .splice so that items added to the list (no matter what the
// defined index) are inserted at the correct index, while preserving the
// ability to remove items from a list.
(function () {
	var proto = DefineList.prototype;
	var oldSplice = proto.splice;

	proto.splice = function (index, howMany) {

		var args = Array.from(arguments);

		// Don't use this "sort" oriented splice unless this list has a
		// comparator
		if (! this.comparator) {
			return oldSplice.apply(this, args);
		}

		// Remove items using the original splice method
		oldSplice.call(this, index, howMany);

		// Remove the 1st and 2nd args so that the newly added
		// items can be processed directly, rather than `.slice()`
		// which creates a copy, or `for (...) { added.push(args[i]); }`
		// which iterates needlessly
		args.splice(0, 2);

		// Add items by way of push so that they're sorted into
		// the correct position
		proto.push.apply(this, args);
	};
})();

module.exports = exports = DefineList;

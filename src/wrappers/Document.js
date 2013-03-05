// Copyright 2013 The Toolkitchen Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(exports) {
  'use strict';

  var WrapperDocument = wrappers.registerObject(
      document.implementation.createHTMLDocument(''),
      Document);
  mixin(WrapperDocument.prototype, ParentNodeInterface);

  exports.WrapperDocument = WrapperDocument;

  // Both WebKit and Gecko uses HTMLDocument for document. HTML5/DOM only has
  // one Document interface and IE implements the standard correctly.
  if (typeof HTMLDocument !== 'undefined')
    wrappers.register(HTMLDocument, WrapperDocument);

  function wrapMethod(object, name) {
    var proto = Object.getPrototypeOf(object);
    var original = proto[name];
    proto[name] = function() {
      return wrap(original.apply(this, arguments));
    };
  }

  [
    'getElementById',
    'querySelector',
    'createElement',
    'createTextNode',
    'createDocumentFragment'
  ].forEach(function(name) {
    wrapMethod(document, name);
  });


  var implementationTable = new SideTable('implementation');

  mixin(WrapperDocument.prototype, {
    get implementation() {
      var implementation = implementationTable.get(this);
      if (implementation)
        return implementation;
      implementation =
          new WrapperDOMImplementation(unwrap(this).implementation);
      implementationTable.set(this, implementation);
      return implementation;
    }
  });

  function wrapImplMethod(name) {
    return function() {
      return wrap(this.impl[name].apply(this.impl, arguments));
    };
  }

  function forwardImplMethod(name) {
    return function() {
      return this.impl[name].apply(this.impl, arguments);
    };
  }

  function WrapperDOMImplementation(impl) {
    this.impl = impl;
  }

  WrapperDOMImplementation.prototype = {
    createDocumentType: wrapImplMethod('createDocumentType'),
    createDocument: wrapImplMethod('createDocument'),
    createHTMLDocument: wrapImplMethod('createHTMLDocument'),
    hasFeature: forwardImplMethod('hasFeature')
  };

})(this);
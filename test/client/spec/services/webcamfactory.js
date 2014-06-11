'use strict';

describe('Service: WebCamFactory', function () {

  // load the service's module
  beforeEach(module('facePongApp'));

  // instantiate service
  var WebCamFactory;
  beforeEach(inject(function (_WebCamFactory_) {
    WebCamFactory = _WebCamFactory_;
  }));

  it('should do something', function () {
    expect(!!WebCamFactory).toBe(true);
  });

});

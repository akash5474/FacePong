'use strict';

describe('Service: PaddleFactory', function () {

  // load the service's module
  beforeEach(module('facePongApp'));

  // instantiate service
  var PaddleFactory;
  beforeEach(inject(function (_PaddleFactory_) {
    PaddleFactory = _PaddleFactory_;
  }));

  it('should do something', function () {
    expect(!!PaddleFactory).toBe(true);
  });

});

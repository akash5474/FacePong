'use strict';

describe('Service: BallFactory', function () {

  // load the service's module
  beforeEach(module('facePongProdApp'));

  // instantiate service
  var BallFactory;
  beforeEach(inject(function (_BallFactory_) {
    BallFactory = _BallFactory_;
  }));

  it('should do something', function () {
    expect(!!BallFactory).toBe(true);
  });

});

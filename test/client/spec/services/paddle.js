'use strict';

describe('Service: paddle', function () {

  // load the service's module
  beforeEach(module('facePongApp'));

  // instantiate service
  var paddle;
  beforeEach(inject(function (_paddle_) {
    paddle = _paddle_;
  }));

  it('should do something', function () {
    expect(!!paddle).toBe(true);
  });

});

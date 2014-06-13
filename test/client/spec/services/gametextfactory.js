'use strict';

describe('Service: GameTextFactory', function () {

  // load the service's module
  beforeEach(module('facePongProdApp'));

  // instantiate service
  var GameTextFactory;
  beforeEach(inject(function (_GameTextFactory_) {
    GameTextFactory = _GameTextFactory_;
  }));

  it('should do something', function () {
    expect(!!GameTextFactory).toBe(true);
  });

});

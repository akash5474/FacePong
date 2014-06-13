'use strict';

describe('Service: CameraFactory', function () {

  // load the service's module
  beforeEach(module('facePongProdApp'));

  // instantiate service
  var CameraFactory;
  beforeEach(inject(function (_CameraFactory_) {
    CameraFactory = _CameraFactory_;
  }));

  it('should do something', function () {
    expect(!!CameraFactory).toBe(true);
  });

});

describe("my-hexBin-layer", function() {

  var chart = d3.myHexBinLayer();


  describe("should allow determining if specific location is in brush region", function() {
    // longitude cases
    
    it("when both West and East lon. > 0", function() {
      var point = [0, 50]; // [lat, lon]
      var extent = {nw: [50, 10], se: [-50, 100]};
      // in
      expect(chart.inBrush()(point, extent)).toEqual(true);
      // out
      point = [0, 110];
      expect(chart.inBrush()(point, extent)).toEqual(false);
      point = [0, 5];
      expect(chart.inBrush()(point, extent)).toEqual(false);
    });

    
    it("when both West and East lon. < 0", function() {
      var point = [0, -20]; // [lat, lon]
      var extent = {nw: [50, -100], se: [-50, -10]};
      // in
      expect(chart.inBrush()(point, extent)).toEqual(true);
      // out
      point = [0, 0];
      expect(chart.inBrush()(point, extent)).toEqual(false);
      point = [0, -110];
      expect(chart.inBrush()(point, extent)).toEqual(false);
    });
    
    it("when West lon. < 0 and East lon. > 0", function() {
      var point = [0, 20]; // [lat, lon]
      var extent = {nw: [50, -100], se: [-50, 100]};
      // in
      expect(chart.inBrush()(point, extent)).toEqual(true);
      point = [0, -20];
      expect(chart.inBrush()(point, extent)).toEqual(true);
      // out
      point = [0, 110];
      expect(chart.inBrush()(point, extent)).toEqual(false);
      point = [0, -110];
      expect(chart.inBrush()(point, extent)).toEqual(false);
    });

    it("when West lon. > 0 and East lon. < 0", function() {
      var point = [0, 160]; // [lat, lon]
      var extent = {nw: [50, 150], se: [-50, -150]};
      // in
      expect(chart.inBrush()(point, extent)).toEqual(true);
      point = [0, -160];
      expect(chart.inBrush()(point, extent)).toEqual(true);
      // out
      point = [0, 140];
      expect(chart.inBrush()(point, extent)).toEqual(false);
      point = [0, -140];
      expect(chart.inBrush()(point, extent)).toEqual(false);

    });

    // latitude cases
    it("when both North and South lat. > 0", function() {
      var point = [40, 0]; // [lat, lon]
      var extent = {nw: [80, 0], se: [10, 0]};
      // in
      expect(chart.inBrush()(point, extent)).toEqual(true);
      // out
      point = [85, 0];
      expect(chart.inBrush()(point, extent)).toEqual(false);
      point = [5, 0];
      expect(chart.inBrush()(point, extent)).toEqual(false);
    });

    it("when North and South lat. are both < 0", function() {
      var point = [-20, 0]; // [lat, lon]
      var extent = {nw: [-10, 0], se: [-80, 0]};
      // in
      expect(chart.inBrush()(point, extent)).toEqual(true);
      // out
      point = [0, 0];
      expect(chart.inBrush()(point, extent)).toEqual(false);
      point = [-85, 0];
      expect(chart.inBrush()(point, extent)).toEqual(false);
    });


    it("when North lat > 0 and South lat. < 0", function() {
      var point = [0, 0]; // [lat, lon]
      var extent = {nw: [40, 0], se: [-40, 0]};
      // in
      expect(chart.inBrush()(point, extent)).toEqual(true);
      // out
      point = [50, 0];
      expect(chart.inBrush()(point, extent)).toEqual(false);
      point = [-50, 0];
      expect(chart.inBrush()(point, extent)).toEqual(false);
    });

  });

});

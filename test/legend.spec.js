describe("legend", function() {
  
  describe("getLegendLabel", function() {
    it("should normalize label", inject(function($utils) {
      expect($utils.getLegendLabel("Series", 12.25, 20)).toBe(
        "Series ....... 12.25"
      );
    }));
  });
  
  describe("getLegendLabelFunction", function() {
    it("should return nothing if chart too small", inject(function($utils) {
      var fakeData = {label: "My series", value: 42};
      
      var f = $utils.getLegendLabelFunction(39);
      expect(f(fakeData)).toBe("");
      
      f = $utils.getLegendLabelFunction(99);
      expect(f(fakeData)).toBe("My series");
      
      f = $utils.getLegendLabelFunction(100);
      expect(f(fakeData)).toBe("My series ....... 42");
    }));
  });
  
  describe("items", function() {
    beforeEach(inject(function($utils) {
      spyOn($utils, 'getDefaultMargins').andReturn(
        {top: 20, right: 50, bottom: 30, left: 50}
      );
    }));
    
    var elm, $scope, isolatedScope;
    beforeEach(inject(function($rootScope, $compile) {
      elm = angular.element('<div id="toto">' +
        '<pie-chart data="data" options="options"></pie-chart>' +
        '</div>');

      $scope = $rootScope;
      $compile(elm)($scope);
      $scope.$digest();
    }));
    
    var svg, content;
    beforeEach(function() {
      $scope.data = [
        {label: "one", value: 12.2, color: "red"}, 
        {label: "two", value: 45, color: "rgb(10, 24, 45)"},
        {label: "three", value: 10, color: "rgba(10, 24, 45, 0.7)"},
        {label: "Fourth series", value: 50, color: "#123456"}
      ];   
      $scope.options = {thickness: 5};
      $scope.$apply();
      
      svg = elm[0].childNodes[0].childNodes[0];
      content = svg.childNodes[0];
    });
    
    it("should be in a single legend group", function() {
      expect(content.childNodes.length).toBe(2);
      expect(content.childNodes[1].getAttribute("id")).toBe("n3-pie-legend");
    });
    
    it("should be four", function() {
      var legendItems = content.childNodes[1].childNodes;
      
      expect(legendItems.length).toBe(4);
    });
    
    it("should be colored", function() {
      var legendItems = content.childNodes[1].childNodes;
      
      var expected = [
        {transform: "translate(0, -30)", style: "fill: #ff0000; fill-opacity: 0.8;"},
        {transform: "translate(0, -15)", style: "fill: #0a182d; fill-opacity: 0.8;"},
        {transform: "translate(0, 0)", style: "fill: rgba(10, 24, 45, 0.70196); fill-opacity: 0.8;"},
        {transform: "translate(0, 15)", style: "fill: #123456; fill-opacity: 0.8;"}
      ];
      
      expected.forEach(function(d, i) {
        expect(legendItems[i].nodeName).toBe("g");
        expect(legendItems[i].getAttribute("transform")).toBe(d.transform);
        expect(legendItems[i].getAttribute("style").trim()).toBeSameStyleAs(d.style);
      });
    });
    
    it("should own text elements", function() {
      var legendItems = content.childNodes[1].childNodes;
      
      var expected = [
        {x: "0px", y: "15px", "text-anchor": "middle", content: "one ........... 12.2", style: "font-family: monospace;"},
        {x: "0px", y: "15px", "text-anchor": "middle", content: "two ............. 45", style: "font-family: monospace;"},
        {x: "0px", y: "15px", "text-anchor": "middle", content: "three ........... 10", style: "font-family: monospace;"},
        {x: "0px", y: "15px", "text-anchor": "middle", content: "Fourth series ... 50", style: "font-family: monospace;"}
      ];
      
      var p = function(i) {return legendItems[i].childNodes[0];};
      expected.forEach(function(d, i) {
        expect(p(i).nodeName).toBe("text");
        expect(p(i).getAttribute("x")).toBe(d.x);
        expect(p(i).getAttribute("y")).toBe(d.y);
        expect(p(i).textContent).toBe(d.content);
        expect(p(i).getAttribute("text-anchor")).toBe(d["text-anchor"]);
        expect(p(i).getAttribute("style").trim()).toBeSameStyleAs(d.style);
      });
    });

    it("should call mouseover", inject(function($utils) {
      var arcs = content.childNodes[0].childNodes;
      var legendItems = content.childNodes[1].childNodes;
      
      var expectedLegends = [
        "fill: #ff0000; fill-opacity: 0.8; opacity: 1;",
        "fill: #0a182d; fill-opacity: 0.8; opacity: 0.4;",
        "fill: rgba(10, 24, 45, 0.70196); fill-opacity: 0.8; opacity: 0.4;",
        "fill: #123456; fill-opacity: 0.8; opacity: 0.4;"
      ];
      
      var expectedArcs = [
        {id: "arc_0", style: "opacity: 1;"},
        {id: "arc_1", style: "opacity: 0.4;"},
        {id: "arc_2", style: "opacity: 0.4;"},
        {id: "arc_3", style: "opacity: 0.4;"}
      ];
      
      runs(function () {
        var e = document.createEvent("MouseEvents");
        e.initMouseEvent("mouseover");
        legendItems[0].dispatchEvent(e);
      });
      
      // There is a transition we have to wait for.
      // BTW : Jasmine is awesome.
      waits(50);

      runs(function () {
        expectedLegends.forEach(function(d, i) {
          expect(legendItems[i].getAttribute("style").trim()).toBeSameStyleAs(d);
        });
        
        expectedArcs.forEach(function(d, i) {
          expect(arcs[i].getAttribute("style").trim()).toBeSameStyleAs(d.style);
          expect(arcs[i].getAttribute("id")).toBe(d.id);
        });
      });
    }));
    
    it("should call mouseout", inject(function($utils) {
      var arcs = content.childNodes[0].childNodes;
      var legendItems = content.childNodes[1].childNodes;
      
      var expectedLegends = [
        "fill: #ff0000; fill-opacity: 0.8; opacity: 1;",
        "fill: #0a182d; fill-opacity: 0.8; opacity: 1;",
        "fill: rgba(10, 24, 45, 0.70196); fill-opacity: 0.8; opacity: 1;",
        "fill: #123456; fill-opacity: 0.8; opacity: 1;"
      ];
      
      var expectedArcs = [
        {id: "arc_0", style: "opacity: 1;"},
        {id: "arc_1", style: "opacity: 1;"},
        {id: "arc_2", style: "opacity: 1;"},
        {id: "arc_3", style: "opacity: 1;"}
      ];
      
      runs(function () {
        var e = document.createEvent("MouseEvents");
        e.initMouseEvent("mouseout");
        legendItems[0].dispatchEvent(e);
      });
      
      // There is a transition we have to wait for.
      // BTW : Jasmine is awesome.
      waits(50);

      runs(function () {
        expectedLegends.forEach(function(d, i) {
          expect(legendItems[i].getAttribute("style").trim()).toBeSameStyleAs(d);
        });
        
        expectedArcs.forEach(function(d, i) {
          expect(arcs[i].getAttribute("style").trim()).toBeSameStyleAs(d.style);
          expect(arcs[i].getAttribute("id")).toBe(d.id);
        });
      });
    }));
  })
});
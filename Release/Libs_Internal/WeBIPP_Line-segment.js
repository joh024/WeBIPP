wbip["line-segment"] = function(){
  var obj = {tags: "subobj", type: "primary"};
  
  obj.icon =
    function(gMenu, transXY){
      obj.gMenu = gMenu;
      var curS = wbip.icon.def(gMenu, "wbip-icon-line-segment");
      curS.append("line")
        .attr("x1", 0)
        .attr("x2", 16)
        .attr("y1", 2.5)
        .attr("y2", 2.5);
      curS.append("line")
        .attr("x1", 0)
        .attr("x2", 12)
        .attr("y1", 7.5)
        .attr("y2", 7.5);
      curS.append("line")
        .attr("x1", 0)
        .attr("x2", 4)
        .attr("y1", 12.5)
        .attr("y2", 12.5);
      curS.append("line")
        .attr("x1", 0)
        .attr("x2", 3)
        .attr("y1", 17.5)
        .attr("y2", 17.5);
      curS.append("rect")
        .attr("width", 20)
        .attr("height", 20);
      
      var curG = gMenu.append("g")
        .attr("transform", wbip.utils.translate(transXY))
        .classed("wbip-icon-line-segment", true);
      wbip.icon.use(curG, "wbip-icon-line-segment");
      
      curG.on("click", function(){
        wbip.gGraph.iconclick("line-segment", gMenu, transXY);
      });
    };
  
  obj.defs = {
    x1: ["attr", "numeric", {
      useScale: ["useScale-x", "logical"]
    }],
    x2: ["attr", "numeric", {
      useScale: ["useScale-x", "logical"]
    }],
    y1: ["attr", "numeric", {
      useScale: ["useScale-y", "logical"]
    }],
    y2: ["attr", "numeric", {
      useScale: ["useScale-y", "logical"]
    }],
    stroke: ["style", "rgb"],
    "stroke-width": ["style", "numeric"],
    "stroke-linecap": ["style", "list", undefined, {
      list: ["butt", "round", "square"]
    }],
    "stroke-dasharray": ["style", "csv"],
    "shape-rendering": ["style", "list", undefined, {
      list: ["auto", "optimizeSpeed", "crispEdges", "geometricPrecision"]
    }],
    opacity: ["style", "proportion"]
  };
  
  obj.setattr =
    function(curID, name, val){
      wbip.setattr(curID, wbip.getrealdef(obj.defs, name), name, val);
    };
  
  obj.getattr = wbip.getattr;
  
  obj.click =
    function(curID, curFrame, Coords){
      var outcode = wbip.outcode.init(curID, curFrame,
        {"wbip-obj-line-segment": true, "wbip-gobj": true});
      
      var curAttrs = {
        x1: Coords[0],
        x2: Coords[0] + 50,
        y1: Coords[1],
        y2: Coords[1]
      };
      outcode += wbip.outcode.append(1, "line", curAttrs);
      
      curAttrs["x1-useScale"] = "auto";
      curAttrs["x2-useScale"] = "auto";
      curAttrs["y1-useScale"] = "auto";
      curAttrs["y2-useScale"] = "auto";
      var curVars = {attr: curAttrs, name: "line-segment"};
      wbip.setIDvar(curID, curVars);
      
      outcode += '\n';
      
      wbip.outcode.write(outcode, "low");
      eval(outcode);
      
      wbip.slidemenu.append(d3.select("g.wbip-sm-" + curFrame.attr("id")),
        [{text: curID, icon: "wbip-icon-line-segment"}]);
    };
  
  return obj;
}();
wbip.addon("line-segment");

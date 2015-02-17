wbip.circle = function(){
  var obj = {tags: "subobj", type: "primary"};
  
  obj.icon =
    function(gMenu, transXY){
      obj.gMenu = gMenu;
      var curS = wbip.icon.def(gMenu, "wbip-icon-circle");
      curS.append("circle")
        .attr("cx", 10)
        .attr("cy", 10)
        .attr("r", 10);
      
      var curG = gMenu.append("g")
        .attr("transform", wbip.utils.translate(transXY))
        .classed("wbip-icon-circle", true);
      wbip.icon.use(curG, "wbip-icon-circle");
      
      curG.on("click", function(){
        wbip.gGraph.iconclick("circle", gMenu, transXY);
      });
    };
  
  obj.defs = {
    cx: ["attr", "numeric", {
      useScale: ["useScale-x", "logical"]
    }],
    cy: ["attr", "numeric", {
      useScale: ["useScale-y", "logical"]
    }],
    r: ["attr", "numeric"],
    stroke: ["style", "rgb"],
    fill: ["style", "rgb"],
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
        {"wbip-obj-circle": true, "wbip-gobj": true});
      
      var curAttrs = {cx: Coords[0], cy: Coords[1], r: 10};
      outcode += wbip.outcode.append(1, "circle", curAttrs);
      
      curAttrs["cx-useScale"] = "auto";
      curAttrs["cy-useScale"] = "auto";
      var curVars = {attr: curAttrs, name: "circle"};
      wbip.setIDvar(curID, curVars);
      
      outcode += "\n";
      
      wbip.outcode.write(outcode, "low");
      eval(outcode);
      
      wbip.slidemenu.append(d3.select("g.wbip-sm-" + curFrame.attr("id")),
        [{text: curID, icon: "wbip-icon-circle"}]);
    };
  
  return obj;
}();
wbip.addon("circle");

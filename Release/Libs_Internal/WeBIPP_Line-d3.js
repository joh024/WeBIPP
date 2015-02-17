wbip["line-d3"] = function(){
  var obj = {tags: "subobj", type: "primary"};
  
  obj.icon =
    function(gMenu, transXY){
      obj.gMenu = gMenu;
      var curS = wbip.icon.def(gMenu, "wbip-icon-line-d3");
      curS.append("polyline")
        .attr("points", "0,17 6,6 16,9 20,3");
      curS.append("text")
        .attr("x", 20)
        .attr("y", 22)
        .text("d3");
      curS.append("rect")
        .attr("width", 20)
        .attr("height", 20);
      
      var curG = gMenu.append("g")
        .attr("transform", wbip.utils.translate(transXY))
        .classed("wbip-icon-line-d3", true);
      wbip.icon.use(curG, "wbip-icon-line-d3");
      
      curG.on("click", function(){
        wbip.gGraph.iconclick("line-d3", gMenu, transXY);
      });
    };
  
  obj.defs = {
    x: ["func", "numeric", {
      useScale: ["useScale-x", "logical"]
    }],
    y: ["func", "numeric", {
      useScale: ["useScale-y", "logical"]
    }],
    interpolate: ["func", "list", undefined, {
      list: ["linear", "linear-closed",
        "step", "step-before", "step-after",
        "basis", "basis-open", "basis-closed", "bundle",
        "cardinal", "cardinal-open", "cardinal-closed",
        "monotone"]
    }],
    stroke: ["style", "rgb"],
    "stroke-width": ["style", "numeric"],
    opacity: ["style", "proportion"]
  };
  
  obj.setattr =
    function(curID, name, val){
      wbip.setattr(curID, wbip.getrealdef(obj.defs, name), name, val);
    };
  
  obj.getattr =
    function(curID, name){
      var curval = wbip.getattr(curID, name);
      if(wbip.utils.isArray(curval)){curval = JSON.stringify(curval);}
      return curval;
    };
  
  obj.click =
    function(curID, curFrame, Coords){
      var outcode = wbip.outcode.init(curID, curFrame,
        {"wbip-obj-line-d3": true, "wbip-gobj": true});
      
      var curAttrs = {
        x: [Coords[0], Coords[0] + 50],
        "x-useScale": "auto",
        y: [Coords[1], Coords[1] - 30],
        "y-useScale": "auto"
      };
      var curVars = {attr: curAttrs, name: "line-d3"};
      wbip.setIDvar(curID, curVars);
      
      outcode += "var curline = d3.svg.line()\n" +
        "  .x(function(d){return " + JSON.stringify(curAttrs.x) + "[d];})\n" +
        "  .y(function(d){return " + JSON.stringify(curAttrs.y) + "[d];});//funcEND\n";
      
      outcode += 'var selData = curG.append("path")\n' +
        '  .datum(d3.range(2));\n' +
        'selData\n' +
        '  .attr("d", curline);//attrEND\n';
      
      outcode += '\n';
      
      wbip.outcode.write(outcode, "low");
      eval(outcode);
      
      wbip.slidemenu.append(d3.select("g.wbip-sm-" + curFrame.attr("id")),
        [{text: curID, icon: "wbip-icon-line-d3"}]);
    };
  
  return obj;
}();
wbip.addon("line-d3", true);

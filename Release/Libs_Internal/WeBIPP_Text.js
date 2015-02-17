wbip.text = function(){
  var obj = {tags: "subobj", type: "primary"};
  
  obj.icon =
    function(gMenu, transXY){
      obj.gMenu = gMenu;
      var curS = wbip.icon.def(gMenu, "wbip-icon-text");
      curS.append("text")
        .attr("x", 10)
        .attr("y", 10)
        .text("A");
      curS.append("rect")
        .attr("width", 20)
        .attr("height", 20);
      
      var curG = gMenu.append("g")
        .attr("transform", wbip.utils.translate(transXY))
        .classed("wbip-icon-text", true);
      wbip.icon.use(curG, "wbip-icon-text");
      
      curG.on("click", function(){
        wbip.gGraph.iconclick("text", gMenu, transXY);
      });
    };
  
  obj.defs = {
    x: ["attr", "numeric", {
      useScale: ["useScale-x", "logical"]
    }],
    y: ["attr", "numeric", {
      useScale: ["useScale-y", "logical"]
    }],
    text: ["func", "text"],
    "text-anchor": ["style", "list", undefined, {
      list: ["start", "middle", "end"]
    }],
    "dominant-baseline": ["style", "list", undefined, {
      list: ["auto",
        "ideographic", "alphabetic",
        "hanging", "mathematical",
        "middle", "central",
        "text-before-edge", "text-after-edge"]
    }],
    "font-size": ["style", "numeric"],
    "font-style": ["style", "list", undefined, {
      list: ["normal", "italic"]
    }],
    "font-weight": ["style", "list", undefined, {
      list: ["normal", "bold"]
    }],
    "font-family": ["style", "list", undefined, {
      list: ["serif", "sans-serif", "cursive", "monospace"]
    }],
    "font-variant": ["style", "list", undefined, {
      list: ["normal", "small-caps"]
    }],
    "text-rendering": ["style", "list", undefined, {
      list: ["auto", "optimizeSpeed", "optimizeLegibility", "geometricPrecision"]
    }],
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
        {"wbip-obj-text": true, "wbip-gobj": true});
      
      var curAttrs = {x: Coords[0], y: Coords[1]};
      outcode += wbip.outcode.append(1, "text", curAttrs);
      outcode += 'selData\n' + '  .text("Text");//funcEND\n';
      curAttrs["x-useScale"] = "auto";
      curAttrs["y-useScale"] = "auto";
      curAttrs["text"] = "Text";
      curAttrs["text-anchor"] = "middle";
      curAttrs["dominant-baseline"] = "central";
      curAttrs["font-family"] = "sans-serif";
      var curVars = {attr: curAttrs, name: "text"};
      wbip.setIDvar(curID, curVars);
      
      outcode += '\n';
      
      wbip.outcode.write(outcode, "low");
      eval(outcode);
      
      wbip.slidemenu.append(d3.select("g.wbip-sm-" + curFrame.attr("id")),
        [{text: curID, icon: "wbip-icon-text"}]);
    };
  
  return obj;
}();

wbip.addon("text");

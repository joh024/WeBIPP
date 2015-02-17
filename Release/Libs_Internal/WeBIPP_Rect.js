wbip.rect = function(){
  var obj = {tags: "subobj", type: "primary"};
  
  obj.icon =
    function(gMenu, transXY){
      obj.gMenu = gMenu;
      var curS = wbip.icon.def(gMenu, "wbip-icon-rect");
      curS.append("rect")
        .attr("width", 20)
        .attr("height", 20);
      
      var curG = gMenu.append("g")
        .attr("transform", wbip.utils.translate(transXY))
        .classed("wbip-icon-rect", true);
      wbip.icon.use(curG, "wbip-icon-rect");
      
      curG.on("click", function(){
        wbip.gGraph.iconclick("rect", gMenu, transXY);
      });
    };
  
  obj.defs = {
    x: ["attr", "numeric", {
      adj: ["special", "proportion"],
      useScale: ["useScale-x", "logical"]
    }],
    y: ["attr", "numeric", {
      adj: ["special", "proportion"],
      useScale: ["useScale-y", "logical"]
    }],
    width: ["attr", "numeric", {
      useScale: ["useScale-x-dist", "logical"]
    }],
    height: ["attr", "numeric", {
      useScale: ["useScale-y-dist", "logical"]
    }],
    stroke: ["style", "rgb"],
    fill: ["style", "rgb"],
    opacity: ["style", "proportion"]
  };
  
  // obj.defshelp
  // help text
  // + suggested values
  
  obj.setattr =
    function(curID, name, val){
      var setxyadj = function(){
        val = eval(val);
        // store val in IDvars
        var curVars = wbip.getIDvar(curID);
        curVars.attr[name] = val;
        
        // replace the "wbip.rect.adjXY(selData, 0.5, 0.5);" line
        var fromto = wbip.cm.findbyid(wbip.cm.low, curID);
        var searchstr = "wbip.rect.adjXY";
        var newval =  "wbip.rect.adjXY(selData, " +
          curVars.attr["x-adj"] + ", " + curVars.attr["y-adj"] + ");";
        wbip.cm.replaceline(wbip.cm.low, fromto, searchstr, newval);
        
        // eval to make change
        wbip.cm.loweval();
      };
      switch(name){
        case "x-adj":
        case "y-adj":
          setxyadj();
          break;
        default:
          wbip.setattr(curID, wbip.getrealdef(obj.defs, name), name, val);
      }
    };
  
  obj.getattr = wbip.getattr;
  
  obj.click =
    function(curID, curFrame, Coords){
      var outcode = wbip.outcode.init(curID, curFrame,
        {"wbip-obj-rect": true, "wbip-gobj": true});
      
      var curAttrs = {x: Coords[0], y: Coords[1], width: 20, height: 20};
      outcode += wbip.outcode.append(1, "rect", curAttrs);
      
      curAttrs["x-adj"] = 0.5;
      curAttrs["y-adj"] = 0.5;
      curAttrs["x-useScale"] = "auto";
      curAttrs["y-useScale"] = "auto";
      curAttrs["width-useScale"] = "auto";
      curAttrs["height-useScale"] = "auto";
      var curVars = {attr: curAttrs, name: "rect"};
      wbip.setIDvar(curID, curVars);
      
      outcode += 'wbip.rect.adjXY(selData, 0.5, 0.5);\n\n';
      
      wbip.outcode.write(outcode, "low");
      eval(outcode);
      
      wbip.slidemenu.append(d3.select("g.wbip-sm-" + curFrame.attr("id")),
        [{text: curID, icon: "wbip-icon-rect"}]);
    };
  
  obj.adjXY =
    // Given a d3 selection, xadj and yadj
    // Adjust the selection's x/y by "adj" the width/height
    // e.g. if xadj = 0,   x not adjusted (describes left)
    //              = 0.5, x effectively cx (describes center, adjusted by half width)
    //              = 1,   x fully adjusted (describes right, adjusted by full width)
    function(sel, xadj, yadj){
      sel.attr("x", function(d, i){
        return Number(d3.select(sel[0][i]).attr("x")) -
          Number(d3.select(sel[0][i]).attr("width")) * xadj;});
      sel.attr("y", function(d, i){
        return Number(d3.select(sel[0][i]).attr("y")) -
          Number(d3.select(sel[0][i]).attr("height")) * yadj;});
    };
  
  return obj;
}();
wbip.addon("rect");

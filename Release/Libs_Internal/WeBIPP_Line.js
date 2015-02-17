wbip.line = function(){
  var obj = {tags: "subobj", type: "primary"};
  
  obj.icon =
    function(gMenu, transXY){
      obj.gMenu = gMenu;
      var curS = wbip.icon.def(gMenu, "wbip-icon-line");
      curS.append("polyline")
        .attr("points", "0,17 6,6 16,13 20,3");
      curS.append("rect")
        .attr("width", 20)
        .attr("height", 20);
      
      var curG = gMenu.append("g")
        .attr("transform", wbip.utils.translate(transXY))
        .classed("wbip-icon-line", true);
      wbip.icon.use(curG, "wbip-icon-line");
      
      curG.on("click", function(){
        wbip.gGraph.iconclick("line", gMenu, transXY);
      });
    };
  
  obj.defs = {
    x: ["special", "numeric", {
      useScale: ["useScale-x", "logical"]
    }],
    y: ["special", "numeric", {
      useScale: ["useScale-y", "logical"]
    }],
    stroke: ["style", "rgb"],
    "stroke-width": ["style", "numeric"],
    "stroke-linecap": ["style", "list", undefined, {
      list: ["butt", "round", "square"]
    }],
    "stroke-dasharray": ["style", "csv"],
    opacity: ["style", "proportion"]
  };
  // Number of lines is 1 less than length of data
  obj.defsn = -1;
  
  obj.setattr =
    function(curID, name, val){
      var setxy = function(){
        // store val in IDvars
        var curVars = wbip.getIDvar(curID);
        curVars.attr[name] = val;
        
        // Need to call "setattr" twice, once for x1 and again for x2
        // Only difference is that x1 takes [d] while x2 takes [d + 1]
        // First, we create a fake def
        var curdef = ["attr", "numeric", {useScale: ["useScale-" + name, "logical"]}];
        // Can always call for x1 as is
        wbip.setattr(curID, curdef, name + "1", val);
        
        // if val starts with the "expr:" keyphrase
        // Replace [d] with [d + 1], then call for x2
        if(val.substr(0, 5) === "expr:"){
          wbip.setattr(curID, curdef, name + "2", val.replace("[d]", "[d + 1]"));
        } else{
          // Else, assuming it's a vector,
          // Form an expr to make a [d + 1], then call for x2
          wbip.setattr(curID, curdef, name + "2", "expr:" + val + "[d + 1]");
        }
      };
      var setxyscale = function(){
        val = val === "true";
        var xy = name.split("-")[0];
        // store vals for x1 and x2
        var curVars = wbip.getIDvar(curID);
        curVars.attr[xy + "1" + "-useScale"] = val;
        curVars.attr[xy + "2" + "-useScale"] = val;
        // call setattr to refresh values
        // a bit inefficient, but keeps things generalised
        obj.setattr(curID, xy, obj.getattr(curID, xy));
      };
      switch(name){
        case "x":
        case "y":
          setxy();
          break;
        case "x-useScale":
        case "y-useScale":
          setxyscale();
          break;
        default:
          wbip.setattr(curID, wbip.getrealdef(obj.defs, name), name, val);
      }
    };
  
  obj.getattr =
    function(curID, name){
      switch(name){
        case "x-useScale":
        case "y-useScale":
          return wbip.getattr(curID, name.replace("-", "1-"));
        default:
          return wbip.getattr(curID, name);
      }
    };
  
  obj.click =
    function(curID, curFrame, Coords){
      var outcode = wbip.outcode.init(curID, curFrame,
        {"wbip-obj-line": true, "wbip-gobj": true});
      
      var curAttrs = {
        x1: Coords[0],
        x2: Coords[0] + 50,
        y1: Coords[1],
        y2: Coords[1] - 30
      };
      outcode += wbip.outcode.append(1, "line", curAttrs);
      
      curAttrs.x = [Coords[0], Coords[0] + 50];
      curAttrs.y = [Coords[1], Coords[1] - 30];
      curAttrs["x1-useScale"] = "auto";
      curAttrs["x2-useScale"] = "auto";
      curAttrs["y1-useScale"] = "auto";
      curAttrs["y2-useScale"] = "auto";
      var curVars = {attr: curAttrs, name: "line"};
      wbip.setIDvar(curID, curVars);
      
      outcode += '\n';
      
      wbip.outcode.write(outcode, "low");
      eval(outcode);
      
      wbip.slidemenu.append(d3.select("g.wbip-sm-" + curFrame.attr("id")),
        [{text: curID, icon: "wbip-icon-line"}]);
    };
  
  return obj;
}();
wbip.addon("line");

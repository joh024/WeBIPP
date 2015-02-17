// Early fiddling
// Doesn't work as intended
wbip.scatterplot = function(){
  var obj = {tags: ["subobj", "protofise"], type: "primary"};
  
  obj.icon =
    function(gMenu, transXY){
      obj.gMenu = gMenu;
      var curS = wbip.icon.def(gMenu, "wbip-icon-scatterplot");
      curS.append("rect")
        .attr("width", 20)
        .attr("height", 20);
      
      var curG = gMenu.append("g")
        .attr("transform", wbip.utils.translate(transXY))
        .classed("wbip-icon-scatterplot", true);
      wbip.icon.use(curG, "wbip-icon-scatterplot");
      
      curG.on("click", function(){
        wbip.gGraph.iconclick("scatterplot", gMenu, transXY);
      });
    };
  
  obj.defs = {
    x: ["special", "data"],
    y: ["special", "data"]
  };
  
  // obj.defshelp
  // help text
  // + suggested values
  
  obj.setattr =
    function(curID, name, val){
      // Only accepts wbip.data inputs
      if(val.substr(0, 9) === "wbip.data"){
        // store val in IDvars
        var curVars = wbip.getIDvar(curID);
        curVars.attr[name] = val;
        
        // replace the "wbip.scatterplot.new(x, y);" line
        var fromto = wbip.cm.findbyid(wbip.cm.low, curID);
        var searchstr = "wbip.scatterplot.new";
        var newval =  "wbip.scatterplot.new(, " +
          curVars.attr["x"] + ", " + curVars.attr["y"] + ");";
        wbip.cm.replaceline(wbip.cm.low, fromto, searchstr, newval);
        
        // eval to make change
        wbip.cm.loweval();
      }
    };
  
  obj.getattr = wbip.getattr;
  
  obj.click =
    function(curID, curFrame, Coords){
      var curAttrs = {x: JSON.stringify([1, 2, 3]),
                      y: JSON.stringify([1, 2, 3])};
      var curVars = {attr: curAttrs, name: "scatterplot"};
      wbip.setIDvar(curID, curVars);
      
      var outcode = 'wbip.scatterplot.new("[1, 2, 3]", "[1, 2, 3]");\n\n';
      
      wbip.outcode.write(outcode, "high");
      eval(outcode);
      
      wbip.slidemenu.append(d3.select("g.wbip-sm-" + curFrame.attr("id")),
        [{text: curID, icon: "wbip-icon-scatterplot"}]);
    };
  
  obj.new =
    function(x, y){
      var oricode =
        "var FrID = \"gEL\" + wbip.getELIndex();\n" +
        "var CirID = \"gEL\" + wbip.getELIndex();\n" +
        "wbip[\"frcart\"].click(FrID, d3.select(\"#gGraph\"), [0,0]);\n" +
        "wbip[\"frcart\"].setattr(FrID, \"x\", \"XDATA\");\n" +
        "wbip[\"frcart\"].setattr(FrID, \"y\", \"YDATA\");\n" +
        "wbip[\"circle\"].click(CirID, d3.select(\"#\" + FrID), [0,0]);\n" +
        "wbip[\"circle\"].setattr(CirID, \"cx\", \"XDATA\");\n" +
        "wbip[\"circle\"].setattr(CirID, \"cy\", \"YDATA\");\n" +
        "wbip[\"circle\"].setattr(CirID, \"fill\", \"none\");\n" +
        "wbip[\"circle\"].setattr(CirID, \"r\", \"5\");\n"
      oricode = oricode.replace("XDATA", x, "g");
      oricode = oricode.replace("YDATA", y, "g");
      console.log(oricode);
      eval(oricode);
    };
  
  return obj;
}();
wbip.addon("scatterplot");

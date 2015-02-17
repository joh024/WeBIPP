wbip = function(){
  var wbip = {version: "0.11.0", vars: {}, IDvars: {}, addonList: {}};
  
  wbip.defarg =
    // Function to make it easier to set default argument values
    //   since currently only Firefox supports default argument values
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters
    function(arg, defval){
      if(typeof(arg) === 'undefined') arg = defval;
      return arg;
    };
  
  wbip.init =
    function(){
      wbip.layout.init();
      wbip.cm.init();
      wbip.menuobj.init();
      wbip.addonLoad();
    };
  wbip.new =
    function(){
      wbip.outcode.undostate = wbip.cm.high.getValue();
      
      // Wipe vars and IDvars
      wbip.clearvars();
      wbip.clearIDvars();
      
      // Wipe data
      wbip.data = {};
      
      // Refresh Layout and reload Addons
      wbip.init();
    };
  wbip.refresh =
    // Messy refresh
    function(){
      wbip.new();
      wbip.cm.high.setValue(wbip.outcode.undostate);
      wbip.cm.higheval();
    };
  
  wbip.clearvars =
    function(){
      wbip.vars = {};
    };
  
  wbip.getELIndex =
    function(){
      if(!wbip.vars.ELIndex){
        wbip.vars.ELIndex = 2;
      } else{
        wbip.vars.ELIndex += 1;
      }
      // Failsafe checking no element exists with given ELIndex
      while(!d3.select("#gEL" + (wbip.vars.ELIndex - 1)).empty()){
        wbip.vars.ELIndex += 1;
      }
      return wbip.vars.ELIndex - 1;
    };
  
  wbip.clearIDvars =
    function(){
      wbip.IDvars = {};
    }
  
  wbip.getIDvar =
    // Retrieves the object stored for the given ID
    //   within wbip.IDvars
    // If no objects stored for the ID, returns null
    function(curID){
      if(typeof wbip.IDvars[curID] == "undefined"){
        return null;
      } else{
        return wbip.IDvars[curID];
      }
    };
  wbip.getdim =
    // Specialised getIDvar for grabbing dim
    function(curID){
      if(typeof wbip.IDvars[curID] == "undefined"){
        return null;
      }
      if(typeof wbip.IDvars[curID].attr.dim == "undefined"){
        return null;
      } else{
        return wbip.IDvars[curID].attr.dim;
      }
    };
  
  wbip.setIDvar =
    function(curID, curobj){
      wbip.IDvars[curID] = curobj;
    };
  
  wbip.getrealdef =
    // For processing cases like x-name
    // where the def of x-name is defined as a
    // child of x
    function(defs, name){
      if(defs[name] === undefined){
        var curSplit = name.split("-");
        var subdef = [0, 0, defs];
        for(var i = 0; i < curSplit.length; i++){
          subdef = subdef[2][curSplit[i]];
        }
        return subdef;
      } else{
        return defs[name];
      }
    };
  
  wbip.getattr =
    function(curID, name){
      var curval = wbip.getIDvar(curID).attr[name];
      if(wbip.utils.isArray(curval)){curval = JSON.stringify(curval);}
      return curval;
    };
  
  wbip.setattr =
    function(curID, attrdef, name, val){
      if(typeof val !== "string"){val = JSON.stringify(val);}
      // If attr type is "special",
      //   this generic function shouldn't be handling it
      if(attrdef[0] === "special"){
        console.log('wbip.setattr cannot handle a "special" type attribute!');
        console.log(arguments);
        return;
      }
      var curVars = wbip.getIDvar(curID);
      
      // If we're dealing with a "useScale" type
      // Need to save the value as a logical
      // Then pretend we're setting a value for the attribute
      //   this useScale applies to, which will result in
      //   correct updating of relevant code
      if(attrdef[0].split("-")[0] === "useScale"){
        val = val === "true";
        curVars.attr[name] = val;
        // Pretend
        name = name.split("-")[0];
        attrdef = wbip[curVars.name].defs[name];
        val = curVars.attr[name].toString();
      }
      
      // store val in IDvars
      curVars.attr[name] = val;
      // -valtype-
      // Want to know what kind of val we have
      // Currently there are 4 types:
      //   "value" - just a value, e.g. 5, e.g.2 "black"
      //   "vector" - an array of some sort, e.g. [1, 2, 3]
      //   "expr" - an expression, e.g. "expr:[1, 2, 3][d] * 10"
      //          after setting valtype to "expr", the "expr:"
      //          keyphrase is removed, i.e.
      //          "expr:[1, 2, 3][d] * 10" -> "[1, 2, 3][d] * 10"
      //   "(default)" - representing the null or undefined value
      //               taking whatever the (unknown) default is
      var valtype = "value";
      if(val === "(default)"){
        valtype = "(default)"
      } else{
        // if val starts with the "expr:" keyphrase
        // set type to "expr" and adjust val to remove keyphrase
        if(val.substr(0, 5) === "expr:"){
          valtype = "expr";
          val = val.substr(5);
        } else{
          // else try evaluating val
          try{
            var valreal = eval(val);
            // if valreal is just a number,
            // set val to that number (for cleanliness)
            if(typeof valreal === "number"){
              val = valreal;
            }
            // if valreal is an array, set type to be "vector"
            if(wbip.utils.isArray(valreal)){
              valtype = "vector";
            }
          } catch(e){
            // assumes val is a normal string (e.g. "black")
            val = JSON.stringify(val);
          }
        }
      }
      // -useScale-
      // If valtype is "vector" or "expr"
      //   and useScale set to "auto"
      // Set useScale to true
      if((valtype === "vector" || valtype === "expr") &&
         curVars.attr[name + "-useScale"] === "auto"){
        curVars.attr[name + "-useScale"] = true;
      }
      // Check if attr has a useScale set to true
      // If so, add a getScale line
      if(curVars.attr[name + "-useScale"] === true){
        var scaledefs = attrdef[2]["useScale"][0].split("-");
        var scalename = scaledefs[1];
        if(scaledefs[2] === "dist"){
          var scaleval = function(val){
            return "wbip.distScale(wbip.getScale(curFrame, " +
              JSON.stringify(scalename) + "), " + val + ")";
          };
        } else{
          var scaleval = function(val){
            return "wbip.getScale(curFrame, " + JSON.stringify(scalename) + ")(" + val + ")";
          };
        }
      } else{
        var scaleval = function(val){return val;};
      }
      
      // -adjust code-
      // Want to adjust the d3 code
      var fromto = wbip.cm.findbyid(wbip.cm.low, curID);
      // if valtype is vector, adjust data length;
      if(valtype === "vector"){
        var defsn = wbip[curVars.name].defsn;
        if(defsn === undefined){defsn = 0;}
        var datalength = valreal.length + defsn;
        try{
          // Try to replace ".data" line
          var searchstr = "  .data(";
          var newval = "  .data(d3.range(" + datalength + "));";
          wbip.cm.replaceline(wbip.cm.low, fromto, searchstr, newval);
        } catch(e){
          // If no ".data" line, look for ".datum"
          var searchstr = "  .datum(";
          var newval = "  .datum(d3.range(" + datalength + "));";
          wbip.cm.replaceline(wbip.cm.low, fromto, searchstr, newval);
        }
      }
      // actual attr line adjustment
      if(attrdef[0] === "func"){
        // line we're searching for e.g. "  .x(function(d) ... )"
        var searchstr = "." + name + "(";
      } else{
        // line we're searching for e.g. "  .attr("x", function(d) ...)"
        var searchstr = "." + attrdef[0] + "(" + JSON.stringify(name) + ", ";
      }
      var newval = "  " + searchstr;
      var searchres = wbip.cm.searchbetween(wbip.cm.low, searchstr, fromto);
      var endstr = attrdef[0] === "func" ? ";//funcEND" : ";//attrEND";
      var attrend = wbip.cm.searchbetween(wbip.cm.low, endstr, fromto);
      switch(valtype){
        case "(default)":
          newval += "undefined)";
          break;
        case "expr":
          newval += "function(d){return " + scaleval(val) + ";})";
          break;
        case "vector":
          newval += "function(d){return " + scaleval(val + "[d]") + ";})";
          break;
        default:
          newval += scaleval(val) + ")";
      }
      if(searchres == false){
        // Search returns false, make new
        wbip.cm.low.replaceRange('\n' + newval, from = attrend.from, to = attrend.from);
      } else{
        // Search returns true, replace
        if(attrend.from.line === searchres.from.line){newval += endstr;}
        var repfromto = {from: {line: searchres.from.line, ch: 0}, to: {line: searchres.from.line}};
        wbip.cm.low.replaceRange(newval, from = repfromto.from, to = repfromto.to);
      }
      
      // eval to make change
      wbip.cm.loweval();
    };
  
  wbip.getScale =
    function(curFrame, scalename){
      return wbip.getIDvar(curFrame.attr("id")).attr[scalename];
    };
  
  wbip.distScale =
    // Given a d3 scale
    // And a number
    // Return the distance of the number on the scale
    // The sign is always the same sign of the number provided
    function(scalef, dist){
      var out = Math.sign(dist) * Math.abs(scalef(dist) - scalef(0));
      if(isNaN(out)){
        try{
          out = Math.sign(dist) * Math.abs(scalef.range()[dist] - scalef.range()[0]);
        } catch(e){
          console.log("WeBIPP cannot compute a scaled distance!")
        }
      }
      return out;
    };
  
  wbip.getSelBG =
    function(gMenu, transXY){
      gMenu.select(".SelBG").style("display", null);
      gMenu.select(".SelBG").attr("transform", wbip.utils.translate(transXY));
    };
  wbip.remSelBG =
    function(gMenu){
      gMenu.select(".SelBG").style("display", "none");
    };
  
  wbip.addon =
    function(name, enabled){
      enabled = wbip.defarg(enabled, true);
      var curList = wbip.addonList;
      // Check name doesn't already exist
      if(curList[name] !== undefined){
        // Some kind of error
      } else{
        curList[name] = enabled;
      }
    };
  
  wbip.addonLoad =
    function(){
      var curList = wbip.addonList;
      for(var name in curList){
        if(curList[name] === true){
          // Add icon
          switch(wbip[name].type){
            case "primary":
              wbip.getIDvar(wbip.vars.gMenuPri.attr("id")).addicon(wbip[name].icon);
              break;
            case "secondary":
              wbip.getIDvar(wbip.vars.gMenuSec.attr("id")).addicon(wbip[name].icon);
              break;
            case "tertiary":
              wbip.getIDvar(wbip.vars.gMenuTer.attr("id")).addicon(wbip[name].icon);
              break;
            case "special":
              // For specials, call its .new() function
              // which will do its own special thing
              wbip[name].new();
              break;
            default: 
              console.log("Addon " + name + " is an unrecognised type");
          }
        }
      }
    };
  // ----
  // icon
  wbip.icon = {};
  wbip.icon.def =
    function(gMenu, curID){
      var curdefs = gMenu.select("defs");
      if(curdefs.empty() == true){
        var curdefs = gMenu.append("defs");
      }
      var outS = curdefs.append("symbol")
        .attr("id", curID)
        .attr("viewBox", "-2 -2 24 24");
      return outS;
    };
  wbip.icon.use =
    function(curG, iconID){
      curG.append("use")
        .attr("x", -2)
        .attr("y", -2)
        .attr("width", 24)
        .attr("height", 24)
        .attr("xlink:href", "#" + iconID);
    };
  wbip.icon.auto =
    // For lazy (or automation)
    // Given a name, a function to call when the icon is clicked
    // and the function to add the icon to a menu
    //   (e.g. wbip.getIDvar(wbip.vars.gMenuPri.attr("id")).addicon)
    // Automatically create an icon function, which is a rectangle
    //   coloured automatically based on using the golden ratio
    // Then add this icon to the menu specified
    function(name, clickf, addf){
      if(wbip.vars.iconauton === undefined){
        wbip.vars.iconauton = 0;
      }
      // Use golden ratio to generate a new colour for the icon
      var goldenrat = (1 + Math.sqrt(5))/2;
      var goldenangle = 360/Math.pow(goldenrat, 2);
      var curangle = wbip.vars.iconauton * goldenangle;
      var curcol = wbip.hcl(curangle, c = 35, l = 85);
      wbip.vars.iconauton += 1;
      var curID = "wbip-icon-" + name;
      
      var iconf = function(gMenu, transXY){
        var curS = wbip.icon.def(gMenu, curID);
        curS.append("rect")
          .attr("width", 20)
          .attr("height", 20)
          .style("stroke", "black")
          .style("fill", curcol);
        
        var curG = gMenu.append("g")
          .attr("transform", wbip.utils.translate(transXY))
          .classed(curID, true);
        wbip.icon.use(curG, curID);
        
        curG.on("click", clickf);
      };
      
      addf(iconf);
    };
  
  // ----
  // outcode
  wbip.outcode = {};
  wbip.outcode.marker =
    function(curID){
      return '// MARKER ' + curID + '\n';
    };
  wbip.outcode.init =
    function(curID, curFrame, curClasses){
      return '// MARKER '.concat(curID, '\n',
        'var curFrame = d3.select("#', curFrame.attr("id"), '");\n',
        'var curDim = wbip.getdim("', curFrame.attr("id"), '");\n',
        'var curG = curFrame.append("g")\n',
        '  .attr("id", "', curID, '")\n',
        '  .classed(', JSON.stringify(curClasses), ');\n');
    };
  wbip.outcode.append =
    function(length, name, attrs, classes, styles){
      outcode = 'var selData = curG.selectAll("*")\n'.concat(
        '  .data(d3.range(', length, '));\n',
        'selData.enter().append("', name, '")');
      for(var attr in attrs){
        outcode += '\n  .attr("' + attr + '", ' + attrs[attr] + ')';
      }
      for(var style in styles){
        outcode += '\n  .style("' + style + '", ' + styles[style] + ')';
      }
      if(!classes == false){
        outcode += '\n  .classed(' + JSON.stringify(classes) + ')';
      }
      outcode += ';//attrEND\n';
      return outcode;
    };
  wbip.outcode.write =
    function(code, type){
      switch(type){
        case "low":
          wbip.cm.low.replaceRange(code,
            from = {line: wbip.cm.low.lastLine()});
          break;
        case "high":
          if(wbip.outcode.freeze){break;}
          wbip.outcode.undostate = wbip.cm.high.getValue();
          wbip.cm.high.replaceRange(code + "\n",
            from = {line: wbip.cm.high.lastLine()});
          break;
        default:
          console.log("Code Type: " + type + " is an unrecognised type");
      }
    };
  wbip.outcode.freeze = false;
  wbip.outcode.undostate = "";
  wbip.outcode.undo =
    function(){
      var undostate = wbip.outcode.undostate
      wbip.new();
      wbip.cm.high.setValue(undostate);
      wbip.cm.higheval();
    };
  
  // ----
  // data
  wbip.data = {};
  wbip.datanew =
    function(name, dat){
      // Remove .json extension to shorten name a bit
      var name = name.replace(/\.json$/, "");
      var outcode = "wbip.data[" + JSON.stringify(name) +
        "] = JSON.parse(" + JSON.stringify(dat) + ");";
      wbip.outcode.write(outcode, "high");
      eval(outcode);
      if(!d3.select("#wbip-dataviewer").empty()){
        d3.select("#wbip-dataviewer").remove();
        wbip.dataviewer.new(wbip.vars.svg, "wbip-dataviewer", [300, 100]);
      }
    };
  
  // ----
  // gGraph
  wbip.gGraph = {sel: ""};
  wbip.gGraph.iconclick =
    function(name, gMenu, transXY){
      if(wbip.gGraph.sel === ""){
        wbip.getSelBG(gMenu, transXY);
        wbip.gGraph.sel = name;
      } else{
        wbip.remSelBG(gMenu);
        wbip.gGraph.sel = "";
      }
    };
  wbip.gGraph.click =
    function(){
      var name = wbip.gGraph.sel;
      if(name != ""){
        if(typeof wbip[name].click == "function"){
          var curID = "gEL" + wbip.getELIndex();
          var curFrame = wbip.utils.getParent(d3.event.originalTarget, "wbip-frame");
          var outcode = 'wbip[' + JSON.stringify(name) + '].click(' +
            '"' + curID + '", ' +
            'd3.select("#' + curFrame.id + '"), ' +
            JSON.stringify(d3.mouse(curFrame)) + ');';
          wbip.outcode.write(outcode, "high");
          eval(outcode);
          wbip.remSelBG(wbip[name].gMenu);
          wbip.gGraph.sel = "";
        }
      }
    };
  //wbip.gGraph.drag = function(){};
  //wbip.gGraph.aidActual = function(){};
  
  return wbip;
}();

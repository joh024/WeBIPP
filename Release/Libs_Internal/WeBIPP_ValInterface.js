wbip.valintf = function(){
  var obj = {tags: "menu-template", requires: ["terminal"]};
  
  obj.none =
    // The default Value Interface, used if no interfaces exist for
    //   type supplied or type is supplied as none.
    function(returnfunc, initval, aiID){
      var inputfunc =
        function(input){
          d3.selectAll("#" + curID).remove();
          returnfunc(input);
        };
      var curID = aiID + "-valintf";
      wbip.terminal.new(wbip.vars.svg, curID, [500, 70],
                        inputfunc, [200, 200], "Enter new value");
      $("#" + curID + "-terminal").terminal().set_command(initval);
    };
  
  obj.logical =
    // Not really an interface, just flips between true and false
    // Slightly weird code for robustness (hopefully)
    function(returnfunc, initval){
      if(initval === true){initval = "true";}
      returnfunc(String(initval !== "true"));
    };
  
  obj.proportion =
    function(returnfunc, initval, aiID){
      var cancelfunc =
        function(){
          wbip.outcode.freeze = true;
          returnfunc(initval);
          wbip.outcode.freeze = false;
        };
      var evalfunc =
        function(expr){
          return JSON.stringify(eval(expr));
        };
      
      var curID = aiID + "-valintf";
      var initnum = Number(initval);
      if(isNaN(initnum)){initnum = 1};
      var layout = [5, 2]; // 2x5 matrix
      var btndef = [[0, {label: 0.25, width: 2}, undefined, {label: 0.5, width: 2}, undefined],
                    [1, {label: 0.75, width: 2}, undefined, {label: "SET", width: 2}, undefined]];
      
      var curintf = wbip.btnintf.new(wbip.vars.svg, curID, returnfunc,
                                     cancelfunc, evalfunc, layout, btndef, false);
      CodeMirror(document.getElementById(curID + "-cm")).setValue(String(initnum));
    };
  
  obj.proportionold =
    function(returnfunc, initval, aiID){
      var curID = aiID + "-valintf";
      var initnum = Number(initval);
      if(isNaN(initnum)){initnum = 1};
      
      var cancelfunc =
        function(){
          wbip.outcode.freeze = true;
          returnfunc(initval);
          wbip.outcode.freeze = false;
        };
      var helpers = {
        proportion: {domain: [0, 1], initval: initnum, returnfunc: returnfunc}
      };
      
      wbip.utils.helperlineffw(wbip.vars.svg, curID, helpers, 300, cancelfunc);
    };
  
  obj.numeric =
    function(returnfunc, initval, aiID){
      var cancelfunc =
        function(){
          wbip.outcode.freeze = true;
          returnfunc(initval);
          wbip.outcode.freeze = false;
        };
      var evalfunc =
        // Correctly handle the various cases of original value
        function(expr){
          // Only need to do complicated stuff if OV is used
          if(expr.match("OV") !== null){
            // if initval is an expr
            if(initval.substr(0, 5) === "expr:"){
              return "expr:" + expr.replace("OV", initval.substr(5), "g");
            } else{
              // else try evaluating initval
              var valreal = eval(initval);
              // if valreal is just a number,
              // can return new number
              if(typeof valreal === "number"){
                return JSON.stringify(eval(expr.replace("OV", initval, "g")));
              }
              // if valreal is an array, need to
              // prefix "expr:"
              // append "[d]" to valreal
              if(wbip.utils.isArray(valreal)){
                return "expr:" + expr.replace("OV", initval + "[d]", "g");
              }
            }
          } else{
            // Direct eval
            return JSON.stringify(eval(expr));
          }
        };
      
      // Draw pseudo-calculator ffw
      var curID = aiID + "-valintf";
      var layout = [7, 3]; // 3x7 matrix
      var btndef =
       [[7, 8, 9, "+", "-", "(", ")"],
        [4, 5, 6, "*", "/", {label: "OV", tooltip: "Represents the original value", width: 2}, undefined],
        [1, 2, 3, 0, ".", {label: "SET", width: 2}, undefined]];
      // TODO add "^", but this requires some parsing to convert to Math.pow
      
      wbip.btnintf.new(wbip.vars.svg, curID, returnfunc,
                       cancelfunc, evalfunc, layout, btndef);
    };
  
  obj.numericold =
    function(returnfunc, initval, aiID){
      var applymod =
        function(oldval, mod){
          // if already an expr, then just append mod
          // adding brackets so mod gets applied correctly
          //   (e.g. in case of multiplication)
          if(oldval.substr(0, 5) === "expr:"){
            return "expr:(" + oldval.substr(5) + ")" + mod;
          } else{
            // else try evaluating val
            try{
              var valreal = eval(oldval);
              // if valreal is just a number,
              // apply mod to actual number and return new number
              if(typeof valreal === "number"){
                return eval(oldval + mod).toString();
              }
              // if valreal is an array,
              // append expr: and [d]
              // then append mod
              if(wbip.utils.isArray(valreal)){
                return "expr:(" + oldval + "[d])" + mod;
              }
            } catch(e){
              // shouldn't happen
              console.log("error in wbip.valintf.numeric");
              console.log(oldval);
            }
          }
        };
      
      var curID = aiID + "-valintf";
      
      var cancelfunc =
        function(){
          wbip.outcode.freeze = true;
          returnfunc(initval);
          wbip.outcode.freeze = false;
        };
      var addfunc =
        function(newval){
          returnfunc(applymod(initval, " + " + newval));
        };
      var multfunc =
        function(newval){
          returnfunc(applymod(initval, " * " + Math.pow(2, newval)));
        };
      var helpers = {
        additive: {domain: [-100, 100], initval: 0, returnfunc: addfunc},
        multiplicative: {domain: [-5, 5], initval: 0, returnfunc: multfunc}
      };
      
      wbip.utils.helperlineffw(wbip.vars.svg, curID, helpers, 300, cancelfunc);
    };
  
  obj.rgb =
    function(returnfunc, initval, aiID){
      var cancelfunc =
        function(){
          wbip.outcode.freeze = true;
          returnfunc(initval);
          wbip.outcode.freeze = false;
        };
      var evalfunc =
        function(expr){
          return JSON.stringify(eval(expr));
        };
      
      var curID = aiID + "-valintf";
      var makedef = function(){
        var ncol = 10; // last column used for SET
        var hvec = wbip.utils.seq(0, 270, ncol);
        var nrow = 5;
        var cvec = wbip.utils.seq(25, 45, nrow);
        var lvec = wbip.utils.seq(65, 105, nrow);
        var outmat = Array(nrow);
        for(var i = 0; i < nrow; i++){
          var currow = [];
          for(var j = 0; j < ncol; j++){
            if(j < ncol - 1){
              var curstr = "wbip.hcl(" + hvec[j] + "," + cvec[i] + "," + lvec[i] + ")";
              var curstyles = {bg: {stroke: "black", fill: eval(curstr)}, text: {display: "none"}};
              currow = currow.concat([{label: curstr, styles: curstyles}]);
            }
          }
          if(i < nrow - 1){
            currow = currow.concat([undefined, undefined]);
          } else{
            currow = currow.concat([{label: "SET", width: 2}, undefined]);
          }
          outmat[i] = currow;
        }
        return {layout: [outmat[0].length, outmat.length], btndef: outmat};
      };
      var defs = makedef();
      
      var curintf = wbip.btnintf.new(wbip.vars.svg, curID, returnfunc,
                                     cancelfunc, evalfunc, defs.layout, defs.btndef, false);
    };
  
  obj.rgbold =
    function(returnfunc, initval, aiID){
      var curID = aiID + "-valintf";
      // Check if it's a wbip.hcl call
      // If it is, grab the angle
      
      
      // Else set-up default angle as 0
      
      initnum = Number(initval);
      if(isNaN(initnum)){initnum = 0};
      
      var hclreturnfunc =
        function(newval){
          returnfunc("wbip.hcl(" + newval + ")");
        };
      var cancelfunc =
        function(){
          wbip.outcode.freeze = true;
          returnfunc(initval);
          wbip.outcode.freeze = false;
        };
      var helpers = {
        hue: {domain: [0, 360], initval: initnum, returnfunc: hclreturnfunc}
      };
      
      wbip.utils.helperlineffw(wbip.vars.svg, curID, helpers, 300, cancelfunc);
    };
  
  // obj.rgb
  // obj.axes
  // obj.axes-opts
  // obj.scale (might be an empty function)
  // obj.domain
  // obj.range
  // obj.
  
  obj.list =
    // Use SlideMenu to display a list of possible values
    function(returnfunc, initval, aiID, tarID, curAttr){
      var aig = d3.select("#" + aiID);
      var tarIDvars = wbip.getIDvar(tarID);
      var attrdef = wbip[tarIDvars.name].defs;
      var list = attrdef[curAttr][3].list;
      if(list === undefined){
        list = ["NO LIST FOUND"];
      }
      
      var itemselect = function(){
        returnfunc(d3.select(this).select("text").text());
        smp.remove();
      }
      var makesmc =
        function(list){
          var smc = [];
          for(var i = 0; i < list.length; i++){
            smc.push({text: list[i]});
          }
          return smc;
        };
      var smp = wbip.slidemenu.new(wbip.vars.svg, aiID + "-valintf", null, bg = true,
        events = {
          click: itemselect,
        mouseover: function(){
          wbip.slidemenu.drawBBox(d3.select(this)).classed("wbip-valintf-sm-BBox", true);
          d3.event.stopPropagation();
        },
        mouseout: function(){
          d3.selectAll(".wbip-valintf-sm-BBox").remove();
          d3.event.stopPropagation();
        }
      });
      smp.attr("transform", wbip.utils.translate(d3.mouse(wbip.vars.svg[0][0])));
      var smc = makesmc(list);
      wbip.slidemenu.append(smp, smc);
    };
  
  obj.dim =
    // Use utils.resize
    function(returnfunc, initval, aiID, tarID){
      var sel = d3.select("#" + tarID);
      if(typeof initval === "string"){initval = JSON.parse(initval);}
      var curdim = initval.slice(0);
      var drag = function(newdim){
      };
      var dragend = function(newdim){
        // It is unknown if running returnfunc will remove the interface or not
        // In the case of Cartesian Frames, it does (needs to rerun code
        //   to update any dependencies)
        // To be as general as possible, no running updates will be done
        // Ensuring returnfunc (and any updates) are only run at the very end
        //wbip.outcode.freeze = true;
        //returnfunc(newdim);
        //wbip.outcode.freeze = false;
        // obj.dim(returnfunc, newdim, aiID, tarID);
      };
      var cancelfunc = function(){
        //wbip.outcode.freeze = true;
        //returnfunc(initval);
        //wbip.outcode.freeze = false;
      };
      
      var valintf = wbip.utils.resize(sel, curdim, drag, dragend, cancelfunc, returnfunc);
      valintf.attr("id", aiID + "-valintf");
    };
  
  return obj;
}();

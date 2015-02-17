wbip.attrintf = function(){
  var obj = {tags: "menu-template", requires: ["slidemenu", "valintf"]};
  
  obj.new =
    function(gMenu, curID, dim, classes){
      var mainG = gMenu.append("g")
        .attr("id", curID)
        .classed({"wbip-attrintf": true, "unselectable": true});
      mainG.classed(classes);
      var CalVals = wbip.utils.CalibrateText(mainG);
      wbip.setIDvar(curID, {dim: dim, CalVals: CalVals});
      
      // name
      var curG = mainG.append("g")
        .attr("id", curID + "-name")
        .classed("wbip-attrintf-name", true);
      curG.append("rect")
        .attr("width", dim[0]/2)
        .attr("height", dim[1]);
      curG.append("text")
        .attr("x", dim[0]/4)
        .attr("y", dim[1]/2)
        .text("NAME");
      // value
      var curG = mainG.append("g")
        .attr("id", curID + "-value")
        .attr("transform", wbip.utils.translate(dim[0]/2, 0))
        .classed("wbip-attrintf-value", true);
      curG.append("rect")
        .attr("width", dim[0]/2)
        .attr("height", dim[1]);
      curG.append("text")
        .attr("x", dim[0]/4)
        .attr("y", dim[1]/2)
        .text("VALUE");
      
      return mainG;
    };
  
  obj.defs =
    // given an AttrIntfG
    // and a TargetID
    // grab the defs from the TarID's IDvars
    // to populate and bind events to the aig
    function(aig, tarID){
      var aiID = aig.attr("id");
      var aigIDvars = wbip.getIDvar(aiID);
      var tarIDvars = wbip.getIDvar(tarID);
      var attrdef = wbip[tarIDvars.name].defs;
      var attrnames = wbip.utils.names(attrdef);
      var aigname = d3.select("#" + aiID + "-name");
      var aigval = d3.select("#" + aiID + "-value");
      
      var nameset = function(curAttr){
        aigname.select("text").text(curAttr);
        var curval = wbip[tarIDvars.name].getattr(tarID, curAttr);
        if(curval === undefined){
          curval = "(default)";
          // following code is for reference
          //   curval = window.getComputedStyle(document.getElementById(tarID))[curAttr];
          // doesn't work as is, since our tarID is the <g>
          // and not the actual element which has the styles we want
        }
        
        // Adjust widths to make it prettier
        var namewidth = Math.max(50, aigIDvars.CalVals[0] * (curAttr.length + 1));
        var valwidth = aigIDvars.dim[0] - namewidth;
        aigname.select("rect").attr("width", namewidth);
        aigname.select("text").attr("x", namewidth/2);
        aigval.attr("transform", wbip.utils.translate(namewidth, 0));
        aigval.select("rect").attr("width", valwidth);
        aigval.select("text").attr("x", valwidth/2);
        
        // If curval is too long, truncate
        var maxchar = Math.floor(valwidth/aigIDvars.CalVals[0]);
        if(curval.length > maxchar){curval = curval.substr(0, maxchar - 3) + "...";}
        aigval.select("text").text(curval);
      };
      var nameselect = function(){
        var getfullname =
          // so if "adj" that's a child of "x" is selected
          // return at the end, "x-adj", etc
          function(cursel){
            var out = cursel.select("text").text();
            var parentsel = d3.select("#" + wbip.getIDvar(cursel.attr("id")).parent);
            if(parentsel.classed("wbip-slidemenu-child")){
              out = getfullname(parentsel) + "-" + out;
            }
            return out;
          };
        
        nameset(getfullname(d3.select(this)));
        d3.select("#" + aiID + "-name-menu").remove();
        d3.select("#" + aiID + "-valintf").remove();
        d3.event.stopPropagation();
      };
      var namemenu = function(){
        var makesmc =
          // Construct slidemenu-children array using
          // attrdef, calling itself recursively where necessary
          function(attrdef){
            var smc = [];
            for(var attrname in attrdef){
              var cursmc = {text: attrname};
              var subattrdef = attrdef[attrname][2];
              if(subattrdef !== undefined){
                cursmc.canmm = true;
                cursmc.children = makesmc(subattrdef);
              }
              smc.push(cursmc);
            }
            return smc;
          };
        if(d3.select("#" + aiID + "-name-menu").empty()){
          var smp = wbip.slidemenu.new(aig, aiID + "-name-menu", null, bg = true,
            events = {
              click: nameselect,
              mouseover: function(){
                wbip.slidemenu.drawBBox(d3.select(this)).classed("wbip-attrintf-sm-BBox", true);
                d3.event.stopPropagation();
              },
              mouseout: function(){
                d3.selectAll(".wbip-attrintf-sm-BBox").remove();
                d3.event.stopPropagation();
              }
            }
          );
          smp.attr("transform", wbip.utils.translate(d3.mouse(this)));
          var smc = makesmc(attrdef);
          wbip.slidemenu.append(smp, smc);
          // minimise all
          //var smarr = smp.selectAll("g.wbip-slidemenu-child")[0];
          //for(var i = 0; i < smarr.length; i++){
          //  wbip.slidemenu.minmaxnode(d3.select(smarr[i]));
          //}
        } else{
          d3.select("#" + aiID + "-name-menu").remove();
        }
      };
      
      var valset = function(newval){
        var curAttr = aigname.select("text").text();
        
        var outcode = "wbip[" + JSON.stringify(tarIDvars.name) +
          "].setattr(" + JSON.stringify(tarID) + ", " + JSON.stringify(curAttr) +
          ", " + JSON.stringify(newval) + ");";
        wbip.outcode.write(outcode, "high");
        eval(outcode);
        
        nameset(curAttr);
      };
      var valmenu = function(){
        var curAttr = aigname.select("text").text();
        var curType = wbip.getrealdef(attrdef, curAttr)[1];
        // var curval = aigval.select("text").text();
        var curval = wbip[tarIDvars.name].getattr(tarID, curAttr);
        if(curval === undefined){
          curval = "(default)";
        }
        curval = curval.toString();
        
        if(d3.select("#" + aiID + "-valintf").empty()){
          // call interface functions based on type
          // if no specific interface found, use a default
          var curintf = wbip.valintf[curType];
          if(curintf === undefined){
            // grab default intf
            curintf = wbip.valintf["none"];
          }
          // call the valintf
          curintf(valset, curval, aiID, tarID, curAttr);
        } else{
          // If terminal interface not loaded,
          //  open it also on a second click
          if(d3.select("#" + aiID + "-valintf-terminal").empty()){
            wbip.valintf["none"](valset, curval, aiID, tarID, curAttr);
          }
        }
      };
      
      aigname.on("click", namemenu);
      aigval.on("click", valmenu);
      
      // If Data Viewer is loaded, bind the click event
      var dataclick = function(selTarget){
          // Operating under assumption data is always 1 child deep
          // e.g. datSimple.val
          // but not datSimple.val.sum
          var selParent = d3.select("#" + wbip.getIDvar(selTarget.attr("id")).parent);
          if(selParent.classed("wbip-slidemenu-child")){
            var curdatstr = "wbip.data[" +
              JSON.stringify(selParent.select("text").text()) + "]" +
              "[" + JSON.stringify(selTarget.select("text").text()) + "]";
            valset(curdatstr);
          }
        };
      if(wbip.dataviewer !== undefined){
        wbip.dataviewer.click = dataclick;
      }
      
      // Save functions to aigIDvars
      var funcs = {
        nameset: nameset,
        nameselect: nameselect,
        namemenu: namemenu,
        valset: valset,
        valmenu: valmenu,
        dataclick: dataclick
      };
      aigIDvars.funcs = funcs;
      
      // ----
      // Clean-up
      // Select first attribute
      nameset(attrnames[0]);
    };
  
  obj.test =
    function(tarID){
      var aig = obj.new(wbip.vars.gMenuPri, "test-attrintf", wbip.getIDvar("gMenuPri").dim);
      obj.defs(aig, tarID);
    };
  
  return obj;
}();
//wbip.attrintf.test();

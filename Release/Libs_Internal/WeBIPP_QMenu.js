wbip.qmenu = function(){
  var obj = {tags: "quick-menu", type: "tertiary", requires: ["radialmenu", "menuobj", "attrintf"]};
  
  obj.icon =
    function(gMenu, transXY){
      obj.gMenu = gMenu;
      var curS = wbip.icon.def(gMenu, "wbip-icon-qmenu");
      curS.append("text")
        .attr("x", 10)
        .attr("y", 10)
        .text("Q");
      curS.append("rect")
        .attr("width", 20)
        .attr("height", 20);
      
      var curG = gMenu.append("g")
        .attr("transform", wbip.utils.translate(transXY))
        .classed({"wbip-icon-qmenu": true, "wbip-icon-qmenu-active": true});
      curG.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .classed("wbip-icon-bg", true);
      wbip.icon.use(curG, "wbip-icon-qmenu");
      
      curG.on("click", function(){
        // Toggle active/inactive
        if(curG.classed("wbip-icon-qmenu-active") === true){
          curG.classed("wbip-icon-qmenu-active", false);
        } else{
          curG.classed("wbip-icon-qmenu-active", true);
        }
      });
      
      // Bind event
      wbip.vars.svg.on("contextmenu", function(){
        if(curG.classed("wbip-icon-qmenu-active")){
          d3.event.preventDefault();
          obj.new();
        }
      });
    };
  
  obj.new =
    function(){
      // select .target, and then climb up parent to find wbip-gobj
      var selel = wbip.utils.getParent(d3.event.target, "wbip-gobj");
      // TODO also works by selecting through menuobj, if done with right-click
      if(selel !== undefined){
        // Pre-cleanup
        obj.close();
        
        var tarID = d3.select(selel).attr("id");
        
        // Fire off selection via MenuObj
        var tarsm = d3.select("g.wbip-sm-" + tarID);
        wbip.menuobj.mover(tarsm);
        wbip.menuobj.click(tarsm);
        // TODO Block unselecting via menuobj, to prevent cross-interference
        //  (unselecting done by closing qmenu)
        
        // TODO Block access to default attrintf, to prevent cross-interference
        //  (attribute assignments are done through qmenu, if it's open)
        
        // Create radialmenu with events that fire attrintf functions, for convenience
        // Pressing back closes and also unselects from MenuObj
        // TODO Check current position and whether there's enough space for all opts
        //  maxwidth = 1000
        var qmenurm = wbip.radialmenu.new(wbip.vars.svg, "qmenu-rm", undefined,
          d3.mouse(wbip.vars.svg[0][0]), 1000, undefined, undefined, obj.close);
        wbip.radialmenu.setopts(qmenurm, makeattropts(tarID, qmenurm));
      }
    };
  
  obj.close =
    // Unselect any existing selection from MenuObj
    // Close any existing qmenu
    // TODO Remove any existing blocks
    function(){
      if(!d3.select(".wbip-menuobj-click").empty()){
        wbip.menuobj.unclick();
      }
      d3.selectAll("#qmenu-rm").remove();
    };
  
  var makeattrlabels =
    // Construct the array of labels for the attributes
    // Prefixing parent for sub attributes, e.g. x-adj
    function(attrdef, parent){
      parent = wbip.defarg(parent, "");
      var labels = [];
      for(var attrname in attrdef){
        var curlab = [parent + attrname];
        var subattrdef = attrdef[attrname][2];
        if(subattrdef !== undefined){
          curlab = curlab.concat(makeattrlabels(subattrdef, parent + attrname + "-"));
        }
        labels = labels.concat(curlab);
      }
      return labels;
    };
  var makeattropts =
    // Make radialmenu opts object that lists all attributes
    //   of the target object
    function(tarID, qmenurm){
      var tarIDvars = wbip.getIDvar(tarID);
      var attrdef = wbip[tarIDvars.name].defs;
      return {
        name: tarID,
        labels: makeattrlabels(attrdef),
        events: {
          click: function(){
            var curAttr = d3.select(this).select("text").text();
            wbip.radialmenu.setopts(qmenurm, makevalopts(tarID, curAttr, qmenurm));
          }
        }
      };
    };
  
  var makedatalabels =
    // In addition to making data labels
    //  also stores the proper expanded reference
    //  to qmenu IDvar.datstr
    function(){
      var fulldat = wbip.data;
      var labels = [];
      var datstr = [];
      var datind = 0;
      for(var curdat in fulldat){
        var sublabs = wbip.utils.names(fulldat[curdat]);
        for(var i = 0; i < sublabs.length; i++){
          datstr[datind] = "[" + JSON.stringify(curdat) + "]" +
            "[" + JSON.stringify(sublabs[i]) + "]";
          sublabs[i] = "Data-" + datind + ":" + curdat + "." + sublabs[i];
          datind += 1;
        }
        labels = labels.concat(sublabs);
      }
      wbip.getIDvar("qmenu-rm").datstr = datstr;
      return labels;
    };
  var makevallabels =
    // For all attributes, opts are:
    // Open Interface
    // Any Suggested Values (not yet implemented)
    // Any Data Vectors
    function(curAttr){
      return ["Open Interface"].concat(makedatalabels());
    };
  var makevalopts =
    function(tarID, curAttr, qmenurm){
      // Find attrintf and grab its funcs
      var aig = d3.select("g.wbip-attrintf");
      var aigIDvars = wbip.getIDvar(aig.attr("id"));
      var aigfuncs = aigIDvars.funcs;
      // Select correct attribute in attrintf
      aigfuncs.nameset(curAttr);
      
      var onclick = function(){
        var curVal = d3.select(this).select("text").text();
        if(curVal === "Open Interface"){
          // fake a click on attritf val area to open
          aigfuncs.valmenu();
        } else if(curVal.split(":")[0].split("-")[0] === "Data"){
          // Grab the more robust [""] reference from IDvar
          var datstr = wbip.getIDvar("qmenu-rm").datstr;
          aigfuncs.valset("wbip.data" + datstr[curVal.split(":")[0].split("-")[1]]);
        } else{
          // Direct assignment
          aigfuncs.valset(curVal);
        }
        // Close qmenurm
        obj.close();
      };
      return {
        name: tarID,
        labels: makevallabels(curAttr),
        events: {
          click: onclick
        }
      };
    };
  
  return obj;
}();
wbip.addon("qmenu");

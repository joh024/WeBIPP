wbip.slidemenu = function(){
  var obj = {tags: "template"};

  obj.new =
    function(gMenu, curID, classes, bg = false, events = {}, canmm = true, indent = 5){
      var smg = gMenu.append("g")
        .attr("id", curID)
        .classed({"wbip-slidemenu-parent": true, "unselectable": true});
      smg.classed(classes);
      var CalVals = wbip.utils.CalibrateText(smg);
      wbip.setIDvar(curID,
        {dim: [0, 0], heights: [0], indent: indent,
         CalVals: CalVals, events: events, canmm: canmm});
      if(bg){
        smg.append("rect")
          .classed("background", true);
        //smg.append("rect")
        //  .attr("y", -20)
        //  .attr("width", 20)
        //  .attr("height", 20)
        //  .classed("wbip-slidemenu-close", true)
        //  .on("click", function(){smg.remove();});
      }
      
      var curdefs = smg.append("defs");
      var sqdim = CalVals[1];
      // Plus icon
      var curG = curdefs.append("symbol")
        .attr("id", curID + "-" + "plus")
        .classed("wbip-slidemenu-icon-plus", true);
      curG.append("rect")
        .attr("x", sqdim/5)
        .attr("y", sqdim*2/5)
        .attr("width", sqdim*3/5)
        .attr("height", sqdim/5)
        .classed("wbip-slidemenu-icon-solid", true);
      curG.append("rect")
        .attr("x", sqdim*2/5)
        .attr("y", sqdim/5)
        .attr("width", sqdim/5)
        .attr("height", sqdim*3/5)
        .classed("wbip-slidemenu-icon-solid", true);
      curG.append("rect")
        .attr("width", sqdim)
        .attr("height", sqdim)
        .classed("wbip-slidemenu-icon-transparent", true);
      // Minus icon
      var curG = curdefs.append("symbol")
        .attr("id", curID + "-" + "minus")
        .classed("wbip-slidemenu-icon-minus", true);
      curG.append("rect")
        .attr("x", sqdim/5)
        .attr("y", sqdim*2/5)
        .attr("width", sqdim*3/5)
        .attr("height", sqdim/5)
        .classed("wbip-slidemenu-icon-solid", true);
      curG.append("rect")
        .attr("width", sqdim)
        .attr("height", sqdim)
        .classed("wbip-slidemenu-icon-transparent", true);
      
      return smg;
    };
  
  obj.clear =
    function(smg){
      smg.selectAll("g.wbip-slidemenu-child").remove();
      var curVars = wbip.getIDvar(smg.attr("id"));
      curVars.dim = [0, 0];
      curVars.heights = [0];
    };
  
  obj.getCalVals =
    // If given curVars has a CalVals, get it
    // Otherwise, get the gparent and get its CalVals
    function(curVars){
      if(typeof curVars.CalVals == "undefined"){
        return wbip.getIDvar(curVars.gparent).CalVals;
      } else{
        return curVars.CalVals;
      }
    };
  
  obj.getgParent =
    // Return the ID of the gparent,
    // That is, the ultimate parent which has class "wbip-slidemenu-parent"
    function(curID){
      if(d3.select("#" + curID).classed("wbip-slidemenu-parent") == true){
        return curID;
      } else{
        return wbip.getIDvar(curID).gparent;
      }
    };
  
  obj.append =
    function(parent, children, indent = 5){
      var ParentID = parent.attr("id");
      var gParentID = obj.getgParent(ParentID);
      var ParentVars = wbip.getIDvar(ParentID);
      var gParentVars = wbip.getIDvar(gParentID);
      var CalVals = obj.getCalVals(ParentVars);
      
      for(var i = 0; i < children.length; i++){
        var Index = ParentVars.heights.length;
        var curID = ParentID + "-" + Index;
        var curG = parent.append("g")
          .attr("id", curID)
          .attr("clip-path", "url(#" + curID + "-" + "clip" + ")")
          .classed("wbip-slidemenu-child", true);
        var curVars = {dim: [0, 0], heights: [0], ismin: false,
          indent: indent, gparent: gParentID, parent: ParentID, index: Index};
        wbip.setIDvar(curID, curVars);
        curG.append("clipPath")
          .attr("id", curID + "-" + "clip")
          .append("rect");
        var curw = 0;
        // min-max icon
        if(gParentVars.canmm === true){
          if(children[i].canmm === true){
            curG.append("use")
              .attr("width", CalVals[1])
              .attr("height", CalVals[1])
              .attr("xlink:href", "#" + gParentID + "-" + "minus")
              .classed("wbip-slidemenu-mmuse", true)
              .on("click", function(){
                obj.minmaxicon(d3.event.originalTarget);
                d3.event.stopPropagation();
              });
          }
          // width always accounts for the minmax icon if it's enabled
          //   at gParent level, for nicer visual hierarchy
          curw += CalVals[1]
        }
        // text
        curG.append("text")
          .attr("x", curw)
          .text(children[i].text);
        curw += children[i].text.length * CalVals[0];
        // icon
        if(children[i].icon !== undefined){
          curw += CalVals[1];
          curG.append("use")
            .attr("x", children[i].text.length * CalVals[0] + CalVals[1])
            .attr("width", CalVals[1])
            .attr("height", CalVals[1])
            .attr("xlink:href", "#" + children[i].icon);
        }
        obj.awh(curID, [curw, CalVals[1]], 0);
        curG.classed("wbip-sm-" + children[i].text, true);
        if(typeof children[i].children == "object"){
          obj.append(curG, children[i].children);
        }
        
        // events
        var events = gParentVars.events;
        for(var curevt in events){
          curG.on(curevt, events[curevt]);
        }
      }
    };
  
  obj.awh =
    // Adjust Width Height
    // Adjusts the .dim of the given ID as well as its .heights
    // Updates the associated clippath
    // Updates the translations of any affected elements
    // Climbs up parentage to update their .dim and .heights as required
    // -args-
    // curID
    // dwh - delta [width, height]
    // Index - the index of the .heights to update
    function(curID, dwh, Index){
      var curVars = wbip.getIDvar(curID);
      if(curVars.ismin){
        if(typeof curVars.heights[Index] == "undefined"){
          curVars.heights[Index] = 0;
        }
        obj.updatetrans(curID, Index);
        return;
      }
      curVars.dim[0] += dwh[0];
      curVars.dim[1] += dwh[1];
      
      if(typeof curVars.heights[Index] == "undefined"){
        curVars.heights[Index] = 0;
      }
      curVars.heights[Index] += dwh[1];
      
      obj.updatetrans(curID, Index);
      if(d3.select("#" + curID).classed("wbip-slidemenu-parent")){
        // if parent, then adjust background size, if it exists
        var bg = d3.select("#" + curID).select(".background");
        if(!bg.empty()){
          bg.attr("width", curVars.dim[0]);
          bg.attr("height", curVars.dim[1]);
        }
      } else{
        // else need to adjust parent's width/height
        var curClip = d3.select("#" + curID + "-" + "clip").select("rect");
        curClip.attr("width", curVars.dim[0] + 1);
        curClip.attr("height", curVars.dim[1] + 1);
        // Compute if parent's width needs to be adjusted
        // (it does if cur width + indent > parent's width)
        var ParentVars = wbip.getIDvar(curVars.parent);
        var dpw = Math.max(0, curVars.dim[0] + curVars.indent - ParentVars.dim[0]);
        obj.awh(curVars.parent, [dpw, dwh[1]], curVars.index);
      }
    };
  
  obj.updatetrans =
    function(curID, istart){
      var curVars = wbip.getIDvar(curID);
      for(var Index = istart; Index < curVars.heights.length; Index++){
        d3.select("#" + curID + "-" + Index)
          //.transition().duration(500)
          .attr("transform", wbip.utils.translate(curVars.indent,
                wbip.utils.cumsum(curVars.heights)[Index - 1]));
      }
    };
  
  obj.geticonparent =
    // returns first parent element of class
    //   "wbip-slidemenu-child"
    function(el){
      var isparent = false;
      while(isparent == false){
        el = el.parentNode;
        isparent = d3.select(el).classed("wbip-slidemenu-child");
      }
      return el;
    };
  
  obj.minmax =
    // Used by minmaxicon and minmaxnode
    function(curID, curVars, gParentID, ismin, useNode){
      if(ismin){
        curVars.ismin = false;
        for(var i = 1; i < curVars.heights.length; i++){
          obj.awh(curID, [0, wbip.getIDvar(curID + "-" + i).dim[1]], i);
        }
        useNode.attr("xlink:href", "#" + gParentID + "-" + "minus");
      } else{
        for(var i = 1; i < curVars.heights.length; i++){
          obj.awh(curID, [0, -curVars.heights[i]], i);
        }
        curVars.ismin = true;
        useNode.attr("xlink:href", "#" + gParentID + "-" + "plus");
      }
    };
  obj.minmaxicon =
    // responding to a mouse click on the icon
    // oriTarget = d3.event.originalTarget
    function(oriTarget){
      var defNode = d3.select(oriTarget.parentNode);
      var useNode = d3.select(oriTarget.parentNode.parentNode);
      var ParentID = obj.geticonparent(oriTarget).id;
      var ParentVars = wbip.getIDvar(ParentID);
      var gParentID = obj.getgParent(ParentID);
      
      var ismin = defNode.classed("wbip-slidemenu-icon-plus");
      // defNode.classed("wbip-slidemenu-icon-minus");
      
      obj.minmax(ParentID, ParentVars, gParentID, ismin, useNode);
    };
  obj.minmaxnode =
    // minimise or maximise the given slidemenu child node
    function(smc){
      var useNode = smc.select(".wbip-slidemenu-mmuse");
      if(!useNode.empty()){
        var curID = smc.attr("id");
        var curVars = wbip.getIDvar(curID);
        var gParentID = obj.getgParent(curID);
        var ismin = curVars.ismin;
        
        obj.minmax(curID, curVars, gParentID, ismin, useNode);
      }
    };
  
  obj.drawBBox =
    // Given a wbip-slidemenu-child selection,
    //   draw the bounding box (computed using dim[0] and heights[0],
    //   so it doesn't include children) using rect
    // rect takes default styles, so needs to be styled as required
    // Returns the d3 selection for the rect
    function(smg){
      var curID = smg.attr("id");
      var curVars = wbip.getIDvar(curID);
      var curBBox = {x: 0, y: 0, width: curVars.dim[0], height: curVars.heights[0]};
      var curTransform = smg.attr("transform");
      var currect = d3.select("#" + curVars.parent).append("rect")
        .attr("x", curBBox.x - 0.5)
        .attr("y", curBBox.y - 0.5)
        .attr("width", curBBox.width + 1)
        .attr("height", curBBox.height + 1)
        .attr("transform", curTransform)
        .classed("wbip-BBox", true);
      return currect;
    };
  
  // children is array containing objects
  // object can contain 3 things:
  //   .text - the text
  //   .icon - (optional) the url(#id) of the <g> icon to <use> next to the text
  //           may require testing on inheritence of events if using the menu icon
  //           (could mean a requirement to <def> the icon separately)
  //   .canmm - show a min/max button (set as true if it's going to be a parent)
  //   .children - (optional) any children to attach to this child
  //                these are again arrays, and result in another nested layer
  //                calling obj.append again recursively, as deeply as required
  // After append, compute the widths/heights
  //   then crawl up parents to adjust widths/heights and transforms accordingly
  obj.testchild = [{text: "parent-1", canmm: true,
                    children: [{text: "child-1"}, {text: "child-2"}]},
                   {text: "parent-2", canmm: true,
                    children: [{text: "child-1"}, {text: "child-2"}]}];
  // Then test:
  // Adding child-3 to parent-1
  // Adding parent-3
  return obj;
}();

// wbip.slidemenu.new(gTabPri, "testsm");
// wbip.slidemenu.append(d3.select("#testsm"), wbip.slidemenu.testchild);
// wbip.slidemenu.append(d3.select("#testsm-1"), wbip.slidemenu.testchild);

wbip.menuobj = function(){
  var obj = {tags: "menu", requires: ["slidemenu"]};
  
  obj.getIDs =
    function(){
      var allG = gGraph.selectAll("g")[0];
      var allIDs = new Array;
      for(var i = 0; i < allG.length; i++){
        if(d3.select(allG[i]).classed("wbip-gobj")) allIDs.push(allG[i].id);
      }
      return allIDs;
    };

  obj.new =
    function(gMenu){
      wbip.slidemenu.new(gMenu, "gMenuObj", {"wbip-sm-gGraph": true}, bg = false,
        events = {
          click: function(){
            if(d3.select(".wbip-menuobj-click").empty()){
              wbip.menuobj.click(d3.select(this));
            } else{
              wbip.menuobj.unclick(d3.select(this));
            }
            d3.event.stopPropagation();
          },
          mouseover: function(){
            if(d3.select(".wbip-menuobj-click").empty()){
              wbip.menuobj.mover(d3.select(this));
            }
            d3.event.stopPropagation();
          },
          mouseout: function(){
            if(d3.select(".wbip-menuobj-click").empty()){
              wbip.menuobj.mout();
            }
            d3.event.stopPropagation();
          }
        }).attr("transform", "translate(0, 5)");
    };
  
  obj.mover =
    function(selMenuObj){
      wbip.slidemenu.drawBBox(selMenuObj).classed("wbip-menuobj-BBox", true);
      var curRealObj = d3.select("#" + selMenuObj.select("text").text());
      curRealObj.classed("wbip-menuobj-BBox-target", true);
      wbip.utils.drawBBox(curRealObj[0][0])
        .classed({"wbip-menuobj-BBox": true, "wbip-menuobj-BBox-real": true});
    };
  obj.mout =
    function(){
      d3.selectAll(".wbip-menuobj-BBox").remove();
      d3.selectAll(".wbip-menuobj-BBox-target").classed("wbip-menuobj-BBox-target", false);
    };
    
  obj.click =
    function(selMenuObj){
      selMenuObj.classed("wbip-menuobj-click", true);
      var realID = selMenuObj.select("text").text();
      wbip.cm.lowmark = wbip.cm.highlight(wbip.cm.low, realID);
      // TEMP using #test-attrintf
      wbip.attrintf.test(realID);
    };
    
  obj.unclick =
    function(selMenuObj){
      d3.select(".wbip-menuobj-click").classed("wbip-menuobj-click", false);
      d3.selectAll(".wbip-menuobj-BBox").remove();
      d3.selectAll(".wbip-menuobj-BBox-target").classed("wbip-menuobj-BBox-target", false);
      wbip.cm.lowmark.clear();
      // TEMP using #test-attrintf
      d3.select("#test-attrintf").remove();
      wbip.dataviewer.click = undefined;
      
      if(selMenuObj !== undefined){wbip.menuobj.mover(selMenuObj);}
    };
  
  obj.clear =
    function(){
      // TEMP using #test-attrintf
      d3.select("#test-attrintf").remove();
      wbip.dataviewer.click = undefined;
      wbip.slidemenu.clear(d3.select("#gMenuObj"));
    }
  
  obj.init =
    function(){
      obj.new(wbip.vars.gMenuTab);
    };
  
  return obj;
}();

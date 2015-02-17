wbip.dataviewer = function(){
  var obj = {tags: "ffw", type: "tertiary", requires: ["slidemenu"]};
  
  obj.icon =
    function(gMenu, transXY){
      obj.gMenu = gMenu;
      var curS = wbip.icon.def(gMenu, "wbip-icon-dataviewer");
      curS.append("text")
        .attr("x", 10)
        .attr("y", 10)
        .text("D");
      curS.append("rect")
        .attr("width", 20)
        .attr("height", 20);
      
      var curG = gMenu.append("g")
        .attr("transform", wbip.utils.translate(transXY))
        .classed("wbip-icon-dataviewer", true);
      wbip.icon.use(curG, "wbip-icon-dataviewer");
      
      curG.on("click", function(){
        // TEMP
        if(d3.select("#wbip-dataviewer").empty()){
          obj.new(wbip.vars.svg, "wbip-dataviewer", [300, 100]);
        }
      });
    };
  
  obj.new =
    function(gMenu, curID, transxy = [0, 0]){
      var dim = [0, 0];
      var ffw = wbip.ffw.new(gMenu, curID, dim, transxy);
      ffw.append("foreignObject");
      
      // ----
      // data list
      // compile the slidemenu childrens array
      var smchildren = [];
      var fulldat = wbip.data;
      for(var curdat in fulldat){
        var curchild = wbip.utils.names(fulldat[curdat]);
        var cursmchildren = [];
        for(var i = 0; i < curchild.length; i++){
          cursmchildren.push({text: curchild[i]});
        }
        smchildren.push({
          text: curdat, canmm: true,
          children: cursmchildren
        })
      }
      // append the slidemenu
      var curG = ffw.append("g")
        .attr("id", curID + "-dlist")
        .classed("wbip-dataviewer-dlist", true);
      var smg = wbip.slidemenu.new(curG, curID + "-dlist-sm", null, bg = false,
        events = {
          click: function(){
            if(typeof obj.click === "function"){
              obj.click(d3.select(this));
            }
            d3.event.stopPropagation();
          },
          mouseover: function(){
            wbip.slidemenu.drawBBox(d3.select(this)).classed("wbip-dataviewer-dlist-BBox", true);
            d3.event.stopPropagation();
          },
          mouseout: function(){
            d3.selectAll(".wbip-dataviewer-dlist-BBox").remove();
            d3.event.stopPropagation();
          }
        });
      wbip.slidemenu.append(smg, smchildren);
      
      // data draw
      // TODO
      
      // Adjust dim
      var adjdim = function(){
        dim = wbip.getIDvar(smg.attr("id")).dim;
        wbip.ffw.dim(ffw, dim);
      };
      adjdim();
      // Attach events to adjust dim as minmax buttons are used
      smg.selectAll("use.wbip-slidemenu-mmuse").on("click.dim", adjdim);
    };
  
  obj.datalist =
    // Lists all curent datasets using slidemenu
    function(){
    
    };
  
  obj.datadraw =
    // Draws the data table for the selected data
    function(){
      // TODO
    };
  
  return obj;
}();
wbip.addon("dataviewer");

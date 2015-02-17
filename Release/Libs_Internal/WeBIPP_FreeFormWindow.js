wbip.ffw = function(){
  var obj = {tags: "template", requires: ["iconsjui"]};
  
  obj.new =
    // Create a freeform window that has a draggable bar at the top
    //   to freely drag around the window
    // Bar also has a button that remove the ffw,
    //   and a button to collapse it
    // Returns the inner <g> of the ffw which comes with a background
    function(gMenu, curID, dim, transxy, barh){
      transxy = wbip.defarg(transxy, [0, 0]);
      barh = wbip.defarg(barh, 20);
      // width must be at least 60
      if(dim[0] < 60){dim[0] = 60;}
      
      var ffw = gMenu.append("g")
        .attr("id", curID)
        .attr("transform", wbip.utils.translate(transxy))
        .classed("wbip-ffw", true);
      wbip.utils.dragevt(ffw, ffw, transxy);
      
      if(wbip.frills !== undefined){
        ffw.attr("filter", "url(#wbip-dropshadow)");
      }
      
      ffw.append("rect")
        .attr("y", -barh)
        .attr("width", dim[0])
        .attr("height", barh)
        .classed("wbip-ffw-bar", true)
        .on("click", function(){
          gMenu[0][0].appendChild(ffw[0][0]);
        });
      
      var ffwinner = ffw.append("g")
        .classed("wbip-ffw-inner", true)
        .on("mousedown.drag", function(){d3.event.stopPropagation();});
      
      ffwinner.append("rect")
        .attr("width", dim[0])
        .attr("height", dim[1])
        .classed("wbip-ffw-inner-bg", true);
      
      // Icons
      var ffwicons = ffw.append("g")
        .attr("transform", wbip.utils.translate(dim[0] - 60, -barh))
        .classed("wbip-ffw-bar-icons", true);
      wbip.iconsjui.new(ffwicons, [(2*20 + 2), 2], "ui-icon-circle-close",
        {click: function(){ffw.remove();}}, classes = {"wbip-ffw-bar-rem": true});
      wbip.iconsjui.new(ffwicons, [(1*20 + 2), 2], "ui-icon-circle-plus",
        {click: function(){ffwinner.style("display", null);}}, {"wbip-ffw-bar-show": true});
      wbip.iconsjui.new(ffwicons, [(0*20 + 2), 2], "ui-icon-circle-minus",
        {click: function(){ffwinner.style("display", "none");}}, {"wbip-ffw-bar-hide": true});
      
      return ffwinner;
    };
  obj.dim =
    // Adjust the dim of a ffw
    // Can be transitioned by setting duration > 0
    function(ffw, dim, duration){
      duration = wbip.defarg(duration, 0);
      // width must be at least 60
      if(dim[0] < 60){dim[0] = 60;}
      
      var ffouter = d3.select(ffw[0][0].parentNode);
      ffouter.select(".wbip-ffw-bar")
        .transition().duration(duration)
        .attr("width", dim[0]);
      var barh = Number(ffouter.select(".wbip-ffw-bar").attr("height"));
      var ffwicons = ffouter.select(".wbip-ffw-bar-icons");
      ffwicons.transition().duration(duration)
        .attr("transform", wbip.utils.translate(dim[0] - 60, -barh));
      ffw.select(".wbip-ffw-inner-bg")
        .transition().duration(duration)
        .attr("width", dim[0])
        .attr("height", dim[1]);
    };
  
  return obj;
}();

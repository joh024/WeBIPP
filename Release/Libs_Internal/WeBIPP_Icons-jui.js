wbip.iconsjui = function(){
  var obj = {tags: "jui"};
  
  obj.new =
    function(gMenu, pos = [0, 0], type, events, classes){
      var fog = gMenu.append("foreignObject")
        .attr("x", pos[0])
        .attr("y", pos[1])
        .attr("width", 16)
        .attr("height", 16)
        .classed("wbip-icons-jui", true);
      fog.classed(classes);
      fog.on("click.blur", function(){$(fog.select("button")[0][0]).blur();});
      var btn = fog.append("xhtml:body").append("button");
      
      $(btn[0][0]).button({
        icons: {primary: type},
        text: false,
      });
      btn.style("width", "16px");
      
      // events
      if(events !== undefined){
        for(var curevt in events){
          fog.on(curevt, events[curevt]);
        }
      }
      
      return fog;
    };
  
  obj.test =
    function(){
      obj.new(wbip.vars.gGraph, [5, 5], "ui-icon-circle-close", {click: function(){console.log("click!");}}); 
    };
  
  return obj;
}();

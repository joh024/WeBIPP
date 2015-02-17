wbip.frills = function(){
  var obj = {tags: "frills", type: "special"};
  
  obj.new =
    function(){
      var defs = wbip.vars.svg.insert("defs", "*");
      
      // Drop shadows
      // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feGaussianBlur
      var curfil = defs.append("filter")
        .attr("id", "wbip-dropshadow");
      curfil.append("feGaussianBlur")
        .attr("in", "SourceAlpha")
        .attr("stdDeviation", 3);
      curfil.append("feOffset")
        .attr("dx", 2)
        .attr("dy", 4);
      var curmer = curfil.append("feMerge");
      curmer.append("feMergeNode");
      curmer.append("feMergeNode")
        .attr("in", "SourceGraphic");
    };
  
  return obj;
}();
wbip.addon("frills");

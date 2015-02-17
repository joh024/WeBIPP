wbip.layout = function(){
  var obj = {tags: "layout-template"};
  
  obj.new =
    function(svg, dim, layout){
      svg.selectAll("*").remove();
      svg.attr("width", dim[0])
         .attr("height", dim[1]);
      
      // convert the layout dim values to pixels
      var computewh = function(widhei, dimsub){
        var whscaled = 0;
        var whfixed = 0;
        for(var i = 0; i < widhei.length; i++){
          if(typeof widhei[i] === "number"){
            whscaled += widhei[i];
          } else{
            whfixed += Number(widhei[i].split(" ")[0]);
          }
        }
        scaleval = Math.ceil((dimsub - whfixed)/whscaled);
        return widhei.map(function(x){
          if(typeof x === "number"){
            return x * scaleval;
          } else{
            return Number(x.split(" ")[0]);
          }
        })
      };
      
      var cumwidths = [0];
      cumwidths = cumwidths.concat(wbip.utils.cumsum(computewh(layout.widths, dim[0])));
      var cumheights = [0];
      cumheights = cumheights.concat(wbip.utils.cumsum(computewh(layout.heights, dim[1])));
      
      for(var i = 0; i < layout.defs.length; i++){
        var curdefs = layout.defs[i];
        var curx = cumwidths[curdefs.cols[0] - 1];
        var curwidth = cumwidths[curdefs.cols[1]] - curx;
        var cury = cumheights[curdefs.rows[0] - 1];
        var curheight = cumheights[curdefs.rows[1]] - cury;
        
        var curG = svg.append("g")
          .attr("id", curdefs.id)
          .attr("transform", wbip.utils.translate(curx, cury));
        // ----
        // IDvars
        IDvars = {dim: [curwidth, curheight]};
        // isframe
        if(curdefs.isframe === true){
          curG.classed("wbip-frame", true);
          IDvars.attr = {
            dim: IDvars.dim,
            x: d3.scale.linear().domain([0, IDvars.dim[0]]).range([0, IDvars.dim[0]]),
            "x-name": "",
            "x-domain": [0, IDvars.dim[0]],
            "x-range": [0, 1],
            y: d3.scale.linear().domain([0, IDvars.dim[1]]).range([0, IDvars.dim[1]]),
            "y-name": "",
            "x-domain": [0, IDvars.dim[1]],
            "x-range": [0, 1]
          };
        }
        // ismenu
        if(curdefs.ismenu === true){
          curG.classed("wbip-menu", true);
          IDvars.addicon = obj.addicon(curG, IDvars);
        }
        wbip.setIDvar(curdefs.id, IDvars);
        // IDvars
        // ----
        
        // background
        curG.append("rect")
          .attr("width", curwidth)
          .attr("height", curheight)
          .classed("background", true);
        // events
        if(curdefs.events !== undefined){
          for(var curevt in curdefs.events){
            curG.on(curevt, curdefs.events[curevt]);
          }
        }
        // selbg
        if(curdefs.selbg !== undefined){
          curG.append("defs");
          var cursel = curG.append("g")
            .style("display", "none")
            .classed("SelBG", true)
            .append(curdefs.selbg.type);
          for(var curattr in curdefs.selbg){
            if(curattr !== "type"){
              cursel.attr(curattr, curdefs.selbg[curattr]);
            }
          }
        }
        
        wbip.vars[curdefs.id] = curG;
      };
      wbip.vars.svg = svg;
    };
  
  obj.lpx =
    // in: 10
    // out: "10 px"
    function(x){
      return "" + x + " px";
    };
  
  obj.addicon =
    // For making an addicon func for menu layouts
    // Done in this manner to ensure the curG reference
    //   points to the desired selection
    // TODO - use IDvars.dim to ensure icons don't fall
    //   off the "page"
    function(curG, IDvars){
      IDvars.transXY = [10, 10];
      return function(iconfunc){
        // slice to make a copy of array, so argument
        //   is by value and not by reference
        iconfunc(curG, IDvars.transXY.slice());
        IDvars.transXY[0] += 30;
        if(IDvars.transXY[0] + 30 > IDvars.dim[0]){
          // If next icon will go off the page to the right
          // See if we can move to the next row
          if(IDvars.transXY[1] + 60 <= IDvars.dim[1]){
            IDvars.transXY[0] = 10;
            IDvars.transXY[1] += 30;
          } else{
            console.log("No more room for placing icons for " + curG.attr("id"));
          }
        }
      };
    };
  
  obj.default = function(){
    gGraphevents = {
      click: wbip.gGraph.click
      // wbip.gGraph.drag
      // wbip.gGraph.aidActual
    };
    
    gMenuPriSelBG = {
      type: "rect", x: -3.5, y: -3.5, width: 27, height: 27
    };
    
    return {
      //mat: [[5, 3, 4],
      //      [2, 1, 1]],
      defs: [
        // 1
        {rows: [2, 2], cols: [2, 3],
         id: "gGraph", isframe: true, events: gGraphevents},
        // 2
        {rows: [2, 2], cols: [1, 1],
         id: "gMenuTab"},
        // 3
        {rows: [1, 1], cols: [2, 2],
         id: "gMenuPri", ismenu: true, selbg: gMenuPriSelBG},
        // 4
        {rows: [1, 1], cols: [3, 3],
         id: "gMenuSec", ismenu: true},
        // 5
        {rows: [1, 1], cols: [1, 1],
         id: "gMenuTer", ismenu: true}
      ],
      widths: [obj.lpx(140), 2, 1],
      heights: [obj.lpx(70), 1]
    };
  }();
  
  obj.dim = [920, 720];
  
  obj.resize = function(oridim){
    oridim = wbip.defarg(oridim, obj.dim.slice(0));
    var sel = wbip.vars.svg;
    var curdim = obj.dim.slice(0);
    var drag = function(newdim){
      sel.attr("width", newdim[0])
         .attr("height", newdim[1]);
    };
    var dragend = function(newdim){
      obj.dim = newdim.slice(0);
      wbip.refresh();
      // Need to recreate resize button due to refresh
      obj.resize(oridim);
    };
    var cancelfunc = function(){
      obj.dim = oridim;
      wbip.refresh();
    };
    var returnfunc = function(){
    };
    
    wbip.utils.resize(sel, curdim, drag, dragend, cancelfunc, returnfunc);
  };
  
  obj.init = function(){
    wbip.layout.new(d3.select("#main-svg"), obj.dim, wbip.layout.default);
  };
  
  return obj;
}();

wbip.radialmenu = function(){
  var obj = {tags: "template"};

  obj.new =
    // nopts - max number of opts PER SIDE of the diamond
    // padding - padding (in pixels) between each option and
    //           between the diamond and the options
    // maxwidth - maximum width rm will achieve with all options
    function(gMenu, curID, classes, transxy, maxwidth, nopts, padding, onclose){
      transxy = wbip.defarg(transxy, [450, 300]);
      maxwidth = wbip.defarg(maxwidth, 600);
      nopts = wbip.defarg(nopts, 3);
      padding = wbip.defarg(padding, 4);
      onclose = wbip.defarg(onclose, function(rmg){rmg.remove();});
      
      var rmg = gMenu.append("g")
        .attr("id", curID)
        .attr("transform", wbip.utils.translate(transxy))
        .classed({"wbip-radialmenu-parent": true, "unselectable": true});
      rmg.classed(classes);
      wbip.utils.dragevt(rmg, rmg, transxy);
      var CalVals = wbip.utils.CalibrateText(rmg);
      var opthei = CalVals[1] * 1.1;
      var diar = opthei * nopts + padding * (nopts - 0.5);
      var optwid = maxwidth/2 - (diar + Math.sqrt(Math.pow(padding, 2) - Math.pow(padding/2, 2)));
      
      wbip.setIDvar(curID, {nopts: nopts, padding: padding, opts: [],
        optdim: [optwid, opthei], diar: diar, CalVals: CalVals});
      
      // Diamond
      var curG = rmg.append("g")
        .classed("wbip-radialmenu-diamond", true);
      curG.append("polygon")
        .attr("points", wbip.utils.coords([0, diar, 0, -diar], [diar, 0, -diar, 0]));
      curG.append("text")
        .text("NO TEXT");
      var curG = curG.append("g")
        .classed("wbip-radialmenu-backbtn", true);
      curG.append("polygon")
        .attr("points", wbip.utils.coords([0, diar/2, -diar/2], [-diar, -diar/2, -diar/2]));
      curG.on("click", function(){
        // Load prev opts if they exist
        // Otherwise close rm
        var rmVars = wbip.getIDvar(rmg.attr("id"));
        if(rmVars.opts.length > 1){
          rmVars.opts = rmVars.opts.slice(0, rmVars.opts.length - 1);
          obj.setopts(rmg, rmVars.opts[rmVars.opts.length - 1], false);
        } else{
          onclose(rmg);
        }
      });
      
      return rmg;
    };
  
  obj.setname =
    // Set the text inside the diamond
    // TODO CHECK LENGTH AND TRIM AS NEEDED
    function(rmg, name){
      name = wbip.defarg(name, "");
      rmg.select("g.wbip-radialmenu-diamond").select("text").text(name);
    };
  
  obj.setopts =
    // isnew - true if new set of opts
    //         false is not, e.g. just navigating prev/next of the same set
    // back - true/false to show/hide back button
    function(rmg, opts, isnew, optind, back){
      isnew = wbip.defarg(isnew, true);
      optind = wbip.defarg(optind, 0);
      back = wbip.defarg(back, true);
      
      var rmID = rmg.attr("id");
      var rmVars = wbip.getIDvar(rmID);
      
      obj.setname(rmg, opts.name);
      
      // Check if we need a Next button (more opts than space available)
      var useopts = rmVars.nopts * 4;
      var neednext = opts.labels.length - optind > useopts - Number(optind > 0);
      
      // Save opts and show/hide back button
      if(isnew === true){rmVars.opts.push(opts);}
      var backbtn = rmg.select("g.wbip-radialmenu-backbtn");
      if(back === true){
        backbtn.style("display", null);
      } else{
        backbtn.style("display", "none");
      }
      
      // ----
      // Draw opts
      rmg.selectAll("g.wbip-radialmenu-opts").remove();
      var optsg = rmg.append("g")
        .classed("wbip-radialmenu-opts", true);
      // Width is smaller of:
      //   Max specified in rmVars, OR
      //   Max width needed for labels
      var maxlabelwidth = wbip.utils.maxnchar(opts.labels) * rmVars.CalVals[0] + rmVars.optdim[1] * 2;
      if(maxlabelwidth < rmVars.optdim[0]){
        var curwidth = maxlabelwidth;
        var charsfit = wbip.utils.maxnchar(opts.labels);
      } else{
        var curwidth = rmVars.optdim[0];
        var charsfit = Math.floor((rmVars.optdim[0] - rmVars.optdim[1] * 2)/rmVars.CalVals[0]);
      }
      
      var optpos = function(ind, centre){
        centre = wbip.defarg(centre, false);
        if(centre === true){
          var textadj = curwidth/2;
        } else{
          var textadj = rmVars.optdim[1];
        }
        var pos = {};
        
        if(ind < rmVars.nopts){
          // top-right
          var subind = ind;
          pos.trans = [rmVars.padding + subind * (rmVars.optdim[1] + rmVars.padding),
            -rmVars.diar + (rmVars.optdim[1] + rmVars.padding) * subind];
          pos.x = [0, curwidth - rmVars.optdim[1], curwidth, rmVars.optdim[1]];
          pos.y = [0, 0, rmVars.optdim[1], rmVars.optdim[1]];
          pos.text = [textadj, rmVars.optdim[1]/2];
          pos.lr = "r";
          
        } else if(ind < rmVars.nopts * 2){
          // bottom-right
          var subind = rmVars.nopts * 2 - (ind + 1);
          pos.trans = [rmVars.padding + subind * (rmVars.optdim[1] + rmVars.padding),
            rmVars.diar - (rmVars.optdim[1] + rmVars.padding) * subind];
          pos.x = [0, curwidth - rmVars.optdim[1], curwidth, rmVars.optdim[1]];
          pos.y = [0, 0, -rmVars.optdim[1], -rmVars.optdim[1]];
          pos.text = [textadj, -rmVars.optdim[1]/2];
          pos.lr = "r";
          
        } else if(ind < rmVars.nopts * 3){
          // bottom-left
          var subind = ind - rmVars.nopts * 2;
          pos.trans = [-rmVars.padding - subind * (rmVars.optdim[1] + rmVars.padding),
            rmVars.diar - (rmVars.optdim[1] + rmVars.padding) * subind];
          pos.x = [0, -curwidth + rmVars.optdim[1], -curwidth, -rmVars.optdim[1]];
          pos.y = [0, 0, -rmVars.optdim[1], -rmVars.optdim[1]];
          pos.text = [-textadj, -rmVars.optdim[1]/2];
          pos.lr = "l";
          
        } else{
          // top-left
          var subind = rmVars.nopts * 4 - (ind + 1);
          pos.trans = [-rmVars.padding - subind * (rmVars.optdim[1] + rmVars.padding),
            -rmVars.diar + (rmVars.optdim[1] + rmVars.padding) * subind];
          pos.x = [0, -curwidth + rmVars.optdim[1], -curwidth, -rmVars.optdim[1]];
          pos.y = [0, 0, rmVars.optdim[1], rmVars.optdim[1]];
          pos.text = [-textadj, rmVars.optdim[1]/2];
          pos.lr = "l";
          
        }
        
        if(centre === true){pos.lr = "c";}
        
        return pos;
      };
      
      // Draw all opts that fit
      var iadj = optind;
      for(var i = 0; i < useopts; i++){
        var curlabel = opts.labels[iadj + i];
        var isspecial = false;
        var events = opts.events;
        // Draw PREV if needed
        if(optind > 0 && i == rmVars.nopts * 2){
          // Skip normal label
          iadj -= 1;
          // Replace curlabel
          curlabel = "PREV";
          isspecial = true;
          var events = {
            click: function(){
              // Go back as many as you can display
              // (useopts - 1) because 1 is needed for NEXT button
              var newind = optind - (useopts - 1);
              // If you can go back further, need another for PREV button
              if(newind > 0){newind += 1;}
              // Back too far!
              if(newind < 0){newind = 0;}
              obj.setopts(rmg, opts, false, newind, back);
            }
          }
        }
        // Draw NEXT if needed
        if(neednext && i == rmVars.nopts * 2 - 1){
          // Skip normal label
          iadj -= 1;
          // Replace curlabel
          curlabel = "NEXT";
          isspecial = true;
          var events = {
            click: function(){
              // Go forward as many as has been displayed
              // (useopts - 1) because 1 was used for NEXT button
              var newind = optind + (useopts - 1);
              // Adjust for PREV button if it exists
              if(optind > 0){newind -= 1;}
              obj.setopts(rmg, opts, false, newind, back);
            }
          }
        }
        // Only draw if there is a valid opt to draw
        if(curlabel !== undefined){
          var curpos = optpos(i);
          var curtooltip = undefined;
          if(curlabel.length > charsfit){
            curtooltip = curlabel;
            curlabel = curlabel.substr(0, charsfit - 3) + "...";
          }
          var curG = optsg.append("g")
            .attr("transform", wbip.utils.translate(curpos.trans))
            .classed("wbip-radialmenu-opts-" + curpos.lr, true);
          if(isspecial){
            curG.classed("wbip-radialmenu-opts-special", true);
          } else{
            curG.classed("wbip-radialmenu-opts-normal", true);
          }
          curG.append("polygon")
            .attr("points", wbip.utils.coords(curpos.x, curpos.y));
          var curtext = curG.append("text")
            .attr("x", curpos.text[0])
            .attr("y", curpos.text[1])
            .text(curlabel);
          if(curtooltip !== undefined){curtext.append("title").html(curtooltip);}
          // events
          for(var curevt in events){
            curG.on(curevt, events[curevt]);
          }
        }
      }
    };
  
  obj.getrmParent =
    // Return the radialmenu-parent of the current element
    function(el){
      return wbip.utils.getParent(el, "wbip-radialmenu-parent");
    };
  
  obj.testopts1 =
    {
      name: "testopts1",
      labels: ["A","B","C","D","E","F","G","H","I","J", "Awkardly long label for comprehensive testing purposes"],
      events: {
        click: function(){
          console.log(d3.select(this).select("text").text());
          obj.setopts(d3.select(obj.getrmParent(this)), obj.testopts2);
        }
      }
    };
  obj.testopts2 =
    {
      name: "testopts2",
      labels: ["Chinese","English","Spanish","Hindi","Arabic","Bengali","Russia","Portuguese","Japanese","German","French","Panjabi","Javanese","Bihari","Italian","Korean","Telugu","Tamil","Marathi","Vietnamese"],
      events: {
        click: function(){
          console.log(d3.select(this).select("text").text());
          obj.setopts(d3.select(obj.getrmParent(this)), obj.testopts3, true, 1);
        }
      }
    };
  obj.testopts3 =
    {
      name: "testopts3",
      labels: [1871,1872,1873,1874,1875,1876,1877,1878,1879,1880,1881,1882,1883,1884,1885,1886,1887,1888,1889,1890,1891,1892,1893,1894,1895,1896,1897,1898,1899,1900,1901,1902,1903,1904,1905,1906,1907,1908,1909,1910,1911,1912,1913,1914,1915,1916,1917,1918,1919,1920,1921,1922,1923,1924,1925,1926,1927,1928,1929,1930,1931,1932,1933,1934,1935,1936,1937,1938,1939,1940,1941,1942,1943,1944,1945,1946,1947,1948,1949,1950,1951,1952,1953,1954,1955,1956,1957,1958,1959,1960,1961,1962,1963,1964,1965,1966,1967,1968,1969,1970],
      events: {
        click: function(){
          console.log(d3.select(this).select("text").text());
        }
      }
    };
  
  obj.test = function(){
    var testrm = obj.new(wbip.vars.svg, "testrm");
    obj.setopts(testrm, obj.testopts1);
    obj.setopts(testrm, obj.testopts2);
    obj.setopts(testrm, obj.testopts3, true, 1);
  };
  
  return obj;
}();

// wbip.radialmenu.test()
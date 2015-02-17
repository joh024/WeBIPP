wbip.fise = function(){
  var obj = {tags: "fise", requires: ["cm", "terminal"]};
  
  obj.new =
    // Functionise a segment of code
    // New function has given name
    // Takes code from given loc
    //   loc is defined as: {marker: [start, end]}
    //   Potential for other definitions, e.g. {line: [start, end]}
    // Matches string|regexp specified in toarg to change
    //   and use as arguments for the new function
    //   toarg is defined as an array containing an object:
    //     [{name: "arg-name",
    //       match: string|regexp to match,
    //       type: "dataset|datavar"}]
    // Resulting functionised function (fise func) is
    //   saved to wbip.vars.fise[name]
    // It accepts 1 argument, "args", which is an object
    // Named elements of the object correspond to the
    //   named arguments, (with names as specified in toarg)
    // Also automatically adjusts code for new ID definitions,
    //   e.g. .click("gEL1", ...)
    //   and auto-update these by adding a suffix
    // So "gEL1" becomes "gEL1b" (checking to ensure it's unique)
    // It also checks for references made to this ID
    //   and updates them accordingly.
    // So the following:
    //   wbip["frcart"].click("gEL1", d3.select("#gGraph"), [44,21]);
    //   wbip["rect"].click("gEL2", d3.select("#gEL1"), [49,29]);
    // Becomes:
    //   wbip["frcart"].click("gEL1b", d3.select("#gGraph"), [44,21]);
    //   wbip["rect"].click("gEL2b", d3.select("#gEL1b"), [49,29]);
    function(name, loc, toarg){
      var curfunc = function(args, noeval, fexport){
        var incode = obj.getbyloc(loc);
        
        if(fexport === true){
          return {
            toarg: toarg,
            incode: incode
          };
        }
        
        // Find new ID definitions (e.g. .click("gEL1", ...))
        // Update these ID automatically by appending an alphabet
        // All IDs, RegExp and Match results
        var AIDre = /.click\(".+?",/g;
        var AIDma = incode.match(AIDre);
        // Individual ID
        var IIDre = /.click\("(.+?)",/;
        for(var i = 0; i < AIDma.length; i++){
          var IIDma = AIDma[i].match(IIDre);
          // Replace ID
          // Matches both definitions and usage for the ID,
          // i.e. will match both "gEL1" and "#gEL1"
          var RIDre = new RegExp('("#*)(' + IIDma[1] + ')(")', "g");
          // Make New ID
          // TODO Make more robust, since currently it breaks once "z" is reached
          var curCharCode = ("b").charCodeAt(0);
          var newID = IIDma[1] + "b";
          while(!d3.select("#" + newID).empty()){
            curCharCode += 1
            newID = IIDma[1] + String.fromCharCode(curCharCode);
          }
          // Make replacements
          incode = incode.replace(RIDre, "$1$2" + String.fromCharCode(curCharCode) + "$3");
        }
        
        if(args !== undefined){
          // For each arg
          for(var i = 0; i < toarg.length; i++){
            var argdef = toarg[i];
            var argval = args[argdef.name];
            // If a value for the arg is specified in args
            // Replace match with new value
            if(argval !== undefined){
              incode = incode.replace(argdef.match, argval, "g");
            }
          }
        }
        
        if(noeval !== true){eval(incode);}
        return incode;
      };
      
      // save function to vars
      if(wbip.vars.fise === undefined){wbip.vars.fise = {};}
      wbip.vars.fise[name] = curfunc;
      
      // Add a new icon to the Primary Buttons menu
      // Assuming one doesn't already exist
      if(d3.select("g.wbip-icon-" + name).empty()){
        wbip.icon.auto(name, function(){obj.callUI(name, toarg)},
          wbip.getIDvar(wbip.vars.gMenuPri.attr("id")).addicon);
      }
    };
  
  obj.newUI =
    // Open a UI to make creating a new fise easier
    function(){
      var loc = {};
      var locset = function(type, input, term){
        try{
          loc[type] = JSON.parse(input);
          term.echo(type + " has been set successfully.");
          makecm();
          term.echo("Select the segment of code you wish to use" +
            " as an argument in the code editor below. Note that all" +
            " code matching the selection will be highlighted, and every" +
            " match will be modified with this new argument.\n" +
            'Enter the command "setarg" to continue.');
        } catch(e){
          term.echo("Invalid input, " + type + "has not been set.\n" +
            'Use "getcode" again to retry.');
        }
      };
      var cmvar = undefined;
      var makecm = function(){
        if(cmvar === undefined){
          ffhtml.append("div")
            .attr("id", curID + "-cm");
          cmvar = CodeMirror(document.getElementById(curID + "-cm"), {
            mode:  "javascript",
            firstLineNumber: 0,
            lineNumbers: true,
            tabSize: 2,
            matchBrackets: true,
            highlightSelectionMatches: true
          });
          cmvar.setSize(width = dim[0] - 15, height = dim[1] * 2 - 15);
          wbip.ffw.dim(ffw, [dim[0], dim[1] * 3], 1000);
          ffFO.transition().duration(1000).attr("height", dim[1] * 3);
        }
        cmvar.setValue(obj.getbyloc(loc));
      };
      var argdef = {};
      var toarg = [];
      var makefise = function(input, term){
        var outcode = "wbip.fise.new(" + JSON.stringify(input) +
          ", " + JSON.stringify(loc) + ", " +
          JSON.stringify(toarg) + ");";
        wbip.outcode.write(outcode, "high");
        eval(outcode);
        term.echo("A new function of name " +
          JSON.stringify(input) + " has been created and" +
          " added to the Primary Buttons Region.\n" +
          "You can now close this helper window.");
      };
      
      var cmdlist = {
        getcode: {
          echo: 'Choose method: "marker" or "line"?',
          next: {
            marker: {
              echo: 'Input the markers in the form: ["start", "end"]\n' +
                'e.g. ["Barplot Start", "Barplot End"]',
              next: {
                ".any": {
                  act: function(input, term){locset("marker", input, term);}
                }
              }
            },
            line: {
              echo: 'Input the line numbers in the form: ["start", "end"]\n' +
                'e.g. [2, 8]',
              next: {
                ".any": {
                  act: function(input, term){locset("line", input, term);}
                }
              }
            }
          }
        },
        setarg: {
          act: function(input, term){
            argdef = {match: cmvar.getSelection()};
            term.echo("Using " + JSON.stringify(argdef.match));
          },
          echo: "What should the argument be called?",
          next: {
            ".any": {
              act: function(input, term){
                argdef.name = input;
                // Temp assignment of type
                argdef.type = "none";
                
                toarg.push(argdef);
                term.echo("Turning " + JSON.stringify(argdef.match) +
                  " into an argument of name " + JSON.stringify(argdef.name));
              },
              echo: 'Create more arguments by using the "setarg"' +
                ' command again.\nRemove existing args by using "rmarg".\n' +
                'Use "finish" to create the function.'
            }
          }
        },
        rmarg: {
          echo: "This command has not yet been implemented."
        },
        finish: {
          echo: "Give your function a name",
          next: {
            ".any": {
              act: makefise
            }
          }
        }
      };
      var evalfunc = wbip.terminal.evalcmd(cmdlist);
      
      var curID = "wbip-fise-new-UI";
      var dim = [600, 200]; // Initial dim, height expands for cm later
      var ffw = wbip.ffw.new(wbip.vars.svg, curID, dim, [80, 60]);
      var ffFO = ffw.append("foreignObject")
        .attr("width", dim[0])
        .attr("height", dim[1]);
      var ffhtml = ffFO.append("xhtml:body");
      var ffterm = ffhtml.append("div")
          .attr("id", curID + "-terminal")
          .style("overflow", "auto");
      var termopts =
        {
          width: dim[0] - 37,
          height: dim[1] - 37,
          prompt: '> ',
          greetings: "Functionise Helper Terminal\n" +
            "Begin by specifying the code you want to functionise by" +
            ' entering the command\n"getcode" (without quotes).'
        };
      jQuery(function($, undefined) {
        $("#" + curID + "-terminal").terminal(evalfunc, termopts).focus(true);
      });
    };
  
  obj.callUI =
    // Open a UI to make calling an existing fise func easier
    function(name, toarg){
      var args = {};
      var argnames = toarg.map(function(x){return x.name;});
      
      var cmdlist = {};
      // Populate cmdlist with all arguments
      for(var i = 0; i < toarg.length; i++){
        cmdlist[toarg[i].name] = {
          echo: "Input a new value for " + JSON.stringify(toarg[i].name) +
              '\n(Original value is ' + JSON.stringify(toarg[i].match) + ')',
          next: {
            ".any": {
              act: function(){
                var argname = toarg[i].name;
                var stargname = JSON.stringify(argname);
                return function(input, term){
                  args[argname] = input;
                  term.echo('Value of ' + stargname +
                    ' has been set to ' + JSON.stringify(input));
                }
              }(),
              echo: 'Specify more arguments, or use "finish" to end'
            }
          }
        };
      }
      cmdlist.finish = {
        act: function(){
          var outcode = "wbip.vars.fise[" + JSON.stringify(name) +
            "](" + JSON.stringify(args) + ");";
          wbip.outcode.write(outcode, "high");
          eval(outcode);
          d3.select("#" + curID).remove();
        }
      };
      var evalfunc = wbip.terminal.evalcmd(cmdlist);
      
      var curID = "wbip-fise-call-UI";
      var dim = [600, 200];
      var greetings = "Helper Terminal for using the Functionised Function " +
            JSON.stringify(name) + "\n" + 'Enter ".help"' +
            ' (without quotes, but with the fullstop)\nto see' +
            ' a list of all valid arguments.\n' +
            'Enter the argument name to set a value to it.\n' +
            'Enter "finish" to end and to call the function.';
      wbip.terminal.new(wbip.vars.svg, curID, dim, evalfunc,
        [80, 60], greetings = greetings);
    };
  
  obj.export =
    // Export the given fise func as an addon
    function(name){
      var outobj = wbip.vars.fise[name](null, null, true);
      var outcode = "wbip.fise.new(" + JSON.stringify(name) + ", " +
          "{direct: " + JSON.stringify(outobj.incode) + "}, " +
          JSON.stringify(outobj.toarg) + ");";
      
      var content = "// WBIP FISE FUNC EXPORT\n" +
        "(function(){\n" +
        "  var outcode = " + JSON.stringify(outcode) + ";\n" +
        "  wbip.outcode.write(outcode, \"high\");\n" +
        "  eval(outcode);\n" +
        "}());\n";
      var uriContent = "data:text/plain," + encodeURIComponent(content);
      window.open(uriContent, 'wbip-fise-export');
    };
  
  obj.addmarker =
    // A utility function to make it convenient
    //   to add a marker to wbip.cm.high
    // Open a terminal ffw and use input to make
    //   the marker
    function(){
      var curID = "wbip-addmarker";
      if(d3.select("#" + curID).empty()){
        var inputfunc = function(input){
          d3.select("#" + curID).remove();
          wbip.cm.high.replaceRange("// MARKER " + input + "\n",
            from = {line: wbip.cm.high.lastLine()});
        };
        wbip.terminal.new(wbip.vars.svg, curID, [500, 70],
                          inputfunc, [80, 105], "Input name of marker");
      }
    };
  
  obj.getbyloc =
    // Utility function to get code from loc object
    function(loc){
      var cmvar = wbip.cm.high;
      // Marker takes priority, if given
      if(loc.marker !== undefined){
        var fromto = wbip.cm.findbymarker(cmvar, loc.marker);
        return cmvar.getRange(fromto.from, fromto.to);
      }
      // Get loc from line
      if(loc.line !== undefined){
        var fromto = {from: {line: loc.line[0], ch: 0}, to: {line: loc.line[1]}};
        return cmvar.getRange(fromto.from, fromto.to);
      }
      // Get it directly from arg
      if(loc.direct !== undefined){
        return loc.direct;
      }
      
      // No recognised loc
      console.log("No recognised loc given for fise")
      return "";
    };
  
  return obj;
}();

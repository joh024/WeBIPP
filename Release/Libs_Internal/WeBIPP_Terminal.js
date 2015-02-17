wbip.terminal = function(){
  var obj = {tags: "ffw"};
  
  obj.new =
    function(gMenu, curID, dim, evalfunc, transxy = [0, 0],
             greetings = 'WeBIPP (v' + wbip.version + ') Terminal'){
      var ffw = wbip.ffw.new(gMenu, curID, dim, transxy);
      ffw.append("foreignObject")
        .attr("width", dim[0])
        .attr("height", dim[1])
        .append("xhtml:body").append("div")
          .attr("id", curID + "-terminal")
          .style("overflow", "auto");
      
      var opts =
        {
          width: dim[0] - 37,
          height: dim[1] - 37,
          prompt: '> ',
          greetings: greetings
        };
      
      jQuery(function($, undefined) {
        $("#" + curID + "-terminal").terminal(evalfunc, opts).focus(true);
      });
      // can select this terminal via:
      // $('#terminal-div').terminal()
      // e.g. $('#terminal-div').terminal().echo("hi")
    };
  
  obj.evalcmd =
    // Given a list of commands,
    //   return an evalfunc to use for a terminal
    // cmdlist is of form:
    /*
      {
        "cmd-name": {
          act: function-to-call,
          echo: "some text to echo",
          next: {another cmdlist}
        }
      }
    */
    // The evalfunc will check if input matches
    //   any of the commands given in the cmdlist
    // If it does, it will call act(), echo the text,
    //   and set the cmdlist in "next" as the current cmdlist
    // If next is undefined, cmdlist is set to the top-most cmdlist
    //   (i.e. the one given in the original argument)
    // Command of name ".help" should be considered reserved
    //   as it leads to printing of all commands in the current
    //   cmdlist. Having a command of name ".help" in the cmdlist
    //   will essentially overwrite this functionality.
    // Command of name ".any" will match any input.
    //   ".any" is given the lowest priority, and terminal
    //   will match other commands, including ".help" first
    function(cmdlist){
      var curlist = cmdlist;
      
      var outfunc = function(input, term){
        if(curlist[input] !== undefined){
          var curcmd = curlist[input];
        } else if(input === ".help"){
          term.echo(JSON.stringify(wbip.utils.names(curlist), null, 2));
          return;
        } else if(curlist[".any"] !== undefined){
          var curcmd = curlist[".any"];
        } else{
          term.echo('Unrecognised command. Enter ".help"' +
            ' (without quotes, but with the fullstop) to see' +
            ' a list of all valid commands.')
          return;
        }
        
        if(curcmd.act !== undefined){curcmd.act(input, term);}
        if(curcmd.echo !== undefined){term.echo(curcmd.echo);}
        if(curcmd.next !== undefined){
          curlist = curcmd.next;
        } else{
          curlist = cmdlist;
        }
      };
      
      return outfunc;
    };
  
  obj.test =
    function(){
      var evalfunc = obj.evalcmd({
        hi: {
          act: function(){console.log("hi");},
          echo: "hello",
          next: {"bye": {echo: "goodbye"}}
        },
        tag: {
          echo: "guten tag"
        }
      });
      obj.new(wbip.vars.svg, "test-term", [500, 200], evalfunc, [200, 200]);
    };
  
  return obj;
}();

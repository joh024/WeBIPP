wbip.hcl = function(){
  /* Adapted from the hcl code in R
     (originally written by Ross Ihaka)
     Used with permission */
  var WHITE_Y = 100.000;
  var WHITE_u = 0.1978398;
  var WHITE_v = 0.4683363;
  var GAMMA = 2.4;
  var DEG2RAD = 1/180 * Math.PI;
  
  var gtrans =
    function(u){
      if(u > 0.00304){
        return 1.055 * Math.pow(u, (1 / GAMMA)) - 0.055;
      }else{
        return 12.92 * u;
      }
    };

  var hcl2rgb =
    function(h, c, l){
      /* Step 1 : Convert to CIE-LUV */

      h = DEG2RAD * h;
      var L = l;
      var U = c * Math.cos(h);
      var V = c * Math.sin(h);

      /* Step 2 : Convert to CIE-XYZ */

      if(L <= 0 && U == 0 && V == 0){
        var X = 0;
        var Y = 0;
        var Z = 0;
      } else{
        var Y = WHITE_Y * ((L > 7.999592) ? Math.pow((L + 16)/116, 3) : L / 903.3);
        var u = U / (13 * L) + WHITE_u;
        var v = V / (13 * L) + WHITE_v;
        var X =  9.0 * Y * u / (4 * v);
        var Z =  - X / 3 - 5 * Y + 3 * Y / v;
      }

      /* Step 4 : CIE-XYZ to sRGB */
      
      RGB = [
        gtrans(( 3.240479 * X - 1.537150 * Y - 0.498535 * Z) / WHITE_Y),
        gtrans((-0.969256 * X + 1.875992 * Y + 0.041556 * Z) / WHITE_Y),
        gtrans(( 0.055648 * X - 0.204043 * Y + 1.057311 * Z) / WHITE_Y)
      ];
      
      return RGB;
    };
  
  var tohex =
    function(x){
      return ("0" + Math.round(Math.min(x, 1) * 255).toString(16)).substr(-2);
    };
  
  var hclfront =
    function(h, c = 35, l = 85){
      if(wbip.utils.isArray(h)){
        var out = [];
        for(var i = 0; i < h.length; i++){
          out.push("#" + hcl2rgb(h[i], c, l).map(tohex).join(""));
        }
        return out;
      } else{
        return "#" + hcl2rgb(h, c, l).map(tohex).join("");
      }
    };
  
  return hclfront;
}();

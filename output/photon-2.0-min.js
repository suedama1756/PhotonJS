var l=!0,r=null,s=!1,M=window;
function W(h){function g(a,b,c,d){c||(a.forEach(function(a,c){X[a]=b;d&&(y[a]=t(d)?d(a):d[c])}),a=a.map(qa));Y.push(a)}function qa(a){return f(a).select(function(a){return-1!=="\\[]{}().+*^".indexOf(a)?"\\"+a:a}).h().join("")}function Z(a){return f.k($,a).select(function(a){var c;if(a[0]){c=a[0];var d=X[c];c=d?d:!/[^\t\n\r ]/.test(c)?J:-1!=="\"'".indexOf(c.charAt(0))?I:!isNaN(Number(c))?K:L}else c=N;return{text:a[0],index:a.index,d:y[a[0]],type:c}}).concat([{text:r,index:a.length,d:y[r],type:N}])}
function D(a){return function(){return a}}function z(a){return"[object String]"===u.call(a)}function aa(a){return"[object Number]"===u.call(a)}function t(a){return"function"===typeof a}function ba(a){return a===r||a===O}function ca(a){return a["0c8c22e83e7245adb341d6df8973ea63"]||(a["0c8c22e83e7245adb341d6df8973ea63"]=++ra)}function j(a,b,c,d){for(var e in b)if(!c||c(b,e,a))a[e]=d?d(b,e,a):b[e];return a}function da(){}function ea(a){var b={},c=r,d=r,e=r;return{name:function(a){c=a;return this},inherits:function(a){d=
a;return this},defines:function(a){t(a)&&(a=a(function(){return e}));j(b,a);return this},exports:function(a){j(b,a(b));return this},build:function(){function i(){}ba(a)&&(a=function(){});c=c||a.name;b.hasOwnProperty("toString")||(b.toString=function(){return"[object "+(c||"Object")+"]"});d&&(e=d.prototype,i.prototype=e);var f={name:function(){return c},baseType:function(){return d}};a.typeInfo=function(){return f};var v=a.prototype=new i;v.constructor=a;b&&h.extend(v,b,h.extend.H,function(a,b){return a[b]});
v.__TYPE_INFO__=a.typeInfo;return a}}}function q(a){return a}function fa(a,b){return a===b?0:a<b?-1:a>b?1:-2}function n(){var a=0,b;return{b:function(){if(0===a)throw Error("Enumeration has not started.");if(3===a)throw Error("Enumeration has completed.");return b},e:function(c){b=c;return!!(a=1)},end:function(){return!(a=3)}}}function ga(a){return function(){var b=-1,c=n();return k(function(){if(-2!==b){for(var d=a.length;++b<d;)if(b in a)return c.e(a[b]);b=-2}return c.end()},c.b)}}function ha(a){var b=
typeof a;"object"===b&&a!==r?(b=Object.prototype.toString.call(a),a="[object Object]"===b||a.valueOf()===a?"o"+ca(a):b+a.valueOf()):a=b.charAt(0)+a;return a}function w(a){var b;if(!(b=P(a))){var c=0;b=P(a)||"object"===typeof a&&aa(c=a.length)&&(0===c||0<c&&"0"in a&&c-1 in a)}if(b)return ga(a);if(z(a))return function(){var b=-1,c=a.length,i=n();return k(function(){return-2!==b?++b<c?i.e(a.charAt(b)):b=i.end():s},i.b)};if(t(a))return a}function E(a,b){var c=b,b=z(c)?function(a){return a[c]}:c||q;return function(){var c=
n(),e=a(),i=0;return k(function(){return e.c()&&c.e(b(e.b(),i++))||c.end()},c.b)}}function ia(a,b){return function(){var c=n(),d=a(),e=0;return k(function(){for(;d.c();){var a=d.b();if(b(a,e++))return c.e(a)}return c.end()},c.b)}}function Q(a,b){return function(){var c=n(),d=a(),e=E(w(b),function(a){return(a.K||w(Array.isArray(a)?a:[a]))()})();return k(function(){for(;!d.c();){if(!e.c())return c.end();d=e.b()}return c.e(d.b())},c.b)}}function F(a,b,c,d){for(var a=a(),e=0;a.c();)c=b(c,a.b(),e++);return e?
c:d}function k(a,b){return{c:a,b:b}}function R(a,b,c){b=b||fa;return F(a,function(a,e,i){return!i||b(e,a)===c?e:a},O,p)}function S(a){for(var b=[],c=0,a=a();a.c();)b[c++]=a.b();return b}function G(a,b){for(;a.c();){var c=a.b();if(!b||b(c))return c}return p}function ja(a,b){for(var c=p,d;(d=G(a,b))!==p;)c=d;return c}function ka(a){if(a===p)throw Error("No match found.");return a}function H(a,b){return a===p?b:a}function f(a){return a instanceof T?a:new T(w(a))}function T(a){this.getEnumerator=this.a=
a}function la(a){return z(a)?function(b){return b[a]}:a||q}function ma(a){if(a.c()){var b=a.b(),c=ma(a),d=la(b.l),e=b.direction,i=b.i;return function(a,b){return i(d(a),d(b))*e||c(a,b)}}return function(){return 0}}function x(a,b,c){P(a)||(a=[a||q]);a=E(w(a),la);return E(a,function(a){return{l:a,direction:c,i:b||fa}})}function A(a,b){return j(f(function(){return w(S(a).sort(ma(b())))()}),{thenBy:function(c,d){return A(a,Q(b,x(c,d,1)))},thenByDesc:function(c,d){return A(a,Q(b,x(c,d,-1)))}})}h.version=
"0.7.0.1";var u=Object.prototype.toString,sa=Array.prototype,O,na=Number,ra=0;j.filterHasOwnProperty=function(a,b){return a.hasOwnProperty(b)};var P=Array.isArray?Array.isArray:Array.isArray=function(){return void 0===u.call("[object Array")};if(!Object.getOwnPropertyNames){var U=Object,B;a:{var oa=function(a){var b=0,c;for(c in a)b++},V=["valueOf","toString"];for(B in{valueOf:da})if(B===V[0]){B=oa;break a}B=function(a){for(var b=oa(a),c=0,d=V.length;c<d;c++){var e=V[c];a.hasOwnProperty(e)&&b.push(e)}return b}}U.getOwnPropertyNames=
B}j(h,{isString:z,isNumber:aa,isBoolean:function(a){return"[object Boolean]"===u.call(a)},isFunction:t,isUndefined:function(a){return a===O},isNullOrUndefined:ba,extend:j,getUID:ca,noop:da});h.typeInfo=function(a){return a.__TYPE_INFO__()};h.type=ea;var p={};j(T.prototype,{select:function(a){return f(E(this.a,a))},m:function(a){return f(ia(this.a,a))},I:function(a){return ka(G(this.a(),a))},J:function(a,b){return H(G(this.a(),a),b)},N:function(a){return ka(ja(this.a(),a))},O:function(a,b){return H(ja(this.a(),
a),b)},h:function(){return S(this.a)},f:function(a,b,c){return F(this.a,a,b,c)},min:function(a){return H(R(this.a,a,-1))},max:function(a){return H(R(this.a,a,1))},G:function(a){return R(this.a,a)},T:function(){return F(this.a,function(a,b){return a+na(b)},0,NaN)},C:function(a){return G(this.a(),a)!==p},S:function(a){var b=this.a;return f(function(){var c=b(),d=-1;return k(function(){for(var b;d<a&&(b=c.c());)d++;return b||c.c()},c.b)})},U:function(a){var b=this.a;return f(function(){var c=b(),d=n(),
e=0;return k(function(){return e<a&&c.c()?(e++,d.e(c.b())):d.end()},d.b)})},F:function(a){var b=this.a,c=a,c=c||q;return f(function(){var a;return ia(function(){a={};return b()},function(b){b=ha(c(b));return!a.hasOwnProperty(b)&&(a[b]=l)})()})},L:function(a){var b=this.a,c=a,c=c||q;return f(function(){function a(b,c,d){var g=f(function(){var a=n(),b=0;return k(function(){return b<c.length||e(l,d)?a.e(c[b++]):a.end()},a.b)});g.key=b;return i[d]={j:c,g:g}}function e(b,e){if(!b){if(j<g.length)return v.e(g[j++].g);
0!==j&&(g=[],j=0)}for(;h.c();){var f=h.b(),k=c(f),m=ha(k);if(i.hasOwnProperty(m)){if(i[m].j.push(f),b&&e===m)return l}else if(f=a(k,[f],m),b?g.push(f):v.e(f.g),!b)return l}return b?s:v.end()}var i={},h=b(),v=n(),g=[],j=0;return k(function(){return e(s)},v.b)})},D:function(){var a=0;return F(this.a,function(b,c){a++;return b+na(c)},0,NaN)/a},forEach:function(a,b){for(var c=(0,this.a)(),d=0;c.c();)a.call(b,c.b(),d++)},reverse:function(){var a=this.a;return f(function(){return ga(S(a).reverse())()})},
P:function(a,b){return A(this.a,x(a,b,1))},concat:function(){return f(Q(this.a,sa.slice.call(arguments)))},Q:function(a,b){return A(this.a,x(a,b,-1))}});f.k=function(a,b){return f(function(){var c=n(),d=0,e;return k(function(){var f,g;e=a.lastIndex;a.lastIndex=d;g=(f=a.exec(b))?c.e(f):c.end();d=a.lastIndex;a.lastIndex=e;return g},c.b)})};h.enumerable=f;h.scope=function(a){function b(){}b.prototype=a||new function(){};return new b};ea(function(){}).defines({n:function(){}});var N=-1,L=8,I=32,K=33,
J=128,pa,X={},y={},$,Y=[];pa=D(0);g(["\\s","\\r","\\t","\\n"," "],J,s);g("+ - * % / === == = !== != <<= << <= < >>= >= > &".split(" "),1,s,function(a){return Function("s","l","x","y","return x(s, l)"+a+"y(s, l);")});g(["()[]{}".split("")],16,s);g(['"([^\\\\"]*(\\\\[rtn"])?)*"',"'([^\\\\']*(\\\\[rtn'])?)*'"],I,l);g(["([-+]?[0-9]*[.]?[0-9]+([eE][-+]?[0-9]+)?)"],K,l);g(["true","false"],34,s,[D(l),D(s)]);g(["null"],35,s,[D(r)]);g(["typeof","in"],4,s);g(["[a-z_$]{1}[\\da-z_]*"],L,l);g([".",":",","],64,
l);U=f(Y).select(function(a){return a.join("|")}).f(function(a,b){a&&(a+="|");return a+"("+b+"){1}"},"");$=RegExp(U,"gi");j(h.V=Z,{q:N,w:1,t:4,s:L,r:16,z:I,v:K,o:34,u:35,p:64,A:J});var ta={M:function(a,b){return!!("object"===typeof a||t(a))&&b in a}};h.R=function(){return{parse:function(a){function b(a){return function(b){return b.type===a}}function c(a){return function(b){return b.text===a}}function d(a,b){var c=m+a.length;if(c>w)return s;for(var d=m,e=0;d<c;d++,e++)if(!a[e](q[d]))return s;c=b||
a.length;d=q.slice(m,m+c);m+=c;return d}function e(a,b,c,d){a:{if(m<w-1){var e=q[m],f=e.text;if(f==a||f==b||f==c||f==d||!a&&!b&&!c&&!d){a=e;break a}}a=s}return a?(m++,a):s}function g(){for(var a=h(),b;;)if(b=e("||"))a=C(a,b.d,h());else return a}function h(){var a=j(),b;if(b=e("&&"))a=C(a,b.d,h());return a}function j(){var a=k(),b;if(b=e("==","!="))a=C(a,b.d,j());return a}function k(){var a;a=n();for(var b;b=e("+","-");)a=C(a,b.d,n());if(b=e("<",">","<=",">="))a=C(a,b.d,k());return a}function n(){for(var a=
p(),b;b=e("*","/","%");)a=C(a,b.d,p());return a}function p(){var a;if(e("+"))a=t();else if(a=e("-"))a=C(pa,a.d,p());else if(a=e("!")){var b=a.d,c=p();a=function(a,d){return b(a,d,c)}}else a=t();return a}function C(a,b,c){return function(d,e){return b(d,e,a,c)}}function t(){var a;var b;if(a=d([z,u],1)){for(b=[a[0].text];;)if(a=d([B,z,u],2))b.push(a[1].text);else if(a=d([F,H,G]))b.push(a[1].text.substring(1,a[1].text.length-1));else break;a=b}else a=r;if(a){a="var c = $scope, u; return "+f(a).f(function(a,
b){""!==a&&(a+=" && ");return a+"c && (c=$ctx.has(c, '"+b+"')?c['"+b+"']:u)"},"");var c=Function("$scope","$ctx",a);a=function(a){return c(a,ta)}}else if(b=e(),a=b.d,!a&&32===(b.type&32))switch(b.type){case K:a=D(Number(b.text));break;case I:a=D(b.text.substring(1,b.text.length-1))}if(!a)throw Error("Invalid expression.");return a}var q=Z(a).m(function(a){return a.type!==J}).h(),m=0,w=q.length,B=c("."),z=b(L),u,E=c("(");u=function(a){return!E(a)};var F=c("["),G=c("]"),H=b(I);var x=g(),A,y;if(y=e("=")){if(!x.assign)throw Error("implies assignment but ["+
a.substring(0,y.index)+"] can not be assigned to",y);A=g();a=function(a,b){return x.assign(a,A(a,b),b)}}else a=x;return a}}}}if("function"===typeof define&&define.B)define(["exports","jquery"],W);else if(M){var ua=M.photon=M.photon||{};W(ua)};

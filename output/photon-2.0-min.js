(function(m){var D=function(i){function m(a){return"[object String]"===E.call(a)}function D(a){return"[object Number]"===E.call(a)}function w(a){return"function"===typeof a}function ea(a){return a===R}function fa(a){return null===a||a===R}function ga(a){return a["0c8c22e83e7245adb341d6df8973ea63"]||(a["0c8c22e83e7245adb341d6df8973ea63"]=++da)}function n(a,b,c,d){for(var e in b)if(!c||c(b,e,a))a[e]=d?d(b,e,a):b[e];return a}function S(){}function ha(a){var b={},c=null,d=null,e=null;return{name:function(a){c=
a;return this},inherits:function(a){d=a;return this},defines:function(a){w(a)&&(a=a(function(){return e}));n(b,a);return this},exports:function(a){n(b,a(b));return this},build:function(){function g(){}fa(a)&&(a=function(){});c=c||a.name;b.hasOwnProperty("toString")||(b.toString=function(){return"[object "+(c||"Object")+"]"});d&&(e=d.prototype,g.prototype=e);var xa={name:function(){return c},baseType:function(){return d}};a.typeInfo=function(){return xa};var q=a.prototype=new g;q.constructor=a;b&&
i.extend(q,b,i.extend.filterHasOwnProperty,function(a,b){return a[b]});q.__TYPE_INFO__=a.typeInfo;return a}}}function x(a){return a}function ia(a,b){return a===b?0:a<b?-1:a>b?1:-2}function l(){var a=0,b;return{current:function(){if(0===a)throw Error("Enumeration has not started.");if(3===a)throw Error("Enumeration has completed.");return b},progress:function(c){b=c;return!!(a=1)},end:function(){return!(a=3)}}}function ja(a){return function(){var b=-1,c=l();return k(function(){if(-2!==b){for(var d=
a.length;++b<d;)if(b in a)return c.progress(a[b]);b=-2}return c.end()},c.current)}}function ka(a){var b=typeof a;"object"===b&&null!==a?(b=Object.prototype.toString.call(a),a="[object Object]"===b||a.valueOf()===a?"o"+ga(a):b+a.valueOf()):a=b.charAt(0)+a;return a}function y(a){var b;if(!(b=T(a))){var c=0;b=T(a)||"object"===typeof a&&D(c=a.length)&&(0===c||0<c&&"0"in a&&c-1 in a)}if(b)return ja(a);if(m(a))return function(){var b=-1,c=a.length,g=l();return k(function(){return-2!==b?++b<c?g.progress(a.charAt(b)):
b=g.end():!1},g.current)};if(w(a))return a}function F(a,b){var c=b,b=m(c)?function(a){return a[c]}:c||x;return function(){var c=l(),e=a(),g=0;return k(function(){return e.moveNext()&&c.progress(b(e.current(),g++))||c.end()},c.current)}}function la(a,b){return function(){var c=l(),d=a(),e=0;return k(function(){for(;d.moveNext();){var a=d.current();if(b(a,e++))return c.progress(a)}return c.end()},c.current)}}function U(a,b){return function(){var c=l(),d=a(),e=F(y(b),function(a){return(a&&"object"===
typeof a&&a.getEnumerator||y(Array.isArray(a)?a:[a]))()})();return k(function(){for(;!d.moveNext();){if(!e.moveNext())return c.end();d=e.current()}return c.progress(d.current())},c.current)}}function G(a,b,c,d){for(var a=a(),e=0;a.moveNext();)c=b(c,a.current(),e++);return e?c:d}function k(a,b){return{moveNext:a,current:b}}function V(a,b,c){b=b||ia;return G(a,function(a,e,g){return!g||b(e,a)===c?e:a},R,s)}function W(a){for(var b=[],c=0,a=a();a.moveNext();)b[c++]=a.current();return b}function H(a,b){for(;a.moveNext();){var c=
a.current();if(!b||b(c))return c}return s}function ma(a,b){for(var c=s,d;(d=H(a,b))!==s;)c=d;return c}function na(a){if(a===s)throw Error("No match found.");return a}function I(a,b){return a===s?b:a}function f(a){return a instanceof J?a:new J(y(a))}function J(a){this.getEnumerator=this.getEnumerator_=a}function oa(a){return m(a)?function(b){return b[a]}:a||x}function pa(a){if(a.moveNext()){var b=a.current(),c=pa(a),d=oa(b.selector),e=b.direction,g=b.comparer;return function(a,b){return g(d(a),d(b))*
e||c(a,b)}}return function(){return 0}}function K(a,b,c){T(a)||(a=[a||x]);a=F(y(a),oa);return F(a,function(a){return{selector:a,direction:c,comparer:b||ia}})}function L(a,b){return n(f(function(){return y(W(a).sort(pa(b())))()}),{thenBy:function(c,d){return L(a,U(b,K(c,d,1)))},thenByDesc:function(c,d){return L(a,U(b,K(c,d,-1)))}})}i.version="0.7.0.1";var E=Object.prototype.toString,z=Array.prototype,R,qa=Number,da=0;n.filterHasOwnProperty=function(a,b){return a.hasOwnProperty(b)};var T=Array.isArray?
Array.isArray:Array.isArray=function(){return void 0===E.call("[object Array")};if(!Object.getOwnPropertyNames){var M=Object,r;a:{var ra=function(a){var b=0,c;for(c in a)b++},X=["valueOf","toString"];for(r in{valueOf:S})if(r===X[0]){r=ra;break a}r=function(a){for(var b=ra(a),c=0,d=X.length;c<d;c++){var e=X[c];a.hasOwnProperty(e)&&b.push(e)}return b}}M.getOwnPropertyNames=r}z.forEach||(z.forEach=function(a,b){for(var c=0,d=this.length;c<d;c++)c in this&&a.call(b,this[c],c,this)});z.map||(z.map=function(a,
b){for(var c=this.length,d=Array(c),e=0;e<c;e++)e in this&&(d[e]=a.call(b,this[e],e,this));return d});n(i,{isString:m,isNumber:D,isBoolean:function(a){return"[object Boolean]"===E.call(a)},isFunction:w,isUndefined:ea,isNullOrUndefined:fa,extend:n,getUID:ga,noop:S});i.typeInfo=function(a){return a.__TYPE_INFO__()};i.type=ha;var s={};n(J.prototype,{select:function(a){return f(F(this.getEnumerator_,a))},where:function(a){return f(la(this.getEnumerator_,a))},first:function(a){return na(H(this.getEnumerator_(),
a))},firstOrDefault:function(a,b){return I(H(this.getEnumerator_(),a),b)},last:function(a){return na(ma(this.getEnumerator_(),a))},lastOrDefault:function(a,b){return I(ma(this.getEnumerator_(),a),b)},toArray:function(){return W(this.getEnumerator_)},aggregate:function(a,b,c){return G(this.getEnumerator_,a,b,c)},min:function(a){return I(V(this.getEnumerator_,a,-1))},max:function(a){return I(V(this.getEnumerator_,a,1))},extremum:function(a){return V(this.getEnumerator_,a)},sum:function(){return G(this.getEnumerator_,
function(a,b){return a+qa(b)},0,NaN)},any:function(a){return H(this.getEnumerator_(),a)!==s},skip:function(a){var b=this.getEnumerator_;return f(function(){var c=b(),d=-1;return k(function(){for(var b;d<a&&(b=c.moveNext());)d++;return b||c.moveNext()},c.current)})},take:function(a){var b=this.getEnumerator_;return f(function(){var c=b(),d=l(),e=0;return k(function(){return e<a&&c.moveNext()?(e++,d.progress(c.current())):d.end()},d.current)})},distinct:function(a){var b=this.getEnumerator_,c=a,c=c||
x;return f(function(){var a;return la(function(){a={};return b()},function(b){b=ka(c(b));return!a.hasOwnProperty(b)&&(a[b]=!0)})()})},groupBy:function(a){var b=this.getEnumerator_,c=a,c=c||x;return f(function(){function a(b,c,d){var q=f(function(){var a=l(),b=0;return k(function(){return b<c.length||e(!0,d)?a.progress(c[b++]):a.end()},a.current)});q.key=b;return g[d]={items:c,groupSource:q}}function e(b,e){if(!b){if(i<j.length)return q.progress(j[i++].groupSource);0!==i&&(j=[],i=0)}for(;h.moveNext();){var f=
h.current(),k=c(f),N=ka(k);if(g.hasOwnProperty(N)){if(g[N].items.push(f),b&&e===N)return!0}else if(f=a(k,[f],N),b?j.push(f):q.progress(f.groupSource),!b)return!0}return b?!1:q.end()}var g={},h=b(),q=l(),j=[],i=0;return k(function(){return e(!1)},q.current)})},average:function(){var a=0;return G(this.getEnumerator_,function(b,c){a++;return b+qa(c)},0,NaN)/a},forEach:function(a,b){for(var c=(0,this.getEnumerator_)(),d=0;c.moveNext();)a.call(b,c.current(),d++)},reverse:function(){var a=this.getEnumerator_;
return f(function(){return ja(W(a).reverse())()})},orderBy:function(a,b){return L(this.getEnumerator_,K(a,b,1))},concat:function(){return f(U(this.getEnumerator_,z.slice.call(arguments)))},orderByDesc:function(a,b){return L(this.getEnumerator_,K(a,b,-1))}});f.regexExec=function(a,b,c){return f(function(){var d=l(),e=c,g;return k(function(){var c,f;e===b.length?(f=!ea(void 0)?d.progress(void 0):d.end(),e=-1):-1===e?f=d.end():(g=a.lastIndex,a.lastIndex=e,f=(c=a.exec(b))?d.progress(c):d.end(),e=a.lastIndex,
a.lastIndex=g);return f},d.current)})};f.value=function(a){var b=!1;return f(k(function(){return!b?b=!0:!1},function(){if(b)throw Error();return a}))};f.sequence=function(a,b,c){return f(function(){var d=l();return k(function(){return a<b?d.progress(c?c(a++):a++):d.end()},d.current)})};i.enumerable=f;i.scope=function(a){function b(){}b.prototype=a||new function(){};return new b};ha(function(){}).defines({$new:function(){}});var p=function(a){return Function("s","l","x","y","return x(s, l)"+a+"y(s, l);")},
t=function(a){return function(){return a}},ua=function(a){function b(b){if(d!==b){var b="at (",c=a.charAt(d);if('"'===c||"'"===c)b="Unterminated string detected "+b;throw Error("INVALID TOKEN: "+b+d+").");}}function c(c){var g,f;c?(f=c[0],g=c[8]&&A||c[1]&&O||c[20]&&P||c[13]&&B,b(c=c.index),d+=f.length):(b(c=a.length),g=sa);if(g)return{type:g,text:f,index:c,fn:null};g=ta[f];return{type:g.type,text:f,index:c,fn:g.fn}}var d=0;return new J(function(){var b=l(),d=0,f;return k(function(){var h,j;if(d===
a.length)return d=-1,b.progress(c(null));if(-1===d)return!1;f=u.lastIndex;u.lastIndex=d;j=(h=u.exec(a))?b.progress(c(h)):b.end();d=u.lastIndex;u.lastIndex=f;return j},b.current)})},Q=function(a){return function(b){return b.type===a}},v=function(a){return function(b){return b.text===a}},Y=function(a,b,c){return function(d,e){return b(d,e,a,c)}},C=function(a,b,c){var d=function(){var e=a(),f;if(f=b(c))e=Y(e,f.fn,d());return e};return d},M=function(){return{parse:function(a){function b(a){if(j<k-1){var b=
i[j];if(!a||b.text===a)return j++,b}return null}function c(a){var b;return j<k-1&&(b=i[j],b.type===a)?(j++,b):null}function d(a,b){var c=j+a.length;if(c>k)return null;for(var d=j,e=0;d<c;d++,e++)if(!a[e](i[d]))return null;c=i.slice(j,j+b);j+=b;return c}function e(){for(var a=l(),c;c=b("||");)a=Y(a,c.fn,l());return a}function g(){var a;if(b("+"))a=h();else if(a=b("-"))a=Y(va,a.fn,g());else if(a=b("!")){var c=a.fn,d=g();a=function(a,b){return c(a,b,d)}}else a=h();return a}function h(){var a;var c;if(a=
d(ya,1)){for(c=[a[0].text];;)if(a=d(za,2))c.push(a[1].text);else if(a=d(Aa,3))c.push(a[1].text.substring(1,a[1].text.length-1));else break;a=c}else a=null;if(a){a="var c = $scope, u; return "+f(a).aggregate(function(a,b){""!==a&&(a+=" && ");return a+"c && (c=$ctx.has(c, '"+b+"')?c['"+b+"']:u)"},"");var e=Function("$scope","$ctx",a);a=function(a){return e(a,Ba)}}else if(c=b(),a=c.fn,!a&&32===(c.type&32))switch(c.type){case B:a=t(Number(c.text));break;case A:a=t(c.text.substring(1,c.text.length-1))}if(!a)throw Error("Invalid expression.");
return a}var i=ua(a).where(function(a){return a.type!==O}).toArray(),j=0,k=i.length,l=C(C(C(C(C(g,c,Z),c,$),c,aa),c,ba),b,"&&");var m=e(),p,n;if(n=b("=")){if(!m.assign)throw Error("implies assignment but ["+a.substring(0,n.index)+"] can not be assigned to",n);p=e();a=function(a,b){return m.assign(a,p(a,b),b)}}else a=m;return a}}};r=function(a){var b={},c=function(c,e){return(b[c]||(b[c]=a.parse(c)))(e)};c.clearCache=function(){b={}};return c};var sa=-1,P=3,ba=17,aa=18,Z=19,$=20,A=32,B=33,O=128,va,
ta={},u,Ca=function(a){return f(a).select(function(a){return-1!=="\\[]{}().+*^|".indexOf(a)?"\\"+a:a}).toArray().join("")},h=function(a,b,c,d){c||(a.forEach(function(a,c){ta[a]={type:b,fn:d&&(w(d)?d(a):d[c])}}),a=a.map(Ca));wa.push(a)};va=t(0);var wa=[];h(["\\s","\\r","\\t","\\n"," "],O,!1);h(["===","==","!==","!="],ba,!1,p);h(["<=","<",">=",">"],aa,!1,p);h(["*","%","/"],Z,!1,p);h(["+","-"],$,!1,p);h("&& || = <<= << >>= & | ^".split(" "),16,!1,p);h("()[]{}".split(""),4,!1);h(['"([^\\\\"]*(\\\\[rtn"])?)*"',
"'([^\\\\']*(\\\\[rtn'])?)*'"],A,!0);h(["[-+]?[0-9]*[.]?[0-9]+([eE][-+]?[0-9]+)?"],B,!0);h(["NaN"],B,!1,[t(NaN)]);h(["true","false"],34,!1,[t(!0),t(!1)]);h(["null"],35,!1,[t(null)]);h(["undefined"],36,!1,[S]);h(["typeof","in"],2,!1);h(["[a-z_$]{1}[\\da-z_]*"],P,!0);h([".",":",",",";"],64,!1);p=f(wa).select(function(a){return a.join("|")}).aggregate(function(a,b){return(a?a+"|(":"(")+b+")"},"");u=RegExp(p,"gi");var Ba={has:function(a,b){return a&&!("object"!==typeof a&&!w(a))&&b in a}},p=v("."),h=
Q(P),Q=Q(A),ca,Da=v("(");ca=function(a){return!Da(a)};var Ea=v("["),v=v("]"),ya=[h,ca],za=[p,h,ca],Aa=[Ea,Q,v];i.parser=M;n(i.tokenize=ua,{TOKEN_EOF:sa,TOKEN_OPERATOR:16,TOKEN_EQUALITY:ba,TOKEN_RELATIONAL:aa,TOKEN_MULTIPLICATIVE:Z,TOKEN_ADDITIVE:$,TOKEN_KEYWORD:2,TOKEN_IDENTIFIER:P,TOKEN_GROUP:4,TOKEN_STRING:A,TOKEN_NUMBER:B,TOKEN_BOOLEAN:34,TOKEN_NULL:35,TOKEN_UNDEFINED:36,TOKEN_DELIMITER:64,TOKEN_WHITESPACE:O});i.execFactory=r;i.exec=r(M())};if("function"===typeof define&&define.amd)define(["exports",
"jquery"],D);else if(m){var da=m.photon=m.photon||{};D(da,m.jQuery)}})(window,document);

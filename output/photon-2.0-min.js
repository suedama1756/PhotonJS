(function(K,fa){var V=function(k){function p(c){return"[object String]"===W.call(c)}function V(c){return"[object Number]"===W.call(c)}function s(c){return"function"===typeof c}function ua(c){return c===ga}function L(c){return!("object"===typeof c||s(c))}function A(c){return null===c||c===ga}function va(c){var a;return I(c)||"object"===typeof c&&V(a=c.length)&&(0===a||0<a&&"0"in c&&a-1 in c)}function X(){}function wa(c){return c["0c8c22e83e7245adb341d6df8973ea63"]||(c["0c8c22e83e7245adb341d6df8973ea63"]=
++kb)}function t(c,a,b,d){for(var e in a)if(!b||b(a,e,c))c[e]=d?d(a,e,c):a[e];return c}function y(c,a,b){return a in c?c[a]:c[a]=b()}function M(c,a){if(A(c))throw new TypeError((a||"?")+" called on null or undefined.");return c}function D(c){var a={},b={},d=null,e=null,f=null;return{name:function(a){d=a;return this},inherits:function(a){e=a;return this},defines:function(c){s(c)&&(c=c(function(){return f}));t(a,c);return this},definesStatic:function(a){s(a)&&(a=a(function(){return f}));t(b,a);return this},
exports:function(c){t(a,c(a));return this},build:function(){function g(){}A(c)&&(c=function(){});d=d||c.name;a.hasOwnProperty("toString")||(a.toString=function(){return"[object "+(d||"Object")+"]"});e&&(f=e.prototype,g.prototype=f);var h={name:function(){return d},baseType:function(){return e}};c.typeInfo=function(){return h};var j=c.prototype=new g;j.constructor=c;a&&k.extend(j,a,k.extend.filterHasOwnProperty,function(a,c){return a[c]});j.__TYPE_INFO__=c.typeInfo;return t(c,b)}}}function N(c){return c}
function xa(c,a){return c===a?0:c<a?-1:c>a?1:-2}function w(){var c=0,a;return{current:function(){if(0===c)throw Error("Enumeration has not started.");if(3===c)throw Error("Enumeration has completed.");return a},progress:function(b){a=b;return!!(c=1)},end:function(){return!(c=3)}}}function ha(c){return function(){var a=-1,b=w();return u(function(){if(-2!==a){for(var d=c.length;++a<d;)if(a in c)return b.progress(c[a]);a=-2}return b.end()},b.current)}}function ya(c){var a=typeof c;"object"===a&&null!==
c?(a=Object.prototype.toString.call(c),c="[object Object]"===a||c.valueOf()===c?"o"+wa(c):a+c.valueOf()):c=a.charAt(0)+c;return c}function O(c){if(I(c)||va(c))return ha(c);if(p(c))return function(){var a=-1,b=c.length,d=w();return u(function(){return-2!==a?++a<b?d.progress(c.charAt(a)):a=d.end():!1},d.current)};if(s(c))return c;if(s(c.getEnumerator))return c.getEnumerator}function Y(c,a){var b=a,a=p(b)?function(a){return a[b]}:b||N;return function(){var b=w(),e=c(),f=0;return u(function(){return e.moveNext()&&
b.progress(a(e.current(),f++))||b.end()},b.current)}}function za(c,a){return function(){var b=w(),d=c(),e=0;return u(function(){for(;d.moveNext();){var c=d.current();if(a(c,e++))return b.progress(c)}return b.end()},b.current)}}function ia(c,a){return function(){var b=w(),d=c(),e=Y(O(a),function(a){return(a&&"object"===typeof a&&a.getEnumerator||O(Array.isArray(a)?a:[a]))()})();return u(function(){for(;!d.moveNext();){if(!e.moveNext())return b.end();d=e.current()}return b.progress(d.current())},b.current)}}
function Z(c,a,b,d){for(var c=c(),e=0;c.moveNext();)b=a(b,c.current(),e++);return e?b:d}function u(c,a){return{moveNext:c,current:a}}function ja(c,a,b){a=a||xa;return Z(c,function(c,e,f){return!f||a(e,c)===b?e:c},ga,E)}function ka(c){for(var a=[],b=0,c=c();c.moveNext();)a[b++]=c.current();return a}function $(c,a){for(;c.moveNext();){var b=c.current();if(!a||a(b))return b}return E}function Aa(c,a){for(var b=E,d;(d=$(c,a))!==E;)b=d;return b}function Ba(c){if(c===E)throw Error("No match found.");return c}
function aa(c,a){return c===E?a:c}function i(c){return c instanceof B?c:new B(O(c))}function B(c){this.getEnumerator=this.getEnumerator_=c}function Ca(c){return p(c)?function(a){return a[c]}:c||N}function Da(c){if(c.moveNext()){var a=c.current(),b=Da(c),d=Ca(a.selector),e=a.direction,f=a.comparer;return function(a,c){return f(d(a),d(c))*e||b(a,c)}}return function(){return 0}}function ba(c,a,b){I(c)||(c=[c||N]);c=Y(O(c),Ca);return Y(c,function(c){return{selector:c,direction:b,comparer:a||xa}})}function ca(c,
a){return t(i(function(){return O(ka(c).sort(Da(a())))()}),{thenBy:function(b,d){return ca(c,ia(a,ba(b,d,1)))},thenByDesc:function(b,d){return ca(c,ia(a,ba(b,d,-1)))}})}function F(c){var a=arguments;return c.replace(lb,function(c,d,e,f,g,h){if(g){c=F.formatters[g];g=F("Invalid format specifier '{0}'.",g);if(!c)throw Error(g);g=c}else g=null;d=a[Number(d)+1];return g?g(d,h):d})}function la(c,a){for(var a=A(a)?1:a,b=[];0<a--;)b.push(c);return b.join("")}function Ea(c){return c.value}function Fa(c,a){c.value=
a}function Ga(c,a){return c.getAttribute(a)}function Ha(c,a,b){c.setAttribute(a,b)}function Ia(c,a){return c.style[a]}function Ja(c,a,b){c.style[a]=b}function Ka(c,a){return function(b,d){var e=this._nodes;return arguments.length?(a(e[0],b,d),this):c(e[0],b)}}function La(c,a){return function(b,d){return 2===arguments.length?(this.forEach(function(c){a(c,b,d)}),this):this.select(function(a){return c(a,b)})}}function da(c,a){return function(b){var d=this._nodes;if(arguments.length){if(!a)throw Error("Property is readonly.");
a(d[0],b);return this}return c(d[0])}}function Ma(c,a){return function(b){return arguments.length?(this.forEach(function(c){a(c,b)}),this):this.select(c)}}function Na(c,a,b,d,e){return c.root(c,a,b,d,e)}function ta(c,a,b){return a(c,b)}function mb(c,a,b,d,e){return c.current(c,a,b,d,e)}function Oa(c){var a=c,b=c.$dependencies;I(c)&&(b=c.length-1,a=c[b],b=c.slice(0,b));return{fn:a,deps:b||[]}}function Pa(c,a,b){return c.map(function(c){return b&&b.hasOwnProperty(c)?b[c]:a.resolve(c)})}function Qa(c){var a,
b,d,e;return{factory:function(a){var a=Oa(a),c=a.deps,d=a.fn;b=function(a,b){var e=Pa(c,a,b);return d.apply(this,e)};return this},instance:function(a){b=function(){return a};return this},type:function(a){function c(){}var a=Oa(a),d=a.deps,e=a.fn;c.prototype=e.prototype;if(!(b=e.$containerFactory))b=e.$containerFactory=function(a,b){var f=new c;e.apply(f,Pa(d,a,b));return f};return this},trans:function(){d=ta;return this},singleton:function(){d=Na;return this},scope:function(){d=mb;return this},name:function(c){a=
c;return this},memberOf:function(a){e=a;return this},build:function(){if(!b)throw Error("Registration has no resolver.");d=d||Na;return{name:a,memberOf:e,resolver:function(e,g){return d(e,b,c,a,g)},contract:c}}}}function ma(c){return function(){var a=[],b=new nb(function(c){c=Qa(c);a.push(c);return c});c(b);return i(a).select(function(a){return a.build()})}}function ob(c){c.observerFn||(c.observerFn=function(a){a.forEach(function(a){(a=c.children[a.name])&&a.watchers.forEach(function(a){a()})})},
Object.observe(c.value,c.observerFn));return c}function Sa(c,a,b){function d(a,c){return!a&&!c?null:!c?a:function(b,e){a&&a(b,e);c(b.childNodes,e)}}function e(a,c){if(1===a.length){var b=a[0];return function(a,e){c(b.directive,a,e,b.options)}}return function(b,e){for(var d=0,f=a.length;d<f;d++)c(a[d].directive,b,e,a[d].options)}}function f(a,j){var l,z,Ra=!1,m;if(!(m=j))m="CONTENT"===a.tagName?[{directive:b.content,options:{}}]:(m=a&&a.attributes)?i(m).select(function(a){var b=a.name,e,d;if(!(d=c.tryResolve("Directive",
b))){var f=b.lastIndexOf("-")+1,g;if(g=0!==f)d=b.substring(0,f),g=d=c.tryResolve("Directive",d);g&&(e=b.substring(f),b=b.substring(0,f-1))}return d?{directive:d,options:{type:b,qualifier:e,expression:a.value}}:null}).where(function(a){return a}).orderBy(function(a){return"replace"===a.directive.render?-1:0}).toArray():null;if((j=m)&&j.length)"replace"===j[0].directive.render&&(j[0].options.linker=f(a,j.slice(1)),j=j.slice(0,1)),j.forEach(function(c){c.directive.context&&(Ra=!0);var b=c.directive;
b.compile&&b.compile(c.options);"replace"===c.directive.render&&(c.options.templateNode=a,c=fa.createComment(c.type),a.parentNode.replaceChild(c,a),a=c)}),l=e(j,function(a,c,b,e){a.link(x(c),b,e)}),z=e(j,function(a,c,b,e){a.unlink(x(c),b,e)});if(a.childNodes.length&&(m=g(i(a.childNodes))))l=d(l,m.link),z=d(z,m.unlink);if(Ra){var pb=l;l=function(a,c,b){pb(a,c.$new(),b)}}return l?{link:l,unlink:z}:null}function g(a){var a=a.toArray(),c=a.map(function(a){return f(a)});return{link:function(a,b){i(a).toArray().forEach(function(a,
e){var d=c[e];d&&d.link(a,b)})},unlink:function(a,b){i(a).toArray().forEach(function(e,d){var f=c[d];f&&f.unlink(a[d],b)})}}}return a.getEnumerator?g(a):va(a)?g(i(a)):f(a)}k.version="0.7.0.1";var W=Object.prototype.toString,n=Array.prototype,Ta=Function.prototype,qb=String.prototype,ga,Ua=Number,kb=0;t.filterHasOwnProperty=function(c,a){return c.hasOwnProperty(a)};t(k,{isString:p,isNumber:V,isBoolean:function(c){return"[object Boolean]"===W.call(c)},isFunction:s,isUndefined:ua,isNullOrUndefined:A,
extend:t,getUID:wa,noop:X});var I=y(Array,"isArray",function(){return function(c){return"[object Array]"===W.call(c)}});y(n,"forEach",function(){return function(c,a){for(var b=M(this,"Array.forEach"),b=p(b)?b.split(""):b,d=0,e=this.length;d<e;d++)d in b&&c.call(a,b[d],d,b)}});y(n,"filter",function(){return function(c,a){for(var b=M(this,"Array.filter"),d=b.length,e=[],f=0,b=p(b)?b.split(""):b,g=0;g<d;g++)if(g in b){var h=b[g];c.call(a,h,g,b)&&(e[f++]=h)}return e}});y(n,"indexOf",function(){return function(c,
a){var b=M(this,"Array.indexOf"),a=A(a)?0:0>a?Math.max(0,b.length+a):a;if(p(b))return!p(c)||1!==c.length?-1:b.indexOf(c,a);for(var d=a,e=b.length;d<e;d++)if(d in b&&b[d]===c)return d;return-1}});y(n,"map",function(){return function(c,a){for(var b=M(this,"Array.map"),d=b.length,e=Array(d),f=p(b)?b.split(""):b,g=0;g<d;g++)g in f&&(e[g]=c.call(a,f[g],g,b));return e}});y(qb,"trim",function(){return function(){return M(this).replace(/^[\s\xa0]+|[\s\xa0]+$/g,"")}});y(Ta,"bind",function(){var c=function(){};
return function(a){var b=this,d,e=n.slice.call(arguments,1);if("object"===typeof b){var f=function(){var c=[a].concat(n.slice.call(arguments));return Function.prototype.call.apply(b,c)};return f.bind.apply(f,arguments)}return d=function(){if(!(this instanceof d))return b.apply(a,e.concat(n.slice.call(arguments)));c.prototype=b.prototype;var f=new c,h=b.apply(f,e.concat(n.slice.call(arguments)));return Object(h)===h?h:f}}});y(Object,"getOwnPropertyNames",function(){var c=function(a){var c=[],b=0,g;
for(g in a)a.hasOwnProperty(g)&&(c[b++]=g);return c},a=["toString","valueOf"],b;for(b in{toString:X})if(b===a[0])return c;return function(b){var e=c(b);a.forEach(function(a){b.hasOwnProperty(a)&&e.push(a)});return e}});y(Object,"observe",function(){return function(){}});k.typeInfo=function(c){return c.__TYPE_INFO__()};k.type=D;var E={};t(B.prototype,{select:function(c){return i(Y(this.getEnumerator_,c))},where:function(c){return i(za(this.getEnumerator_,c))},first:function(c){return Ba($(this.getEnumerator_(),
c))},firstOrDefault:function(c,a){return aa($(this.getEnumerator_(),c),a)},last:function(c){return Ba(Aa(this.getEnumerator_(),c))},lastOrDefault:function(c,a){return aa(Aa(this.getEnumerator_(),c),a)},toArray:function(){return ka(this.getEnumerator_)},aggregate:function(c,a,b){return Z(this.getEnumerator_,c,a,b)},min:function(c){return aa(ja(this.getEnumerator_,c,-1))},max:function(c){return aa(ja(this.getEnumerator_,c,1))},extremum:function(c){return ja(this.getEnumerator_,c)},sum:function(){return Z(this.getEnumerator_,
function(c,a){return c+Ua(a)},0,NaN)},any:function(c){return $(this.getEnumerator_(),c)!==E},skip:function(c){var a=this.getEnumerator_;return i(function(){var b=a(),d=-1;return u(function(){for(var a;d<c&&(a=b.moveNext());)d++;return a||b.moveNext()},b.current)})},take:function(c){var a=this.getEnumerator_;return i(function(){var b=a(),d=w(),e=0;return u(function(){return e<c&&b.moveNext()?(e++,d.progress(b.current())):d.end()},d.current)})},distinct:function(c){var a=this.getEnumerator_,b=c,b=b||
N;return i(function(){var c;return za(function(){c={};return a()},function(a){a=ya(b(a));return!c.hasOwnProperty(a)&&(c[a]=!0)})()})},groupBy:function(c){var a=this.getEnumerator_,b=c,b=b||N;return i(function(){function c(a,b,d){var g=i(function(){var a=w(),c=0;return u(function(){return c<b.length||e(!0,d)?a.progress(b[c++]):a.end()},a.current)});g.key=a;return f[d]={items:b,groupSource:g}}function e(a,e){if(!a){if(l<j.length)return h.progress(j[l++].groupSource);0!==l&&(j=[],l=0)}for(;g.moveNext();){var m=
g.current(),i=b(m),k=ya(i);if(f.hasOwnProperty(k)){if(f[k].items.push(m),a&&e===k)return!0}else if(m=c(i,[m],k),a?j.push(m):h.progress(m.groupSource),!a)return!0}return a?!1:h.end()}var f={},g=a(),h=w(),j=[],l=0;return u(function(){return e(!1)},h.current)})},average:function(){var c=0;return Z(this.getEnumerator_,function(a,b){c++;return a+Ua(b)},0,NaN)/c},forEach:function(c,a){for(var b=(0,this.getEnumerator_)(),d=0;b.moveNext();)c.call(a,b.current(),d++)},reverse:function(){var c=this.getEnumerator_;
return i(function(){return ha(ka(c).reverse())()})},orderBy:function(c,a){return ca(this.getEnumerator_,ba(c,a,1))},concat:function(){return i(ia(this.getEnumerator_,n.slice.call(arguments)))},orderByDesc:function(c,a){return ca(this.getEnumerator_,ba(c,a,-1))}});i.regexExec=function(c,a,b){return i(function(){var d=w(),e=b,f;return u(function(){var b,h;e===a.length?(h=!ua(void 0)?d.progress(void 0):d.end(),e=-1):-1===e?h=d.end():(f=c.lastIndex,c.lastIndex=e,h=(b=c.exec(a))?d.progress(b):d.end(),
e=c.lastIndex,c.lastIndex=f);return h},d.current)})};i.value=function(c){var a=!1;return i(u(function(){return!a?a=!0:!1},function(){if(a)throw Error();return c}))};i.sequence=function(c,a,b){return i(function(){var d=w();return u(function(){return c<a?d.progress(b?b(c++):c++):d.end()},d.current)})};k.enumerable=i;var Va=k.List=D(function(){this.items_=[];var c=this;B.call(this,function(){return i(c.items_).getEnumerator()})}).defines({add:function(c){this.items_.push(c);return this.items_.length-
1},addRange:function(c){I(c)||(c=i(c).toArray());this.items_=this.items_.concat(c)},remove:function(c){c=this.items_.indexOf(c);-1!==c&&this.removeAt(c);return-1!==c},removeAt:function(c){this.items.splice(c,1)},count:function(){return this.items_.length},itemAt:function(c){return this.items_[c]}}).inherits(B).build(),lb=/\{(\d+)(:(([a-z])(\d*)))?\}/gi;F.formatters={d:function(c,a){c=Math.floor(Number(c));if(isNaN(c)||!a)return c;c=""+c;return la("0",a-c.length)+c},f:function(c,a){c=Number(c);return!A(a)?
c.toFixed(a):c}};t(k,{string:{padLeft:function(c,a,b){return la(a,b)+c},padRight:function(c,a,b){return c+la(a,b)},format:F}});var P=function(c,a,b){a?c.reject(b):c.resolve(b)},Wa=function(c){function a(){function c(a,b){j=a;l=b;h=!0;for(var e;d.length;){e=d;d=[];for(var f=0,i=e.length;f<i;f++)e[f][Number(j)](l)}d=null}function b(a,d){d&&s(d.then)?d.then(function(b){c(a,b)},function(a){c(!0,a)}):c(a,d)}var d=[],h=!1,j,l;return{resolve:function(a){b(!1,a)},reject:function(a){b(!0,a)},promise:{fin:function(a){var c,
b;return this.then(function(b){c=b;return a()},function(c){b=c;return a()}).then(function(){return c},function(a){throw a||b;})},then:function(c,b){var e=a(),f=function(a){try{e.resolve(c?c(a):a)}catch(b){e.reject(b)}},h=function(a){if(b)try{e.resolve(b(a))}catch(c){e.reject(c)}else e.reject(a)};d?d.push([f,h]):(j?h:f)(l);return e.promise},isResolved:function(){return h},isRejected:function(){return!0==j},isFulfilled:function(){return!1===j},valueOf:function(){if(!h)throw Error("Promise has not completed.");
return l}}}}function b(b){if(b&&s(b.then))return b;var d=a();c(function(){d.resolve(b)});return d.promise}var d=D(function(a,c){this.callback=a;c&&(this.isErrback=c)}).defines({isAsyncCallback:!0,isErrback:!1}).build();return{defer:a,reject:function(b){var d=a();c(function(){d.reject(b)});return d.promise},resolve:b,all:function(c){if(!c.length)return b([]);var d=c.length,g=!1,h=a();c.map(function(a){return b(a)}).forEach(function(a){a.then(function(){g|=0;--d||P(h,g,c)},function(){g|=1;--d||P(h,
g,c)})});return h.promise},wait:function(c,b,d){function h(){z&&(clearInterval(z),z=null);l&&(clearTimeout(l),l=null)}var j=a(),l=setTimeout(function(){h();j.reject(new na)},d),z=setInterval(function(){c()&&(h(),j.resolve())},b);return j.promise},delay:function(c,b){var d=a();setTimeout(function(){d.resolve(b)},c);return d.promise},timeout:function(c,d){if((c=b(c)).isResolved())return c;var g=a(),h=setTimeout(function(){g.reject(new na("Timed out after "+d+" ms."))},d||0);c.then(function(a){clearTimeout(h);
g.promise.isResolved()||P(g,!1,a)},function(a){g.promise.isResolved()||P(g,!0,a)});return g.promise},factory:Wa,invoke:function(c,b){function d(a){var c=a.isErrback,b=a.callback;return function(){try{var a;b?(a=b.apply(this,arguments),c=!1):a=arguments[0];P(h,c,a)}catch(d){h.reject(d)}}}for(var h=a(),j=i(arguments).toArray().slice(2),l=0,z=j.length;l<z;l++){var k=j[l];k&&k.isAsyncCallback&&(j[l]=d(k))}c.apply(b,j);return h.promise},callback:function(a){return new d(a,!1)},errback:function(a){return new d(a,
!0)},TimeoutError:na}};k.async=Wa(function(c){c()});var na=D(function(){Error.apply(this,arguments)}).inherits(Error).build(),Xa="textContent"in fa.createElement("span"),Ya=Xa?function(c){return c.textContent||""}:function(c){return(1==c.nodeType?c.innerText:c.nodeValue)||""},Za=Xa?function(c,a){c.textContent=a?a:""}:function(c,a){a=a||"";1==c.nodeType?c.innerText=a:c.nodeValue=a},v={option:[1,"<select multiple='multiple'>","</select>"],legend:[1,"<fieldset>","</fieldset>"],thead:[1,"<table>","</table>"],
tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],area:[1,"<map>","</map>"]};v.optgroup=v.option;v.tbody=v.tfoot=v.colgroup=v.caption=v.thead;v.th=v.td;var x=t(function a(b){if(b instanceof Q)return b;if(I(b))return new Q(b);if(p(b))return a.parse(b);if(b.nodeType)return new Q([b]);throw Error();},{parse:function(a,b){var b=b||fa,d=b.createElement("div"),e=a.match(/^\s*<(t[dhr]|tbody|tfoot|thead|option|legend|col|area|optgroup|colgroup|caption)/i);
if(e){var e=v[e[1].toLowerCase()],f=e[0];for(d.innerHTML=e[1]+a+e[2];f--;)d=d.lastChild}else d.innerHTML="<br>"+a,d.removeChild(d.firstChild);e=i(d.childNodes).toArray();d.innerHTML="";return new Q(e)}}),Q=D(function(a){this._nodes=a;B.call(this,ha(a))}).name("Nodes").inherits(B).defines({value:da(Ea,Fa),valueList:Ma(Ea,Fa),text:da(Ya,Za),textList:Ma(Ya,Za),attribute:Ka(Ga,Ha),attributeList:La(Ga,Ha),style:Ka(Ia,Ja),styleList:La(Ia,Ja),parent:da(function(a){return x(a.parentNode)}),nextSibling:da(function(a){return x(a.nextSibling)}),
on:function(a,b){this.forEach(function(d){d.addEventListener(a,b)})},off:function(a,b){this.forEach(function(d){d.removeEventListener(a,b)})},clone:function(a){return new Q(this._nodes.map(function(b){return b.cloneNode(a)}))},replace:function(a){a=x(a);this.forEach(function(b){var d=b.parentNode;null!=d&&d.replaceChild(a.first(),b)})},appendTo:function(a){var b=this,d=!1;x(a).forEach(function(a){b.forEach(function(b){b=d?b.cloneNode(!0):b;a.appendChild(b)});d=!0});return this},insertBefore:function(a){var b=
!1,d=this;x(a).forEach(function(a){var f=a.parentNode;d.forEach(function(d){f.insertBefore(b?d.cloneNode(!0):d,a)});b=!0})},insertAfter:function(a){var b=!1,d=this;x(a).forEach(function(a){var f=a.parentNode,a=a.nextSibling;d.forEach(function(d){f.insertBefore(b?d.cloneNode(!0):d,a)});b=!0})}}).build();k.nodes=x;var nb=D(function(a){this.registration=a}).defines({factory:function(a,b){return this.registration(a).factory(b)},type:function(a,b){return this.registration(a).type(b)},instance:function(a,
b){return this.registration(a).instance(b)},directive:function(a){return this.registration("Directive").name(a)},controller:function(a){return this.registration("Controller").name(a)}}).build();k.module=ma;k.container=function(a){function b(a,b,e){e=d(a,b,e);if(!e)throw Error("Could not resolve instance: "+a+":"+(b||""));return e}function d(a,b,d){!d&&(b&&!L(b))&&(d=b,b="");var a=f[a],e;a&&(e=b?a.keys[b]:a.main);return(b=e?e.resolver:null)?b(g,d):null}function e(){function a(d,e,f,g,h){f+=":";g&&
(f+=g);return b[f]||(b[f]=e(d,h))}var b={};g.root||(g.current=g.root=a);return{using:function(b){if(this._cache)throw Error("Object disposed");var d=g.current;g.current=a;try{b()}finally{g.current=d}},dispose:function(){b&&(b=null,_)}}}var f={},g;g={resolve:b};e();i(a).select(function(a){return a()}).forEach(function(a){a.forEach(function(a){var b=f[a.contract]||(f[a.contract]={main:null,keys:{}});if(a.memberOf){var d=a.memberOf,e=req,h=f[d]||(f[d]={main:null,keys:{}});h.members||(h.members=[],h.main=
Qa(d).factory(function(){return h.members.map(function(a){return a.resolver(g)})}).trans().build());h.members.push(e)}a.name?b.keys[a.name]=a:b.main=a})});return{resolve:b,tryResolve:d,createScope:e}};var R=function(a){return Function("s","l","x","y","return x(s, l)"+a+"y(s, l);")},G=function(a){var b=function(){return a};b.isPrimitive=L(a);return b},bb=function(a,b){function d(b){if(f!==b){var b="at (",d=a.charAt(f);if('"'===d||"'"===d)b="Unterminated string detected "+b;throw Error("INVALID TOKEN: "+
b+f+").");}}function e(b){var e,g;b?(g=b[0],e=b[8]&&H||b[1]&&S||b[19]&&C||b[13]&&T,d(b=b.index),f+=g.length):(d(b=a.length),e=$a);if(e)return{type:e,text:g,index:b,fn:null};e=ab[g];return{type:e.type,text:g,index:b,fn:e.fn}}var f=0,g=new B(function(){var b=w(),d=0,f;return u(function(){var g,i;if(d===a.length)return d=-1,b.progress(e(null));if(-1===d)return!1;f=J.lastIndex;J.lastIndex=d;i=(g=J.exec(a))?b.progress(e(g)):b.end();d=J.lastIndex;J.lastIndex=f;return i},b.current)});b&&(g=g.where(function(a){return a.type!==
S}));return g},ea=function(a,b){if(a&&a.length){var d;d="var c = $scope, u;"+(i(a).aggregate(function(a,b){return a+" if ($ctx.isNullOrUndefined(c)) return u; c=c['"+b+"'];"},"")+" return c");var e=Function("$scope","$ctx",d);return t(b?function(a){return e(b(a),cb)}:function(a){return e(a,cb)},{setter:function(b,d){for(var e=0,j=a.length-1;e<j;e++){if(L(b))return;b=b[a[e]]}L(b)||(b[a[a.length-1]]=d)},context:t(function(a){return b?b(a):a},{fn:b}),path:a})}return null},db=function(a){return function(b){return b.text===
a}},oa=function(a,b,d){return t(function(e,f){return b(e,f,a,d)},{lhs:a,rhs:d})},U=function(a,b,d){var e=function(){var f=a(),g;if(g=b(d))f=oa(f,g.fn,e());return f};return e},gb=function(){return{parse:function(a,b){function d(a){if(r<w-1){var b=p[r];if(!a||b.text===a)return b}return null}function e(a){return t(Error(F("Parser error: {0} at position ({1}).",a,r)),{line:0,column:r})}function f(a){var b;if(!(b=g(a)))throw b=p[r],e(F("expected token '{0}', but found '{1}'",a,b&&b.text||"EOF"));return b}
function g(a){(a=d(a))&&r++;return a}function h(a){var b;return r<w-1&&(b=p[r],b.type===a)?(r++,b):null}function j(a,b,d){var e=r+a.length;if(e>w)return null;for(var f=r,g=0;f<e;f++,g++)if(!a[g](p[f]))return null;a=p[r+b];r+=d;return a}function l(a){var b,e,f=a;if(b=h(C)||a&&j(eb,1,3))for(e=[b.text];;)if(g(".")||d("[")){b=h(C)||j(eb,1,3);if(!b)throw Error();e.push(b.type===H?b.text.substring(1,b.text.length-1):b.text)}else if(g("("))b=f,e.length&&(a=f,1<e.length&&(a=f=ea(e.slice(0,e.length-1),f)),
b=ea(e.slice(e.length-1),f)),f=q(b,a),a=function(){return K},e=[];else break;e&&e.length&&(f=ea(e,f));return f}function i(){var b=k(),d,e;if(e=g("=")){if(!b.assign)throw Error("implies assignment but ["+a.substring(0,e.index)+"] can not be assigned to",e);d=k();return function(a,e){return b.assign(a,d(a,e),e)}}return b}function k(){for(var a=x(),b;b=g("||");)a=oa(a,b.fn,x());return a}function m(){var a;if(g("+"))a=u();else if(a=g("-"))a=oa(fb,a.fn,m());else if(a=g("!")){var b=a.fn,d=m();a=function(a,
e){return b(a,e,d)}}else a=u();return a}function q(a,b){var e=[];if(!d(")")){do e.push(i());while(g(","))}f(")");return function(d,f){for(var g=[],h=b?b(d,f):d,j=0;j<e.length;j++)g.push(e[j](d,f));j=a(d,f)||X;if(j.apply)return j.apply(h,g);g.unshift(h);return Ta.call.apply(j,g)}}function u(){var a,b;a=l();if(!a)if(g("("))a=i(),f(")");else if(g("[")){var e=[];if(!d("]")){do e.push(i());while(g(","))}a=function(a,b){return e.map(function(d){return d(a,b)})};f("]")}if(!a){b=g();a=b.fn;if(!a&&32===(b.type&
32))switch(b.type){case T:a=G(Number(b.text));break;case C:a=ea([h(C)]);break;case H:a=G(b.text.substring(1,b.text.length-1))}if(d(".")||d("["))g("."),a=l(a)}if(!a)throw Error("Invalid expression.");return a}var p=bb(a).where(function(a){return a.type!==S}).toArray(),r=0,w=p.length,x=U(U(U(U(U(m,h,pa),h,qa),h,ra),h,sa),g,"&&"),s=i();if(!b||!b.isBindingExpression)return s;for(s={evaluator:s,parameters:{}};g(",");){var v=void 0;if(!(v=h(C)))throw Error("Unexpected token");var v=v.text,y,n;f("=");y=
r;if(n=p[r])r++,n.fn&&n.fn.isPrimitive?s.parameters[v]=n.fn():n.type===H?s.parameters[v]=n.text.substring(1,n.text.length-1):r--;if(y===r)throw e(F("unexpected token '{0}', but found '{1}'",n&&n.text||"EOF"));}return s}}},hb=function(a){var b={},d=function(d,f){return(b[d]||(b[d]=a.parse(d)))(f)};d.clearCache=function(){b={}};return d},$a=-1,C=3,sa=17,ra=18,pa=19,qa=20,H=32,T=33,S=128,fb,ab={},J,rb=function(a){return i(a).select(function(a){return-1!=="\\[]{}().+*^|".indexOf(a)?"\\"+a:a}).toArray().join("")},
q=function(a,b,d,e){d||(a.forEach(function(a,d){ab[a]={type:b,fn:e&&(s(e)?e(a):e[d])}}),a=a.map(rb));ib.push(a)};fb=G(0);var ib=[];q(["\\s","\\r","\\t","\\n"," "],S,!1);q(["===","==","!==","!="],sa,!1,R);q(["<=","<",">=",">"],ra,!1,R);q(["*","%","/"],pa,!1,R);q(["+","-"],qa,!1,R);q("&& || = <<= << >>= & | ^".split(" "),16,!1,R);q("()[]{}".split(""),4,!1);q(['"([^\\\\"]*(\\\\[rtn"])?)*"',"'([^\\\\']*(\\\\[rtn'])?)*'"],H,!0);q(["[-+]?[0-9]*[.]?[0-9]+([eE][-+]?[0-9]+)?"],T,!0);q(["NaN"],T,!1,[G(NaN)]);
q(["true","false"],34,!1,[G(!0),G(!1)]);q(["null"],35,!1,[G(null)]);q(["undefined"],36,!1,[X]);q(["[a-z_$]{1}[\\da-z_]*"],C,!0);q(["typeof","in"],2,!1);q([".",":",",",";"],64,!1);var sb=i(ib).select(function(a){return a.join("|")}).aggregate(function(a,b){return(a?a+"|(":"(")+b+")"},"");J=RegExp(sb,"gi");var cb={has:function(a,b){return a&&!L(a)&&b in a},isNullOrUndefined:function(a){return A(a)}},tb=H,ub=db("["),vb=db("]"),eb=[ub,function(a){return a.type===tb},vb];k.parser=gb;t(k.tokenize=bb,{TOKEN_EOF:$a,
TOKEN_OPERATOR:16,TOKEN_EQUALITY:sa,TOKEN_RELATIONAL:ra,TOKEN_MULTIPLICATIVE:pa,TOKEN_ADDITIVE:qa,TOKEN_KEYWORD:2,TOKEN_IDENTIFIER:C,TOKEN_GROUP:4,TOKEN_STRING:H,TOKEN_NUMBER:T,TOKEN_BOOLEAN:34,TOKEN_NULL:35,TOKEN_UNDEFINED:36,TOKEN_DELIMITER:64,TOKEN_WHITESPACE:S});k.execFactory=hb;k.exec=hb(gb());var wb=["$parse",function(a){return{link:function(b,d,e){var e=a(e.expression),f=e.evaluator;(e=e.parameters.on)&&e.split(" ").forEach(function(a){b.on(a,function(){f(d)})})}}}],xb=[function(){return{link:function(a,
b,d){b.$observe(d.expression,function(b){a.attribute(d.qualifier,b)})}}}],yb=["$parse",function(a){return{render:"replace",compile:function(a){var d=a.expression,e=k.tokenize(d,!0).take(2).toArray();a.itemName="item";2===e.length&&(e[0].type===k.tokenize.TOKEN_IDENTIFIER&&"in"===e[1].text)&&(a.expression=d.substring(e[1].index+2),a.itemName=e[0].text||"item")},link:function(b,d,e){var f=x(e.templateNode),g=e.linker,h=a(e.expression).evaluator,b=b.nextSibling();(h=h(d))&&i(h).forEach(function(a){var h=
f.clone(!0),i=d.$new();h.insertAfter(b);i[e.itemName]=a;g.link(h.first(),i);b=b.nextSibling()})}}}],zb=["$parse",function(a){return{link:function(b,d,e){var f=a(e.expression),g=f.evaluator;b.on("change"===f.parameters.updateOn?"input":"change",function(){g.setter(d,b.value());d.$sync()});d.$observe(e.expression,function(a){b.value(A(a)?"":a)})}}}],Ab=function(){return{link:function(a,b,d){b.$observe(d.expression,function(b){a.text(b)})}}},Bb=function(){return{link:function(a,b,d){b.$observe(d.expression,
function(b){a.style("display",b?"":"none")})}}},Cb=["$parse","$container",function(a,b){return{render:"replace",link:function(d,e,f){var g=e.$new();e.$observe(f.expression,function(h){var j=a(f.expression),h=x(b.resolve("Template",h)),i=Sa(b,h,{content:{link:function(a){var b=f.templateNode.cloneNode(!0);a.replace(b);f.linker.link(b,e)}}}),h=h.clone(!0);h.insertAfter(d);Object.getOwnPropertyNames(j.parameters).forEach(function(a){g[a]=j.parameters[a]});i.link(h,g)})}}}],Db=["$parse",function(a){return{link:function(b,
d,e){var f=a(e.expression).evaluator;b.on(e.qualifier,function(){f(d)})}}}],Eb=[function(){return{compile:function(a){var b;b=a.qualifier.split("_").map(function(a,b){return b?a.charAt(0).toUpperCase()+a.substring(1):a}).join("");b=jb[b]||(jb[b]=b);a.propertyName=b},link:function(a,b,d){b.$observe(d.expression,function(b){a[d.propertyName]=b})}}}],Fb=["$parse","$container",function(a,b){return{context:{},link:function(a,e,f){e.$controller=b.resolve("Controller",f.expression,{$context:e})}}}],Hb=k.DataContext=
D(function(a){this.$children=new Va;this.$parse=a;this.$observers={}}).defines({$new:function(){if(!this.hasOwnProperty("$childScopeType")){var a=function(a){a.constructor.call(this,a.$parse);this.$parent=a;a.$children.add(this)};a.prototype=this;this.$childScopeType=a}return new this.$childScopeType(this)},$eval:function(a){if(p(a))return this.$parse(a)(this);if(s(a))return a(this);throw Error();},$sync:function(){Object.getOwnPropertyNames(this.$observers).forEach(function(a){this.$observers[a].sync()}.bind(this))},
$observe:function(a,b){var d=this.$observers,e=d[a];if(!e){var f;var g=this,h=a,j=g.$parse(h).evaluator;f=j.path;if(!f||j.context.fn)f=!1;else{var i=g._autoObjserveData=g._autoObjserveData||{watchers:{},root:{value:g,children:[]}},k=i.watchers[h];if(k)k.handlers.push(b),f=void 0;else{var p=j(g),k=i.watchers[h]=function(){var a=j(g);p!==a&&k.handlers.forEach(function(b){b(a,p)})};k.handlers=[b];for(var h=g,i=i.root,m=0;m<f.length;m++){ob(i);var n=f[m],h=i.children[n]=i.children[n]||{value:h[n],watchers:[],
children:{}};h.watchers.push(k);i=h;h=h.value}f=!0}}if(!f)var a=this.$parse(a),q=a.evaluator,e=d[a]=new Gb(function(){return q(this)}.bind(this))}if(e)e.on(b)}}).build(),Gb=k.type(function(a){this._handlers=new Va;this._evaluator=a;this._value=a()}).defines({sync:function(){var a=this._value,b=this._value=this._evaluator();a!==b&&this._handlers.forEach(function(d){d(b,a)})},on:function(a){this._handlers.add(a);a(this._value)},off:function(a){this._handlers.remove(a)}}).build(),jb={},Ib=ma(function(a){a.directive("mv-each").factory(yb);
a.directive("mv-action").factory(wb);a.directive("mv-on-").factory(Db);a.directive("mv-model").factory(zb);a.directive("mv-attr-").factory(xb);a.directive("mv-").factory(Eb);a.directive("mv-decorator").factory(Cb);a.directive("mv-text").factory(Ab);a.directive("mv-show").factory(Bb);a.directive("mv-controller").factory(Fb);a.factory("$parse",function(){var a=k.parser().parse;return function(d){return a(d,{isBindingExpression:!0})}});a.type("$rootContext",["$parse",Hb])});k.bootstrap=function(a,b,
d){var e,b=b||[];b.unshift(Ib);b.unshift(ma(function(a){a.factory("$container",function(){return e})}));e=k.container(b);b=e.resolve("$rootContext");a.dataContext=b;d&&t(b,d);Sa(e,a).link(a,b);return b};k.bind=function(a,b,d){a.bindings=a.bindings||[];b={updateSource:b,updateTarget:d};a.bindings.push(b);return b}};if("function"===typeof define&&define.amd)define(["exports","jquery"],V);else if(K){var ta=K.photon=K.photon||{};V(ta,K.jQuery)}})(window,document);

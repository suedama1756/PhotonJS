(function(O,ja){var N=function(k){function w(c){return"[object String]"===Y.call(c)}function N(c){return"[object Number]"===Y.call(c)}function q(c){return"function"===typeof c}function Aa(c){return c===ka}function J(c){return!("object"===typeof c||q(c))}function y(c){return null===c||c===ka}function Ba(c){var a;return K(c)||"object"===typeof c&&N(a=c.length)&&(0===a||0<a&&"0"in c&&a-1 in c)}function Z(){}function Ca(c){return c["0c8c22e83e7245adb341d6df8973ea63"]||(c["0c8c22e83e7245adb341d6df8973ea63"]=
++tb)}function r(c,a,b,d){for(var e in a)if(!b||b(a,e,c))c[e]=d?d(a,e,c):a[e];return c}function B(c,a,b){return a in c?c[a]:c[a]=b()}function P(c,a){if(y(c))throw new TypeError((a||"?")+" called on null or undefined.");return c}function z(c){var a={},b={},d=null,e=null,f=null;return{name:function(a){d=a;return this},inherits:function(a){e=a;return this},defines:function(b){q(b)&&(b=b(function(){return f}));r(a,b);return this},definesStatic:function(a){q(a)&&(a=a(function(){return f}));r(b,a);return this},
exports:function(b){r(a,b(a));return this},build:function(){function g(){}y(c)&&(c=function(){});d=d||c.name;a.hasOwnProperty("toString")||(a.toString=function(){return"[object "+(d||"Object")+"]"});e&&(f=e.prototype,g.prototype=f);var h={name:function(){return d},baseType:function(){return e}};c.typeInfo=function(){return h};var i=c.prototype=new g;i.constructor=c;a&&k.extend(i,a,k.extend.filterHasOwnProperty,function(a,b){return a[b]});i.__TYPE_INFO__=c.typeInfo;return r(c,b)}}}function Q(c){return c}
function Da(c,a){return c===a?0:c<a?-1:c>a?1:-2}function s(){var c=0,a;return{current:function(){if(0===c)throw Error("Enumeration has not started.");if(3===c)throw Error("Enumeration has completed.");return a},progress:function(b){a=b;return!!(c=1)},end:function(){return!(c=3)}}}function la(c){return function(){var a=-1,b=s();return v(function(){if(-2!==a){for(var d=c.length;++a<d;)if(a in c)return b.progress(c[a]);a=-2}return b.end()},b.current)}}function Ea(c){var a=typeof c;"object"===a&&null!==
c?(a=Object.prototype.toString.call(c),c="[object Object]"===a||c.valueOf()===c?"o"+Ca(c):a+c.valueOf()):c=a.charAt(0)+c;return c}function R(c){if(K(c)||Ba(c))return la(c);if(w(c))return function(){var a=-1,b=c.length,d=s();return v(function(){return-2!==a?++a<b?d.progress(c.charAt(a)):a=d.end():!1},d.current)};if(q(c))return c;if(q(c.getEnumerator))return c.getEnumerator}function $(c,a){var b=a,a=w(b)?function(a){return a[b]}:b||Q;return function(){var b=s(),e=c(),f=0;return v(function(){return e.moveNext()&&
b.progress(a(e.current(),f++))||b.end()},b.current)}}function Fa(c,a){return function(){var b=s(),d=c(),e=0;return v(function(){for(;d.moveNext();){var c=d.current();if(a(c,e++))return b.progress(c)}return b.end()},b.current)}}function ma(c,a){return function(){var b=s(),d=c(),e=$(R(a),function(a){return(a&&"object"===typeof a&&a.getEnumerator||R(Array.isArray(a)?a:[a]))()})();return v(function(){for(;!d.moveNext();){if(!e.moveNext())return b.end();d=e.current()}return b.progress(d.current())},b.current)}}
function aa(c,a,b,d){for(var c=c(),e=0;c.moveNext();)b=a(b,c.current(),e++);return e?b:d}function v(c,a){return{moveNext:c,current:a}}function na(c,a,b){a=a||Da;return aa(c,function(c,e,f){return!f||a(e,c)===b?e:c},ka,F)}function oa(c){for(var a=[],b=0,c=c();c.moveNext();)a[b++]=c.current();return a}function ba(c,a){for(;c.moveNext();){var b=c.current();if(!a||a(b))return b}return F}function Ga(c,a){for(var b=F,d;(d=ba(c,a))!==F;)b=d;return b}function Ha(c){if(c===F)throw Error("No match found.");
return c}function ca(c,a){return c===F?a:c}function j(c){return c instanceof D?c:new D(R(c))}function D(c){this.getEnumerator=this.getEnumerator_=c}function Ia(c){return w(c)?function(a){return a[c]}:c||Q}function Ja(c){if(c.moveNext()){var a=c.current(),b=Ja(c),d=Ia(a.selector),e=a.direction,f=a.comparer;return function(a,c){return f(d(a),d(c))*e||b(a,c)}}return function(){return 0}}function da(c,a,b){K(c)||(c=[c||Q]);c=$(R(c),Ia);return $(c,function(c){return{selector:c,direction:b,comparer:a||
Da}})}function ea(c,a){return r(j(function(){return R(oa(c).sort(Ja(a())))()}),{thenBy:function(b,d){return ea(c,ma(a,da(b,d,1)))},thenByDesc:function(b,d){return ea(c,ma(a,da(b,d,-1)))}})}function G(c){var a=arguments;return c.replace(ub,function(b,c,e,f,g,h){if(g){b=G.formatters[g];g=G("Invalid format specifier '{0}'.",g);if(!b)throw Error(g);g=b}else g=null;c=a[Number(c)+1];return g?g(c,h):c})}function pa(c,a){for(var a=y(a)?1:a,b=[];0<a--;)b.push(c);return b.join("")}function Ka(c){return c.value}
function La(c,a){c.value=a}function Ma(c,a){return c.getAttribute(a)}function Na(c,a,b){c.setAttribute(a,b)}function Oa(c,a){return c.style[a]}function Pa(c,a,b){c.style[a]=b}function Qa(c,a){return function(b,d){var e=this._nodes;return arguments.length?(a(e[0],b,d),this):c(e[0],b)}}function Ra(c,a){return function(b,d){return 2===arguments.length?(this.forEach(function(c){a(c,b,d)}),this):this.select(function(a){return c(a,b)})}}function fa(c,a){return function(b){var d=this._nodes;if(arguments.length){if(!a)throw Error("Property is readonly.");
a(d[0],b);return this}return c(d[0])}}function Sa(c,a){return function(b){return arguments.length?(this.forEach(function(c){a(c,b)}),this):this.select(c)}}function Ta(c,a,b,d,e){return c.root(c,a,b,d,e)}function za(c,a,b){return a(c,b)}function vb(c,a,b,d,e){return c.current(c,a,b,d,e)}function Ua(c){var a=c,b=c.$dependencies;K(c)&&(b=c.length-1,a=c[b],b=c.slice(0,b));return{fn:a,deps:b||[]}}function Va(c,a,b){return c.map(function(c){return b&&b.hasOwnProperty(c)?b[c]:a.resolve(c)})}function Wa(c){var a,
b,d,e;return{factory:function(a){var a=Ua(a),c=a.deps,d=a.fn;b=function(a,b){var e=Va(c,a,b);return d.apply(this,e)};return this},instance:function(a){b=function(){return a};return this},type:function(a){function c(){}var a=Ua(a),d=a.deps,e=a.fn;c.prototype=e.prototype;if(!(b=e.$containerFactory))b=e.$containerFactory=function(a,b){var f=new c;e.apply(f,Va(d,a,b));return f};return this},trans:function(){d=za;return this},singleton:function(){d=Ta;return this},scope:function(){d=vb;return this},name:function(b){a=
b;return this},memberOf:function(a){e=a;return this},build:function(){if(!b)throw Error("Registration has no resolver.");d=d||Ta;return{name:a,memberOf:e,resolver:function(e,g){return d(e,b,c,a,g)},contract:c}}}}function qa(c){return function(){var a=[],b=new wb(function(b){b=Wa(b);a.push(b);return b});c(b);return j(a).select(function(a){return a.build()})}}function xb(c,a){return c===a}function ga(c){var a=null,b=null,d=null,e=new yb,f={observe:function(g,h){var i=a&&a[g.text];if(!i){i=g.paths;if(g.isObservable){var l=
d||(d=new Xa(e,c));b=b||{};var x=b[g.text];if(!x)for(var x=b[g.text]=new Ya(f,g),L=0;L<i.length;L++){for(var m=i[L],ha=l,Za,A=0;A<m.length;A++)ha=Za=ha.getOrCreateChild(m[A]);Za.addObserver(x)}i=x}else i=!1;i||(a||(a={}),i=a[g.text]=new Ya(f,g))}i.addHandler(h)},root:function(){return c},sync:function(){e.begin();try{d&&d.update(),a&&Object.getOwnPropertyNames(a).forEach(function(b){e.addObserver(a[b])})}finally{e.end()}}};return f}function ra(c,a){var b;y(c)||(b=c[a],b=q(b)&&b.isPropertyAccessor?
b.call(c):b);return b}function $a(c,a,b){function d(a,b){return!a&&!b?null:!b?a:function(c,d){a&&a(c,d);b(c.childNodes,d)}}function e(a,b){if(1===a.length){var c=a[0];return function(a,d){b(c.directive,a,d,c.options)}}return function(c,d){for(var e=0,f=a.length;e<f;e++)b(a[e].directive,c,d,a[e].options)}}function f(a,i){var l,x,L=!1,m;if(!(m=i))m="CONTENT"===a.tagName?[{directive:b.content,options:{}}]:(m=a&&a.attributes)?j(m).select(function(a){var b=a.name,d,e;if(!(e=c.tryResolve("Directive",b))){var f=
b.lastIndexOf("-")+1,g;if(g=0!==f)e=b.substring(0,f),g=e=c.tryResolve("Directive",e);g&&(d=b.substring(f),b=b.substring(0,f-1))}return e?{directive:e,options:{type:b,qualifier:d,expression:a.value}}:null}).where(function(a){return a}).orderBy(function(a){return"replace"===a.directive.render?-1:0}).toArray():null;if((i=m)&&i.length)"replace"===i[0].directive.render&&(i[0].options.linker=f(a,i.slice(1)),i=i.slice(0,1)),i.forEach(function(b){b.directive.context&&(L=!0);var c=b.directive;c.compile&&c.compile(b.options);
"replace"===b.directive.render&&(b.options.templateNode=a,b=ja.createComment(b.type),a.parentNode.replaceChild(b,a),a=b)}),l=e(i,function(a,b,c,e){a.link(u(b),c,e)}),x=e(i,function(a,b,c,e){a.unlink(u(b),c,e)});if(a.childNodes.length&&(m=g(j(a.childNodes))))l=d(l,m.link),x=d(x,m.unlink);if(L){var ha=l;l=function(a,b,c){ha(a,b.$new(),c)}}return l?{link:l,unlink:x}:null}function g(a){var a=a.toArray(),b=a.map(function(a){return f(a)});return{link:function(a,c){j(a).toArray().forEach(function(a,e){var d=
b[e];d&&d.link(a,c)})},unlink:function(a,c){j(a).toArray().forEach(function(e,d){var f=b[d];f&&f.unlink(a[d],c)})}}}return a.getEnumerator?g(a):Ba(a)?g(j(a)):f(a)}k.version="0.7.0.1";var Y=Object.prototype.toString,C=Array.prototype,ab=Function.prototype,zb=String.prototype,ka,bb=Number,tb=0;r.filterHasOwnProperty=function(c,a){return c.hasOwnProperty(a)};r(k,{isString:w,isNumber:N,isBoolean:function(c){return"[object Boolean]"===Y.call(c)},isFunction:q,isUndefined:Aa,isNullOrUndefined:y,extend:r,
getUID:Ca,noop:Z});var K=B(Array,"isArray",function(){return function(c){return"[object Array]"===Y.call(c)}});B(C,"forEach",function(){return function(c,a){for(var b=P(this,"Array.forEach"),b=w(b)?b.split(""):b,d=0,e=this.length;d<e;d++)d in b&&c.call(a,b[d],d,b)}});B(C,"filter",function(){return function(c,a){for(var b=P(this,"Array.filter"),d=b.length,e=[],f=0,b=w(b)?b.split(""):b,g=0;g<d;g++)if(g in b){var h=b[g];c.call(a,h,g,b)&&(e[f++]=h)}return e}});B(C,"indexOf",function(){return function(c,
a){var b=P(this,"Array.indexOf"),a=y(a)?0:0>a?Math.max(0,b.length+a):a;if(w(b))return!w(c)||1!==c.length?-1:b.indexOf(c,a);for(var d=a,e=b.length;d<e;d++)if(d in b&&b[d]===c)return d;return-1}});B(C,"map",function(){return function(c,a){for(var b=P(this,"Array.map"),d=b.length,e=Array(d),f=w(b)?b.split(""):b,g=0;g<d;g++)g in f&&(e[g]=c.call(a,f[g],g,b));return e}});B(zb,"trim",function(){return function(){return P(this).replace(/^[\s\xa0]+|[\s\xa0]+$/g,"")}});B(ab,"bind",function(){var c=function(){};
return function(a){var b=this,d,e=C.slice.call(arguments,1);if("object"===typeof b){var f=function(){var c=[a].concat(C.slice.call(arguments));return Function.prototype.call.apply(b,c)};return f.bind.apply(f,arguments)}return d=function(){if(!(this instanceof d))return b.apply(a,e.concat(C.slice.call(arguments)));c.prototype=b.prototype;var f=new c,h=b.apply(f,e.concat(C.slice.call(arguments)));return Object(h)===h?h:f}}});B(Object,"getOwnPropertyNames",function(){var c=function(a){var b=[],c=0,g;
for(g in a)a.hasOwnProperty(g)&&(b[c++]=g);return b},a=["toString","valueOf"],b;for(b in{toString:Z})if(b===a[0])return c;return function(b){var e=c(b);a.forEach(function(a){b.hasOwnProperty(a)&&e.push(a)});return e}});B(Object,"observe",function(){return function(){}});k.typeInfo=function(c){return c.__TYPE_INFO__()};k.type=z;var F={};r(D.prototype,{select:function(c){return j($(this.getEnumerator_,c))},where:function(c){return j(Fa(this.getEnumerator_,c))},first:function(c){return Ha(ba(this.getEnumerator_(),
c))},firstOrDefault:function(c,a){return ca(ba(this.getEnumerator_(),c),a)},last:function(c){return Ha(Ga(this.getEnumerator_(),c))},lastOrDefault:function(c,a){return ca(Ga(this.getEnumerator_(),c),a)},toArray:function(){return oa(this.getEnumerator_)},aggregate:function(c,a,b){return aa(this.getEnumerator_,c,a,b)},min:function(c){return ca(na(this.getEnumerator_,c,-1))},max:function(c){return ca(na(this.getEnumerator_,c,1))},extremum:function(c){return na(this.getEnumerator_,c)},sum:function(){return aa(this.getEnumerator_,
function(c,a){return c+bb(a)},0,NaN)},any:function(c){return ba(this.getEnumerator_(),c)!==F},skip:function(c){var a=this.getEnumerator_;return j(function(){var b=a(),d=-1;return v(function(){for(var a;d<c&&(a=b.moveNext());)d++;return a||b.moveNext()},b.current)})},take:function(c){var a=this.getEnumerator_;return j(function(){var b=a(),d=s(),e=0;return v(function(){return e<c&&b.moveNext()?(e++,d.progress(b.current())):d.end()},d.current)})},distinct:function(c){var a=this.getEnumerator_,b=c,b=
b||Q;return j(function(){var c;return Fa(function(){c={};return a()},function(a){a=Ea(b(a));return!c.hasOwnProperty(a)&&(c[a]=!0)})()})},groupBy:function(c){var a=this.getEnumerator_,b=c,b=b||Q;return j(function(){function c(a,b,d){var g=j(function(){var a=s(),c=0;return v(function(){return c<b.length||e(!0,d)?a.progress(b[c++]):a.end()},a.current)});g.key=a;return f[d]={items:b,groupSource:g}}function e(a,e){if(!a){if(l<i.length)return h.progress(i[l++].groupSource);0!==l&&(i=[],l=0)}for(;g.moveNext();){var m=
g.current(),j=b(m),k=Ea(j);if(f.hasOwnProperty(k)){if(f[k].items.push(m),a&&e===k)return!0}else if(m=c(j,[m],k),a?i.push(m):h.progress(m.groupSource),!a)return!0}return a?!1:h.end()}var f={},g=a(),h=s(),i=[],l=0;return v(function(){return e(!1)},h.current)})},average:function(){var c=0;return aa(this.getEnumerator_,function(a,b){c++;return a+bb(b)},0,NaN)/c},forEach:function(c,a){for(var b=(0,this.getEnumerator_)(),d=0;b.moveNext();)c.call(a,b.current(),d++)},reverse:function(){var c=this.getEnumerator_;
return j(function(){return la(oa(c).reverse())()})},orderBy:function(c,a){return ea(this.getEnumerator_,da(c,a,1))},concat:function(){return j(ma(this.getEnumerator_,C.slice.call(arguments)))},orderByDesc:function(c,a){return ea(this.getEnumerator_,da(c,a,-1))}});j.regexExec=function(c,a,b){return j(function(){var d=s(),e=b,f;return v(function(){var b,h;e===a.length?(h=!Aa(void 0)?d.progress(void 0):d.end(),e=-1):-1===e?h=d.end():(f=c.lastIndex,c.lastIndex=e,h=(b=c.exec(a))?d.progress(b):d.end(),
e=c.lastIndex,c.lastIndex=f);return h},d.current)})};j.value=function(c){var a=!1;return j(v(function(){return!a?a=!0:!1},function(){if(a)throw Error();return c}))};j.sequence=function(c,a,b){return j(function(){var d=s();return v(function(){return c<a?d.progress(b?b(c++):c++):d.end()},d.current)})};k.enumerable=j;var cb=k.List=z(function(){this.items_=[];var c=this;D.call(this,function(){return j(c.items_).getEnumerator()})}).defines({add:function(c){this.items_.push(c);return this.items_.length-
1},addRange:function(c){K(c)||(c=j(c).toArray());this.items_=this.items_.concat(c)},remove:function(c){c=this.items_.indexOf(c);-1!==c&&this.removeAt(c);return-1!==c},removeAt:function(c){this.items.splice(c,1)},count:function(){return this.items_.length},itemAt:function(c){return this.items_[c]}}).inherits(D).build(),ub=/\{(\d+)(:(([a-z])(\d*)))?\}/gi;G.formatters={d:function(c,a){c=Math.floor(Number(c));if(isNaN(c)||!a)return c;c=""+c;return pa("0",a-c.length)+c},f:function(c,a){c=Number(c);return!y(a)?
c.toFixed(a):c}};r(k,{string:{padLeft:function(c,a,b){return pa(a,b)+c},padRight:function(c,a,b){return c+pa(a,b)},format:G}});var S=function(c,a,b){a?c.reject(b):c.resolve(b)},db=function(c){function a(){function b(a,c){i=a;l=c;h=!0;for(var e;d.length;){e=d;d=[];for(var f=0,j=e.length;f<j;f++)e[f][Number(i)](l)}d=null}function c(a,d){d&&q(d.then)?d.then(function(c){b(a,c)},function(a){b(!0,a)}):b(a,d)}var d=[],h=!1,i,l;return{resolve:function(a){c(!1,a)},reject:function(a){c(!0,a)},promise:{fin:function(a){var b,
c;return this.then(function(c){b=c;return a()},function(b){c=b;return a()}).then(function(){return b},function(a){throw a||c;})},then:function(b,c){var e=a(),f=function(a){try{e.resolve(b?b(a):a)}catch(c){e.reject(c)}},h=function(a){if(c)try{e.resolve(c(a))}catch(b){e.reject(b)}else e.reject(a)};d?d.push([f,h]):(i?h:f)(l);return e.promise},isResolved:function(){return h},isRejected:function(){return!0==i},isFulfilled:function(){return!1===i},valueOf:function(){if(!h)throw Error("Promise has not completed.");
return l}}}}function b(b){if(b&&q(b.then))return b;var d=a();c(function(){d.resolve(b)});return d.promise}var d=z(function(a,b){this.callback=a;b&&(this.isErrback=b)}).defines({isAsyncCallback:!0,isErrback:!1}).build();return{defer:a,reject:function(b){var d=a();c(function(){d.reject(b)});return d.promise},resolve:b,all:function(c){if(!c.length)return b([]);var d=c.length,g=!1,h=a();c.map(function(a){return b(a)}).forEach(function(a){a.then(function(){g|=0;--d||S(h,g,c)},function(){g|=1;--d||S(h,
g,c)})});return h.promise},wait:function(b,c,d){function h(){x&&(clearInterval(x),x=null);l&&(clearTimeout(l),l=null)}var i=a(),l=setTimeout(function(){h();i.reject(new sa)},d),x=setInterval(function(){b()&&(h(),i.resolve())},c);return i.promise},delay:function(b,c){var d=a();setTimeout(function(){d.resolve(c)},b);return d.promise},timeout:function(c,d){if((c=b(c)).isResolved())return c;var g=a(),h=setTimeout(function(){g.reject(new sa("Timed out after "+d+" ms."))},d||0);c.then(function(a){clearTimeout(h);
g.promise.isResolved()||S(g,!1,a)},function(a){g.promise.isResolved()||S(g,!0,a)});return g.promise},factory:db,invoke:function(b,c){function d(a){var b=a.isErrback,c=a.callback;return function(){try{var a;c?(a=c.apply(this,arguments),b=!1):a=arguments[0];S(h,b,a)}catch(d){h.reject(d)}}}for(var h=a(),i=j(arguments).toArray().slice(2),l=0,x=i.length;l<x;l++){var k=i[l];k&&k.isAsyncCallback&&(i[l]=d(k))}b.apply(c,i);return h.promise},callback:function(a){return new d(a,!1)},errback:function(a){return new d(a,
!0)},TimeoutError:sa}};k.async=db(function(c){c()});var sa=z(function(){Error.apply(this,arguments)}).inherits(Error).build(),eb="textContent"in ja.createElement("span"),fb=eb?function(c){return c.textContent||""}:function(c){return(1==c.nodeType?c.innerText:c.nodeValue)||""},gb=eb?function(c,a){c.textContent=a?a:""}:function(c,a){a=a||"";1==c.nodeType?c.innerText=a:c.nodeValue=a},p={option:[1,"<select multiple='multiple'>","</select>"],legend:[1,"<fieldset>","</fieldset>"],thead:[1,"<table>","</table>"],
tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],area:[1,"<map>","</map>"]};p.optgroup=p.option;p.tbody=p.tfoot=p.colgroup=p.caption=p.thead;p.th=p.td;var u=r(function a(b){if(b instanceof T)return b;if(K(b))return new T(b);if(w(b))return a.parse(b);if(b.nodeType)return new T([b]);throw Error();},{parse:function(a,b){var b=b||ja,d=b.createElement("div"),e=a.match(/^\s*<(t[dhr]|tbody|tfoot|thead|option|legend|col|area|optgroup|colgroup|caption)/i);
if(e){var e=p[e[1].toLowerCase()],f=e[0];for(d.innerHTML=e[1]+a+e[2];f--;)d=d.lastChild}else d.innerHTML="<br>"+a,d.removeChild(d.firstChild);e=j(d.childNodes).toArray();d.innerHTML="";return new T(e)}}),T=z(function(a){this._nodes=a;D.call(this,la(a))}).name("Nodes").inherits(D).defines({value:fa(Ka,La),valueList:Sa(Ka,La),text:fa(fb,gb),textList:Sa(fb,gb),attribute:Qa(Ma,Na),attributeList:Ra(Ma,Na),style:Qa(Oa,Pa),styleList:Ra(Oa,Pa),parent:fa(function(a){return u(a.parentNode)}),nextSibling:fa(function(a){return u(a.nextSibling)}),
on:function(a,b){this.forEach(function(d){d.addEventListener(a,b)})},off:function(a,b){this.forEach(function(d){d.removeEventListener(a,b)})},clone:function(a){return new T(this._nodes.map(function(b){return b.cloneNode(a)}))},replace:function(a){a=u(a);this.forEach(function(b){var d=b.parentNode;null!=d&&d.replaceChild(a.first(),b)})},appendTo:function(a){var b=this,d=!1;u(a).forEach(function(a){b.forEach(function(b){b=d?b.cloneNode(!0):b;a.appendChild(b)});d=!0});return this},insertBefore:function(a){var b=
!1,d=this;u(a).forEach(function(a){var f=a.parentNode;d.forEach(function(d){f.insertBefore(b?d.cloneNode(!0):d,a)});b=!0})},insertAfter:function(a){var b=!1,d=this;u(a).forEach(function(a){var f=a.parentNode,a=a.nextSibling;d.forEach(function(d){f.insertBefore(b?d.cloneNode(!0):d,a)});b=!0})}}).build();k.nodes=u;var wb=z(function(a){this.registration=a}).defines({factory:function(a,b){return this.registration(a).factory(b)},type:function(a,b){return this.registration(a).type(b)},instance:function(a,
b){return this.registration(a).instance(b)},directive:function(a){return this.registration("Directive").name(a)},controller:function(a){return this.registration("Controller").name(a)}}).build();k.module=qa;k.container=function(a){function b(a,b,e){e=d(a,b,e);if(!e)throw Error("Could not resolve instance: "+a+":"+(b||""));return e}function d(a,b,d){!d&&(b&&!J(b))&&(d=b,b="");var a=f[a],e;a&&(e=b?a.keys[b]:a.main);return(b=e?e.resolver:null)?b(g,d):null}function e(){function a(d,e,f,g,h){f+=":";g&&
(f+=g);return b[f]||(b[f]=e(d,h))}var b={};g.root||(g.current=g.root=a);return{using:function(b){if(this._cache)throw Error("Object disposed");var d=g.current;g.current=a;try{b()}finally{g.current=d}},dispose:function(){b&&(b=null,_)}}}var f={},g;g={resolve:b};e();j(a).select(function(a){return a()}).forEach(function(a){a.forEach(function(a){var b=f[a.contract]||(f[a.contract]={main:null,keys:{}});if(a.memberOf){var d=a.memberOf,e=req,h=f[d]||(f[d]={main:null,keys:{}});h.members||(h.members=[],h.main=
Wa(d).factory(function(){return h.members.map(function(a){return a.resolver(g)})}).trans().build());h.members.push(e)}a.name?b.keys[a.name]=a:b.main=a})});return{resolve:b,tryResolve:d,createScope:e}};var U=function(a){return Function("s","l","x","y","return x(s, l)"+a+"y(s, l);")},H=function(a){var b=function(){return a};b.isConstant=!0;return b},jb=function(a,b){function d(b){if(f!==b){var b="at (",d=a.charAt(f);if('"'===d||"'"===d)b="Unterminated string detected "+b;throw Error("INVALID TOKEN: "+
b+f+").");}}function e(b){var e,g;b?(g=b[0],e=b[8]&&I||b[1]&&V||b[19]&&E||b[13]&&W,d(b=b.index),f+=g.length):(d(b=a.length),e=hb);if(e)return{type:e,text:g,index:b,fn:null};e=ib[g];return{type:e.type,text:g,index:b,fn:e.fn}}var f=0,g=new D(function(){var b=s(),d=0,f;return v(function(){var g,j;if(d===a.length)return d=-1,b.progress(e(null));if(-1===d)return!1;f=M.lastIndex;M.lastIndex=d;j=(g=M.exec(a))?b.progress(e(g)):b.end();d=M.lastIndex;M.lastIndex=f;return j},b.current)});b&&(g=g.where(function(a){return a.type!==
V}));return g},ia=function(a,b){if(a&&a.length){var d;d="var c = $scope, d = c, u;"+(j(a).aggregate(function(a,b){return a+" if ($ctx.isNullOrUndefined(c)) return u; d=c['"+b+"'];if ($ctx.isPropertyAccessor(d)) d = d.call(c); c = d;"},"")+" return c");var e=Function("$scope","$ctx",d);return r(b?function(a){return e(b(a),kb)}:function(a){return e(a,kb)},{setter:function(b,d){for(var e,i=0,j=a.length-1;i<j;i++){if(J(b))return;e=b[a[i]];q(e)&&e.isPropertyAccessor&&(e=e.call(b));b=e}J(b)||(e=b[a[a.length-
1]],q(e)&&e.isPropertyAccessor?e.call(b,d):b[a[a.length-1]]=d)},context:function(a){return b?b(a):a},paths:[a],isObservable:!b})}return null},lb=function(a){return function(b){return b.text===a}},ta=function(a,b,d){var e,f;if(e=a.isObservable&&(d.isObservable||d.isConstant)||d.isObservable&&(a.isObservable||a.isConstant))(f=a.paths)?d.paths&&(f=f.concat(d.paths)):f=d.paths;return r(function(e,f){return b(e,f,a,d)},{isObservable:e,paths:f})},X=function(a,b,d){var e=function(){var f=a(),g;if(g=b(d))f=
ta(f,g.fn,e());return f};return e},ob=function(){return{parse:function(a,b){function d(a){if(n<w-1){var b=A[n];if(!a||b.text===a)return b}return null}function e(a){return r(Error(G("Parser error: {0} at position ({1}).",a,n)),{line:0,column:n})}function f(a){var b;if(!(b=g(a)))throw b=A[n],e(G("expected token '{0}', but found '{1}'",a,b&&b.text||"EOF"));return b}function g(a){(a=d(a))&&n++;return a}function h(a){var b;return n<w-1&&(b=A[n],b.type===a)?(n++,b):null}function i(a,b,d){var e=n+a.length;
if(e>w)return null;for(var g=n,f=0;g<e;g++,f++)if(!a[f](A[g]))return null;a=A[n+b];n+=d;return a}function j(a){var b,e,f=a;if(b=h(E)||a&&i(mb,1,3))for(e=[b.text];;)if(g(".")||d("[")){b=h(E)||i(mb,1,3);if(!b)throw Error();e.push(b.type===I?b.text.substring(1,b.text.length-1):b.text)}else if(g("("))b=f,e.length&&(a=f,1<e.length&&(a=f=ia(e.slice(0,e.length-1),f)),b=ia(e.slice(e.length-1),f)),f=t(b,a),a=function(){return O},e=[];else break;e&&e.length&&(f=ia(e,f));return f}function k(){var b=q(),d,e;
if(e=g("=")){if(!b.assign)throw Error("implies assignment but ["+a.substring(0,e.index)+"] can not be assigned to",e);d=q();return function(a,e){return b.assign(a,d(a,e),e)}}return b}function q(){for(var a=y(),b;b=g("||");)a=ta(a,b.fn,y());return a}function m(){var a;if(g("+"))a=v();else if(a=g("-"))a=ta(nb,a.fn,m());else if(a=g("!")){var b=a.fn,d=m();a=function(a,e){return b(a,e,d)}}else a=v();return a}function t(a,b){var e=[];if(!d(")")){do e.push(k());while(g(","))}f(")");return function(d,f){for(var g=
[],h=b?b(d,f):d,i=0;i<e.length;i++)g.push(e[i](d,f));i=a(d,f)||Z;if(i.apply)return i.apply(h,g);g.unshift(h);return ab.call.apply(i,g)}}function v(){var a,b;a=j();if(!a)if(g("("))a=k(),f(")");else if(g("[")){var e=[];if(!d("]")){do e.push(k());while(g(","))}a=function(a,b){return e.map(function(d){return d(a,b)})};f("]")}if(!a){b=g();a=b.fn;if(!a&&32===(b.type&32))switch(b.type){case W:a=H(Number(b.text));break;case E:a=ia([h(E)]);break;case I:a=H(b.text.substring(1,b.text.length-1))}if(d(".")||d("["))g("."),
a=j(a)}if(!a)throw Error("Invalid expression.");return a}var A=jb(a).where(function(a){return a.type!==V}).toArray(),n=0,w=A.length,y=X(X(X(X(X(m,h,ua),h,va),h,wa),h,xa),g,"&&"),s=r(k(),{text:a.substring(0,A[n].index)});if(!b||!b.isBindingExpression)return s;for(s={evaluator:s,parameters:{}};g(",");){var u=void 0;if(!(u=h(E)))throw Error("Unexpected token");var u=u.text,z,p;f("=");z=n;if(p=A[n])n++,p.fn&&p.fn.isConstant?s.parameters[u]=p.fn():p.type===I?s.parameters[u]=p.text.substring(1,p.text.length-
1):n--;if(z===n)throw e(G("unexpected token '{0}', but found '{1}'",p&&p.text||"EOF"));}return s}}},pb=function(a){var b={},d=function(d,f){return(b[d]||(b[d]=a.parse(d)))(f)};d.clearCache=function(){b={}};return d},hb=-1,E=3,xa=17,wa=18,ua=19,va=20,I=32,W=33,V=128,nb,ib={},M,Ab=function(a){return j(a).select(function(a){return-1!=="\\[]{}().+*^|".indexOf(a)?"\\"+a:a}).toArray().join("")},t=function(a,b,d,e){d||(a.forEach(function(a,d){ib[a]={type:b,fn:e&&(q(e)?e(a):e[d])}}),a=a.map(Ab));qb.push(a)};
nb=H(0);var qb=[];t(["\\s","\\r","\\t","\\n"," "],V,!1);t(["===","==","!==","!="],xa,!1,U);t(["<=","<",">=",">"],wa,!1,U);t(["*","%","/"],ua,!1,U);t(["+","-"],va,!1,U);t("&& || = <<= << >>= & | ^".split(" "),16,!1,U);t("()[]{}".split(""),4,!1);t(['"([^\\\\"]*(\\\\[rtn"])?)*"',"'([^\\\\']*(\\\\[rtn'])?)*'"],I,!0);t(["[-+]?[0-9]*[.]?[0-9]+([eE][-+]?[0-9]+)?"],W,!0);t(["NaN"],W,!1,[H(NaN)]);t(["true","false"],34,!1,[H(!0),H(!1)]);t(["null"],35,!1,[H(null)]);t(["undefined"],36,!1,[Z]);t(["[a-z_$]{1}[\\da-z_]*"],
E,!0);t(["typeof","in"],2,!1);t([".",":",",",";"],64,!1);var Bb=j(qb).select(function(a){return a.join("|")}).aggregate(function(a,b){return(a?a+"|(":"(")+b+")"},"");M=RegExp(Bb,"gi");var kb={has:function(a,b){return a&&!J(a)&&b in a},isNullOrUndefined:function(a){return y(a)},isPropertyAccessor:function(a){return q(a)&&a.isPropertyAccessor}},Cb=I,Db=lb("["),Eb=lb("]"),mb=[Db,function(a){return a.type===Cb},Eb];k.parser=ob;r(k.tokenize=jb,{TOKEN_EOF:hb,TOKEN_OPERATOR:16,TOKEN_EQUALITY:xa,TOKEN_RELATIONAL:wa,
TOKEN_MULTIPLICATIVE:ua,TOKEN_ADDITIVE:va,TOKEN_KEYWORD:2,TOKEN_IDENTIFIER:E,TOKEN_GROUP:4,TOKEN_STRING:I,TOKEN_NUMBER:W,TOKEN_BOOLEAN:34,TOKEN_NULL:35,TOKEN_UNDEFINED:36,TOKEN_DELIMITER:64,TOKEN_WHITESPACE:V});k.execFactory=pb;k.exec=pb(ob());var Fb=["$parse",function(a){return{link:function(b,d,e){var e=a(e.expression),f=e.evaluator;(e=e.parameters.on)&&e.split(" ").forEach(function(a){b.on(a,function(){f(d)})})}}}],Gb=[function(){return{link:function(a,b,d){b.$observe(d.expression,function(b){a.attribute(d.qualifier,
b)})}}}],Hb=["$parse",function(a){return{render:"replace",compile:function(a){var d=a.expression,e=k.tokenize(d,!0).take(2).toArray();a.itemName="item";2===e.length&&(e[0].type===k.tokenize.TOKEN_IDENTIFIER&&"in"===e[1].text)&&(a.expression=d.substring(e[1].index+2),a.itemName=e[0].text||"item")},link:function(b,d,e){var f=u(e.templateNode),g=e.linker,h=a(e.expression).evaluator,b=b.nextSibling();(h=h(d))&&j(h).forEach(function(a){var h=f.clone(!0),j=d.$new();h.insertAfter(b);j[e.itemName]=a;g.link(h.first(),
j);b=b.nextSibling()})}}}],Ib=["$parse",function(a){return{link:function(b,d,e){var f=a(e.expression),g=f.evaluator;b.on("change"===f.parameters.updateOn?"input":"change",function(){g.setter(d,b.value());d.$sync()});d.$observe(e.expression,function(a){b.value(y(a)?"":a)})}}}],Jb=function(){return{link:function(a,b,d){b.$observe(d.expression,function(b){a.text(b)})}}},Kb=function(){return{link:function(a,b,d){b.$observe(d.expression,function(b){a.style("display",b?"":"none")})}}},Lb=["$parse","$container",
function(a,b){return{render:"replace",link:function(d,e,f){var g=e.$new();e.$observe(f.expression,function(h){var i=a(f.expression),h=u(b.resolve("Template",h)),j=$a(b,h,{content:{link:function(a){var b=f.templateNode.cloneNode(!0);a.replace(b);f.linker.link(b,e)}}}),h=h.clone(!0);h.insertAfter(d);Object.getOwnPropertyNames(i.parameters).forEach(function(a){g[a]=i.parameters[a]});j.link(h,g)})}}}],Mb=["$parse",function(a){return{link:function(b,d,e){var f=a(e.expression).evaluator;b.on(e.qualifier,
function(){f(d)})}}}],Nb=[function(){return{compile:function(a){var b;b=a.qualifier.split("_").map(function(a,b){return b?a.charAt(0).toUpperCase()+a.substring(1):a}).join("");b=rb[b]||(rb[b]=b);a.propertyName=b},link:function(a,b,d){b.$observe(d.expression,function(b){a[d.propertyName]=b})}}}],Ob=["$parse","$container",function(a,b){return{context:{},link:function(a,e,f){e.$controller=b.resolve("Controller",f.expression,{$context:e})}}}],Pb=z(function(){this._observers=[];this._observableProperties=
{}}).defines({notify:function(a){this._observers.forEach(function(b){b(a)})},observe:function(a){this._observers.push(a)},unobserve:function(a){a=this._observers.indexOf(a);-1!==a&&this._observers.splice(a,1)}}).definesStatic({property:function(a,b){b=b||xb;return r(function(d){var e=this._observableProperties[a];return arguments.length?!b(e,d)?(this._observableProperties[a]=d,this.notify([{object:this,type:"updated",name:a,oldValue:e}]),!0):!1:e},{isPropertyAccessor:!0})}}).build();k.Observable=
Pb;var Qb=k.DataContext=z(function(a){this.$children=new cb;this.$parse=a;this.$observer=ga(this)}).defines({$new:function(){if(!this.hasOwnProperty("$childScopeType")){var a=function(a){a.constructor.call(this,a.$parse);this.$parent=a;a.$children.add(this)};a.prototype=this;this.$childScopeType=a}return new this.$childScopeType(this)},$eval:function(a){if(w(a))return this.$parse(a)(this);if(q(a))return a(this);throw Error();},$sync:function(){this.$observer.sync()},$observe:function(a,b){this.$observer.observe(this.$parse(a).evaluator,
b)}}).build(),yb=z(function(){this._count=0;this._observers=null}).defines({begin:function(){this._count++},end:function(){if(0===--this._count){var a=this._observers;this._observers=null;a&&a.forEach(function(a){a.sync()})}},addObserver:function(a){0===this._count?a.sync():this._observers?-1===this._observers.indexOf(a)&&this._observers.push(a):this._observers=[a]}}).build(),ya=!1;if(Object.observe){var sb={x:0};Object.observe(sb,function(){ya=ga.isObserveSupportedNatively=!0});sb.x=1}var Xa=z(function(a,
b){this._scope=a;this._observers=this._children=null;this._changedHandler=this.changed.bind(this);this._isObserving=!1;this.setValue(b)}).defines({update:function(a){a&&this.syncObservers();var b=this._children,d=this._isObserving,e=this._value;b&&Object.getOwnPropertyNames(b).forEach(function(f){var g=b[f];a||!d?g.setValue(ra(e,f))||g.update():g.update()})},changed:function(a){var b=this._children;if(b){this._scope.begin();try{a.forEach(function(a){var e=b[a.name];e&&e.setValue(ra(a.object,a.name))})}finally{this._scope.end()}}},
syncObservers:function(){var a=this._observers;if(a){var b=this._scope;a.forEach(function(a){b.addObserver(a)})}},getOrCreateChild:function(a){this._children=this._children||{};return this._children[a]||(this._children[a]=new Xa(this._scope,ra(this._value,a)))},getValue:function(){return this._value},setValue:function(a){var b=this._value;if(b!==a){var d=this._changedHandler;!y(b)&&!J(b)&&(q(b.unobserve)?b.unobserve(d):ya&&Object.unobserve(b,d));this._value=a;!y(a)&&!J(a)?(q(a.observe)?(a.observe(d),
a=!0):ya&&!ga.disableNativeObserve?(Object.observe(a,d),a=!0):a=!1,this._isObserving=a):this._isObserving=!1;this.update(!0);return!0}return!1},addObserver:function(a){(this._observers||(this._observers=[])).push(a)}}).build(),Ya=k.type(function(a,b){this._observer=a;this._handlers=new cb;this._expression=b;this._value=b(a.root())}).defines({sync:function(){var a=this._value,b=this._value=this._expression(this._observer.root());a!==b&&this._handlers.forEach(function(d){d(b,a)})},addHandler:function(a){this._handlers.add(a);
a(this._value)},removeHandler:function(a){this._handlers.remove(a)}}).build();k.observer=ga;var rb={},Rb=qa(function(a){a.directive("mv-each").factory(Hb);a.directive("mv-action").factory(Fb);a.directive("mv-on-").factory(Mb);a.directive("mv-model").factory(Ib);a.directive("mv-attr-").factory(Gb);a.directive("mv-").factory(Nb);a.directive("mv-decorator").factory(Lb);a.directive("mv-text").factory(Jb);a.directive("mv-show").factory(Kb);a.directive("mv-controller").factory(Ob);a.factory("$parse",function(){var a=
k.parser().parse;return function(d){return a(d,{isBindingExpression:!0})}});a.type("$rootContext",["$parse",Qb])});k.bootstrap=function(a,b,d){var e,b=b||[];b.unshift(Rb);b.unshift(qa(function(a){a.factory("$container",function(){return e})}));e=k.container(b);b=e.resolve("$rootContext");a.dataContext=b;d&&r(b,d);$a(e,a).link(a,b);return b};k.bind=function(a,b,d){a.bindings=a.bindings||[];b={updateSource:b,updateTarget:d};a.bindings.push(b);return b}};if("function"===typeof require&&"object"===typeof exports&&
"object"===typeof module)N(module.exports||exports,require("undefined"));else if("function"===typeof define&&define.amd)define(["exports","jquery"],N);else if(O){var za=O.photon=O.photon||{};N(za,O.jQuery)}})(window,document);

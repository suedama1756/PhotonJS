var n=!0,p=null,t=window;
function A(i){function g(a){this.getEnumerator=a}function B(a,b,c){b=b||M;return k(a,function(a,e){return C(a)||b(e,a)===c?e:a})}function D(a){var b=typeof a;"object"===b&&a!==p?(b=Object.prototype.toString.call(a),a="[object Object]"===b||a.valueOf()===a?"o"+E(a):b+a.valueOf()):a=b.charAt(0)+a;return a}function F(a){return a}function M(a,b){return a===b?0:a<b?-1:a>b?1:-2}function k(a,b,c){for(a=a.getEnumerator();a.moveNext();)c=b(c,a.current());return c}function G(a){if(a===l)throw Error("No match found.");
return a}function H(a,b){for(var c=l,d;(d=r(a,b))!==l;)c=d;return c}function r(a,b){for(b=b||N;a.c();){var c=a.a();if(b(c))return c}return l}function N(){return n}function u(a,b,c){return function(){var d=f(a),e=-1,m=c?b():b;return j(function(){for(;d.c();)if(m(d.a(),++e))return n;return d.b()},d.a)}}function f(a,b){function c(a){g=b?b(a,++O):a;return!!(h=1)}function d(){return!(h=3)}function e(){return 3===h}function m(){return 0!==h}var f=a?a.getEnumerator():p,h=0,g,O=-1;return{c:function(){return 3!==
h&&f.moveNext()?c(f.current()):d()},a:function(){if(!m())throw Error("Enumeration has not started.");if(e())throw Error("Enumeration has completed.");return g},b:d,d:e,f:m,e:c}}function j(a,b){return{moveNext:a,current:b}}function v(a){return"function"===typeof a}function C(a){return a===I}function w(a){return a===p||a===I}function E(a){return a["0c8c22e83e7245adb341d6df8973ea63"]||(a["0c8c22e83e7245adb341d6df8973ea63"]=++P)}function s(a,b,c,d){for(var e in b)if(!c||c(b,e,a))a[e]=d?d(b,e,a):b[e];
return a}function Q(){}function J(a){var b={},c=p,d=p,e=p;return{name:function(a){c=a;return this},inherits:function(a){d=a;return this},defines:function(a){v(a)&&(a=a(function(){return e}));s(b,a);return this},build:function(){function f(){}w(a)&&(a=function(){});c=c||a.name;b.hasOwnProperty("toString")||(b.toString=function(){return"[object "+(c||"Object")+"]"});d&&(e=d.prototype,f.prototype=e);var g={name:function(){return c},baseType:function(){return d}};a.typeInfo=function(){return g};var h=
a.prototype=new f;h.constructor=a;b&&i.extend(h,b,i.extend.i,function(a,b){return a[b]});h.__TYPE_INFO__=a.typeInfo;return a}}}i.version="0.7.0.1";var x=Object.prototype.toString,I,K=Number,P=0;s.filterHasOwnProperty=function(a,b){return a.hasOwnProperty(b)};if(!Object.getOwnPropertyNames){var R=Object,q;a:{var L=function(a){var b=0,c;for(c in a)b++},y=["valueOf","toString"];for(q in{valueOf:Q})if(q===y[0]){q=L;break a}q=function(a){for(var b=L(a),c=0,d=y.length;c<d;c++){var e=y[c];a.hasOwnProperty(e)&&
b.push(e)}return b}}R.getOwnPropertyNames=q}s(i,{isString:function(a){return"[object String]"===x.call(a)},isNumber:function(a){return"[object Number]"===x.call(a)},isBoolean:function(a){return"[object Boolean]"===x.call(a)},isFunction:v,isUndefined:C,isNullOrUndefined:w,extend:s,getUID:E});i.typeInfo=function(a){return a.__TYPE_INFO__()};i.type=J;var z,l={},S=new g(function(){var a=f();return j(a.b,a.a)});J(g).defines({where:function(a){return new g(u(this,a))},select:function(a){var b=this;return new g(function(){var c=
f(b,a);return j(c.c,c.a)})},distinct:function(a){a=a||F;return new g(u(this,function(){var b={};return function(c){c=D(a(c));return b.hasOwnProperty(c)?!1:b[c]=n}},n))},skip:function(a){return 0<a?new g(u(this,function(b,c){return c>=a})):this},take:function(a){var b=this;return new g(function(){var c=f(b),d=0;return j(function(){return d<a&&c.c()?(d++,n):c.b()},c.a)})},groupBy:function(a){var a=a||F,b=this;return new g(function(){function c(a,b){return function(){var c=f(),e=0;return j(function(){return e<
a.length||d(n,b)?c.e(a[e++]):c.b()},c.a)}}function d(b,d){if(!b)if(l===h.length)h=[];else if(l<h.length)return i=h[l++].enumerable,n;for(;m.c();){var f=m.a(),j=a(f),k=D(j);e.hasOwnProperty(k)?e[k].g.push(f):(f=[f],i=new g(c(f,k)),i.key=j,j=e[k]={g:f,enumerable:i},b&&h.push(j));if(!b||d===k)return n}return m.b()}var e={},m=f(b),i,h=[],l=0;return j(function(){return d(!1,p)},function(){return(!m.d()||h.length)&&m.f()?i:m.a()})})},first:function(a){return G(r(f(this),a))},firstOrDefault:function(a,b){var c=
r(f(this),a);return c===l?b:c},last:function(a){return G(H(f(this),a))},lastOrDefault:function(a,b){var c=H(f(this),a);return c===l?b:c},any:function(a){return r(f(this),a)!==l},min:function(a){return B(this,a,-1)},max:function(a){return B(this,a,1)},sum:function(){return k(this,function(a,b){return a+K(b)},0)},average:function(){var a=0;return k(this,function(b,c){a++;return b+K(c)},0)/a},aggregate:function(a,b){return k(this,a,b)},count:function(){return k(this,function(a){return a+1},0)},reverse:function(){return z(this.toArray().reverse())},
toArray:function(){for(var a=[],b=0,c=f(this);c.c();)a[b++]=c.a();return a}}).build();z=function(a){return w(a)?S:v(a.getEnumerator)?new g(function(){return a.getEnumerator}):new g(a&&"length"in a?function(){var b=-1,c=f();return j(function(){if(!c.d())for(var d=a.length;++b<d;)if(b in a)return c.e(a[b]);return c.b()},c.a)}:[a])};i.enumerable=z}if("function"===typeof define&&define.h)define(["exports","jquery"],A);else if(t){var T=t.photon=t.photon||{};A(T)};

function A(){}function q(t,n){for(const e in n)t[e]=n[e];return t}function G(t){return t()}function st(){return Object.create(null)}function I(t){t.forEach(G)}function z(t){return typeof t=="function"}function ct(t,n){return t!=t?n==n:t!==n||t&&typeof t=="object"||typeof t=="function"}function lt(t){return Object.keys(t).length===0}function L(t,...n){if(t==null){for(const i of n)i(void 0);return A}const e=t.subscribe(...n);return e.unsubscribe?()=>e.unsubscribe():e}function rt(t){let n;return L(t,e=>n=e)(),n}function ot(t,n,e){t.$$.on_destroy.push(L(n,e))}function at(t,n,e,i){if(t){const s=M(t,n,e,i);return t[0](s)}}function M(t,n,e,i){return t[1]&&i?q(e.ctx.slice(),t[1](i(n))):e.ctx}function ut(t,n,e,i){if(t[2]&&i){const s=t[2](i(e));if(n.dirty===void 0)return s;if(typeof s=="object"){const r=[],c=Math.max(n.dirty.length,s.length);for(let o=0;o<c;o+=1)r[o]=n.dirty[o]|s[o];return r}return n.dirty|s}return n.dirty}function ft(t,n,e,i,s,r){if(s){const c=M(n,e,i,r);t.p(c,s)}}function _t(t){if(t.ctx.length>32){const n=[],e=t.ctx.length/32;for(let i=0;i<e;i++)n[i]=-1;return n}return-1}function ht(t){const n={};for(const e in t)e[0]!=="$"&&(n[e]=t[e]);return n}function dt(t,n){const e={};n=new Set(n);for(const i in t)!n.has(i)&&i[0]!=="$"&&(e[i]=t[i]);return e}function mt(t){const n={};for(const e in t)n[e]=!0;return n}function pt(t,n,e){return t.set(e),n}function yt(t){return t&&z(t.destroy)?t.destroy:A}const F=["",!0,1,"true","contenteditable"];let p=!1;function bt(){p=!0}function gt(){p=!1}function R(t,n,e,i){for(;t<n;){const s=t+(n-t>>1);e(s)<=i?t=s+1:n=s}return t}function U(t){if(t.hydrate_init)return;t.hydrate_init=!0;let n=t.childNodes;if(t.nodeName==="HEAD"){const l=[];for(let a=0;a<n.length;a++){const u=n[a];u.claim_order!==void 0&&l.push(u)}n=l}const e=new Int32Array(n.length+1),i=new Int32Array(n.length);e[0]=-1;let s=0;for(let l=0;l<n.length;l++){const a=n[l].claim_order,u=(s>0&&n[e[s]].claim_order<=a?s+1:R(1,s,B=>n[e[B]].claim_order,a))-1;i[l]=e[u]+1;const T=u+1;e[T]=l,s=Math.max(T,s)}const r=[],c=[];let o=n.length-1;for(let l=e[s]+1;l!=0;l=i[l-1]){for(r.push(n[l-1]);o>=l;o--)c.push(n[o]);o--}for(;o>=0;o--)c.push(n[o]);r.reverse(),c.sort((l,a)=>l.claim_order-a.claim_order);for(let l=0,a=0;l<c.length;l++){for(;a<r.length&&c[l].claim_order>=r[a].claim_order;)a++;const u=a<r.length?r[a]:null;t.insertBefore(c[l],u)}}function W(t,n){if(p){for(U(t),(t.actual_end_child===void 0||t.actual_end_child!==null&&t.actual_end_child.parentNode!==t)&&(t.actual_end_child=t.firstChild);t.actual_end_child!==null&&t.actual_end_child.claim_order===void 0;)t.actual_end_child=t.actual_end_child.nextSibling;n!==t.actual_end_child?(n.claim_order!==void 0||n.parentNode!==t)&&t.insertBefore(n,t.actual_end_child):t.actual_end_child=n.nextSibling}else(n.parentNode!==t||n.nextSibling!==null)&&t.appendChild(n)}function J(t,n,e){t.insertBefore(n,e||null)}function K(t,n,e){p&&!e?W(t,n):(n.parentNode!==t||n.nextSibling!=e)&&t.insertBefore(n,e||null)}function x(t){t.parentNode&&t.parentNode.removeChild(t)}function xt(t,n){for(let e=0;e<t.length;e+=1)t[e]&&t[e].d(n)}function P(t){return document.createElement(t)}function j(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function E(t){return document.createTextNode(t)}function vt(){return E(" ")}function wt(){return E("")}function Et(t,n,e,i){return t.addEventListener(n,e,i),()=>t.removeEventListener(n,e,i)}function Tt(t){return function(n){return n.preventDefault(),t.call(this,n)}}function Nt(t){return function(n){return n.stopPropagation(),t.call(this,n)}}function S(t,n,e){e==null?t.removeAttribute(n):t.getAttribute(n)!==e&&t.setAttribute(n,e)}const Q=["width","height"];function kt(t,n){const e=Object.getOwnPropertyDescriptors(t.__proto__);for(const i in n)n[i]==null?t.removeAttribute(i):i==="style"?t.style.cssText=n[i]:i==="__value"?t.value=t[i]=n[i]:e[i]&&e[i].set&&Q.indexOf(i)===-1?t[i]=n[i]:S(t,i,n[i])}function At(t,n){for(const e in n)S(t,e,n[e])}function Lt(t){return Array.from(t.childNodes)}function C(t){t.claim_info===void 0&&(t.claim_info={last_index:0,total_claimed:0})}function H(t,n,e,i,s=!1){C(t);const r=(()=>{for(let c=t.claim_info.last_index;c<t.length;c++){const o=t[c];if(n(o)){const l=e(o);return l===void 0?t.splice(c,1):t[c]=l,s||(t.claim_info.last_index=c),o}}for(let c=t.claim_info.last_index-1;c>=0;c--){const o=t[c];if(n(o)){const l=e(o);return l===void 0?t.splice(c,1):t[c]=l,s?l===void 0&&t.claim_info.last_index--:t.claim_info.last_index=c,o}}return i()})();return r.claim_order=t.claim_info.total_claimed,t.claim_info.total_claimed+=1,r}function O(t,n,e,i){return H(t,s=>s.nodeName===n,s=>{const r=[];for(let c=0;c<s.attributes.length;c++){const o=s.attributes[c];e[o.name]||r.push(o.name)}r.forEach(c=>s.removeAttribute(c))},()=>i(n))}function Mt(t,n,e){return O(t,n,e,P)}function Pt(t,n,e){return O(t,n,e,j)}function V(t,n){return H(t,e=>e.nodeType===3,e=>{const i=""+n;if(e.data.startsWith(i)){if(e.data.length!==i.length)return e.splitText(i.length)}else e.data=i},()=>E(n),!0)}function jt(t){return V(t," ")}function N(t,n,e){for(let i=e;i<t.length;i+=1){const s=t[i];if(s.nodeType===8&&s.textContent.trim()===n)return i}return-1}function St(t,n){const e=N(t,"HTML_TAG_START",0),i=N(t,"HTML_TAG_END",e+1);if(e===-1||i===-1)return new y(n);C(t);const s=t.splice(e,i-e+1);x(s[0]),x(s[s.length-1]);const r=s.slice(1,s.length-1);if(r.length===0)return new y(n);for(const c of r)c.claim_order=t.claim_info.total_claimed,t.claim_info.total_claimed+=1;return new y(n,r)}function X(t,n){n=""+n,t.data!==n&&(t.data=n)}function Y(t,n){n=""+n,t.wholeText!==n&&(t.data=n)}function Ct(t,n,e){~F.indexOf(e)?Y(t,n):X(t,n)}function Ht(t,n){t.value=n??""}function Ot(t,n,e,i){e==null?t.style.removeProperty(n):t.style.setProperty(n,e,i?"important":"")}function Dt(t,n,e){t.classList.toggle(n,!!e)}function Z(t,n,{bubbles:e=!1,cancelable:i=!1}={}){return new CustomEvent(t,{detail:n,bubbles:e,cancelable:i})}class ${is_svg=!1;e=void 0;n=void 0;t=void 0;a=void 0;constructor(n=!1){this.is_svg=n,this.e=this.n=null}c(n){this.h(n)}m(n,e,i=null){this.e||(this.is_svg?this.e=j(e.nodeName):this.e=P(e.nodeType===11?"TEMPLATE":e.nodeName),this.t=e.tagName!=="TEMPLATE"?e:e.content,this.c(n)),this.i(i)}h(n){this.e.innerHTML=n,this.n=Array.from(this.e.nodeName==="TEMPLATE"?this.e.content.childNodes:this.e.childNodes)}i(n){for(let e=0;e<this.n.length;e+=1)J(this.t,this.n[e],n)}p(n){this.d(),this.h(n),this.i(this.a)}d(){this.n.forEach(x)}}class y extends ${l=void 0;constructor(n=!1,e){super(n),this.e=this.n=null,this.l=e}c(n){this.l?this.n=this.l:super.c(n)}i(n){for(let e=0;e<this.n.length;e+=1)K(this.t,this.n[e],n)}}function Bt(t,n){return new t(n)}let m;function b(t){m=t}function h(){if(!m)throw new Error("Function called outside component initialization");return m}function qt(t){h().$$.on_mount.push(t)}function Gt(t){h().$$.after_update.push(t)}function It(t){h().$$.on_destroy.push(t)}function zt(){const t=h();return(n,e,{cancelable:i=!1}={})=>{const s=t.$$.callbacks[n];if(s){const r=Z(n,e,{cancelable:i});return s.slice().forEach(c=>{c.call(t,r)}),!r.defaultPrevented}return!0}}function Ft(t,n){return h().$$.context.set(t,n),n}function Rt(t){return h().$$.context.get(t)}function Ut(t,n){const e=t.$$.callbacks[n.type];e&&e.slice().forEach(i=>i.call(this,n))}const d=[],k=[];let _=[];const v=[],D=Promise.resolve();let w=!1;function tt(){w||(w=!0,D.then(et))}function Wt(){return tt(),D}function nt(t){_.push(t)}function Jt(t){v.push(t)}const g=new Set;let f=0;function et(){if(f!==0)return;const t=m;do{try{for(;f<d.length;){const n=d[f];f++,b(n),it(n.$$)}}catch(n){throw d.length=0,f=0,n}for(b(null),d.length=0,f=0;k.length;)k.pop()();for(let n=0;n<_.length;n+=1){const e=_[n];g.has(e)||(g.add(e),e())}_.length=0}while(d.length);for(;v.length;)v.pop()();w=!1,g.clear(),b(t)}function it(t){if(t.fragment!==null){t.update(),I(t.before_update);const n=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,n),t.after_update.forEach(nt)}}function Kt(t){const n=[],e=[];_.forEach(i=>t.indexOf(i)===-1?n.push(i):e.push(i)),e.forEach(i=>i()),_=n}export{Ht as $,et as A,lt as B,nt as C,Kt as D,m as E,b as F,G,d as H,tt as I,bt as J,gt as K,zt as L,q as M,kt as N,Dt as O,Et as P,dt as Q,ht as R,Ut as S,j as T,Pt as U,At as V,at as W,ft as X,_t as Y,ut as Z,Ft as _,L as a,Rt as a0,Jt as a1,yt as a2,xt as a3,y as a4,St as a5,It as a6,pt as a7,mt as a8,Nt as a9,Tt as aa,rt as ab,Ct as ac,vt as b,Mt as c,Lt as d,P as e,V as f,x as g,jt as h,z as i,K as j,W as k,X as l,ot as m,A as n,wt as o,Gt as p,qt as q,I as r,ct as s,E as t,S as u,Ot as v,k as w,Bt as x,Wt as y,st as z};

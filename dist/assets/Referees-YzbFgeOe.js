import{_ as V,u as z,a as P,r as t,f as p,g as I,t as w,P as T,o as W,h as F,H as k,i as B,b as o,c as d,e as n,j as i,k as r,D as H,l as O,w as U,m as S,C as q,E as j,M as K,n as G,z as f,K as J,F as Q,p as X,d as Y,q as Z,A as R}from"./index-LjW8QbZt.js";const g=l=>(X("data-v-167c426c"),l=l(),Y(),l),$={class:"header"},ee=g(()=>n("div",{class:"logo"},[n("a",{href:"#"},[n("img",{src:Z,id:"logo",alt:"Logo"})])],-1)),ne={class:"accesslinks"},se={class:"container"},te=g(()=>n("h1",null,"Referees",-1)),ae={class:"grid2",style:{height:"500px"}},oe={cellspacing:"0",id:"latest_investment"},le=g(()=>n("tr",{id:"table_row"},[n("th",null,"Email"),n("th",null,"Name"),n("th",null,"User Status")],-1)),de={__name:"Referees",setup(l){z();const x=P();t(!1),t(!1);let h=t(void 0);t(void 0);let c=t(void 0),u=t(void 0),_=p({}),b=p([]),E=p([]);const{data:C,error:ie}=I("/api/loggedIn",R.loggedIn),{data:L,error:re}=I("/api/fetch_users",R.fetch_users);setTimeout(()=>{let e=w(C.value);h.value=e.message,M(h),_=e.user,b=w(L.value),E=T.get_referrals(b.users,_).referrals},1e3),W(()=>{m(),window.addEventListener("resize",m)}),F(()=>{window.removeEventListener("resize",m)});function m(){setTimeout(()=>{let e=document.getElementById("main_nav");k.screenhandler(window.innerWidth,1027,e)})}function N(){let e=document.getElementById("main_nav"),s=document.getElementById("dashboard_nav");e.style.display==="none"?e.style.display="inline-block":e.style.display="none",s.style.display="none"}function A(){let e=document.getElementById("main_nav"),s=document.getElementById("dashboard_nav");s.style.display==="none"?s.style.display="inline-block":s.style.display="none",e.style.display="none"}async function D(e){let s=document.getElementById("dashboard_nav"),v=document.getElementById("main_nav"),y=document.getElementById("sub_div");e.target.className.toString().includes("remove")==!1&&(s.style.display="none",y.style.display="none"),k.removenav(e,window.innerWidth,1027,v)}function M(e){e.value===!0?(c.value=!1,u.value=!0):(c.value=!0,u.value=!1,x.push({name:"home"}))}return(e,s)=>{const v=B("font-awesome-icon"),y=B("router-link");return o(),d("div",{id:"body",onClick:D},[n("div",$,[i(K,{id:"main_nav",style:{display:"none"}}),ee,i(v,{class:"remove fa-solid fa-navicon",onClick:N,id:"hamburger",icon:"fa-solid fa-navicon"}),i(H,{id:"dashboard_nav",easycoins:r(_).easycoins,style:{display:"none"}},null,8,["easycoins"]),n("ul",ne,[r(c)?(o(),O(y,{key:0,to:"/sign-in",class:"",id:"signInbtn"},{default:U(()=>[G("Sign in")]),_:1})):S("",!0),r(u)?(o(),d("li",{key:1,class:"remove",style:{padding:"0px"},onClick:A},"Menu")):S("",!0)])]),n("div",se,[te,n("div",ae,[n("table",oe,[le,(o(!0),d(q,null,j(r(E),a=>(o(),d("tr",null,[n("td",null,f(a.email),1),n("td",null,f(a.full_name),1),n("td",{style:J(a.status==="Pending"?{color:"red"}:{color:"green"})},f(a.status),5)]))),256))])])]),i(Q)])}}},ue=V(de,[["__scopeId","data-v-167c426c"]]);export{ue as default};
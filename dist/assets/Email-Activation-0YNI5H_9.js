import{_ as v,u as h,r as c,i as b,b as _,c as k,j as d,e as s,z as E,k as m,n as p,l as I,m as g,B,p as C,d as S,A as w}from"./index-LjW8QbZt.js";import{S as R}from"./SuccessModal-x3f7Qgur.js";import{E as A}from"./ErrorModal-_8tJkFS0.js";const t=a=>(C("data-v-e6a398c9"),a=a(),S(),a),M={id:"body",class:"container"},N=t(()=>s("h1",null,"Please verify your email",-1)),V=t(()=>s("p",null,"You're almost there! We sent an email to",-1)),q=t(()=>s("p",null,[p("Just click on the link in that email to complete your signup. If you don't see it, you may need to "),s("b",null,"Check your spam"),p(" folder.")],-1)),D=t(()=>s("p",null,"Still can't find the email? No problem.",-1)),O=["disabled"],x={__name:"Email-Activation",setup(a){const n=h();c(!1);let l=c(!1),i=c(!1);async function u(){l.value=!0,i.value=!0;let o=document.getElementById("display_success_modal"),e=document.getElementById("display_error_modal");switch((await w.ResendConfirmationMail({confirmationCode:n.params.confirmationCode,confirmationEmail:n.query.confirmationEmail})).message){case"Account created succesfully, Mail sent":success_description="Email was resent",o.style.display="block",l.value=!1,i.value=!1;break;case"error occured":error_description.value="There was a problem sending your mail. please try again later.",e.style.display="block",l.value=!1,i.value=!1;break;case"Invalid email":this.error_description="Invalid request",e.style.display="block",this.spinner=!1,this.disablebtn=!1;break}}function f(o){let e=document.getElementById("display_success_modal");e.style.display="none"}function y(o){let e=document.getElementById("display_error_modal");e.style.display="none"}return(o,e)=>{const r=b("font-awesome-icon");return _(),k("div",M,[d(A,{style:{display:"none"},id:"display_error_modal",error_description:o.error_description,onRemove_error_modal:y},null,8,["error_description"]),d(R,{style:{display:"none"},id:"display_success_modal",success_description:o.success_description,onRemove_success_modal:f},null,8,["success_description"]),d(r,{class:"remove fa-solid fa-envelope",id:"envelope",icon:"fa-solid fa-envelope"}),N,V,s("b",null,E(m(n).query.confirmationEmail),1),q,D,s("button",{id:"btn",onClick:B(u,["prevent"]),disabled:m(i)},[p("Resend Verification Email "),m(l)?(_(),I(r,{key:0,class:"remove fa-solid fa-spinner fa-spin",id:"spinner",icon:"fa-solid fa-spinner"})):g("",!0)],8,O)])}}},j=v(x,[["__scopeId","data-v-e6a398c9"]]);export{j as default};

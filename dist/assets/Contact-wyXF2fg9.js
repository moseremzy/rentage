import{_ as q,r as l,f as x,g as Y,t as j,o as G,v as J,h as K,H as V,i as N,b as v,c as R,e,j as r,k as i,D as Q,l as U,w as X,m as I,x as c,y as m,z as _,B as ee,n as h,M as se,F as ae,p as te,d as ne,q as le,A as D}from"./index-LjW8QbZt.js";import{E as oe}from"./ErrorModal-_8tJkFS0.js";import{S as ie}from"./SuccessModal-x3f7Qgur.js";const u=p=>(te("data-v-97e24e3e"),p=p(),ne(),p),re={class:"header"},de=u(()=>e("div",{class:"logo"},[e("a",{href:"#"},[e("img",{src:le,id:"logo",alt:"Logo"})])],-1)),ce={class:"accesslinks"},me={class:"container"},_e=u(()=>e("h1",null,"Contact us",-1)),ue=u(()=>e("div",{class:"contactusdetails"},[e("p",null,"You can reach us through the following details provided below. Our support team will get back to you as soon as possible. call the phone no or send a mail to the email address. You can also use the form provided below, your message will be received."),e("h2",null,[e("svg",{"aria-hidden":"true",focusable:"false","data-prefix":"fas","data-icon":"envelope",role:"img",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",class:"svg-inline--fa fa-envelope"},[e("path",{fill:"currentColor",d:"M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z",class:""})]),h(" support@easyrentage.com")]),e("h2",null,[e("svg",{"aria-hidden":"true",focusable:"false","data-prefix":"fas","data-icon":"phone",role:"img",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",class:"svg-inline--fa fa-phone"},[e("path",{fill:"currentColor",d:"M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z",class:""})]),h(" +234 8116350276")])],-1)),pe={class:"contactusform"},fe=u(()=>e("h2",null,"SEND US A MESSAGE",-1)),ye=u(()=>e("p",null,"Have complaints, suggestions or want to say Hi, send us a message.",-1)),ve={action:""},he={class:"grid_container1"},ge={class:"item1"},be={class:"err",style:{"font-size":"12px"}},we={class:"item2"},Ee={class:"err",style:{"font-size":"12px"}},xe={class:"item3"},Ie={class:"err",style:{"font-size":"12px"}},ke={class:"item4"},Be={class:"err",style:{"font-size":"12px"}},Ce={class:"item5"},Se={class:"err",style:{"font-size":"12px"}},ze=["disabled"],Le={__name:"Contact",setup(p){l(!1),l(!1),l(!1);let g=l(!1),b=l(!1),k=x({}),f=l(!1),y=l(!1),B=l(void 0),C=l(void 0);l(!1),l(!1);const t=x({firstname:"",lastname:"",email:"",phone:"",message:""}),n=x({firstname_err:"",lastname_err:"",email_err:"",phone_err:"",message_err:""}),{data:P,error:Me}=Y("/api/loggedIn",D.loggedIn);setTimeout(()=>{let s=j(P.value);W(s.message),k=s.user},1e3),G(()=>{w(),window.addEventListener("resize",w)}),J(()=>{S(),z(),L(),M(),A()}),K(()=>{window.removeEventListener("resize",w)});function w(){setTimeout(()=>{let s=document.getElementById("main_nav");V.screenhandler(window.innerWidth,1027,s)})}function H(){let s=document.getElementById("main_nav"),a=document.getElementById("dashboard_nav");s.style.display==="none"?s.style.display="inline-block":s.style.display="none",a.style.display="none"}function O(){let s=document.getElementById("main_nav"),a=document.getElementById("dashboard_nav");a.style.display==="none"?a.style.display="inline-block":a.style.display="none",s.style.display="none"}async function T(s){let a=document.getElementById("dashboard_nav"),d=document.getElementById("main_nav"),E=document.getElementById("sub_div");s.target.className.toString().includes("remove")==!1&&(a.style.display="none",E.style.display="none"),V.removenav(s,window.innerWidth,1027,d)}function Z(s){let a=document.getElementById("display_success_modal");a.style.display="none"}function $(s){let a=document.getElementById("display_error_modal");a.style.display="none"}function S(){let s=/^[A-Za-z]+$/;if(t.firstname==="")n.firstname_err="Please fill field";else if(s.test(t.firstname)===!1)n.firstname_err="Firstname can only contain letters";else return n.firstname_err="",!0}function z(){let s=/^[A-Za-z]+$/;if(t.lastname==="")n.lastname_err="Please fill field";else if(s.test(t.lastname)===!1)n.lastname_err="Lastname can only contain letters";else return n.lastname_err="",!0}function L(){let s=/^[0-9]*$/,a=t.phone.length;if(t.phone==="")n.phone_err="Please fill field";else if(s.test(t.phone)===!1)n.phone_err="Invalid phone number";else if(a>11)n.phone_err="Cannot be 12 digits long";else return n.phone_err="",!0}function M(){let s=/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;if(t.email==="")n.email_err="Please fill field";else if(s.test(t.email)===!1)n.email_err="Invalid email";else return n.email_err="",!0}function A(){let s=t.message.length;if(t.message==="")n.message_err="Please fill field";else if(s>4e3)n.message_err="Maximum words reached";else return n.message_err="",!0}async function F(){let s=document.getElementById("display_success_modal"),a=document.getElementById("display_error_modal");if(S()&&z()&&L()&&M()&&A())switch(f.value=!0,y.value=!0,(await D.contact_us(t)).message){case"Mail sent":B.value="Your request has been recieved. We will get back to you as soon as possible via the email provided below. Thank you for choosing Easyrentage.",s.style.display="block",f.value=!1,y.value=!1;break;default:C.value="There was a problem sending your mail. please try again later.",a.style.display="block",f.value=!1,y.value=!1;break}}function W(s){s===!0?(g.value=!1,b.value=!0):(g.value=!0,b.value=!1)}return(s,a)=>{const d=N("font-awesome-icon"),E=N("router-link");return v(),R("div",{id:"body",onClick:T},[e("div",re,[r(se,{id:"main_nav",style:{display:"none"}}),r(oe,{style:{display:"none"},id:"display_error_modal",error_description:i(C),onRemove_error_modal:$},null,8,["error_description"]),r(ie,{style:{display:"none"},id:"display_success_modal",success_description:i(B),onRemove_success_modal:Z},null,8,["success_description"]),de,r(d,{class:"remove fa-solid fa-navicon",onClick:H,id:"hamburger",icon:"fa-solid fa-navicon"}),r(Q,{id:"dashboard_nav",easycoins:i(k).easycoins,style:{display:"none"}},null,8,["easycoins"]),e("ul",ce,[i(g)?(v(),U(E,{key:0,to:"/sign-in",class:"",id:"signInbtn"},{default:X(()=>[h("Sign in")]),_:1})):I("",!0),i(b)?(v(),R("li",{key:1,class:"remove",style:{padding:"0px"},onClick:O},"Menu")):I("",!0)])]),e("div",me,[_e,ue,e("div",pe,[fe,ye,e("form",ve,[e("div",he,[e("div",ge,[c(e("input",{type:"text",placeholder:"First Name","onUpdate:modelValue":a[0]||(a[0]=o=>t.firstname=o),class:"reedonly"},null,512),[[m,t.firstname]]),e("p",be,_(n.firstname_err),1)]),e("div",we,[c(e("input",{type:"text",placeholder:"Last Name","onUpdate:modelValue":a[1]||(a[1]=o=>t.lastname=o),class:"reedonly"},null,512),[[m,t.lastname]]),e("p",Ee,_(n.lastname_err),1)]),e("div",xe,[c(e("input",{type:"email",placeholder:"Email","onUpdate:modelValue":a[2]||(a[2]=o=>t.email=o),class:"reedonly"},null,512),[[m,t.email]]),e("p",Ie,_(n.email_err),1)]),e("div",ke,[c(e("input",{type:"text",placeholder:"Phone No","onUpdate:modelValue":a[3]||(a[3]=o=>t.phone=o),class:"reedonly"},null,512),[[m,t.phone]]),e("p",Be,_(n.phone_err),1)]),e("div",Ce,[c(e("textarea",{placeholder:"Message","onUpdate:modelValue":a[4]||(a[4]=o=>t.message=o),class:"reedonly"},`\r
                `,512),[[m,t.message]]),e("p",Se,_(n.message_err),1)])]),e("button",{type:"submit",onClick:ee(F,["prevent"]),disabled:i(y)},[i(f)?(v(),U(d,{key:0,class:"fa-solid fa-spinner fa-spin",id:"spinner",icon:"fa-solid fa-spinner"})):I("",!0),h(" Send Email")],8,ze)])])]),r(ae)])}}},Re=q(Le,[["__scopeId","data-v-97e24e3e"]]);export{Re as default};
var testStatus=-1,dlStatus="",ulStatus="",pingStatus="",jitterStatus="",clientIp="",dlProgress=0,ulProgress=0,pingProgress=0,log="";function tlog(t){log+=Date.now()+": "+t+"\n"}function twarn(t){log+=Date.now()+" WARN: "+t+"\n",console.warn(t)}var settings={test_order:"IP_D_U",time_ul:15,time_dl:15,time_ulGraceTime:3,time_dlGraceTime:1.5,count_ping:35,url_dl:"garbage.php",url_ul:"empty.php",url_ping:"empty.php",url_getIp:"getIP.php",getIp_ispInfo:!0,getIp_ispInfo_distance:"km",xhr_dlMultistream:10,xhr_ulMultistream:3,xhr_multistreamDelay:300,xhr_ignoreErrors:1,xhr_dlUseBlob:!1,xhr_ul_blob_megabytes:20,garbagePhp_chunkSize:20,enable_quirks:!0,ping_allowPerformanceApi:!0,overheadCompensationFactor:1.06,useMebibits:!1,telemetry_level:0,url_telemetry:"telemetry.php"},xhr=null,interval=null,test_pointer=0;function url_sep(t){return t.match(/\?/)?"&":"?"}function clearRequests(){if(tlog("stopping pending XHRs"),xhr){for(var t=0;t<xhr.length;t++){try{xhr[t].onprogress=null,xhr[t].onload=null,xhr[t].onerror=null}catch(t){}try{xhr[t].upload.onprogress=null,xhr[t].upload.onload=null,xhr[t].upload.onerror=null}catch(t){}try{xhr[t].abort()}catch(t){}try{delete xhr[t]}catch(t){}}xhr=null}}this.addEventListener("message",function(t){var e=t.data.split(" ");if("status"===e[0]&&postMessage(testStatus+";"+dlStatus+";"+ulStatus+";"+pingStatus+";"+clientIp+";"+jitterStatus+";"+dlProgress+";"+ulProgress+";"+pingProgress),"start"===e[0]&&-1===testStatus){testStatus=0;try{var r={};try{var s=t.data.substring(5);s&&(r=JSON.parse(s))}catch(t){twarn("Error parsing custom settings JSON. Please check your syntax")}for(var n in r)void 0!==settings[n]?settings[n]=r[n]:twarn("Unknown setting ignored: "+n);if(settings.enable_quirks||void 0!==r.enable_quirks&&r.enable_quirks){var i=navigator.userAgent;/Firefox.(\d+\.\d+)/i.test(i)&&void 0===r.xhr_ulMultistream&&(settings.xhr_ulMultistream=1),/Edge.(\d+\.\d+)/i.test(i)&&void 0===r.xhr_dlMultistream&&(settings.xhr_dlMultistream=3),/Chrome.(\d+)/i.test(i)&&self.fetch&&void 0===r.xhr_dlMultistream&&(settings.xhr_dlMultistream=5)}/Edge.(\d+\.\d+)/i.test(i)&&(settings.forceIE11Workaround=!0),/Chrome.(\d+)/i.test(i)&&/Android|iPhone|iPad|iPod|Windows Phone/i.test(i)&&(settings.xhr_ul_blob_megabytes=4),void 0!==r.telemetry_level&&(settings.telemetry_level="basic"===r.telemetry_level?1:"full"===r.telemetry_level?2:0),settings.test_order=settings.test_order.toUpperCase()}catch(t){twarn("Possible error in custom test settings. Some settings may not be applied. Exception: "+t)}tlog(JSON.stringify(settings)),test_pointer=0;var l=!1,a=!1,o=!1,u=!1,g=function(){if(5!=testStatus){if(test_pointer>=settings.test_order.length)return testStatus=4,void sendTelemetry();switch(settings.test_order.charAt(test_pointer)){case"I":if(test_pointer++,l)return void g();l=!0,getIp(g);break;case"D":if(test_pointer++,a)return void g();a=!0,testStatus=1,dlTest(g);break;case"U":if(test_pointer++,o)return void g();o=!0,testStatus=3,ulTest(g);break;case"P":if(test_pointer++,u)return void g();u=!0,testStatus=2,pingTest(g);break;case"_":test_pointer++,setTimeout(g,1e3);break;default:test_pointer++}}};g()}"abort"===e[0]&&(tlog("manually aborted"),clearRequests(),g=null,interval&&clearInterval(interval),settings.telemetry_level>1&&sendTelemetry(),testStatus=5,dlStatus="",ulStatus="",pingStatus="",jitterStatus="")});var ipCalled=!1;function getIp(t){tlog("getIp"),ipCalled||(ipCalled=!0,(xhr=new XMLHttpRequest).onload=function(){tlog("IP: "+xhr.responseText),clientIp=xhr.responseText,t()},xhr.onerror=function(){tlog("getIp failed"),t()},xhr.open("GET",settings.url_getIp+url_sep(settings.url_getIp)+(settings.getIp_ispInfo?"isp=true"+(settings.getIp_ispInfo_distance?"&distance="+settings.getIp_ispInfo_distance+"&":"&"):"&")+"r="+Math.random(),!0),xhr.send())}var dlCalled=!1;function dlTest(t){if(tlog("dlTest"),!dlCalled){dlCalled=!0;var e=0,r=(new Date).getTime(),s=!1,n=!1;xhr=[];for(var i=function(t,r){setTimeout(function(){if(1===testStatus){tlog("dl test stream started "+t+" "+r);var s=0,l=new XMLHttpRequest;xhr[t]=l,xhr[t].onprogress=function(r){if(tlog("dl stream progress event "+t+" "+r.loaded),1!==testStatus)try{l.abort()}catch(t){}var n=r.loaded<=0?0:r.loaded-s;isNaN(n)||!isFinite(n)||n<0||(e+=n,s=r.loaded)}.bind(this),xhr[t].onload=function(){tlog("dl stream finished "+t);try{xhr[t].abort()}catch(t){}i(t,0)}.bind(this),xhr[t].onerror=function(){tlog("dl stream failed "+t),0===settings.xhr_ignoreErrors&&(n=!0);try{xhr[t].abort()}catch(t){}delete xhr[t],1===settings.xhr_ignoreErrors&&i(t,0)}.bind(this);try{settings.xhr_dlUseBlob?xhr[t].responseType="blob":xhr[t].responseType="arraybuffer"}catch(t){}xhr[t].open("GET",settings.url_dl+url_sep(settings.url_dl)+"r="+Math.random()+"&ckSize="+settings.garbagePhp_chunkSize,!0),xhr[t].send()}}.bind(this),1+r)}.bind(this),l=0;l<settings.xhr_dlMultistream;l++)i(l,settings.xhr_multistreamDelay*l);interval=setInterval(function(){tlog("DL: "+dlStatus+(s?"":" (in grace time)"));var i=(new Date).getTime()-r;(s&&(dlProgress=i/(1e3*settings.time_dl)),i<200)||(s?(dlStatus=(8*(e/(i/1e3))*settings.overheadCompensationFactor/(settings.useMebibits?1048576:1e6)).toFixed(2),(i/1e3>settings.time_dl&&dlStatus>0||n)&&((n||isNaN(dlStatus))&&(dlStatus="Fail"),clearRequests(),clearInterval(interval),dlProgress=1,tlog("dlTest finished "+dlStatus),t())):i>1e3*settings.time_dlGraceTime&&(e>0&&(r=(new Date).getTime(),e=0),s=!0))}.bind(this),200)}}var ulCalled=!1;function ulTest(t){if(tlog("ulTest"),!ulCalled){ulCalled=!0;var e=new ArrayBuffer(1048576);try{e=new Float32Array(e);for(var r=0;r<e.length;r++)e[r]=Math.random()}catch(t){}var s=[],n=[];for(r=0;r<settings.xhr_ul_blob_megabytes;r++)s.push(e);s=new Blob(s),e=new ArrayBuffer(262144);try{e=new Float32Array(e);for(r=0;r<e.length;r++)e[r]=Math.random()}catch(t){}n.push(e),n=new Blob(n);var i=0,l=(new Date).getTime(),a=!1,o=!1;xhr=[];var u=function(t,e){setTimeout(function(){if(3===testStatus){tlog("ul test stream started "+t+" "+e);var r,l=0,a=new XMLHttpRequest;if(xhr[t]=a,settings.forceIE11Workaround)r=!0;else try{xhr[t].upload.onprogress,r=!1}catch(t){r=!0}r?(xhr[t].onload=function(){tlog("ul stream progress event (ie11wa)"),i+=n.size,u(t,0)},xhr[t].onerror=function(){tlog("ul stream failed (ie11wa)"),0===settings.xhr_ignoreErrors&&(o=!0);try{xhr[t].abort()}catch(t){}delete xhr[t],1===settings.xhr_ignoreErrors&&u(t,0)},xhr[t].open("POST",settings.url_ul+url_sep(settings.url_ul)+"r="+Math.random(),!0),xhr[t].setRequestHeader("Content-Encoding","identity"),xhr[t].send(n)):(xhr[t].upload.onprogress=function(e){if(tlog("ul stream progress event "+t+" "+e.loaded),3!==testStatus)try{a.abort()}catch(t){}var r=e.loaded<=0?0:e.loaded-l;isNaN(r)||!isFinite(r)||r<0||(i+=r,l=e.loaded)}.bind(this),xhr[t].upload.onload=function(){tlog("ul stream finished "+t),u(t,0)}.bind(this),xhr[t].upload.onerror=function(){tlog("ul stream failed "+t),0===settings.xhr_ignoreErrors&&(o=!0);try{xhr[t].abort()}catch(t){}delete xhr[t],1===settings.xhr_ignoreErrors&&u(t,0)}.bind(this),xhr[t].open("POST",settings.url_ul+url_sep(settings.url_ul)+"r="+Math.random(),!0),xhr[t].setRequestHeader("Content-Encoding","identity"),xhr[t].send(s))}}.bind(this),1)}.bind(this);for(r=0;r<settings.xhr_ulMultistream;r++)u(r,settings.xhr_multistreamDelay*r);interval=setInterval(function(){tlog("UL: "+ulStatus+(a?"":" (in grace time)"));var e=(new Date).getTime()-l;(a&&(ulProgress=e/(1e3*settings.time_ul)),e<200)||(a?(ulStatus=(8*(i/(e/1e3))*settings.overheadCompensationFactor/(settings.useMebibits?1048576:1e6)).toFixed(2),(e/1e3>settings.time_ul&&ulStatus>0||o)&&((o||isNaN(ulStatus))&&(ulStatus="Fail"),clearRequests(),clearInterval(interval),ulProgress=1,tlog("ulTest finished "+ulStatus),t())):e>1e3*settings.time_ulGraceTime&&(i>0&&(l=(new Date).getTime(),i=0),a=!0))}.bind(this),200)}}var ptCalled=!1;function pingTest(t){if(tlog("pingTest"),!ptCalled){ptCalled=!0;var e=null,r=0,s=0,n=0,i=0;xhr=[];var l=function(){tlog("ping"),pingProgress=n/settings.count_ping,e=(new Date).getTime(),xhr[0]=new XMLHttpRequest,xhr[0].onload=function(){if(tlog("pong"),0===n)e=(new Date).getTime();else{var a=(new Date).getTime()-e;if(settings.ping_allowPerformanceApi)try{var o=performance.getEntries(),u=(o=o[o.length-1]).responseStart-o.requestStart;u<=0&&(u=o.duration),u>0&&u<a&&(a=u)}catch(t){tlog("Performance API not supported, using estimate")}var g=Math.abs(a-i);1===n?r=a:(r=.9*r+.1*a,s=g>s?.2*s+.8*g:.9*s+.1*g),i=a}pingStatus=r.toFixed(2),jitterStatus=s.toFixed(2),n++,tlog("PING: "+pingStatus+" JITTER: "+jitterStatus),n<settings.count_ping?l():(pingProgress=1,t())}.bind(this),xhr[0].onerror=function(){tlog("ping failed"),0===settings.xhr_ignoreErrors&&(pingStatus="Fail",jitterStatus="Fail",clearRequests(),t()),1===settings.xhr_ignoreErrors&&l(),2===settings.xhr_ignoreErrors&&(++n<settings.count_ping?l():t())}.bind(this),xhr[0].open("GET",settings.url_ping+url_sep(settings.url_ping)+"r="+Math.random(),!0),xhr[0].send()}.bind(this);l()}}function sendTelemetry(){if(!(settings.telemetry_level<1)){(xhr=new XMLHttpRequest).onload=function(){console.log("TELEMETRY OL "+xhr.responseText)},xhr.onerror=function(){console.log("TELEMETRY ERROR "+xhr)},xhr.open("POST",settings.url_telemetry+url_sep(settings.url_telemetry)+"r="+Math.random(),!0);try{var t=new FormData;t.append("dl",dlStatus),t.append("ul",ulStatus),t.append("ping",pingStatus),t.append("jitter",jitterStatus),t.append("log",settings.telemetry_level>1?log:""),xhr.send(t)}catch(t){var e="dl="+encodeURIComponent(dlStatus)+"&ul="+encodeURIComponent(ulStatus)+"&ping="+encodeURIComponent(pingStatus)+"&jitter="+encodeURIComponent(jitterStatus)+"&log="+encodeURIComponent(settings.telemetry_level>1?log:"");xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded"),xhr.send(e)}}}
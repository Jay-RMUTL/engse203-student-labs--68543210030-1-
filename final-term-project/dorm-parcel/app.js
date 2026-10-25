const KEY="dorm-parcel-records-v1";
const $=id=>document.getElementById(id);
const today=()=>new Date().toISOString().slice(0,10);
let parcels=[];
try{parcels=JSON.parse(localStorage.getItem(KEY)||"[]")}catch{parcels=[]}
if(!parcels.length){
  parcels=[
    {id:crypto.randomUUID(),tracking:"TH123456789",resident:"สมชาย ใจดี",room:"A-101",phone:"0812345678",courier:"ไปรษณีย์ไทย",arrival:today(),status:"pending",note:""},
    {id:crypto.randomUUID(),tracking:"FL987654321",resident:"สมหญิง รักเรียน",room:"B-202",phone:"0891234567",courier:"Flash Express",arrival:new Date(Date.now()-4*86400000).toISOString().slice(0,10),status:"pending",note:""},
    {id:crypto.randomUUID(),tracking:"KEX246813579",resident:"นรินทร์ ตัวอย่าง",room:"A-305",phone:"",courier:"Kerry Express",arrival:today(),status:"received",note:""}
  ];save();
}
function save(){localStorage.setItem(KEY,JSON.stringify(parcels))}
function safe(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function age(date){return Math.floor((new Date(today())-new Date(date))/86400000)}
function render(){
  $("total").textContent=parcels.length;
  $("pending").textContent=parcels.filter(p=>p.status==="pending").length;
  $("received").textContent=parcels.filter(p=>p.status==="received").length;
  $("overdue").textContent=parcels.filter(p=>p.status==="pending"&&age(p.arrival)>3).length;
  const q=$("search").value.trim().toLowerCase(),f=$("filter").value;
  const list=parcels.filter(p=>(f==="all"||p.status===f)&&[p.tracking,p.resident,p.room,p.phone,p.courier].some(v=>String(v).toLowerCase().includes(q))).sort((a,b)=>b.arrival.localeCompare(a.arrival));
  $("rows").innerHTML=list.map(p=>`<tr>
    <td><b>${safe(p.tracking)}</b></td>
    <td>${safe(p.resident)}<br><small>ห้อง ${safe(p.room)} ${safe(p.phone)}</small></td>
    <td>${safe(p.courier)}</td>
    <td>${safe(p.arrival)} ${p.status==="pending"&&age(p.arrival)>3?'<br><small style="color:#c33">ค้าง '+age(p.arrival)+' วัน</small>':""}</td>
    <td><span class="status ${p.status}">${p.status==="pending"?"รอรับ":"รับแล้ว"}</span></td>
    <td><div class="actions">${p.status==="pending"?`<button data-act="receive" data-id="${p.id}">รับแล้ว</button>`:`<button class="secondary" data-act="pending" data-id="${p.id}">ย้อนสถานะ</button>`}<button class="secondary" data-act="edit" data-id="${p.id}">แก้ไข</button><button class="delete" data-act="delete" data-id="${p.id}">ลบ</button></div></td>
  </tr>`).join("");
  $("empty").hidden=list.length>0;
}
function openForm(p){
  $("parcelForm").reset();$("id").value=p?.id||"";
  $("formTitle").textContent=p?"แก้ไขพัสดุ":"เพิ่มพัสดุ";
  for(const [field,key] of [["tracking","tracking"],["resident","resident"],["room","room"],["phone","phone"],["courier","courier"],["arrival","arrival"],["note","note"]])$(field).value=p?.[key]|| (field==="arrival"?today():"");
  $("formDialog").showModal();
}
$("add").onclick=()=>openForm();
$("cancel").onclick=()=>$("formDialog").close();
$("parcelForm").onsubmit=e=>{
  e.preventDefault();const id=$("id").value;
  const p={id:id||crypto.randomUUID(),tracking:$("tracking").value.trim(),resident:$("resident").value.trim(),room:$("room").value.trim(),phone:$("phone").value.trim(),courier:$("courier").value,arrival:$("arrival").value,note:$("note").value.trim(),status:"pending"};
  if(parcels.some(x=>x.tracking.toLowerCase()===p.tracking.toLowerCase()&&x.id!==id)){alert("เลขพัสดุนี้มีอยู่แล้ว");return}
  if(id){const old=parcels.find(x=>x.id===id);p.status=old.status;p.receivedAt=old.receivedAt;parcels=parcels.map(x=>x.id===id?p:x)}else parcels.unshift(p);
  save();render();$("formDialog").close();
};
$("rows").onclick=e=>{
  const b=e.target.closest("button[data-act]");if(!b)return;
  const p=parcels.find(x=>x.id===b.dataset.id);if(!p)return;
  if(b.dataset.act==="edit")return openForm(p);
  if(b.dataset.act==="delete"){if(confirm("ยืนยันลบพัสดุ "+p.tracking+"?"))parcels=parcels.filter(x=>x.id!==p.id)}
  if(b.dataset.act==="receive"){p.status="received";p.receivedAt=new Date().toISOString()}
  if(b.dataset.act==="pending"){p.status="pending";delete p.receivedAt}
  save();render();
};
$("search").addEventListener("input",render);$("filter").addEventListener("change",render);render();

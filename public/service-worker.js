self.addEventListener('push',event=>{
  let message={};
  try{message=event.data?event.data.json():{}}
  catch(error){console.error('Push payload is invalid.',error)}
  const title=message.title||'Njoftim i ri nga CIPI';
  const options={body:message.body||'Keni një kërkesë të re rezervimi.',data:{url:'/admin/'}};
  event.waitUntil(self.registration.showNotification(title,options));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(windows=>{
    const adminWindow=windows.find(client=>new URL(client.url).origin===self.location.origin&&new URL(client.url).pathname.startsWith('/admin'));
    if(adminWindow)return adminWindow.focus();
    return self.clients.openWindow('/admin/');
  }));
});

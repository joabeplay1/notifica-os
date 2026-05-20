// Ouvinte para mensagens vindas do script.js
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'DISPARAR_ALERTA') {
        const title = event.data.title;
        const options = {
            body: event.data.desc || 'O horário do seu agendamento chegou!',
            requireInteraction: true, // Mantém o balão na tela do PC até o usuário agir
            vibrate: [200, 100, 200]
        };

        event.waitUntil(
            self.registration.showNotification(title, options)
        );
    }
});

// Manipula o clique na notificação nativa do PC
self.addEventListener('notificationclick', (event) => {
    event.notification.close(); // Fecha o balão de alerta do Windows/Mac

    // Traz a aba do aplicativo de volta para o foco do usuário
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

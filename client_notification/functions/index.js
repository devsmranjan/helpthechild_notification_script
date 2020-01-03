const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

exports.clientNotificationTrigger = functions.firestore
    .document(`data/{dataId}`)
    .onCreate((snapshot, context) => {
        const data = snapshot.data();

        const state = data.state;
        const dist = data.dist;
        const name = data.name;

        admin
            .firestore()
            .collection('dcpu')
            .where('state', '==', state)
            .where('dist', '==', dist)
            .get()
            .then(function(snapshot) {
                if (snapshot.empty) {
                    console.log('No such document!');
                    return 0;
                }

                let pushToken;
                snapshot.forEach(doc => {
                    pushToken = [doc.data().pushToken];
                });

                console.log(pushToken);

                var payload = {
                    notification: {
                        title: 'New Child Data',
                        body: name
                    },
                    data: {
                        sound: 'default'
                        // sendername: 'Munu',
                        // message: 'Message'
                    }
                };

                admin
                    .messaging()
                    .sendToDevice(pushToken, payload)
                    .then(response => {
                        console.log('Pushed');
                        return 0;
                    })
                    .catch(err => {
                        console.log(err);
                    });

                return 0;
            })
            .catch(err => {
                console.log(err);
            });
    });

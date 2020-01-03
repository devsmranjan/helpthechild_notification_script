const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

exports.userNotificationTrigger = functions.firestore
    .document(`users/{uid}/notifications/{notificationId}`)
    .onCreate((snapshot, context) => {
        const uid = context.params.uid;
        const data = snapshot.data();

        const dataId = data.dataId;
        const name = data.name;
        const status = data.status;
        const detailedStatus = data.detailedStatus;

        admin
            .firestore()
            .collection('users')
            .doc(uid)
            .get()
            .then(function(doc) {
                if (!doc.exists) {
                    console.log('No such document!');
                    return 0;
                }
                let pushToken = [doc.data().pushToken];
                console.log(pushToken);

                var payload = {
                    notification: {
                        title: 'New Update',
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

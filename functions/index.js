const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

const admin = require("firebase-admin");
admin.initializeApp();

const app = express();
const { body, validationResult } = require("express-validator");
app.use(cors({ origin: true }));

// const auth = express();


// const API_KEY = "AIzaSyA-Ep8wcXGwnNrivN2yYjm1PFYRfpjPaX8";

app.get("/", async (req, res) => {
    const snapshot = await admin.firestore().collection("pusat_kesehatans").get();

    let puskes = [];
    snapshot.forEach((doc) => {
        let id = doc.id;
        let data = doc.data();

        puskes.push({ id, ...data });
    });

    res.status(200).send(JSON.stringify(puskes));
});

app.get("/:id", async (req, res) => {
    const snapshot = await admin.firestore().collection('pusat_kesehatans').doc(req.params.id).get();

    const userId = snapshot.id;
    const userData = snapshot.data();

    res.status(200).send(JSON.stringify({id: userId, ...userData}));
});


const validators = [
    body('nama_rs').notEmpty().withMessage('nama_rs harus diisi'),
    body('rating_rs').notEmpty().withMessage('rating_rs harus diisi').isFloat().withMessage('rating_rs harus angka'),
    body('jenis_rs').notEmpty().withMessage('jenis_rs harus diisi'),
    body('alamat_rs').notEmpty().withMessage('alamat_rs harus diisi'),
    body('kodepos').notEmpty().withMessage('kodepos harus diisi').isInt().withMessage('kodepos harus angka'),
    body('latitude').notEmpty().withMessage('latitude harus diisi').isFloat('Harus barupa angka'),
    body('longitude').notEmpty().withMessage('latitude harus diisi').isFloat('Harus barupa angka'),
    body('gambar').notEmpty().withMessage('gambar harus diisi')
];

app.post("/", validators, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const user = req.body;

    await admin.firestore().collection("pusat_kesehatans").add(user);

    res.status(201).send();
});


app.put("/:id", validators, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const body = req.body;

    await admin.firestore().collection('pusat_kesehatans').doc(req.params.id).update(body);

    res.status(200).send()
});

app.delete("/:id", async (req, res) => {
    await admin.firestore().collection("pusat_kesehatans").doc(req.params.id).delete();

    res.status(200).send();
})

const geodata = express();
geodata.use(cors({ origin: true }));
geodata.get("/", async (req, res) => {
    const snapshot = await admin.firestore().collection("pusat_kesehatans").get();

    let puskes = {
        type: "FeatureCollection",
        features: [],
    };
    snapshot.forEach((doc) => {
        let id = doc.id;
        let data = doc.data();

        puskes.features.push({
            type:"Feature",
            id,
            geometry:{
                type:"Point",
                coordinates:[
                    parseFloat(doc.data().longitude),
                    parseFloat(doc.data().latitude)
                ],
            },
            properties:{id, ...data}
        });
    });

    res.status(200).send(JSON.stringify(puskes));
});
geodata.get("/:tipe", async (req, res) => {
    const snapshot = await admin.firestore().collection('pusat_kesehatans').where('jenis_rs','==',decodeURI(req.params.tipe)).get();

    let puskes = {
        type: "FeatureCollection",
        features: [],
    };
    snapshot.forEach((doc) => {
        let id = doc.id;
        let data = doc.data();

        puskes.features.push({
            type:"Feature",
            id,
            geometry:{
                type:"Point",
                coordinates:[
                    parseFloat(doc.data().longitude),
                    parseFloat(doc.data().latitude)
                ],
            },
            properties:{id, ...data}
        });
    });

    res.status(200).send(JSON.stringify(puskes));
});


exports.pusat_kesehatan = functions.https.onRequest(app);
exports.geojson = functions.https.onRequest(geodata);



// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

// exports.helloWorld = functions.https.onRequest((request, response) => {
//     functions.logger.info("Hello logs!", { structuredData: true });
//     response.send("Hello from Firebase!");
// });

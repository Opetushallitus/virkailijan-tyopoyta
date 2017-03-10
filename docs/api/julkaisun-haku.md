#Julkaisun haku

##Endpoint

`GET /virkailijan-tyopoyta/api/release?id={id}`

##Parametrit

id: *Pakollinen.*  Määrittää, mikä julkaisu palautetaan.

##Vastauksen muoto

Palauttaa pyynnön onnistuessa HTTP-statuskoodin 200 OK. Vastauksena on
julkaisu JSON-objektina.

Epäonnistuessa palauttaa HTTP-statuskoodina virhekoodin.

##Esimerkki

`GET /virkailijan-tyopoyta/api/release?id=1`

```
{
    "id": 1,
    "categories": [1, 2],
    "userGroups": [1, 2],
    "tags": [1],
    "sendEmail": true,
    "notification": {
        "id": 1,
        "releaseId": 1,
        "content": {
            "fi": {
                "language": "fi",
                "notificationId": 6,
                "title": "Versiopäivitys 13.3. klo 8:00-8.15"
                "text": "<p>Opintopolussa versiopäivitys 13.3. klo 8:00-8.30</p>"
            },
            "sv": { [s
        "initialStartDate": "1.3.2017",
        "startDate": "1.3.2017",
        "endDate": "13.3.2017",
        "tags": [1, 2],
        "categories": [3],
        "createdAt": "28.2.2017"
    },
    timeline: [
        {
            "id": 1,
            "releaseId": 1,
            "notificationId": 1,
            "date": "1.3.2017"
            "content": {
                "fi": {
                    "timelineId": 1,
                    "language": "fi",
                    "text": "<p>Versiopäivitys</p>"
                },
                "sv": { [sisältö ruotsiksi] }
            }
        },
        ...
    ]
}
```

#Luonnoksen haku

##Endpoint

`GET /virkailijan-tyopoyta/api/release/draft`

##Ei parametrejä

##Vastauksen muoto

Palauttaa pyynnön onnistuessa HTTP-statuskoodin 200 OK. Vastauksena on
luonnos JSON-objektina.

Epäonnistuessa palauttaa HTTP-statuskoodina virhekoodin.

##Esimerkki

```
{
  "id": -1,
  "categories": [1, 2],
  "tags": [1],
  "userGroups": [3, 4]
  "sendEmail": true,
  "notification": {
    "id": -1,
    "releaseId": -1,
    "content": {
      "fi": {
        "language": "fi",
        "notificationId": 6,
        "title": "Otsikko"
        "text": "<p>Teksti/p>"
      },
      "sv": { [sisältö ruotsiksi] }
    },
    "initialStartDate": "5.4.2017",
    "startDate": "5.4.2017",
    "endDate": "7.4.2017",
    "tags": [1, 2],
    "categories": [3],
    "created": "10.3.2017",
    "creator": "NN"
  },
  timeline: [
    {
      "id": 1,
      "releaseId": 1,
      "notificationId": 1,
      "date": "6.4.2017"
      "content": {
        "fi": {
          "timelineId": 1,
          "language": "fi",
          "text": "<p>Tapahtuman teksti</p>"
        },
        "sv": { [sisältö ruotsiksi] }
      }
    },
    ...
  ]
}
```

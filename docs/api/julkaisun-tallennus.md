# Julkaisun tallennus

## Endpointit

Uuden julkaisun tallennus: `POST /virkailijan-tyopoyta/api/release`

Päivittäminen ja poisto: `PUT /virkailijan-tyopoyta/api/release`

Luonnoksen tallennus: `POST /virkailijan-tyopoyta/api/release/draft`

## Ei parametrejä

## Pyynnön muoto

Pyynnössä lähetetään julkaisu JSON-muotoisena merkkijonona.

## Esimerkki, uuden tallennus

```
{
    "id": -1,
    "categories": [1, 2],
    "tags": [1],
    "userGroups": [3, 4]
    "sendEmail": true,
    "targetingGroup": "Ammatillisen päivitetty aikataulu",
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
        "startDate": "1.4.2017",
        "endDate": "1.5.2017",
        "tags": [1, 2],
        "categories": [3],
        "created": "5.3.2017",
        "creator": "NN"
    },
    timeline: [
        {
            "id": 1,
            "releaseId": 1,
            "notificationId": 1,
            "date": "1.4.2017"
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

## Vastauksen muoto

Palauttaa pyynnön onnistuessa HTTP-statuskoodin 200 OK. Vastaus on tyhjä.

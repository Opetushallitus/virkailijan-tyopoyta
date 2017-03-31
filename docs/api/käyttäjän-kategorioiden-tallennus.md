# Käyttäjän kategorioiden tallennus

Käyttäjä voi rajata käyttöliittymän tiedotelistaa valitsemiensa kategorioiden perusteella, 
sekä valita, haluaako sähköposti-ilmoituksen kun kyseisiin kategorioihin julkaistaan tiedotteita.

Valitut kategoriat ja tieto sähköposti-ilmoituksista tallennetaan käyttäjän tietoihin.

## Endpoint

`POST /virkailijan-tyopoyta/api/user`

## Ei parametrejä

## Pyynnön muoto

Pyynnössä lähetetään JSON-objekti, jossa on tieto siitä, lähetetäänkö käyttäjälle 
sähköposti-ilmoitus, kun valittuihin kategorioihin julkaistaan tiedotteita sekä 
pilkuilla erotettu lista tallennettavien kategorioiden id:eistä.

## Esimerkki

```
{
    "email": [true/false],
    "categories": [1, 2, 3]
}
```

## Vastauksen muoto

Palauttaa pyynnön onnistuessa HTTP-statuskoodin 200 OK. Vastauksena on teksti "OK".

Epäonnistuessa palauttaa HTTP-statuskoodina virhekoodin.
